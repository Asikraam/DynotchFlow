const ICONS = {
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  shelf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  vol: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  mute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6M8 14v6M12 16v6"/></svg>`,
  sync: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
  autohide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/><line x1="4" y1="5" x2="20" y2="5"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
};

function weatherIconSvg(kind) {
  if (kind === 'sun' || kind === 'sun-cloud') return ICONS.sun;
  if (kind && (kind.includes('rain') || kind === 'drizzle' || kind === 'storm')) return ICONS.rain;
  return ICONS.cloud;
}

const shell = document.getElementById('notch-shell');
const pillIdleEl = document.getElementById('pill-idle');
const pillMediaEl = document.getElementById('pill-media');
const pillHudEl = document.getElementById('pill-hud');
const pillSchedAlertEl = document.getElementById('pill-sched-alert');
const idleClockEl = document.getElementById('idle-clock');
const idleAlertChipEl = document.getElementById('idle-alert-chip');
const idleAlertDotEl = document.getElementById('idle-alert-dot');
const idleAlertTextEl = document.getElementById('idle-alert-text');
const timeCurEl = document.getElementById('time-cur');
const timeTotEl = document.getElementById('time-tot');
const pillLyricTrackEl = document.getElementById('pill-lyric-track');

let config = {};
let mediaState = { active: false, status: 'Stopped', position: 0, duration: 0, ts: Date.now() };
let lyricsState = { found: false, lines: [], plain: [] };
let externalState = { weather: null, prayer: null, calendar: { events: [] }, customFeeds: [] };
let shelfState = [];
let volumeState = { volume: 0, muted: false };

let isExpanded = false;
let isPinned = false;
let isHudActive = false;
let hudTimer = null;
let hoverEnterTimer = null;
let hoverLeaveTimer = null;
let activeLyricIdx = -1;
let lastPassedLyricIdx = -1;
let lastPillText = '';

const DEFAULT_VINYL_ART = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#2c2c34"/>
        <stop offset="65%" stop-color="#141418"/>
        <stop offset="100%" stop-color="#0b0b0e"/>
      </radialGradient>
      <linearGradient id="lbl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4cc9f0"/>
        <stop offset="100%" stop-color="#4361ee"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="22" fill="url(#g)"/>
    <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="27" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="17" fill="url(#lbl)"/>
    <circle cx="60" cy="60" r="5" fill="#111115"/>
  </svg>`
);

// Hydrate static icon placeholders
document.querySelectorAll('[data-ico]').forEach(el => {
  const k = el.getAttribute('data-ico');
  if (ICONS[k]) el.innerHTML = ICONS[k];
});
document.getElementById('play-ico').innerHTML = ICONS.play;
document.getElementById('idle-weather-icon').innerHTML = ICONS.cloud;
document.getElementById('hdr-vol-ico').innerHTML = ICONS.vol;
document.getElementById('pill-art').src = DEFAULT_VINYL_ART;
document.getElementById('exp-art').src  = DEFAULT_VINYL_ART;
document.getElementById('pill-art').onerror = (e) => { e.target.src = DEFAULT_VINYL_ART; };
document.getElementById('exp-art').onerror  = (e) => { e.target.src = DEFAULT_VINYL_ART; };

function fmtSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

function extractDominantColor(imgEl) {
  try {
    const canvas = document.getElementById('color-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imgEl, 0, 0, 8, 8);
    const data = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
      if (lum > 35 && lum < 235) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }
    }
    if (count === 0) return;
    r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
    const maxC = Math.max(r, g, b, 1);
    if (maxC < 140) {
      const boost = 165 / maxC;
      r = Math.min(255, Math.round(r * boost));
      g = Math.min(255, Math.round(g * boost));
      b = Math.min(255, Math.round(b * boost));
    }
    document.documentElement.style.setProperty('--accent', `rgb(${r}, ${g}, ${b})`);
    document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  } catch {}
}

let isSchedAlertActive = false;
let schedAlertTimer = null;
let currentCalFilter = 'all';
const notifiedEventKeys = new Set();
const notifiedPrayerKeys = new Set();
let lastNotifDateKey = '';
let lastActiveEventId = '';
let isHoveringTopZone = false;
const topEdgeSensor = document.getElementById('top-edge-sensor');
let manualSkyTheme = '';

function cleanEventTitle(raw) {
  return String(raw || '').replace(/^\[(Kuliah|Study|Pro|Profesional|Work|Sosial|Social|Personal|Libur)\]\s*/i, '').trim();
}

const CAL_TAG_DISPLAY = {
  kuliah: 'Study',
  study: 'Study',
  pro: 'Work',
  profesional: 'Work',
  work: 'Work',
  sosial: 'Social',
  social: 'Social',
  personal: 'Personal',
  kalender: 'Calendar',
  calendar: 'Calendar'
};

function normalizeCalTag(tag) {
  const key = String(tag || '').trim().toLowerCase();
  return CAL_TAG_DISPLAY[key] || (tag ? String(tag).trim() : 'Calendar');
}

const PRAYER_KEY_DISPLAY = {
  subuh: 'Fajr',
  fajr: 'Fajr',
  dzuhur: 'Dhuhr',
  dhuhr: 'Dhuhr',
  ashar: 'Asr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isya: 'Isha',
  isha: 'Isha'
};

function formatPrayerName(key) {
  const k = String(key || '').trim();
  return PRAYER_KEY_DISPLAY[k.toLowerCase()] || k;
}

function cleanTrackDisplay(rawTitle, rawArtist) {
  const cleanPart = (s) => String(s || '')
    .replace(/\.(mp3|flac|wav|m4a|ogg|opus|mp4|mkv|webm)$/i, '')
    .replace(/\s*[\(\[](?:official\s*(?:music\s*)?(?:video|audio|lyric(?:s)?\s*video|visualizer|mv)|lyrics?|lirik|audio|hd|hq|4k|remastered(?:\s*\d{4})?|live|explicit|clean|visualizer)[\)\]]/gi, '')
    .replace(/\s*-\s*(?:official\s*(?:music\s*)?(?:video|audio)|lyrics?|remastered(?:\s*\d{4})?)$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const t = cleanPart(lyricsState.title || rawTitle);
  const a = cleanPart(lyricsState.artist || rawArtist);
  if (t && a) return `${t} · ${a}`;
  return t || a || 'Playing Media';
}

function fmtHHMM(ms) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getNextCountdown() {
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const curMin = now.getHours() * 60 + now.getMinutes();

  const events = (externalState.calendar && externalState.calendar.events) || [];
  // 1. Check event starting within 60 min or currently live
  for (const ev of events) {
    if (ev.allDay) continue;
    const diffStartMin = Math.round((ev.startMs - nowMs) / 60000);
    const isLive = nowMs >= ev.startMs && nowMs < (ev.endMs || ev.startMs + 3600000);
    const shortTitle = cleanEventTitle(ev.title).replace(/^\[[^\]]+\]\s*/, '').slice(0, 22);
    if (diffStartMin >= 0 && diffStartMin <= 60) {
      return {
        text: `${fmtHHMM(ev.startMs)} ${shortTitle} · ${diffStartMin === 0 ? 'Now' : 'in ' + diffStartMin + 'm'}`,
        color: ev.color || '#38bdf8'
      };
    }
    if (isLive) {
      return {
        text: `${fmtHHMM(ev.startMs)} ${shortTitle} · Now`,
        color: ev.color || '#10b981'
      };
    }
  }

  // 2. Check next prayer within 35 min (including midnight rollover for Fajr)
  if (config.showPrayerCountdown !== false) {
    const timings = (externalState.prayer && externalState.prayer.timings) || [];
    for (const p of timings) {
      const [hh, mm] = p.time.split(':').map(Number);
      const pMin = hh * 60 + mm;
      let diff = pMin - curMin;
      if (diff < -720) diff += 1440; // Midnight rollover
      if (diff >= 0 && diff <= 35) {
        return {
          text: `${formatPrayerName(p.key)} · ${diff === 0 ? 'Now' : 'in ' + diff + 'm'}`,
          color: '#38bdf8'
        };
      }
    }
  }
  return null;
}

function flashScheduleAlert(badgeText, titleText, timeText, color = '#38bdf8', url = '', alsoNative = true) {
  const alertEl = document.getElementById('pill-sched-alert');
  if (!alertEl) return;
  alertEl.style.setProperty('--sched-color', color || '#38bdf8');
  document.getElementById('sched-alert-badge').textContent = badgeText;
  document.getElementById('sched-alert-time').textContent = timeText;
  document.getElementById('sched-alert-title').textContent = titleText;

  isSchedAlertActive = true;
  document.getElementById('pill-idle').classList.add('hidden');
  document.getElementById('pill-media').classList.add('hidden');
  document.getElementById('pill-hud').classList.add('hidden');
  alertEl.classList.remove('hidden');
  syncNotchClass();

  if (alsoNative) {
    window.notchApi.notifySchedule({
      title: `${badgeText} (${timeText})`,
      body: titleText,
      url
    });
  }

  clearTimeout(schedAlertTimer);
  schedAlertTimer = setTimeout(() => {
    isSchedAlertActive = false;
    alertEl.classList.add('hidden');
    if (isHudActive) {
      document.getElementById('pill-hud').classList.remove('hidden');
    } else if (mediaState.active) {
      document.getElementById('pill-media').classList.remove('hidden');
    } else {
      document.getElementById('pill-idle').classList.remove('hidden');
    }
    syncNotchClass();
  }, 6200);
}

function checkScheduleTransitions() {
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (todayKey !== lastNotifDateKey) {
    lastNotifDateKey = todayKey;
    notifiedEventKeys.clear();
    notifiedPrayerKeys.clear();
  }

  const events = (externalState.calendar && externalState.calendar.events) || [];
  let currentLive = null;

  for (const ev of events) {
    if (ev.allDay) continue;
    const diffMin = Math.round((ev.startMs - nowMs) / 60000);
    const timeRange = `${fmtHHMM(ev.startMs)} – ${fmtHHMM(ev.endMs || ev.startMs + 3600000)} · ${normalizeCalTag(ev.tag)}`;
    const cleanT = cleanEventTitle(ev.title);

    // 10-minute heads-up notification (tolerant 9..10m range)
    const key10 = `${ev.id}_10m`;
    if (diffMin <= 10 && diffMin >= 9 && !notifiedEventKeys.has(key10)) {
      notifiedEventKeys.add(key10);
      flashScheduleAlert('10 MIN REMINDER', cleanT, timeRange, ev.color || '#fbbf24', ev.htmlLink, true);
    }

    // Event start notification (tolerant -1..0m range)
    const keyStart = `${ev.id}_start`;
    if (diffMin <= 0 && diffMin >= -1 && !notifiedEventKeys.has(keyStart)) {
      notifiedEventKeys.add(keyStart);
      flashScheduleAlert('STARTING NOW', cleanT, timeRange, ev.color || '#10b981', ev.htmlLink, true);
    }

    if (nowMs >= ev.startMs && nowMs <= (ev.endMs || ev.startMs + 3600000)) {
      currentLive = ev;
    }
  }

  // Automatic back-to-back schedule transition notification
  if (currentLive && lastActiveEventId && currentLive.id !== lastActiveEventId) {
    const keyTrans = `${currentLive.id}_trans`;
    if (!notifiedEventKeys.has(keyTrans)) {
      notifiedEventKeys.add(keyTrans);
      const timeRange = `${fmtHHMM(currentLive.startMs)} – ${fmtHHMM(currentLive.endMs || currentLive.startMs + 3600000)}`;
      flashScheduleAlert('NEXT EVENT', cleanEventTitle(currentLive.title), timeRange, currentLive.color || '#38bdf8', currentLive.htmlLink, true);
    }
  }
  if (currentLive) lastActiveEventId = currentLive.id;

  // Check Prayer transitions (10m, 5m before & exact time)
  if (config.prayerAdzanAlert !== false && externalState.prayer && Array.isArray(externalState.prayer.timings)) {
    const curMin = now.getHours() * 60 + now.getMinutes();
    const dateKey = externalState.prayer.dateKey || todayKey;
    const cityLbl = externalState.prayer.city || config.city || 'Local';
    for (const p of externalState.prayer.timings) {
      const [hh, mm] = String(p.time || '').split(':').map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) continue;
      const pMin = hh * 60 + mm;
      const diff = pMin - curMin;
      const pName = formatPrayerName(p.key);
      const key10m = `${dateKey}_${pName}_10m`;
      const key5m  = `${dateKey}_${pName}_5m`;
      const keyNow = `${dateKey}_${pName}_now`;
      if (diff === 10 && !notifiedPrayerKeys.has(key10m)) {
        notifiedPrayerKeys.add(key10m);
        flashScheduleAlert('10 MIN TO PRAYER', `Prepare for ${pName} (${cityLbl})`, `${p.time} · Local`, '#38bdf8', '', true);
      } else if (diff === 5 && !notifiedPrayerKeys.has(key5m)) {
        notifiedPrayerKeys.add(key5m);
        flashScheduleAlert('5 MIN TO PRAYER', `Prepare for ${pName} (${cityLbl})`, `${p.time} · Local`, '#38bdf8', '', true);
      } else if (diff === 0 && !notifiedPrayerKeys.has(keyNow)) {
        notifiedPrayerKeys.add(keyNow);
        flashScheduleAlert('PRAYER TIME', `Time for ${pName} (${cityLbl})`, `${p.time} · Local`, '#10b981', '', true);
      }
    }
  }
}
setInterval(checkScheduleTransitions, 15000);

function updateClockAndAlert() {
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('idle-clock').textContent = `${hh}:${mm}`;

  const showWeather = config.showWeatherOnIdle !== false;
  const idleBadge = document.getElementById('idle-badge');
  const idleSep = document.getElementById('idle-dot-sep');
  if (idleBadge) idleBadge.classList.toggle('hidden', !showWeather);
  if (idleSep) idleSep.classList.toggle('hidden', !showWeather);

  const chip = document.getElementById('idle-alert-chip');
  const dotEl = document.getElementById('idle-alert-dot');
  const txtEl = document.getElementById('idle-alert-text');
  const alertInfo = getNextCountdown();
  if (alertInfo && txtEl) {
    txtEl.textContent = alertInfo.text;
    if (dotEl) {
      dotEl.style.background = alertInfo.color || '#38bdf8';
      dotEl.style.color = alertInfo.color || '#38bdf8';
    }
    chip.classList.remove('hidden');
  } else if (chip) {
    chip.classList.add('hidden');
  }
  if (!isExpanded && !mediaState.active && !isHudActive && !isSchedAlertActive) {
    syncNotchClass();
  }
}

let shapeAnimEndMs = 0;
let shapeRafRunning = false;
let lastShapeKey = '';
let suppressHoverUntil = 0;

function syncWindowShape() {
  if (!shell || !window.notchApi.updateShape) return;
  const r = shell.getBoundingClientRect();
  const isHiddenMode = shell.classList.contains('is-hidden-fs') || shell.classList.contains('is-hidden-top');
  if (isHiddenMode && r.bottom <= 2) {
    if (lastShapeKey !== 'hidden') {
      lastShapeKey = 'hidden';
      window.notchApi.updateShape({ hidden: true });
    }
    return;
  }
  const rad = isExpanded ? 24 : (isSchedAlertActive ? 20 : Math.round((Number(config.pillHeight) || 34) / 2));
  const key = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.bottom)},${rad}`;
  if (key !== lastShapeKey) {
    lastShapeKey = key;
    window.notchApi.updateShape({
      x: r.left,
      y: Math.max(0, r.top),
      width: r.width,
      height: Math.max(0, r.bottom),
      radius: rad,
      wing: 12
    });
  }
}

function animateShapeTransition(durationMs = 520) {
  shapeAnimEndMs = Math.max(shapeAnimEndMs, performance.now() + durationMs);
  syncWindowShape();
  if (shapeRafRunning) return;
  shapeRafRunning = true;
  const step = (now) => {
    syncWindowShape();
    if (now < shapeAnimEndMs) {
      requestAnimationFrame(step);
    } else {
      shapeRafRunning = false;
      syncWindowShape();
      if (shell.classList.contains('is-hidden-top') || shell.classList.contains('is-hidden-fs')) {
        lastShapeKey = 'hidden';
        window.notchApi.updateShape({ hidden: true });
      }
    }
  };
  requestAnimationFrame(step);
}

let prevStateSignature = '';

function syncNotchClass() {
  if (topEdgeSensor) {
    topEdgeSensor.classList.toggle('active-sensor', Boolean(config.autoHideTopEdge));
  }
  const hideFs = Boolean(config.autoHideFullscreen && mediaState.fullscreen && !isExpanded);
  shell.classList.toggle('is-hidden-fs', hideFs);

  const hideTop = Boolean(config.autoHideTopEdge && !isExpanded && !isPinned && !isHoveringTopZone && !isSchedAlertActive && !isHudActive);
  shell.classList.toggle('is-hidden-top', hideTop);

  let targetState = 'state-idle';
  if (isExpanded) {
    targetState = 'state-expanded';
  } else if (isSchedAlertActive) {
    targetState = 'state-sched-alert';
  } else if (isHudActive) {
    targetState = 'state-hud';
  } else if (mediaState.active) {
    targetState = 'state-media';
  } else {
    const hasAlert = !idleAlertChipEl?.classList.contains('hidden');
    targetState = hasAlert ? 'state-idle-event' : 'state-idle';
  }

  const pillH = Number(config.pillHeight || 34);
  if (shell.dataset.size !== String(pillH)) {
    shell.dataset.size = String(pillH);
  }
  const isMatte = config.theme === 'matte';
  shell.classList.toggle('theme-matte', isMatte);
  const sig = `${targetState}|${hideFs}|${hideTop}|${pillH}|${isMatte ? 'matte' : 'normal'}`;
  if (sig !== prevStateSignature) {
    prevStateSignature = sig;
    shell.classList.remove('state-idle', 'state-idle-event', 'state-media', 'state-hud', 'state-sched-alert', 'state-expanded');
    shell.classList.add(targetState);
    animateShapeTransition(420);
  }
}

function scrollActiveLyricIntoView(instant = false) {
  const focusIdx = activeLyricIdx >= 0 ? activeLyricIdx : lastPassedLyricIdx;
  if (focusIdx < 0) return;
  const pane = document.getElementById('lyrics-pane');
  const activeEl = cachedLyricNodes[focusIdx];
  if (!pane || !activeEl) return;
  const targetTop = activeEl.offsetTop - (pane.clientHeight / 2) + (activeEl.clientHeight / 2);
  pane.scrollTo({ top: Math.max(0, targetTop), behavior: instant ? 'auto' : 'smooth' });
}

function expandNotch(focusTab) {
  clearTimeout(hoverLeaveTimer);
  isHoveringTopZone = true;
  isExpanded = true;
  window.notchApi.setExpandedState(true);
  if (focusTab) switchTab(focusTab);
  syncNotchClass();
  ensureScrubberLoop();
  requestAnimationFrame(() => scrollActiveLyricIntoView(true));
}

function collapseNotch() {
  if (isPinned) return;
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) return;
  isHoveringTopZone = false;
  isExpanded = false;
  window.notchApi.setExpandedState(false);
  window.notchApi.setMouseInteractive(false);
  syncNotchClass();
}

if (topEdgeSensor) {
  topEdgeSensor.addEventListener('mouseenter', () => {
    if (Date.now() < suppressHoverUntil) return;
    isHoveringTopZone = true;
    window.notchApi.setMouseInteractive(true);
    clearTimeout(hoverLeaveTimer);
    syncNotchClass();
    if (config.expandOnHover !== false && !isExpanded) {
      hoverEnterTimer = setTimeout(() => expandNotch(), 95);
    }
  });
}

shell.addEventListener('mouseenter', () => {
  if (Date.now() < suppressHoverUntil) return;
  isHoveringTopZone = true;
  window.notchApi.setMouseInteractive(true);
  clearTimeout(hoverLeaveTimer);
  syncNotchClass();
  if (config.expandOnHover !== false && !isExpanded) {
    hoverEnterTimer = setTimeout(() => expandNotch(), 85);
  }
});

shell.addEventListener('mouseleave', () => {
  clearTimeout(hoverEnterTimer);
  hoverLeaveTimer = setTimeout(() => collapseNotch(), 260);
});

shell.addEventListener('click', () => {
  if (!isExpanded) expandNotch();
});

// Tab navigation
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === name));
  ensureScrubberLoop();
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    switchTab(btn.dataset.tab);
  });
});

document.getElementById('btn-pin').addEventListener('click', (e) => {
  e.stopPropagation();
  isPinned = !isPinned;
  e.currentTarget.classList.toggle('active', isPinned);
});

// Music controls & Custom Wavy Scrubber (with 0ms Optimistic UI)
let optimisticStatusUntil = 0;

document.getElementById('btn-prev').addEventListener('click', () => {
  mediaState.position = 0;
  mediaState.ts = Date.now();
  window.notchApi.mediaAction('prev');
});

document.getElementById('btn-play').addEventListener('click', () => {
  if (mediaState.active) {
    mediaState.position = currentPlaybackPos();
    mediaState.ts = Date.now();
    mediaState.status = mediaState.status === 'Playing' ? 'Paused' : 'Playing';
    optimisticStatusUntil = Date.now() + 950;
    renderMediaUi();
  }
  window.notchApi.mediaAction('playpause');
});

document.getElementById('btn-next').addEventListener('click', () => {
  mediaState.position = 0;
  mediaState.ts = Date.now();
  window.notchApi.mediaAction('next');
});

const wavyCanvas = document.getElementById('wavy-scrubber');
const scrubberWrap = document.querySelector('.scrubber-wrap');
let isSeeking = false;
let isHoveringScrubber = false;
let seekFraction = 0;
let wavePhase = 0;
let waveAmp = 0;

if (scrubberWrap) {
  scrubberWrap.addEventListener('mouseenter', () => { isHoveringScrubber = true; });
  scrubberWrap.addEventListener('mouseleave', () => { isHoveringScrubber = false; });
}

function clientXToFraction(clientX) {
  const rect = wavyCanvas.getBoundingClientRect();
  const pad = 7;
  const usable = Math.max(1, rect.width - pad * 2);
  return Math.max(0, Math.min(1, (clientX - rect.left - pad) / usable));
}

wavyCanvas.addEventListener('pointerdown', (e) => {
  isSeeking = true;
  wavyCanvas.setPointerCapture(e.pointerId);
  seekFraction = clientXToFraction(e.clientX);
  const dur = Math.max(1, mediaState.duration || 0);
  timeCurEl.textContent = fmtSec(seekFraction * dur);
  timeTotEl.textContent = '-' + fmtSec(Math.max(0, dur - seekFraction * dur));
  ensureScrubberLoop();
});

wavyCanvas.addEventListener('pointermove', (e) => {
  if (!isSeeking) return;
  seekFraction = clientXToFraction(e.clientX);
  const dur = Math.max(1, mediaState.duration || 0);
  timeCurEl.textContent = fmtSec(seekFraction * dur);
  timeTotEl.textContent = '-' + fmtSec(Math.max(0, dur - seekFraction * dur));
});

wavyCanvas.addEventListener('pointerup', (e) => {
  if (!isSeeking) return;
  isSeeking = false;
  try { wavyCanvas.releasePointerCapture(e.pointerId); } catch {}
  const frac = clientXToFraction(e.clientX);
  if (mediaState.duration > 0) {
    const targetSec = frac * mediaState.duration;
    mediaState.position = targetSec;
    mediaState.ts = Date.now();
    window.notchApi.mediaAction('seek', targetSec);
  }
});

let scrubberRafRunning = false;

function renderWavyFrame() {
  const dpr = window.devicePixelRatio || 1;
  const cssW = wavyCanvas.clientWidth || 140;
  const cssH = wavyCanvas.clientHeight || 20;
  const targetW = Math.round(cssW * dpr);
  const targetH = Math.round(cssH * dpr);
  if (wavyCanvas.width !== targetW || wavyCanvas.height !== targetH) {
    wavyCanvas.width = targetW;
    wavyCanvas.height = targetH;
  }

  const ctx = wavyCanvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  const dur = Math.max(1, mediaState.duration || 0);
  const pos = currentPlaybackPos();
  const frac = isSeeking ? seekFraction : Math.max(0, Math.min(1, pos / dur));
  const isPlaying = mediaState.status === 'Playing' && !isSeeking;

  const targetAmp = isPlaying ? 2.4 : 0.0;
  waveAmp += (targetAmp - waveAmp) * 0.14;
  if (isPlaying || waveAmp > 0.05) wavePhase += 0.085;

  const pad = 6;
  const midY = cssH / 2;
  const xStart = pad;
  const xEnd = cssW - pad;
  const xCur = xStart + (xEnd - xStart) * frac;

  const isMatteTheme = shell && shell.classList.contains('theme-matte');
  const cs = getComputedStyle(shell || document.documentElement);
  const accentRgb = cs.getPropertyValue('--accent-rgb').trim() || '76, 201, 240';

  // Unplayed right track
  ctx.beginPath();
  ctx.moveTo(xCur, midY);
  ctx.lineTo(xEnd, midY);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = isHoveringScrubber ? 2.8 : 2.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Played left wavy track
  if (xCur > xStart + 0.5) {
    ctx.beginPath();
    const wavelength = 18;
    for (let x = xStart; x <= xCur; x += 1.5) {
      const edgeTaper = Math.min(1, (x - xStart) / 8, (xCur - x) / 8);
      const y = midY + Math.sin((x / wavelength) * Math.PI * 2 - wavePhase) * waveAmp * edgeTaper;
      if (x === xStart) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgb(${accentRgb})`;
    ctx.lineWidth = isHoveringScrubber ? 2.8 : 2.2;
    ctx.lineCap = 'round';
    ctx.shadowColor = isMatteTheme ? 'transparent' : `rgba(${accentRgb}, 0.55)`;
    ctx.shadowBlur = isMatteTheme ? 0 : 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Playhead thumb dot (white center + accent ring)
  const r = isSeeking ? 5.2 : 4.0;
  if (isSeeking) {
    ctx.beginPath();
    ctx.arc(xCur, midY, 9, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accentRgb}, 0.22)`;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(xCur, midY, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgb(${accentRgb})`;
  ctx.stroke();

  ctx.restore();
}

function ensureScrubberLoop() {
  if (scrubberRafRunning) return;
  if (!isExpanded || !mediaState.active) return;
  scrubberRafRunning = true;
  const tick = () => {
    if (!isExpanded || !mediaState.active) {
      scrubberRafRunning = false;
      return;
    }
    renderWavyFrame();
    if (mediaState.status === 'Playing' || isSeeking || waveAmp > 0.05) {
      requestAnimationFrame(tick);
    } else {
      scrubberRafRunning = false;
    }
  };
  requestAnimationFrame(tick);
}

// Quick volume chip click + scroll (strictly even numbers: 0, 2, 4, 6, 8, 10...)
const volBtn = document.getElementById('btn-vol-quick');
volBtn.addEventListener('click', () => window.notchApi.toggleMute());
volBtn.addEventListener('wheel', (e) => {
  e.preventDefault();
  const curEven = Math.round((volumeState.volume || 0) / 2) * 2;
  const next = Math.max(0, Math.min(100, curEven + (e.deltaY < 0 ? 2 : -2)));
  volumeState.volume = next;
  volumeState.muted = next === 0;
  const ico = next === 0 ? ICONS.mute : ICONS.vol;
  document.getElementById('hdr-vol-ico').innerHTML = ico;
  document.getElementById('hdr-vol-txt').textContent = next === 0 ? 'Mute' : `${next}%`;
  window.notchApi.setVolume(next);
});

function setPillLyricText(text) {
  if (text === lastPillText) return;
  lastPillText = text;
  const el = document.getElementById('pill-lyric-track');
  if (!el) return;
  const wrap = el.parentElement;
  el.classList.remove('marquee');
  if (wrap) wrap.classList.remove('is-overflow');

  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  el.textContent = text;

  requestAnimationFrame(() => {
    const usableW = Math.max(20, (wrap ? wrap.clientWidth : 0) - 12);
    const textW = el.scrollWidth;
    if (textW > usableW - 2) {
      const shift = -(textW - usableW + 22);
      el.style.setProperty('--marquee-shift', `${shift}px`);
      el.style.setProperty('--marquee-dur', `${Math.max(4.5, Math.min(11, textW / 40))}s`);
      if (wrap) wrap.classList.add('is-overflow');
      el.classList.add('marquee');
    }
  });
}

let cachedLyricNodes = [];

function renderLyricsList() {
  const listEl = document.getElementById('lyrics-list');
  const statusEl = document.getElementById('lyrics-status');
  listEl.innerHTML = '';
  cachedLyricNodes = [];
  activeLyricIdx = -1;
  lastPassedLyricIdx = -1;

  if (lyricsState.loading) {
    statusEl.textContent = 'Searching synced lyrics...';
    statusEl.classList.remove('hidden');
    return;
  }

  const lines = lyricsState.lines || [];
  const hasVisibleLines = lines.some(l => l && !l.isBreak);
  if (hasVisibleLines) {
    statusEl.classList.add('hidden');
    const frag = document.createDocumentFragment();
    lines.forEach((line) => {
      if (!line || line.isBreak) {
        cachedLyricNodes.push(null);
        return;
      }
      const div = document.createElement('div');
      div.className = 'lyric-line';
      div.textContent = line.text;
      div.title = 'Click to seek to this line';
      div.addEventListener('click', () => {
        const dur = Math.max(0, mediaState.duration || 0);
        const scale = getLyricTempoScale(dur);
        window.notchApi.mediaAction('seek', Math.max(0, line.time / Math.max(0.5, scale)));
      });
      frag.appendChild(div);
      cachedLyricNodes.push(div);
    });
    listEl.appendChild(frag);
  } else if (lyricsState.plain && lyricsState.plain.length > 0) {
    statusEl.classList.add('hidden');
    const frag = document.createDocumentFragment();
    lyricsState.plain.forEach(txt => {
      const div = document.createElement('div');
      div.className = 'lyric-line';
      div.textContent = txt;
      frag.appendChild(div);
      cachedLyricNodes.push(div);
    });
    listEl.appendChild(frag);
  } else if (lyricsState.isMultiSongLongVideo) {
    statusEl.textContent = 'Long concert / mix video — synced lyrics resume on single tracks.';
    statusEl.classList.remove('hidden');
  } else {
    statusEl.textContent = mediaState.active ? 'No synced lyrics found for this track.' : '';
    statusEl.classList.remove('hidden');
  }
}

function currentPlaybackPos() {
  if (!mediaState.active) return 0;
  let p = Number(mediaState.position) || 0;
  if (mediaState.status === 'Playing' && mediaState.ts) {
    p += Math.max(0, (Date.now() - mediaState.ts) / 1000);
  }
  if (mediaState.duration > 0) p = Math.min(mediaState.duration, p);
  return Math.max(0, p);
}

function getLyricTempoScale(durSec) {
  const srcDur = Number(lyricsState.sourceDuration || 0);
  if (srcDur <= 20 || durSec <= 20) return 1.0;
  const kind = lyricsState.tempoKind;
  const ratio = srcDur / durSec;
  if (kind === 'slowed' && ratio >= 0.58 && ratio <= 0.98) return ratio;
  if (kind === 'spedup' && ratio >= 1.02 && ratio <= 1.55) return ratio;
  const rawTitle = `${lyricsState.rawTitle || mediaState.title || ''} ${mediaState.artist || ''}`;
  if (!lyricsState.isLiveTrack && Math.abs(srcDur - durSec) > 10 && ratio >= 0.72 && ratio <= 1.38 &&
      /\b(?:dj|remix|mashup|koplo|edit|mix|version|ver\.?|nightcore|slow|fast|speed|reverb)\b/i.test(rawTitle)) {
    return ratio;
  }
  return 1.0;
}

function resolveVocalLyricState(lines, syncPos) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { activeIdx: -1, passedIdx: -1, endT: 0 };
  }
  let cand = -1;
  for (let i = 0; i < lines.length; i++) {
    if (syncPos + 0.15 >= lines[i].time) cand = i;
    else break;
  }
  if (cand < 0) {
    return { activeIdx: -1, passedIdx: -1, endT: 0 };
  }
  if (lines[cand].isBreak) {
    return { activeIdx: -1, passedIdx: cand, endT: 0 };
  }
  const curLine = lines[cand];
  const nextLine = lines[cand + 1];
  const estDur = Math.max(4.0, Math.min(8.5, 2.8 + (curLine.text || '').length * 0.11));
  let naturalEnd;
  if (nextLine && nextLine.isBreak) {
    naturalEnd = Math.min(nextLine.time, curLine.time + Math.max(estDur, 8.5));
  } else if (!nextLine || (nextLine.time - curLine.time) >= 10.0) {
    naturalEnd = curLine.time + estDur;
  } else {
    naturalEnd = nextLine.time;
  }
  if ((syncPos + 0.12) > naturalEnd) {
    return { activeIdx: -1, passedIdx: cand, endT: naturalEnd };
  }
  return {
    activeIdx: cand,
    passedIdx: cand,
    endT: Math.min(naturalEnd, curLine.time + 7.5)
  };
}

// 120ms lyric & timeline interpolation ticker (throttled idle clock & zero ReferenceError)
let clockSubTick = 0;
let lastRenderedPosSec = -1;

setInterval(() => {
  clockSubTick++;
  if (clockSubTick % 20 === 1) {
    updateClockAndAlert();
  }
  if (!mediaState.active) return;

  const pos = currentPlaybackPos();
  const dur = Math.max(0, mediaState.duration || 0);
  const syncPos = pos * getLyricTempoScale(dur);
  if (!isSeeking && isExpanded) {
    timeCurEl.textContent = fmtSec(pos);
    timeTotEl.textContent = isHoveringScrubber
      ? ('-' + fmtSec(Math.max(0, dur - pos)))
      : fmtSec(dur);
    if (mediaState.status !== 'Playing') renderWavyFrame();
  }

  const lines = lyricsState.lines || [];
  const { activeIdx: idx, passedIdx, endT } = resolveVocalLyricState(lines, syncPos);

  // Collapsed pill holds steady on track metadata during intro, long instrumental solos & outro
  const cleanMeta = cleanTrackDisplay(mediaState.title, mediaState.artist);
  if (config.lyricsInCollapsedPill !== false && idx >= 0 && lines[idx] && !lines[idx].isBreak) {
    setPillLyricText(lines[idx].text || cleanMeta);
  } else if (config.lyricsInCollapsedPill !== false && lines.length === 0 && lyricsState.plain && lyricsState.plain.length > 0 && dur > 0) {
    const introCutoff = Math.min(10, dur * 0.06);
    const outroCutoff = dur - Math.min(12, dur * 0.07);
    if (pos < introCutoff || pos > outroCutoff || outroCutoff <= introCutoff) {
      setPillLyricText(cleanMeta);
    } else {
      const pFrac = (pos - introCutoff) / (outroCutoff - introCutoff);
      const pIdx = Math.min(lyricsState.plain.length - 1, Math.max(0, Math.floor(pFrac * lyricsState.plain.length)));
      setPillLyricText(lyricsState.plain[pIdx] || cleanMeta);
    }
  } else {
    setPillLyricText(cleanMeta);
  }

  if (idx >= 0 && cachedLyricNodes[idx] && lines[idx]) {
    const startT = lines[idx].time;
    const pct = Math.max(0, Math.min(100, ((syncPos + 0.15 - startT) / Math.max(0.4, endT - startT)) * 100));
    cachedLyricNodes[idx].style.setProperty('--karaoke-pct', `${pct.toFixed(1)}%`);
  }

  if ((idx !== activeLyricIdx || passedIdx !== lastPassedLyricIdx) && lines.length > 0) {
    activeLyricIdx = idx;
    lastPassedLyricIdx = passedIdx;
    cachedLyricNodes.forEach((node, i) => {
      if (!node) return;
      node.classList.toggle('active', i === idx);
      node.classList.toggle('past', i <= passedIdx && i !== idx);
      node.classList.toggle('near', idx >= 0 && Math.abs(i - idx) === 1);
    });
    if (isExpanded && idx >= 0) scrollActiveLyricIntoView(false);
  }
}, 120);

function flashHud(iconHtml, label, pct, durationMs = 2200) {
  if (isSchedAlertActive) return; // Keep priority on Schedule / Adzan Alert Banner
  document.getElementById('hud-icon').innerHTML = iconHtml;
  document.getElementById('hud-label').textContent = label;
  document.getElementById('hud-bar-fill').style.width = `${Math.max(0, Math.min(100, pct))}%`;
  document.getElementById('hud-value').textContent = pct >= 0 ? `${Math.round(pct)}%` : '';

  isHudActive = true;
  document.getElementById('pill-idle').classList.add('hidden');
  document.getElementById('pill-media').classList.add('hidden');
  document.getElementById('pill-hud').classList.remove('hidden');
  syncNotchClass();

  clearTimeout(hudTimer);
  hudTimer = setTimeout(() => {
    isHudActive = false;
    document.getElementById('pill-hud').classList.add('hidden');
    if (isSchedAlertActive) {
      document.getElementById('pill-sched-alert').classList.remove('hidden');
    } else if (mediaState.active) {
      document.getElementById('pill-media').classList.remove('hidden');
    } else {
      document.getElementById('pill-idle').classList.remove('hidden');
    }
    syncNotchClass();
  }, durationMs);
}

let lastAppliedArtSrc = '';
let lastPlayIconState = null;

const SOURCE_APP_RULES = [
  [/spotify/i, 'Spotify'],
  [/applemusic/i, 'Apple Music'],
  [/appletv/i, 'Apple TV'],
  [/itunes/i, 'iTunes'],
  [/zunemusic|microsoft\.mediaplayer/i, 'Media Player'],
  [/zunevideo/i, 'Movies & TV'],
  [/youtube\s*music|ytmusic|th-ch\.youtube/i, 'YT Music'],
  [/tidal/i, 'TIDAL'],
  [/deezer/i, 'Deezer'],
  [/amazon.*music/i, 'Amazon Music'],
  [/soundcloud/i, 'SoundCloud'],
  [/netflix/i, 'Netflix'],
  [/msedge/i, 'Edge'],
  [/chrome/i, 'Chrome'],
  [/brave/i, 'Brave'],
  [/firefox|mozilla/i, 'Firefox'],
  [/opera/i, 'Opera'],
  [/vivaldi/i, 'Vivaldi'],
  [/\barc(\.exe)?$/i, 'Arc'],
  [/\bzen(\.exe)?$/i, 'Zen'],
  [/vlc/i, 'VLC'],
  [/potplayer/i, 'PotPlayer'],
  [/mpc-?hc/i, 'MPC-HC'],
  [/mpc-?be/i, 'MPC-BE'],
  [/foobar/i, 'foobar2000'],
  [/aimp/i, 'AIMP'],
  [/musicbee/i, 'MusicBee'],
  [/whatsapp/i, 'WhatsApp'],
  [/telegram/i, 'Telegram'],
  [/discord/i, 'Discord'],
  [/wmplayer/i, 'Windows Media']
];

function formatMediaSourceName(rawApp) {
  const raw = String(rawApp || '').trim();
  if (!raw) return 'Media';
  for (const [re, label] of SOURCE_APP_RULES) {
    if (re.test(raw)) return label;
  }
  // Fallback for other MSIX / UWP PackageFamilyName!AppId or desktop .exe
  let clean = raw
    .split('!')[0]
    .replace(/\._crx_[a-z0-9]+$/i, '')
    .replace(/_+[a-z0-9]{10,15}$/i, '')
    .replace(/\.exe$/i, '');
  if (clean.includes('.')) clean = clean.split('.').pop();
  return clean.trim() || 'Media';
}

function renderMediaUi() {
  const hasMedia = Boolean(mediaState.active);
  document.getElementById('music-empty').classList.toggle('hidden', hasMedia);
  document.getElementById('music-main').classList.toggle('hidden', !hasMedia);

  // FIXED: Never overwrite #pill-sched-alert when a schedule/adzan alert banner is active
  if (!isHudActive && !isSchedAlertActive) {
    document.getElementById('pill-idle').classList.toggle('hidden', hasMedia);
    document.getElementById('pill-media').classList.toggle('hidden', !hasMedia);
  }

  if (hasMedia) {
    document.getElementById('exp-title').textContent = lyricsState.title || mediaState.title || '—';
    document.getElementById('exp-artist').textContent = lyricsState.artist || mediaState.artist || '—';
    document.getElementById('exp-source').textContent = formatMediaSourceName(mediaState.app);
    const isPlaying = mediaState.status === 'Playing';
    if (isPlaying !== lastPlayIconState) {
      lastPlayIconState = isPlaying;
      document.getElementById('play-ico').innerHTML = isPlaying ? ICONS.pause : ICONS.play;
    }
    document.getElementById('pill-eq').classList.toggle('playing', isPlaying);

    if (mediaState.thumbnail !== undefined) {
      const src = mediaState.thumbnail || DEFAULT_VINYL_ART;
      if (src !== lastAppliedArtSrc) {
        lastAppliedArtSrc = src;
        const pillArt = document.getElementById('pill-art');
        const expArt  = document.getElementById('exp-art');
        const backdrop = document.getElementById('cover-backdrop');
        pillArt.src = src;
        expArt.src  = src;
        if (mediaState.thumbnail) {
          backdrop.style.backgroundImage = `url("${mediaState.thumbnail}")`;
          backdrop.classList.add('has-cover');
          expArt.onload = () => extractDominantColor(expArt);
        } else {
          backdrop.style.backgroundImage = 'none';
          backdrop.classList.remove('has-cover');
        }
      }
    }
    ensureScrubberLoop();
  } else {
    lastPillText = '';
    lastAppliedArtSrc = '';
    lastPlayIconState = null;
    const backdrop = document.getElementById('cover-backdrop');
    backdrop.style.backgroundImage = 'none';
    backdrop.classList.remove('has-cover');
    document.getElementById('pill-art').src = DEFAULT_VINYL_ART;
    document.getElementById('exp-art').src  = DEFAULT_VINYL_ART;
    document.documentElement.style.setProperty('--accent', '#4cc9f0');
    document.documentElement.style.setProperty('--accent-rgb', '76, 201, 240');
  }
  syncNotchClass();
}

function applyWeatherSkyTheme(w) {
  const skyEl = document.getElementById('weather-sky-fx');
  if (!skyEl) return;
  skyEl.classList.remove('theme-rain', 'theme-sun', 'theme-night');
  if (manualSkyTheme) {
    skyEl.classList.add(manualSkyTheme);
    return;
  }
  const hr = new Date().getHours();
  const isNight = hr >= 18 || hr < 5;
  const ico = (w && w.icon) || '';
  const desc = (w && w.label) || '';
  if (/rain|drizzle|storm/i.test(ico) || /rain|drizzle|shower|storm|thunder|hujan|petir|badai/i.test(desc)) {
    skyEl.classList.add('theme-rain');
  } else if (isNight) {
    skyEl.classList.add('theme-night');
  } else {
    skyEl.classList.add('theme-sun');
  }
}

function renderExternalUi() {
  const w = externalState.weather;
  const p = externalState.prayer;
  if (w) {
    applyWeatherSkyTheme(w);
    document.getElementById('idle-weather-icon').innerHTML = weatherIconSvg(w.icon);
    document.getElementById('idle-weather-text').textContent = `${w.temp}°`;
    document.getElementById('info-city').textContent = w.city || 'Jakarta';
    const srcBadge = document.getElementById('info-source-badge');
    if (srcBadge) {
      srcBadge.textContent = w.source || 'BMKG';
    }
    document.getElementById('info-weather-ico').innerHTML = weatherIconSvg(w.icon);
    document.getElementById('info-temp').textContent = String(w.temp);
    document.getElementById('info-w-desc').textContent = `${w.label} · ${w.min}°–${w.max}°C · RH ${w.humidity}%`;

    const transEl = document.getElementById('weather-transitions');
    if (transEl) {
      transEl.innerHTML = '';
      const list = Array.isArray(w.transitions) && w.transitions.length > 0
        ? w.transitions.slice(0, 4)
        : [{ time: 'Now', label: w.label, temp: w.temp, icon: w.icon }];
      list.forEach((t) => {
        const card = document.createElement('div');
        card.className = 'glam-trans-card';
        const icoSvg = weatherIconSvg(t.icon || w.icon);
        card.innerHTML = `
          <span class="gt-time">${escapeHtml(t.time)}</span>
          <div class="gt-mid">
            <span class="gt-ico">${icoSvg}</span>
            <span class="gt-temp">${t.temp !== undefined ? escapeHtml(String(t.temp)) + '°' : ''}</span>
          </div>
          <span class="gt-desc">${escapeHtml(t.label)}</span>
        `;
        transEl.appendChild(card);
      });
    }
  }

  // Prayer strip (Auto-synced daily)
  const pStrip = document.getElementById('prayer-strip');
  pStrip.innerHTML = '';
  const timings = (p && p.timings) || [];
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  let nextKey = '';
  let nextDiffMin = 0;
  for (const item of timings) {
    const [hh, mm] = item.time.split(':').map(Number);
    const tMin = hh * 60 + mm;
    if (tMin >= nowMin) {
      nextKey = item.key;
      nextDiffMin = tMin - nowMin;
      break;
    }
  }
  if (!nextKey && timings.length > 0) {
    nextKey = timings[0].key;
    const [hh, mm] = timings[0].time.split(':').map(Number);
    nextDiffMin = (24 * 60 - nowMin) + (hh * 60 + mm);
  }
  const nextBadge = document.getElementById('prayer-next-countdown');
  if (nextBadge && nextKey) {
    const hrs = Math.floor(nextDiffMin / 60);
    const mins = nextDiffMin % 60;
    nextBadge.textContent = `${formatPrayerName(nextKey)} in ${hrs > 0 ? hrs + 'h ' : ''}${mins}m`;
  }

  timings.forEach(item => {
    const pName = formatPrayerName(item.key);
    const div = document.createElement('div');
    div.className = `prayer-chip ${item.key === nextKey ? 'next' : ''}`;
    div.title = p?.tanggal ? `Prayer schedule (${p.tanggal})` : 'Daily Prayer Schedule';
    div.innerHTML = `<div class="p-name">${escapeHtml(pName)}</div><div class="p-time">${escapeHtml(item.time)}</div>`;
    pStrip.appendChild(div);
  });

  // Calendar events
  const calData = externalState.calendar || {};
  const calEl = document.getElementById('cal-list');
  calEl.innerHTML = '';
  const allEvents = calData.events || [];
  const filteredEvents = currentCalFilter === 'all'
    ? allEvents
    : allEvents.filter(ev => normalizeCalTag(ev.tag).toLowerCase() === normalizeCalTag(currentCalFilter).toLowerCase());

  if (filteredEvents.length === 0) {
    if (!config.icsUrl && allEvents.length === 0) {
      calEl.innerHTML = `<div class="card-sub" style="margin:auto;text-align:center;white-space:normal;line-height:1.5;max-width:380px;">No Google Calendar connected yet.<br/>Click below to get your <strong>Secret iCal (.ics)</strong> link, copy it (auto-detected), or add an event via <strong>+ Event</strong>.<div style="margin-top:10px;"><button id="btn-empty-gcal" class="mini-btn accent">Connect Google Calendar (.ics)</button></div></div>`;
      document.getElementById('btn-empty-gcal')?.addEventListener('click', handleGcalConnect);
    } else {
      calEl.innerHTML = `<div class="card-sub" style="margin:auto;text-align:center;white-space:normal;line-height:1.4;">No events in <strong>${escapeHtml(currentCalFilter === 'all' ? 'All' : normalizeCalTag(currentCalFilter))}</strong>.</div>`;
    }
  } else {
    const nowMs = Date.now();
    const todayStr = new Date().toDateString();
    const tmrDate = new Date(); tmrDate.setDate(tmrDate.getDate() + 1);
    const tmrStr = tmrDate.toDateString();

    filteredEvents.slice(0, 14).forEach(ev => {
      const d = new Date(ev.startMs);
      const dayLbl = d.toDateString() === todayStr
        ? 'Today'
        : d.toDateString() === tmrStr
          ? 'Tomorrow'
          : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const endMs = ev.endMs || (ev.startMs + 3600000);
      const tStr = ev.allDay ? 'All day' : `${fmtHHMM(ev.startMs)} – ${fmtHHMM(endMs)}`;
      const cleanTitle = cleanEventTitle(ev.title);
      const isLive = !ev.allDay && nowMs >= ev.startMs && nowMs < endMs;
      const diffMin = Math.round((ev.startMs - nowMs) / 60000);
      const isSoon = !ev.allDay && diffMin > 0 && diffMin <= 45;
      const statusBadge = isLive
        ? `<span class="live-pill">LIVE</span>`
        : isSoon
          ? `<span class="soon-pill">in ${diffMin}m</span>`
          : '';
      const dispTag = normalizeCalTag(ev.tag);
      const tagStr = dispTag ? `${dispTag} · ${dayLbl}${ev.location ? ' · ' + ev.location : ''}` : dayLbl;

      const row = document.createElement('div');
      row.className = 'cal-item';
      row.style.setProperty('--cal-color', ev.color || '#38bdf8');
      const delBtn = ev.source === 'local' ? `<button class="cal-del-btn" data-ev-del="${escapeHtml(ev.id)}" title="Delete">×</button>` : '';
      row.innerHTML = `
        <div class="c-left">
          <span class="c-title">${escapeHtml(cleanTitle)}</span>
          <span class="c-meta">${statusBadge}<span>${escapeHtml(tagStr)}</span></span>
        </div>
        <span class="c-right"><span class="c-time">${tStr}</span>${delBtn}</span>
      `;
      row.addEventListener('click', (e) => {
        if (e.target.dataset && e.target.dataset.evDel) return;
        if (ev.htmlLink) window.notchApi.openExternalUrl(ev.htmlLink);
      });
      calEl.appendChild(row);
    });
    calEl.querySelectorAll('[data-ev-del]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.notchApi.removeLocalEvent(btn.dataset.evDel);
      });
    });
  }

  // Custom JSON feeds
  const fBar = document.getElementById('custom-feeds-bar');
  fBar.innerHTML = '';
  (externalState.customFeeds || []).forEach(f => {
    const span = document.createElement('span');
    span.className = 'feed-pill';
    span.innerHTML = `${escapeHtml(f.label)}<strong>${escapeHtml(f.prefix)}${escapeHtml(f.value)}${escapeHtml(f.suffix)}</strong>`;
    fBar.appendChild(span);
  });
  updateClockAndAlert();
}

function renderShelfUi() {
  const listEl = document.getElementById('shelf-dropzone');
  const badge = document.getElementById('shelf-count');
  badge.textContent = String(shelfState.length);
  badge.classList.toggle('hidden', shelfState.length === 0);

  listEl.innerHTML = '';
  if (shelfState.length === 0) {
    listEl.innerHTML = `<div id="shelf-empty" class="empty-state compact"><div>Drop files, images, or notes here (drag out anytime or right-click to reveal)</div></div>`;
    return;
  }

  shelfState.forEach(item => {
    const card = document.createElement('div');
    card.className = 'shelf-item';
    const isFile = item.kind === 'file';
    if (isFile && item.path) {
      card.draggable = true;
      card.title = 'Click: Open File | Right-Click: Reveal in Explorer | Drag: Drag File Out';
      card.addEventListener('dragstart', (e) => {
        e.preventDefault();
        window.notchApi.startShelfDrag(item.path);
      });
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.notchApi.revealShelfFile(item.path);
      });
    } else {
      card.title = 'Click to copy text to Clipboard';
    }
    const revealBtn = isFile
      ? `<button class="mini-btn icon-only" data-reveal="${escapeHtml(item.path)}" title="Reveal in Explorer">${ICONS.folder}</button>`
      : '';
    card.innerHTML = `
      <div class="shelf-meta">
        <div class="shelf-kind">${isFile ? 'File (Drag-Out Ready)' : 'Note / Text'}</div>
        <div class="shelf-title">${escapeHtml(item.title || item.content)}</div>
      </div>
      <div class="ev-row">
        ${revealBtn}
        <button class="mini-btn" data-del="${escapeHtml(item.id)}" title="Delete">×</button>
      </div>
    `;
    card.addEventListener('click', async (e) => {
      const delBtn = e.target.closest('[data-del]');
      if (delBtn) {
        await window.notchApi.removeShelfItem(delBtn.dataset.del);
        return;
      }
      const revBtn = e.target.closest('[data-reveal]');
      if (revBtn) {
        window.notchApi.revealShelfFile(revBtn.dataset.reveal);
        return;
      }
      if (isFile) {
        window.notchApi.openShelfFile(item.path);
      } else {
        await window.notchApi.copyText(item.content);
        flashHud(ICONS.shelf, 'Copied', 100, 1400);
      }
    });
    listEl.appendChild(card);
  });
}

function renderSettingsUi() {
  const ox = Number(config.offsetX || 0);
  const pillH = Number(config.pillHeight || 34);
  const theme = config.theme === 'matte' ? 'matte' : 'normal';
  const sizeChanged = shell && shell.dataset.size !== String(pillH);
  document.documentElement.style.setProperty('--pill-h', `${pillH}px`);
  if (shell) shell.dataset.size = String(pillH);
  document.querySelectorAll('[data-height]').forEach(b => b.classList.toggle('active', Number(b.dataset.height) === pillH));
  document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
  if (sizeChanged && typeof lastPillText === 'string' && lastPillText) {
    const remeasure = () => {
      if (!shell || shell.dataset.size !== String(pillH) || !lastPillText) return;
      const cur = lastPillText;
      lastPillText = '';
      setPillLyricText(cur);
    };
    requestAnimationFrame(remeasure);
    setTimeout(remeasure, 390);
  }
  document.querySelectorAll('[data-offset]').forEach(b => b.classList.toggle('active', Number(b.dataset.offset) === ox));

  document.getElementById('set-offsetx').value = String(ox);
  document.getElementById('lbl-offsetx').textContent = String(ox);
  document.getElementById('chk-pill-lyrics').checked = config.lyricsInCollapsedPill !== false;
  const chkTop = document.getElementById('chk-autohide-top');
  if (chkTop) chkTop.checked = Boolean(config.autoHideTopEdge);
  const btnTop = document.getElementById('btn-autohide-top');
  if (btnTop) btnTop.classList.toggle('active', Boolean(config.autoHideTopEdge));
  document.getElementById('chk-fullscreen').checked = config.autoHideFullscreen !== false;
  document.getElementById('chk-autostart').checked = Boolean(config.autostart);

  const chkWeather = document.getElementById('chk-idle-weather');
  if (chkWeather) chkWeather.checked = config.showWeatherOnIdle !== false;
  const chkPrayerCd = document.getElementById('chk-prayer-cd');
  if (chkPrayerCd) chkPrayerCd.checked = config.showPrayerCountdown !== false;
  const chkPrayerAlert = document.getElementById('chk-prayer-alert');
  if (chkPrayerAlert) chkPrayerAlert.checked = config.prayerAdzanAlert !== false;
  const chkHoverExp = document.getElementById('chk-hover-expand');
  if (chkHoverExp) chkHoverExp.checked = config.expandOnHover !== false;

  document.getElementById('set-city').value = config.city || 'Jakarta';
  document.getElementById('set-ics').value = config.icsUrl || '';
  updateClockAndAlert();
  syncNotchClass();
  if (mediaState.active) renderWavyFrame();

  const cfgList = document.getElementById('set-feeds-list');
  cfgList.innerHTML = '';
  (config.customFeeds || []).forEach((f, idx) => {
    const row = document.createElement('div');
    row.className = 'feed-cfg-item';
    row.innerHTML = `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
        <input type="checkbox" class="ios-switch" ${f.enabled ? 'checked' : ''} data-feed-toggle="${idx}" />
        <span>${escapeHtml(f.label)} <small style="opacity:.55">(${escapeHtml(f.jsonPath || 'root')})</small></span>
      </label>
      <button class="mini-btn" style="height:20px;padding:0 6px;" data-feed-del="${idx}">×</button>
    `;
    cfgList.appendChild(row);
  });

  cfgList.querySelectorAll('[data-feed-toggle]').forEach(chk => {
    chk.addEventListener('change', async () => {
      const i = Number(chk.dataset.feedToggle);
      const nextFeeds = [...(config.customFeeds || [])];
      nextFeeds[i] = { ...nextFeeds[i], enabled: chk.checked };
      await window.notchApi.saveConfig({ customFeeds: nextFeeds });
    });
  });

  cfgList.querySelectorAll('[data-feed-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const i = Number(btn.dataset.feedDel);
      const nextFeeds = (config.customFeeds || []).filter((_, idx) => idx !== i);
      await window.notchApi.saveConfig({ customFeeds: nextFeeds });
    });
  });
}

// Drag & drop files straight onto Notch or Shelf
['dragenter', 'dragover'].forEach(evt => {
  shell.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.notchApi.setMouseInteractive(true);
    if (!isExpanded) expandNotch('shelf');
    else switchTab('shelf');
    document.getElementById('shelf-dropzone').classList.add('drag-over');
  });
});

shell.addEventListener('dragleave', (e) => {
  if (!shell.contains(e.relatedTarget)) {
    document.getElementById('shelf-dropzone').classList.remove('drag-over');
  }
});

shell.addEventListener('drop', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('shelf-dropzone').classList.remove('drag-over');
  const files = Array.from(e.dataTransfer?.files || []);
  for (const f of files) {
    const p = window.notchApi.getPathForFile(f);
    if (p) {
      await window.notchApi.addShelfItem({ kind: 'file', title: f.name, path: p });
    }
  }
  const plainText = e.dataTransfer?.getData('text/plain');
  if (files.length === 0 && plainText) {
    await window.notchApi.addShelfItem({ kind: 'text', title: plainText.slice(0, 60), content: plainText });
  }
});

// Shelf text quick input, paste & clear
document.getElementById('shelf-text-in').addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    const val = e.target.value.trim();
    e.target.value = '';
    await window.notchApi.addShelfItem({ kind: 'text', title: val.slice(0, 60), content: val });
  }
});
document.getElementById('btn-shelf-paste').addEventListener('click', async () => {
  const txt = (await window.notchApi.readClipboardText()).trim();
  if (txt) {
    await window.notchApi.addShelfItem({ kind: 'text', title: txt.slice(0, 60), content: txt });
  }
});
document.getElementById('btn-shelf-clear')?.addEventListener('click', async () => {
  await window.notchApi.clearShelf();
});

// Category filter pills in Calendar tab
document.querySelectorAll('#cal-filters [data-cal-filter]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCalFilter = btn.dataset.calFilter || 'all';
    document.querySelectorAll('#cal-filters [data-cal-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.calFilter === currentCalFilter);
    });
    renderExternalUi();
  });
});

// Test Schedule Transition Notification (Dynamic Island Banner + Native Windows Notification)
document.getElementById('btn-test-sched-notif')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const events = (externalState.calendar && externalState.calendar.events) || [];
  const sample = events[0] || {
    title: 'Design System Sprint Review',
    tag: 'Work',
    color: '#16a765',
    startMs: Date.now(),
    endMs: Date.now() + 5400000
  };
  const timeRange = `${fmtHHMM(sample.startMs)} – ${fmtHHMM(sample.endMs || sample.startMs + 3600000)} · ${normalizeCalTag(sample.tag)}`;
  isExpanded = false;
  window.notchApi.setExpandedState(false);
  flashScheduleAlert('STARTING NOW', cleanEventTitle(sample.title), timeRange, sample.color || '#16a765', sample.htmlLink || '', true);
});

// Quick calendar add with Category & Duration
document.getElementById('btn-toggle-ev-form').addEventListener('click', () => {
  document.getElementById('ev-form').classList.toggle('hidden');
});
document.getElementById('ev-save-btn').addEventListener('click', async () => {
  const title = document.getElementById('ev-title-in').value.trim();
  const tVal = document.getElementById('ev-time-in').value;
  const tag = document.getElementById('ev-tag-in')?.value || 'Work';
  const durationMin = Number(document.getElementById('ev-dur-in')?.value || 60);
  if (!title || !tVal) return;
  const [hh, mm] = tVal.split(':').map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  if (d.getTime() < Date.now() - 60000) d.setDate(d.getDate() + 1);
  await window.notchApi.addLocalEvent({
    title,
    tag,
    durationMin,
    startMs: d.getTime(),
    endMs: d.getTime() + durationMin * 60000
  });
  document.getElementById('ev-title-in').value = '';
  document.getElementById('ev-form').classList.add('hidden');
});

async function triggerLiveSync(btnEl) {
  const btns = [
    document.getElementById('btn-refresh-ext'),
    document.getElementById('btn-refresh-cal'),
    btnEl
  ].filter(Boolean);
  btns.forEach(b => b.classList.add('spinning'));
  const badge = document.getElementById('info-source-badge');
  const prevTxt = badge ? badge.textContent : 'BMKG';
  if (badge) badge.textContent = 'Syncing...';

  const startMs = Date.now();
  try {
    await window.notchApi.refreshExternal();
  } catch {}
  const elapsed = Date.now() - startMs;
  if (elapsed < 680) {
    await new Promise(r => setTimeout(r, 680 - elapsed));
  }
  btns.forEach(b => b.classList.remove('spinning'));
  if (badge) {
    badge.textContent = 'Synced ✓';
    setTimeout(() => {
      if (badge) badge.textContent = externalState.weather?.source || prevTxt || 'BMKG';
    }, 2200);
  }
}

document.getElementById('btn-refresh-ext')?.addEventListener('click', (e) => {
  e.stopPropagation();
  triggerLiveSync(e.currentTarget);
});
document.getElementById('btn-refresh-cal')?.addEventListener('click', (e) => {
  e.stopPropagation();
  triggerLiveSync(e.currentTarget);
});

// Click weather hero icon/temp to preview all 3 Apple Weather sky effects
document.getElementById('btn-cycle-sky')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const order = ['', 'theme-rain', 'theme-sun', 'theme-night'];
  const labels = {
    '': 'Auto Forecast',
    'theme-rain': 'Rain Sky FX',
    'theme-sun': 'Clear / Sunset FX',
    'theme-night': 'Starry Night FX'
  };
  const nextIdx = (order.indexOf(manualSkyTheme) + 1) % order.length;
  manualSkyTheme = order[nextIdx];
  applyWeatherSkyTheme(externalState.weather);
  const badge = document.getElementById('info-source-badge');
  if (badge) {
    badge.textContent = labels[manualSkyTheme];
    setTimeout(() => {
      if (badge) badge.textContent = externalState.weather?.source || 'BMKG';
    }, 2000);
  }
});

function hideToTopEdgeNow() {
  clearTimeout(hoverEnterTimer);
  clearTimeout(hoverLeaveTimer);
  isPinned = false;
  document.getElementById('btn-pin')?.classList.remove('active');
  isHoveringTopZone = false;
  isExpanded = false;
  suppressHoverUntil = Date.now() + 950;
  config.autoHideTopEdge = true;
  window.notchApi.setExpandedState(false);
  window.notchApi.setMouseInteractive(false);
  window.notchApi.saveConfig({ autoHideTopEdge: true });
  renderSettingsUi();
  syncNotchClass();
  setTimeout(() => {
    if (shell.classList.contains('is-hidden-top')) {
      lastShapeKey = 'hidden';
      window.notchApi.updateShape({ hidden: true });
    }
  }, 390);
}

document.getElementById('btn-autohide-top')?.addEventListener('click', (e) => {
  e.stopPropagation();
  hideToTopEdgeNow();
});

// Settings event listeners
document.querySelectorAll('[data-offset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = Number(btn.dataset.offset);
    window.notchApi.saveConfig({ offsetX: val });
  });
});
document.querySelectorAll('[data-height]').forEach(btn => {
  btn.addEventListener('click', () => window.notchApi.saveConfig({ pillHeight: Number(btn.dataset.height) }));
});
document.querySelectorAll('[data-theme]').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme === 'matte' ? 'matte' : 'normal';
    config.theme = theme;
    renderSettingsUi();
    window.notchApi.saveConfig({ theme });
  });
});
document.getElementById('btn-toggle-json-drawer')?.addEventListener('click', () => {
  const drawer = document.getElementById('set-json-drawer');
  if (!drawer) return;
  const nowHidden = drawer.classList.toggle('hidden');
  if (!nowHidden) drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
document.getElementById('set-offsetx').addEventListener('input', (e) => {
  const val = Number(e.target.value);
  document.getElementById('lbl-offsetx').textContent = String(val);
});
document.getElementById('set-offsetx').addEventListener('change', (e) => {
  window.notchApi.saveConfig({ offsetX: Number(e.target.value) });
});
document.getElementById('chk-pill-lyrics').addEventListener('change', (e) => {
  window.notchApi.saveConfig({ lyricsInCollapsedPill: e.target.checked });
});
document.getElementById('chk-autohide-top')?.addEventListener('change', (e) => {
  config.autoHideTopEdge = e.target.checked;
  window.notchApi.saveConfig({ autoHideTopEdge: e.target.checked });
  renderSettingsUi();
});
document.getElementById('chk-fullscreen').addEventListener('change', (e) => {
  window.notchApi.saveConfig({ autoHideFullscreen: e.target.checked });
});
document.getElementById('chk-autostart').addEventListener('change', (e) => {
  window.notchApi.saveConfig({ autostart: e.target.checked });
});
document.getElementById('chk-idle-weather')?.addEventListener('change', (e) => {
  window.notchApi.saveConfig({ showWeatherOnIdle: e.target.checked });
});
document.getElementById('chk-prayer-cd')?.addEventListener('change', (e) => {
  window.notchApi.saveConfig({ showPrayerCountdown: e.target.checked });
});
document.getElementById('chk-prayer-alert')?.addEventListener('change', (e) => {
  window.notchApi.saveConfig({ prayerAdzanAlert: e.target.checked });
});
document.getElementById('chk-hover-expand')?.addEventListener('change', (e) => {
  window.notchApi.saveConfig({ expandOnHover: e.target.checked });
});
document.getElementById('btn-save-city').addEventListener('click', () => {
  const c = document.getElementById('set-city').value.trim() || 'Jakarta';
  window.notchApi.saveConfig({ city: c });
});
document.getElementById('btn-save-ics').addEventListener('click', () => {
  const cleanUrl = document.getElementById('set-ics').value.replace(/webcal:\/\//gi, 'https://').trim();
  window.notchApi.saveConfig({ icsUrl: cleanUrl });
});

async function handleGcalConnect() {
  const res = await window.notchApi.connectGoogleCalendar();
  if (res && res.connected) {
    flashHud(ICONS.calendar, 'Calendar Linked', 100, 2400);
  } else if (res && res.openedBrowser) {
    flashHud(ICONS.calendar, 'Copy .ics Link in Browser', 100, 3200);
  }
}
document.getElementById('btn-connect-gcal')?.addEventListener('click', handleGcalConnect);
document.getElementById('btn-add-feed').addEventListener('click', async () => {
  const label = document.getElementById('feed-label').value.trim();
  const url = document.getElementById('feed-url').value.trim();
  const jsonPath = document.getElementById('feed-path').value.trim();
  if (!label || !url) return;
  const nextFeeds = [...(config.customFeeds || []), {
    id: `feed_${Date.now()}`,
    label,
    url,
    jsonPath,
    prefix: '',
    suffix: '',
    enabled: true
  }];
  document.getElementById('feed-label').value = '';
  document.getElementById('feed-url').value = '';
  document.getElementById('feed-path').value = '';
  await window.notchApi.saveConfig({ customFeeds: nextFeeds });
});
document.getElementById('btn-test-hook').addEventListener('click', () => window.notchApi.testWebhook());
document.getElementById('btn-quit').addEventListener('click', () => window.notchApi.quitApp());

// Bridge Subscriptions
window.notchApi.onMediaUpdate((d) => {
  if (d.active && d.thumbnail === undefined && mediaState.thumbnail && d.title === mediaState.title) {
    d.thumbnail = mediaState.thumbnail;
  }
  if (Date.now() < optimisticStatusUntil && d.active && d.title === mediaState.title) {
    if (d.status === mediaState.status) {
      optimisticStatusUntil = 0;
    } else {
      d.status = mediaState.status;
      d.position = mediaState.position;
      d.ts = mediaState.ts;
    }
  }
  mediaState = d;
  renderMediaUi();
});

window.notchApi.onLyricsUpdate((d) => {
  lyricsState = d || { found: false, lines: [], plain: [] };
  renderLyricsList();
});

window.notchApi.onVolumeUpdate((d) => {
  const evenVol = Math.max(0, Math.min(100, Math.round((d.volume || 0) / 2) * 2));
  volumeState = { ...d, volume: evenVol };
  const isMuted = Boolean(d.muted) || evenVol === 0;
  const ico = isMuted ? ICONS.mute : ICONS.vol;
  document.getElementById('hdr-vol-ico').innerHTML = ico;
  document.getElementById('hdr-vol-txt').textContent = isMuted ? 'Mute' : `${evenVol}%`;
  if (!d.initial && !isExpanded) {
    flashHud(ico, isMuted ? 'Muted' : 'Volume', isMuted ? 0 : evenVol, 1900);
  }
});

window.notchApi.onExternalUpdate((d) => {
  externalState = d || externalState;
  renderExternalUi();
});

window.notchApi.onPushToast((d) => {
  if (!isExpanded) {
    flashHud(ICONS.calendar, d.title || 'Info', 100, d.duration || 4000);
  }
});

window.notchApi.onConfigUpdate((d) => {
  config = d || config;
  renderSettingsUi();
});

window.notchApi.onShelfUpdate((d) => {
  shelfState = d || [];
  renderShelfUi();
});

window.notchApi.onVisibilityToggle(() => {
  syncNotchClass();
});

window.notchApi.onTopEdgeHover?.((inside) => {
  if (inside) {
    if (Date.now() < suppressHoverUntil) return;
    isHoveringTopZone = true;
    window.notchApi.setMouseInteractive(true);
    clearTimeout(hoverLeaveTimer);
    syncNotchClass();
    if (config.expandOnHover !== false && !isExpanded) {
      hoverEnterTimer = setTimeout(() => expandNotch(), 85);
    }
  } else {
    clearTimeout(hoverEnterTimer);
    if (!isPinned) {
      hoverLeaveTimer = setTimeout(() => collapseNotch(), 180);
    }
  }
});

window.notchApi.getState().then(s => {
  if (s.config) { config = s.config; renderSettingsUi(); }
  if (s.shelf) { shelfState = s.shelf; renderShelfUi(); }
  if (s.external) { externalState = s.external; renderExternalUi(); }
  if (s.lyrics) {
    lyricsState = s.lyrics;
    renderLyricsList();
  }
  if (s.media) { mediaState = s.media; renderMediaUi(); }
  updateClockAndAlert();
});
