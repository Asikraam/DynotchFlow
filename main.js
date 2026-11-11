const { app, BrowserWindow, ipcMain, screen, Tray, Menu, globalShortcut, clipboard, shell, nativeImage, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const zlib = require('zlib');
const { spawn } = require('child_process');
const services = require('./services');

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
app.setAppUserModelId('DynotchFlow.DynamicIsland');

const PROGRAMS_INSTALL_DIR = path.join(process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local'), 'Programs', 'DynotchFlow');

// Auto-Install / Self-Relocate standalone .exe from Downloads/temp folder into %LOCALAPPDATA%\Programs\DynotchFlow
function ensureInstalledInUserPrograms() {
  if (process.platform !== 'win32') return false;
  if (process.defaultApp || process.argv.includes('--no-self-install')) return false;
  try {
    const exeName = path.basename(process.execPath);
    const exeLower = exeName.toLowerCase();
    if (!exeLower.includes('notchflow') && !exeLower.includes('dynotchflow')) return false;

    const currentRoot = path.resolve(path.dirname(process.execPath));
    const targetRoot = path.resolve(PROGRAMS_INSTALL_DIR);
    if (currentRoot.toLowerCase() === targetRoot.toLowerCase()) return false;
    if (!fs.existsSync(path.join(currentRoot, 'resources'))) return false;

    fs.mkdirSync(targetRoot, { recursive: true });
    fs.cpSync(currentRoot, targetRoot, { recursive: true, force: true });

    const targetExe = path.join(targetRoot, exeName);
    if (!fs.existsSync(targetExe)) return false;

    // Update Desktop shortcuts (DynotchFlow.lnk & NotchFlow.lnk) to point to %LOCALAPPDATA%\Programs\DynotchFlow
    const icoPath = fs.existsSync(path.join(targetRoot, 'resources', 'app', 'NotchFlow.ico'))
      ? path.join(targetRoot, 'resources', 'app', 'NotchFlow.ico')
      : targetExe;
    const psCmd = [
      "$ws = New-Object -ComObject WScript.Shell;",
      "$desk = [Environment]::GetFolderPath('Desktop');",
      "foreach ($name in @('DynotchFlow.lnk', 'NotchFlow.lnk')) {",
      "  $s = $ws.CreateShortcut((Join-Path $desk $name));",
      `  $s.TargetPath = '${targetExe.replace(/'/g, "''")}';`,
      `  $s.WorkingDirectory = '${targetRoot.replace(/'/g, "''")}';`,
      `  $s.IconLocation = '${icoPath.replace(/'/g, "''")}';`,
      "  $s.Save();",
      "}"
    ].join(' ');
    spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', psCmd], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    }).unref();

    spawn(targetExe, ['--just-installed-to-programs'], {
      cwd: targetRoot,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    }).unref();

    app.exit(0);
    return true;
  } catch {
    return false;
  }
}

if (ensureInstalledInUserPrograms()) {
  process.exit(0);
}


// Low-Memory Chromium & V8 flags (48MB heap + working set trim keeps RAM compact while maintaining 60fps UI)
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=48 --optimize-for-size');
app.commandLine.appendSwitch('renderer-process-limit', '1');
app.commandLine.appendSwitch(
  'disable-features',
  'SpareRendererForSitePerProcess,AudioServiceOutOfProcess,Translate,TranslateUI,BackForwardCache,MediaRouter,OptimizationHints,HardwareMediaKeyHandling'
);
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disk-cache-size', '1048576');
app.commandLine.appendSwitch('media-cache-size', '1048576');
app.commandLine.appendSwitch('gpu-program-cache-size-kb', '512');

const APP_DATA_DIR = path.join(app.getPath('appData'), 'NotchFlow');
const CONFIG_PATH  = path.join(APP_DATA_DIR, 'config.json');
const SHELF_PATH   = path.join(APP_DATA_DIR, 'shelf.json');
const EXT_CACHE_PATH = path.join(APP_DATA_DIR, 'external-cache.json');
const LYRICS_CACHE = path.join(APP_DATA_DIR, 'lyrics-cache');

const WIN_W = 556;
const WIN_H = 380;
const WEBHOOK_PORT = 17420;

const DEFAULT_CONFIG = {
  theme: 'normal',
  pillHeight: 34,          // Alcove/NotchNook 32-36px sweet spot for 1080p
  offsetX: 0,              // 0 = top-center flush
  autoHideTopEdge: false,  // Hide completely above top bezel until cursor touches top edge
  autoHideFullscreen: true,
  expandOnHover: true,
  lyricsInCollapsedPill: true,
  showWeatherOnIdle: true,
  showPrayerCountdown: true,
  prayerAdzanAlert: true,
  city: 'Jakarta',
  country: 'Indonesia',
  weatherLat: -6.2088,
  weatherLon: 106.8456,
  gcalAccount: '',
  calendars: [],
  icsUrl: '',
  localEvents: [],
  customFeeds: [
    {
      id: 'usd_idr',
      label: 'USD/IDR',
      url: 'https://open.er-api.com/v6/latest/USD',
      jsonPath: 'rates.IDR',
      prefix: 'Rp ',
      suffix: '',
      enabled: false
    },
    {
      id: 'btc_idr',
      label: 'Bitcoin',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr',
      jsonPath: 'bitcoin.idr',
      prefix: 'Rp ',
      suffix: '',
      enabled: false
    }
  ],
  autostart: false
};

let config = { ...DEFAULT_CONFIG };
let shelf = [];
let win = null;
let tray = null;
let trayIconImg = null;
let bridgeProc = null;
let bridgeRestartTimer = null;
let httpServer = null;
let isQuitting = false;
let isExpanded = false;
let isHiddenManual = false;
let lastTrackKey = '';
let lastLyricsResult = null;
let lastMediaMsg = null;
let currentThumb = '';
let gcalWatchTimer = null;

let externalState = {
  weather: null,
  prayer: null,
  calendar: { events: [], remoteCount: 0, error: null },
  customFeeds: []
};

function ensureDirs() {
  fs.mkdirSync(APP_DATA_DIR, { recursive: true });
  fs.mkdirSync(LYRICS_CACHE, { recursive: true });
  const legacyToggl = path.join(APP_DATA_DIR, 'toggl.json');
  if (fs.existsSync(legacyToggl)) {
    try { fs.unlinkSync(legacyToggl); } catch {}
  }
  const seedDir = path.join(__dirname, 'data');
  if (fs.existsSync(seedDir)) {
    for (const fName of ['config.json', 'external-cache.json', 'gcal-cache.json']) {
      const target = path.join(APP_DATA_DIR, fName);
      const src = path.join(seedDir, fName);
      if (!fs.existsSync(target) && fs.existsSync(src)) {
        try { fs.copyFileSync(src, target); } catch {}
      }
    }
  }
}

function loadJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {}
  return fallback;
}

function saveJson(filePath, obj) {
  ensureDirs();
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

function loadState() {
  ensureDirs();
  const savedCfg = loadJson(CONFIG_PATH, {});
  delete savedCfg.togglToken;
  config = { ...DEFAULT_CONFIG, ...savedCfg };
  config.theme = config.theme === 'matte' ? 'matte' : 'normal';
  if (!Array.isArray(config.customFeeds) || config.customFeeds.length === 0) {
    config.customFeeds = DEFAULT_CONFIG.customFeeds;
  }
  if (!Array.isArray(config.calendars) || config.calendars.length === 0) {
    config.calendars = services.DEFAULT_CALENDARS;
  }
  if (!Array.isArray(config.localEvents)) config.localEvents = [];
  shelf = loadJson(SHELF_PATH, []);
  if (!Array.isArray(shelf)) shelf = [];
  const cachedExt = loadJson(EXT_CACHE_PATH, null);
  if (cachedExt && typeof cachedExt === 'object') {
    externalState = { ...externalState, ...cachedExt };
  }
}

function createTrayPng() {
  const size = 16;
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;
      const inNotch = y >= 2 && y <= 11 && x >= 1 && x <= 14 &&
        !((y === 11 || y === 2) && (x === 1 || x === 14));
      if (inNotch) {
        const isDot = (x >= 10 && x <= 12 && y >= 5 && y <= 7);
        const isWave = (y >= 5 && y <= 8 && (x === 4 || x === 6 || x === 8));
        if (isDot) {
          raw[px] = 76; raw[px + 1] = 201; raw[px + 2] = 240; raw[px + 3] = 255;
        } else if (isWave) {
          raw[px] = 255; raw[px + 1] = 255; raw[px + 2] = 255; raw[px + 3] = 235;
        } else {
          raw[px] = 22; raw[px + 1] = 22; raw[px + 2] = 26; raw[px + 3] = 255;
        }
      } else {
        raw[px] = 0; raw[px + 1] = 0; raw[px + 2] = 0; raw[px + 3] = 0;
      }
    }
  }
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crcBuf]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function getNativeHwnd() {
  try {
    if (!win || win.isDestroyed()) return 0;
    const buf = win.getNativeWindowHandle();
    if (!buf) return 0;
    if (buf.length >= 8) {
      return Number(buf.readBigUInt64LE(0));
    }
    return buf.length >= 4 ? buf.readUInt32LE(0) : 0;
  } catch {
    return 0;
  }
}

function buildNotchShapeRects(left, top, width, height, bottomRadius = 17, wingSize = 12) {
  const x = Math.round(left);
  const y = Math.round(top);
  const w = Math.round(width);
  const h = Math.round(height);
  if (w <= 2 || h <= 2 || y + h <= 1) {
    return [];
  }
  const pad = 2;
  const r = Math.min(Math.round(bottomRadius || 17), Math.floor(h / 2), Math.floor(w / 2));
  const wing = Math.max(0, Math.min(14, Math.round(wingSize || 12)));
  const rects = [];

  // 1. Top wing scanlines (12px concave ears + 2px AA buffer)
  const wingRows = Math.min(wing, Math.max(0, h - r));
  for (let dy = 0; dy < wingRows; dy++) {
    const ry = y + dy;
    if (ry < 0) continue;
    const rem = Math.max(0, wing - dy);
    const ext = Math.max(pad, Math.ceil(wing - Math.sqrt(Math.max(0, wing * wing - rem * rem))) + pad);
    rects.push({
      x: Math.max(0, x - ext),
      y: ry,
      width: w + ext * 2,
      height: 1
    });
  }

  // 2. Main vertical body with 1px horizontal AA clearance
  const bodyStart = Math.max(0, y + wingRows);
  const bodyEnd = Math.max(bodyStart, y + h - r);
  if (bodyEnd > bodyStart) {
    rects.push({
      x: Math.max(0, x - 1),
      y: bodyStart,
      width: w + 2,
      height: bodyEnd - bodyStart
    });
  }

  // 3. Bottom rounded corner scanlines (+2px outside circle so Chromium AA edge stays razor smooth)
  for (let rowOffset = 0; rowOffset <= r; rowOffset++) {
    const ry = y + h - r + rowOffset;
    if (ry < 0) continue;
    const dy = Math.min(r - 0.5, Math.max(0, rowOffset));
    const rawInset = r - Math.sqrt(Math.max(0, r * r - dy * dy));
    const inset = Math.max(-1, Math.floor(rawInset) - pad);
    const rx = Math.max(0, x + inset);
    const rw = w - inset * 2;
    if (rw > 0) {
      rects.push({
        x: rx,
        y: ry,
        width: rw,
        height: 1
      });
    }
  }

  return rects;
}

let currentShapeRect = { x: 166, y: 0, width: 224, height: 34, hidden: false };

function applyNotchShape(rect) {
  if (!win || win.isDestroyed() || typeof win.setShape !== 'function') return;
  try {
    if (!rect || rect.hidden) {
      currentShapeRect = { x: 0, y: 0, width: 0, height: 0, hidden: true };
      win.setShape([]);
      if (win.getOpacity() !== 0) win.setOpacity(0);
      win.setIgnoreMouseEvents(true, { forward: true });
      return;
    }
    currentShapeRect = { ...rect, hidden: false };
    const rects = buildNotchShapeRects(rect.x, rect.y, rect.width, rect.height, rect.radius, rect.wing);
    win.setShape(rects);
    if (!isHiddenManual && win.getOpacity() !== 1) win.setOpacity(1);
  } catch {}
}

function positionWindow() {
  if (!win || win.isDestroyed()) return;
  const primary = screen.getPrimaryDisplay();
  const b = primary.bounds;
  const startX = Math.round(b.x + (b.width - WIN_W) / 2 + Number(config.offsetX || 0));
  const hwnd = getNativeHwnd();
  if (hwnd && bridgeProc) {
    sendBridgeCommand(`win:move:${hwnd}:${startX}:${b.y}`);
  } else {
    try { win.setPosition(startX, b.y, false); } catch {}
  }
}

function sendToRenderer(channel, payload) {
  if (win && !win.isDestroyed() && win.webContents) {
    win.webContents.send(channel, payload);
  }
}

function requestMemoryTrim() {
  sendBridgeCommand('mem:trim');
}

let lastPrayerDateKey = '';

function getTodayDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function refreshExternalData(forceRefresh = false) {
  const [weatherRes, prayerRes, calRes, feedsRes] = await Promise.allSettled([
    services.fetchWeather(config.weatherLat, config.weatherLon, config.city),
    services.fetchPrayerTimes(config.city, config.country),
    services.fetchCalendarEvents(config.icsUrl, config.localEvents, config.gcalAccount || '', config.calendars, forceRefresh),
    Promise.all((config.customFeeds || []).map(f => services.fetchCustomFeed(f)))
  ]);

  if (weatherRes.status === 'fulfilled') externalState.weather = weatherRes.value;
  if (prayerRes.status === 'fulfilled') {
    externalState.prayer = prayerRes.value;
    lastPrayerDateKey = prayerRes.value?.dateKey || getTodayDateKey();
  }
  if (calRes.status === 'fulfilled') externalState.calendar = calRes.value;
  if (feedsRes.status === 'fulfilled') {
    externalState.customFeeds = feedsRes.value.filter(Boolean);
  }

  try { saveJson(EXT_CACHE_PATH, externalState); } catch {}
  sendToRenderer('bridge:external', externalState);
  return externalState;
}

async function handleMediaMessage(msg) {
  if (!msg.active) {
    lastMediaMsg = msg;
    sendToRenderer('bridge:media', msg);
    if (lastTrackKey !== '') {
      lastTrackKey = '';
      lastLyricsResult = null;
      currentThumb = '';
      sendToRenderer('bridge:lyrics', { found: false, lines: [], plain: [] });
    }
    return;
  }

  const key = `${msg.title || ''}||${msg.artist || ''}`;
  const isNewTrack = key !== lastTrackKey;
  let thumbChanged = false;
  if (isNewTrack) {
    lastTrackKey = key;
    currentThumb = msg.thumbnail || '';
    thumbChanged = true;
  } else if (msg.thumbnail && !currentThumb) {
    currentThumb = msg.thumbnail;
    thumbChanged = true;
  }

  lastMediaMsg = { ...msg, thumbnail: currentThumb };
  const ipcPayload = thumbChanged ? lastMediaMsg : { ...msg, thumbnail: undefined };
  sendToRenderer('bridge:media', ipcPayload);

  if (isNewTrack) {
    sendToRenderer('bridge:lyrics', { loading: true, found: false, lines: [], plain: [] });
    services.fetchAlbumArtHD(msg.title, msg.artist, LYRICS_CACHE).then((hdArt) => {
      if (lastTrackKey === key && hdArt) {
        currentThumb = hdArt;
        lastMediaMsg = { ...lastMediaMsg, thumbnail: hdArt };
        sendToRenderer('bridge:media', lastMediaMsg);
      }
    }).catch(() => {});
    try {
      const lyr = await services.fetchLyrics(msg.title, msg.artist, msg.album, msg.duration || 0, LYRICS_CACHE);
      if (lastTrackKey === key) {
        lastLyricsResult = lyr;
        sendToRenderer('bridge:lyrics', lyr);
      }
    } catch {
      if (lastTrackKey === key) {
        sendToRenderer('bridge:lyrics', { found: false, lines: [], plain: [] });
      }
    }
    setTimeout(() => { if (!isExpanded) requestMemoryTrim(); }, 1800);
  }
}

function startMediaVolumeBridge() {
  if (isQuitting || bridgeProc) return;
  clearTimeout(bridgeRestartTimer);

  const exePath = path.join(__dirname, 'NotchBridge.exe');
  const scriptPath = path.join(__dirname, 'bridge.ps1');
  try {
    if (fs.existsSync(exePath)) {
      bridgeProc = spawn(exePath, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });
    } else {
      bridgeProc = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-WindowStyle', 'Hidden',
        '-File', scriptPath
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });
    }
  } catch {
    bridgeProc = null;
    bridgeRestartTimer = setTimeout(startMediaVolumeBridge, 3000);
    return;
  }

  let buffer = '';
  let sentInitHwnd = false;
  bridgeProc.stdout.on('data', (chunk) => {
    if (!sentInitHwnd) {
      const h = getNativeHwnd();
      if (h) {
        sentInitHwnd = true;
        sendBridgeCommand(`win:init:${h}`);
      }
    }
    buffer += chunk.toString('utf8');
    let nl;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.type === 'volume') {
          sendToRenderer('bridge:volume', msg);
        } else if (msg.type === 'media') {
          handleMediaMessage(msg);
        }
      } catch {}
    }
  });

  bridgeProc.on('error', () => {});
  bridgeProc.on('exit', () => {
    bridgeProc = null;
    if (!isQuitting) {
      bridgeRestartTimer = setTimeout(startMediaVolumeBridge, 2000);
    }
  });
}

function sendBridgeCommand(cmd) {
  if (bridgeProc && bridgeProc.stdin && !bridgeProc.stdin.destroyed) {
    try {
      bridgeProc.stdin.write(cmd + '\n');
    } catch {}
  }
}

function startWebhookServer() {
  httpServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Vary', 'Origin');
    if (req.headers.origin || req.method === 'OPTIONS' || req.headers['sec-fetch-site'] === 'cross-site') {
      res.statusCode = 403;
      res.end(JSON.stringify({ ok: false, error: 'Cross-origin browser requests blocked' }));
      return;
    }
    if (req.method === 'GET' && req.url === '/health') {
      res.end(JSON.stringify({ ok: true, app: 'DynotchFlow', version: '1.0.0' }));
      return;
    }
    if (req.method === 'POST' && req.url === '/push') {
      let body = '';
      let aborted = false;
      req.on('data', (c) => {
        body += c;
        if (body.length > 65536) {
          aborted = true;
          req.destroy();
        }
      });
      req.on('end', () => {
        if (aborted) return;
        try {
          const data = JSON.parse(body || '{}');
          sendToRenderer('bridge:toast', {
            title: String(data.title || 'Webhook Info'),
            body: String(data.body || ''),
            accent: String(data.accent || '#4cc9f0'),
            duration: Math.min(12000, Math.max(1500, Number(data.duration || 4500)))
          });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false }));
  });

  httpServer.on('error', () => {});
  httpServer.listen(WEBHOOK_PORT, '127.0.0.1');
}

function applyAutostart(enabled) {
  try {
    const progDynotch = path.join(PROGRAMS_INSTALL_DIR, 'DynotchFlow.exe');
    const progLegacy = path.join(PROGRAMS_INSTALL_DIR, 'NotchFlow.exe');
    const progExe = fs.existsSync(progDynotch) ? progDynotch : progLegacy;
    const localDynotch = path.join(__dirname, 'DynotchFlow.exe');
    const localLegacy = path.join(__dirname, 'NotchFlow.exe');
    const localStandalone = fs.existsSync(localDynotch) ? localDynotch : localLegacy;
    const exeBaseLower = path.basename(process.execPath).toLowerCase();
    const isSelfStandalone = !process.defaultApp && (exeBaseLower.includes('dynotchflow') || exeBaseLower.includes('notchflow'));
    const bestExe = fs.existsSync(progExe)
      ? progExe
      : (isSelfStandalone ? process.execPath : (fs.existsSync(localStandalone) ? localStandalone : process.execPath));
    const needsArg = bestExe === process.execPath && !isSelfStandalone && bestExe !== progExe && bestExe !== localStandalone;
    if (enabled) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: bestExe,
        args: needsArg ? [path.resolve(__dirname)] : []
      });
    } else {
      app.setLoginItemSettings({ openAtLogin: false });
    }
  } catch {}
}

function createWindow() {
  const primary = screen.getPrimaryDisplay();
  const b = primary.bounds;
  const startX = Math.round(b.x + (b.width - WIN_W) / 2 + Number(config.offsetX || 0));

  win = new BrowserWindow({
    title: '',
    width: WIN_W,
    height: WIN_H,
    x: startX,
    y: b.y,
    frame: false,
    transparent: true,
    thickFrame: false,
    roundedCorners: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      v8CacheOptions: 'none',
      enableWebSQL: false
    }
  });

  win.setMenuBarVisibility(false);
  win.setMenu(null);
  win.on('page-title-updated', (e) => e.preventDefault());
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  applyNotchShape({
    x: Math.round((WIN_W - 224) / 2),
    y: 0,
    width: 224,
    height: config.pillHeight || 34,
    radius: Math.round((config.pillHeight || 34) / 2),
    wing: 12
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  win.once('ready-to-show', () => {
    win.showInactive();
    win.setAlwaysOnTop(true, 'screen-saver');
    sendToRenderer('bridge:config', config);
    sendToRenderer('bridge:shelf', shelf);
    sendToRenderer('bridge:external', externalState);
    if (process.argv.includes('--just-installed-to-programs')) {
      setTimeout(() => {
        sendToRenderer('bridge:toast', {
          title: 'DynotchFlow Installed',
          body: 'Running from AppData\\Local\\Programs\\DynotchFlow',
          accent: '#10b981',
          duration: 4800
        });
      }, 900);
    }
  });

  // Top-edge & shell bounds hover detection via OS cursor position (cached display bounds)
  let wasInsideZone = false;
  let cachedBounds = screen.getPrimaryDisplay().bounds;
  screen.on('display-metrics-changed', () => {
    try { cachedBounds = screen.getPrimaryDisplay().bounds; } catch {}
  });
  setInterval(() => {
    if (!win || win.isDestroyed() || isHiddenManual) return;
    try {
      const pt = screen.getCursorScreenPoint();
      const b = cachedBounds;
      const winX = Math.round(b.x + (b.width - WIN_W) / 2 + Number(config.offsetX || 0));
      const centerX = b.x + b.width / 2 + Number(config.offsetX || 0);
      const touchTopBezel = pt.y <= b.y + 4 && Math.abs(pt.x - centerX) <= 190;

      let insideShell = false;
      if (!currentShapeRect.hidden && currentShapeRect.width > 0 && currentShapeRect.height > 0) {
        const sLeft = winX + currentShapeRect.x - 10;
        const sRight = winX + currentShapeRect.x + currentShapeRect.width + 10;
        const sBottom = b.y + currentShapeRect.y + currentShapeRect.height + 12;
        insideShell = pt.x >= sLeft && pt.x <= sRight && pt.y >= b.y && pt.y <= sBottom;
      }

      if (touchTopBezel && (!wasInsideZone || currentShapeRect.hidden)) {
        wasInsideZone = true;
        sendToRenderer('bridge:top-edge-hover', true);
      } else if (insideShell) {
        wasInsideZone = true;
      } else if (!touchTopBezel && !insideShell && (wasInsideZone || isExpanded)) {
        wasInsideZone = false;
        sendToRenderer('bridge:top-edge-hover', false);
      }
    } catch {}
  }, 75);

  // Periodic ensure always-on-top over Windows shell/taskbar
  setInterval(() => {
    if (win && !win.isDestroyed() && !isHiddenManual) {
      win.setAlwaysOnTop(true, 'screen-saver');
    }
  }, 8000);
}

function createTray() {
  trayIconImg = nativeImage.createFromBuffer(createTrayPng());
  tray = new Tray(trayIconImg);
  tray.setToolTip('DynotchFlow — Dynamic Island (Ctrl+Alt+N)');
  const menu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide (Ctrl+Alt+N)',
      click: () => toggleVisibility()
    },
    {
      label: 'Toggle Top Auto-Hide (Ctrl+Alt+H)',
      click: () => toggleAutoHideTop()
    },
    {
      label: 'Refresh Weather, Prayer & Calendar',
      click: () => refreshExternalData(true)
    },
    { type: 'separator' },
    {
      label: 'Center Position (Reset Offset)',
      click: () => {
        config.offsetX = 0;
        saveJson(CONFIG_PATH, config);
        positionWindow();
        sendToRenderer('bridge:config', config);
      }
    },
    {
      label: 'Shift Right (+460px Side-by-Side)',
      click: () => {
        config.offsetX = 460;
        saveJson(CONFIG_PATH, config);
        positionWindow();
        sendToRenderer('bridge:config', config);
      }
    },
    {
      label: 'Optimize RAM Now',
      click: () => requestMemoryTrim()
    },
    {
      label: 'Open Program Folder (AppData\\Local\\Programs)',
      click: () => {
        const dir = fs.existsSync(PROGRAMS_INSTALL_DIR) ? PROGRAMS_INSTALL_DIR : __dirname;
        shell.openPath(dir);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit DynotchFlow',
      click: () => app.quit()
    }
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => toggleVisibility());
}

function toggleVisibility() {
  if (!win || win.isDestroyed()) return;
  isHiddenManual = !isHiddenManual;
  if (isHiddenManual) {
    win.hide();
  } else {
    win.setOpacity(1);
    win.showInactive();
    win.setAlwaysOnTop(true, 'screen-saver');
    sendToRenderer('bridge:toggle-visibility');
  }
}

function toggleAutoHideTop() {
  config.autoHideTopEdge = !Boolean(config.autoHideTopEdge);
  saveJson(CONFIG_PATH, config);
  sendToRenderer('bridge:config', config);
  sendToRenderer('bridge:toast', {
    title: config.autoHideTopEdge ? 'Top Auto-Hide Enabled (Ctrl+Alt+H)' : 'Standard Pill Mode (Ctrl+Alt+H)',
    body: config.autoHideTopEdge ? 'Hover the top edge of the screen to reveal the Island' : 'Dynamic Island stays visible at the top bezel',
    accent: '#38bdf8',
    duration: 2100
  });
}

function setupIpc() {
  ipcMain.on('notch:mouse-interactive', (_e, interactive) => {
    if (!win || win.isDestroyed()) return;
    if (interactive) {
      win.setIgnoreMouseEvents(false);
    } else {
      win.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  ipcMain.on('notch:expanded-state', (_e, expanded) => {
    isExpanded = Boolean(expanded);
    sendBridgeCommand(`win:expanded:${isExpanded ? 1 : 0}`);
    if (!isExpanded) {
      setTimeout(() => sendBridgeCommand('mem:trim'), 450);
    }
  });

  ipcMain.on('notch:update-shape', (_e, rect) => {
    applyNotchShape(rect);
  });

  ipcMain.on('notch:media-action', (_e, { action, payload }) => {
    if (action === 'playpause') sendBridgeCommand('media:playpause');
    else if (action === 'next') sendBridgeCommand('media:next');
    else if (action === 'prev') sendBridgeCommand('media:prev');
    else if (action === 'seek') sendBridgeCommand(`media:seek:${Number(payload || 0)}`);
  });

  ipcMain.on('notch:set-volume', (_e, pct) => {
    sendBridgeCommand(`vol:set:${Math.max(0, Math.min(100, Math.round(Number(pct || 0))))}`);
  });

  ipcMain.on('notch:toggle-mute', () => {
    sendBridgeCommand('vol:mute');
  });

  ipcMain.handle('notch:get-state', async () => {
    return { config, shelf, external: externalState, lyrics: lastLyricsResult, media: lastMediaMsg };
  });

  ipcMain.handle('notch:save-config', async (_e, partial) => {
    const prevOffset = config.offsetX;
    const prevAutostart = config.autostart;
    const cityChanged = partial.city !== undefined && partial.city.trim() && partial.city.trim().toLowerCase() !== (config.city || '').toLowerCase();
    const needExternalRefresh = cityChanged || (
      partial.icsUrl !== undefined && partial.icsUrl !== config.icsUrl
    ) || (
      partial.customFeeds !== undefined
    );
    config = { ...config, ...partial };
    config.theme = config.theme === 'matte' ? 'matte' : 'normal';
    if (cityChanged) {
      try {
        const geo = await services.geocodeCity(config.city);
        if (geo) {
          config.weatherLat = geo.lat;
          config.weatherLon = geo.lon;
        }
      } catch {}
    }
    saveJson(CONFIG_PATH, config);
    if (config.offsetX !== prevOffset) positionWindow();
    if (config.autostart !== prevAutostart) applyAutostart(config.autostart);
    sendToRenderer('bridge:config', config);
    if (needExternalRefresh) refreshExternalData();
    return config;
  });

  ipcMain.handle('notch:connect-gcal', async () => {
    const clip = (clipboard.readText() || '').trim();
    if (/^https:\/\/calendar\.google\.com\/calendar\/ical\/.+\.ics/i.test(clip)) {
      config.icsUrl = clip;
      saveJson(CONFIG_PATH, config);
      sendToRenderer('bridge:config', config);
      await refreshExternalData();
      return { connected: true, fromClipboard: true, icsUrl: clip };
    }
    const acct = (config.gcalAccount || '').trim();
    const targetUrl = acct
      ? `https://calendar.google.com/calendar/u/0/r/settings/calendar/${encodeURIComponent(acct)}`
      : 'https://calendar.google.com/calendar/u/0/r/settings';
    shell.openExternal(targetUrl);

    if (gcalWatchTimer) clearInterval(gcalWatchTimer);
    let checks = 0;
    gcalWatchTimer = setInterval(async () => {
      checks++;
      if (checks > 60) {
        clearInterval(gcalWatchTimer);
        gcalWatchTimer = null;
        return;
      }
      const curClip = (clipboard.readText() || '').trim();
      if (/^https:\/\/calendar\.google\.com\/calendar\/ical\/.+\.ics/i.test(curClip) && curClip !== config.icsUrl) {
        clearInterval(gcalWatchTimer);
        gcalWatchTimer = null;
        config.icsUrl = curClip;
        saveJson(CONFIG_PATH, config);
        sendToRenderer('bridge:config', config);
        await refreshExternalData();
        sendToRenderer('bridge:toast', {
          title: 'Google Calendar Linked',
          body: 'iCal feed connected automatically',
          accent: '#38bdf8',
          duration: 4200
        });
      }
    }, 1500);

    return { connected: false, openedBrowser: true };
  });

  ipcMain.handle('notch:refresh-external', async () => {
    return await refreshExternalData(true);
  });

  ipcMain.on('notch:optimize-ram', () => {
    requestMemoryTrim();
  });

  ipcMain.handle('notch:shelf-add', async (_e, item) => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      kind: item.kind || 'text',
      title: String(item.title || '').slice(0, 120),
      content: String(item.content || ''),
      path: String(item.path || ''),
      createdAt: Date.now()
    };
    shelf.unshift(entry);
    shelf = shelf.slice(0, 30);
    saveJson(SHELF_PATH, shelf);
    sendToRenderer('bridge:shelf', shelf);
    return shelf;
  });

  ipcMain.handle('notch:shelf-remove', async (_e, id) => {
    shelf = shelf.filter(x => x.id !== id);
    saveJson(SHELF_PATH, shelf);
    sendToRenderer('bridge:shelf', shelf);
    return shelf;
  });

  ipcMain.handle('notch:shelf-clear', async () => {
    shelf = [];
    saveJson(SHELF_PATH, shelf);
    sendToRenderer('bridge:shelf', shelf);
    return shelf;
  });

  ipcMain.on('notch:shelf-open', (_e, filePath) => {
    if (filePath && fs.existsSync(filePath)) shell.openPath(filePath);
  });

  ipcMain.on('notch:shelf-reveal', (_e, filePath) => {
    if (filePath && fs.existsSync(filePath)) shell.showItemInFolder(filePath);
  });

  ipcMain.on('notch:shelf-drag', (event, filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        event.sender.startDrag({
          file: filePath,
          icon: trayIconImg || nativeImage.createFromBuffer(createTrayPng())
        });
      }
    } catch {}
  });

  ipcMain.on('notch:open-external', (_e, url) => {
    if (url && /^https?:\/\//i.test(String(url))) {
      shell.openExternal(String(url));
    }
  });

  ipcMain.handle('notch:notify-schedule', async (_e, payload) => {
    try {
      if (Notification.isSupported()) {
        const notif = new Notification({
          title: String(payload?.title || 'DynotchFlow Schedule'),
          body: String(payload?.body || ''),
          silent: false
        });
        notif.on('click', () => {
          if (payload?.url && /^https?:\/\//i.test(String(payload.url))) {
            shell.openExternal(String(payload.url));
          }
        });
        notif.show();
      }
    } catch {}
    return true;
  });

  ipcMain.handle('notch:copy-text', async (_e, text) => {
    clipboard.writeText(String(text || ''));
    return true;
  });

  ipcMain.handle('notch:read-clipboard', async () => {
    return clipboard.readText() || '';
  });

  ipcMain.handle('notch:event-add', async (_e, ev) => {
    const startMs = Number(ev.startMs) || Date.now();
    const durationMin = Math.max(15, Number(ev.durationMin || 60));
    const tag = String(ev.tag || 'Personal').trim();
    const colorMap = {
      Study: '#4986e7',
      Kuliah: '#4986e7',
      Work: '#16a765',
      Profesional: '#16a765',
      Social: '#fa573c',
      Sosial: '#fa573c',
      Personal: '#cd74e6'
    };
    const item = {
      id: `local_${Date.now()}`,
      title: String(ev.title || 'Event').trim(),
      tag,
      color: colorMap[tag] || '#38bdf8',
      location: String(ev.location || '').trim(),
      startMs,
      endMs: Number(ev.endMs || (startMs + durationMin * 60000)),
      allDay: false,
      source: 'local'
    };
    config.localEvents = [...(config.localEvents || []), item];
    saveJson(CONFIG_PATH, config);
    await refreshExternalData();
    return externalState.calendar;
  });

  ipcMain.handle('notch:event-remove', async (_e, id) => {
    config.localEvents = (config.localEvents || []).filter(e => e.id !== id);
    saveJson(CONFIG_PATH, config);
    await refreshExternalData();
    return externalState.calendar;
  });

  ipcMain.handle('notch:test-webhook', async () => {
    sendToRenderer('bridge:toast', {
      title: 'Webhook Push OK',
      body: `POST JSON to http://127.0.0.1:${WEBHOOK_PORT}/push`,
      accent: '#4cc9f0',
      duration: 4500
    });
    return true;
  });

  ipcMain.on('notch:quit', () => {
    app.quit();
  });
}

app.on('second-instance', () => {
  if (win && !win.isDestroyed()) {
    isHiddenManual = false;
    win.showInactive();
    win.setAlwaysOnTop(true, 'screen-saver');
  }
});

app.whenReady().then(() => {
  loadState();
  setupIpc();
  createWindow();
  createTray();
  startMediaVolumeBridge();
  startWebhookServer();
  refreshExternalData();

  globalShortcut.register('CommandOrControl+Alt+N', toggleVisibility);
  globalShortcut.register('CommandOrControl+Alt+H', toggleAutoHideTop);
  globalShortcut.register('Alt+H', toggleAutoHideTop);
  screen.on('display-metrics-changed', positionWindow);

  // Auto-trim cold startup/GPU working-set pages so Task Manager stays < 50 MB RAM idle
  setTimeout(() => { if (!isExpanded) requestMemoryTrim(); }, 3000);
  setTimeout(() => { if (!isExpanded) requestMemoryTrim(); }, 9000);
  setTimeout(() => { if (!isExpanded) requestMemoryTrim(); }, 18000);
  setInterval(() => { if (!isExpanded) requestMemoryTrim(); }, 30 * 1000);

  // Refresh weather, prayer, calendar, custom feeds every 5 minutes
  setInterval(refreshExternalData, 5 * 60 * 1000);

  // Check every 60s for date rollover so Kemenag prayer times always stay synced daily/weekly
  setInterval(() => {
    if (getTodayDateKey() !== lastPrayerDateKey) {
      refreshExternalData();
    }
  }, 60 * 1000);
});

app.on('will-quit', () => {
  isQuitting = true;
  clearTimeout(bridgeRestartTimer);
  if (gcalWatchTimer) clearInterval(gcalWatchTimer);
  globalShortcut.unregisterAll();
  if (bridgeProc) {
    try {
      bridgeProc.stdin.write('__EXIT__\n');
      bridgeProc.kill();
    } catch {}
  }
  if (httpServer) {
    try { httpServer.close(); } catch {}
  }
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
