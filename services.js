const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const dns = require('dns');
const { execFile } = require('child_process');

const BMKG_ADM4_MAP = {
  bandung: '32.73.07.1003',
  'kota bandung': '32.73.07.1003',
  cimahi: '32.77.01.1001',
  jakarta: '31.71.01.1001',
  bogor: '32.71.01.1001',
  depok: '32.76.01.1001',
  tangerang: '36.71.01.1001',
  bekasi: '32.75.01.1001',
  semarang: '33.74.01.1001',
  yogyakarta: '34.71.01.1001',
  jogja: '34.71.01.1001',
  surabaya: '35.78.01.1001',
  malang: '35.73.01.1001',
  medan: '12.71.01.1001',
  makassar: '73.71.01.1001',
  denpasar: '51.71.01.1001',
  bali: '51.71.01.1001'
};

const MYQURAN_CITY_CACHE = {
  bandung: '1219',
  'kota bandung': '1219',
  cimahi: '1221',
  jakarta: '1301',
  bogor: '1220',
  depok: '1225',
  bekasi: '1221',
  surabaya: '1638',
  yogyakarta: '1505',
  semarang: '1433'
};

function pruneCacheDir(cacheDir, maxFiles = 160) {
  try {
    if (!cacheDir || !fs.existsSync(cacheDir)) return;
    const entries = fs.readdirSync(cacheDir).map((name) => {
      const fullPath = path.join(cacheDir, name);
      try {
        const st = fs.statSync(fullPath);
        return st.isFile() ? { fullPath, mtimeMs: st.mtimeMs } : null;
      } catch {
        return null;
      }
    }).filter(Boolean);
    if (entries.length <= maxFiles) return;
    entries.sort((a, b) => b.mtimeMs - a.mtimeMs);
    for (let i = maxFiles; i < entries.length; i++) {
      try { fs.unlinkSync(entries[i].fullPath); } catch {}
    }
  } catch {}
}

function bmkgDescToIcon(desc) {
  const s = String(desc || '').toLowerCase();
  if (s.includes('petir') || s.includes('badai')) return 'storm';
  if (s.includes('hujan lebat') || s.includes('hujan deras')) return 'rain-heavy';
  if (s.includes('hujan') || s.includes('gerimis')) return 'rain';
  if (s.includes('kabut') || s.includes('asap') || s.includes('udara')) return 'fog';
  if (s.includes('cerah berawan')) return 'sun-cloud';
  if (s.includes('cerah')) return 'sun';
  return 'cloud';
}

const WMO_MAP = {
  0: ['Cerah', 'sun'],
  1: ['Umumnya Cerah', 'sun-cloud'],
  2: ['Berawan Sebagian', 'cloud-sun'],
  3: ['Mendung', 'cloud'],
  45: ['Berkabut', 'fog'],
  48: ['Kabut Tipis', 'fog'],
  51: ['Gerimis Ringan', 'drizzle'],
  53: ['Gerimis', 'drizzle'],
  55: ['Gerimis Lebat', 'drizzle'],
  61: ['Hujan Ringan', 'rain'],
  63: ['Hujan Sedang', 'rain'],
  65: ['Hujan Lebat', 'rain-heavy'],
  80: ['Hujan Lokal Ringan', 'rain'],
  81: ['Hujan Lokal', 'rain'],
  82: ['Hujan Deras', 'rain-heavy'],
  95: ['Badai Petir', 'storm'],
  96: ['Badai + Hujan Es', 'storm'],
  99: ['Badai Petir Kuat', 'storm']
};

function detectTempoVariant(rawText) {
  const s = String(rawText || '').toLowerCase();
  if (/\b(?:slowed|reverb|slow\s*version|0\.[6-9]\d?x)\b/i.test(s)) return 'slowed';
  if (/\b(?:sped\s*up|speed\s*up|nightcore|1\.[1-4]\d?x)\b/i.test(s)) return 'spedup';
  if (/\b(?:live\s+(?:at|in|on|from|@|stage|concert|konser|performance|perform|session|studio|acoustic|version|ver\.|recording|set|fest|festival|tour)|live\b|fancam|unplugged|acoustic\s+(?:cover|version|session|live)|cover\s+(?:by|oleh)|unofficial\s+live)\b/i.test(s)) return 'live';
  if (/\b(?:dj\s+|remix|bootleg|jedag\s*jedug|full\s*bass|bass\s*boost(?:ed)?|mashup|koplo)\b/i.test(s)) return 'remix';
  return null;
}

function stripRemixNoise(str) {
  return String(str || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\.(mp3|flac|wav|m4a|ogg|opus|mp4|mkv|webm)$/i, '')
    .replace(/\s*[\(\[\{][^)\]}]*(?:official|music\s*video|lyric|lirik|visualizer|mv|hd|hq|4k|8k|live|concert|konser|festival|fest\b|tour|stage|session|acoustic|akustik|unplugged|fancam|recorded|remaster|feat\.|ft\.|prod\.|slowed|reverb|sped\s*up|speed\s*up|nightcore|remix|bootleg|jedag|bass|tiktok|viral|cover|mix|edit|karaoke|instrumental|8d|audio|sub\s*indo|terjemahan)[^)\]}]*[\)\]\}]/gi, ' ')
    .replace(/\s*(?:\/\/|\||#|•|〜|~).*$/g, '')
    .replace(/\s+(?:live\s+(?:at|in|on|from|@|stage|concert|konser|performance|perform|session|studio|acoustic|akustik|version|ver\.|recording|set|fest|festival|tour)\b.*|@\s*[\w\s.&-]+$|acoustic\s+(?:cover|version|session|live)\b.*|cover\s+(?:by|oleh)\s+.*|recorded\s+(?:at|live)\s+.*|fancam\b.*|unofficial\b.*)$/i, '')
    .replace(/\s+(?:live|fancam|cover|unplugged)$/i, '')
    .replace(/\b(?:slowed\s*(?:&|\+|and|with)?\s*reverb|slowed|reverb|sped\s*up|speed\s*up|nightcore|jedag\s*jedug|full\s*bass|bass\s*boost(?:ed)?|tiktok\s*viral|viral\s*tiktok|remix|bootleg|lirik\s*terjemahan|lirik\s*lagu|lyric\s*video|video\s*lirik|official\s*(?:music\s*)?(?:video|audio|live)|music\s*video|full\s*album|8d\s*audio)\b/gi, ' ')
    .replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanTrackInfo(rawTitle, rawArtist) {
  let title = (rawTitle || '').trim();
  let artist = (rawArtist || '').replace(/\s*-\s*Topic$/i, '').trim();
  const tempoKind = detectTempoVariant(`${rawTitle || ''} ${rawArtist || ''}`);

  const junkRe = /\s*[\(\[\{]\s*(?:official\s*(?:music\s*)?(?:video|audio|lyric(?:s)?\s*video|visualizer)|lyrics?|lirik|mv|hd|hq|4k|8k|live(?:\s+(?:at|in|on|from|@).*)?|concert.*|konser.*|fancam.*|unplugged.*|acoustic.*|remastered.*|feat\..*|ft\..*|prod\..*|slowed.*|sped\s*up.*|nightcore.*|remix.*)\s*[\)\]\}]/gi;
  title = title.replace(junkRe, '').replace(/\s*(?:\/\/|\|)\s*.*$/, '').trim();

  let altSwapped = null;
  // Handle "Artist - Song Title" or "Song Title - Artist" common on YouTube / GSMTC
  const dashMatch = /\s+[-–—]\s+/.exec(title);
  if (dashMatch && dashMatch.index > 0 && dashMatch.index + dashMatch[0].length < title.length) {
    const dashIdx = dashMatch.index;
    const left = title.slice(0, dashIdx).trim();
    const right = title.slice(dashIdx + dashMatch[0].length).trim();
    const artistLow = artist.toLowerCase();
    const leftLow = left.toLowerCase();
    const rightLow = right.toLowerCase();
    const isGenericArtist = !artist || /youtube|chrome|msedge|brave|opera|firefox|vlc|browser|music\s*channel|official|vibes|records|galau|santai|konser|concert|live|fancam|akustik|acoustic|corner|fest|stage|media|musik/i.test(artistLow);

    if (artistLow && (rightLow.includes(artistLow) || artistLow.includes(rightLow)) && !leftLow.includes(artistLow)) {
      title = left;
      altSwapped = { title: right, artist: left };
    } else if (artistLow && (leftLow.includes(artistLow) || artistLow.includes(leftLow))) {
      artist = left;
      title = right;
      altSwapped = { title: left, artist: right };
    } else if (isGenericArtist) {
      artist = left;
      title = right;
      altSwapped = { title: left, artist: right };
    } else {
      altSwapped = { title: left, artist: right };
    }
  }

  artist = artist.replace(/\s*(?:VEVO|Official|Channel)$/i, '').trim();
  const baseTitle = stripRemixNoise(title) || title;
  const baseArtist = (/^(?:dj\s+|youtube|chrome|edge|brave|music|lyrics)/i.test(artist) ? '' : stripRemixNoise(artist)) || artist;
  return { title, artist, baseTitle, baseArtist, tempoKind, altSwapped };
}

function isLrcCreditOrTitleEcho(text, tSec, titleHint, artistHint) {
  const clean = String(text || '').trim();
  if (!clean) return true;
  if (/^(?:lyrics?|lirik|words?|text|music|composed|composer|arranged|arranger|arrangement|producer|produced|mixed|mastered|vocal|vocals|singer|artist|performer|album|writer|written|作词|作曲|编曲|演唱|制作|混音|歌词|制作人|发行)\s*(?:by)?\s*[:：]/i.test(clean)) {
    return true;
  }
  if (tSec <= 8.5) {
    const fold = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const fc = fold(clean);
    const ft = fold(titleHint);
    const fa = fold(artistHint);
    if (fc && ft && (fc === ft || fc === fa + ft || fc === ft + fa)) return true;
    if (fc && ft && clean.includes(' - ') && fc.includes(ft) && (!fa || fc.includes(fa))) return true;
  }
  return false;
}

function isInstrumentalCue(text) {
  const clean = String(text || '').trim();
  if (!clean) return true;
  if (/^[♪♫♬♩🎵🎶•·…\-\s.~_*\/\\|()[\]]+$/.test(clean)) return true;
  const isBracketed = (/^\[.*\]$/.test(clean) || /^\(.*\)$/.test(clean));
  const inner = clean.replace(/^[\[(<\s♪♫♬♩🎵🎶~*\-]+|[\])>\s♪♫♬♩🎵🎶~*\-]+$/g, '').trim();
  if (!inner) return true;
  if (isBracketed) {
    return /^(?:(?:instrumental|instr\.?|musik|music|interlude|guitar|piano|keyboard|synth|bass|drum|violin|sax(?:ophone)?|flute|cello|trumpet|acoustic|electric|orchestra|intro|outro|break|bridge|pause|solo|fade\s*out|end)(?:\s+(?:solo|break|intro|outro|interlude|part|section|musik|music))?)$/i.test(inner);
  }
  return /^(?:instrumental(?:\s+(?:solo|break|intro|outro|interlude))?|interlude|(?:guitar|piano|keyboard|synth|bass|drum|violin|sax(?:ophone)?|flute|cello|trumpet|acoustic)\s+solo|musik|fade\s*out)$/i.test(inner);
}

function parseLrc(lrcText, titleHint = '', artistHint = '') {
  if (!lrcText || typeof lrcText !== 'string') return [];
  let offsetSec = 0;
  const offMatch = lrcText.match(/\[offset\s*:\s*([+-]?\d+)\s*\]/i);
  if (offMatch) {
    const ms = Number(offMatch[1]);
    if (Number.isFinite(ms)) offsetSec = Math.max(-10, Math.min(10, ms / 1000));
  }

  const lines = [];
  const rowRe = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  for (const rawLine of lrcText.split(/\r?\n/)) {
    const times = [];
    let match;
    rowRe.lastIndex = 0;
    while ((match = rowRe.exec(rawLine)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const msRaw = match[3] || '0';
      const ms = msRaw.length === 3 ? parseInt(msRaw, 10) / 1000 : msRaw.length === 2 ? parseInt(msRaw, 10) / 100 : parseInt(msRaw, 10) / 10;
      times.push(Math.max(0, mins * 60 + secs + ms - offsetSec));
    }
    if (times.length === 0) continue;
    const text = rawLine
      .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, '')
      .replace(/\[(?:ti|ar|al|au|by|offset|length|re|ve|id|total):[^\]]*\]/gi, '')
      .replace(/<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/g, '')
      .trim();
    const isInstr = !text || isInstrumentalCue(text);
    const outText = text || '♪';
    for (const t of times) {
      if (!isInstr && isLrcCreditOrTitleEcho(outText, t, titleHint, artistHint)) continue;
      lines.push(isInstr ? { time: Number(t.toFixed(3)), text: outText, isBreak: true } : { time: Number(t.toFixed(3)), text: outText });
    }
  }
  lines.sort((a, b) => a.time - b.time);
  return lines;
}

async function fetchJson(url, timeoutMs = 8000, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DynotchFlow/1.0 (Windows 11 Custom Dynamic Island)',
        ...headers
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'DynotchFlow/1.0 (Windows 11)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function titleSim(a, b) {
  const cleanTokens = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  const collapse = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const ca = collapse(a);
  const cb = collapse(b);
  if (!ca || !cb) return 0;
  if (ca === cb) return 1.0;
  if (ca.length >= 5 && cb.length >= 5 && (ca.includes(cb) || cb.includes(ca))) {
    return (Math.min(ca.length, cb.length) / Math.max(ca.length, cb.length)) * 0.95;
  }
  const sa = new Set(cleanTokens(a));
  const sb = new Set(cleanTokens(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  return inter / Math.max(sa.size, sb.size);
}

async function resolveCanonicalViaItunes(artist, title) {
  const candidates = [];
  if (artist && title) candidates.push(`${artist} ${title}`.trim());
  if (title) candidates.push(title);
  for (const q of candidates) {
    try {
      const res = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=4`, 4500);
      const list = Array.isArray(res && res.results) ? res.results : [];
      let best = null;
      let bestSim = 0;
      for (const item of list) {
        const ts = titleSim(title, item.trackName);
        if (ts < 0.45) continue;
        const as = artist ? titleSim(artist, item.artistName) : 0.3;
        const combined = ts * 0.7 + as * 0.3;
        if (combined > bestSim) {
          bestSim = combined;
          best = item;
        }
      }
      if (best) {
        return {
          title: best.trackName,
          artist: best.artistName,
          duration: (best.trackTimeMillis || 0) / 1000
        };
      }
    } catch {}
  }
  return null;
}

async function fetchKugouLyrics(artist, title, durationSec) {
  const query = `${artist || ''} ${title || ''}`.trim();
  if (!query) return null;
  try {
    const searchUrl = `https://mobileservice.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(query)}&page=1&pagesize=4`;
    const searchRes = await fetchJson(searchUrl, 4500);
    const items = (searchRes && searchRes.data && searchRes.data.info) || [];
    let bestSong = null;
    let bestScore = -1;
    for (const s of items) {
      if (!s || !s.hash) continue;
      const tSim = titleSim(title, s.songname);
      if (tSim < 0.50) continue;
      const aSim = artist ? titleSim(artist, s.singername) : 0.2;
      const sc = tSim * 65 + aSim * 35;
      if (sc > bestScore) {
        bestScore = sc;
        bestSong = s;
      }
    }
    if (!bestSong) return null;

    const kDur = Number(bestSong.duration || durationSec || 0) * 1000;
    const candRes = await fetchJson(
      `https://krcs.kugou.com/search?ver=1&man=yes&client=mobi&keyword=&duration=${Math.round(kDur)}&hash=${encodeURIComponent(bestSong.hash)}`,
      4500
    );
    const cand = candRes && Array.isArray(candRes.candidates) ? candRes.candidates[0] : null;
    if (!cand || !cand.id || !cand.accesskey) return null;

    const dlRes = await fetchJson(
      `https://lyrics.kugou.com/download?ver=1&client=pc&id=${encodeURIComponent(cand.id)}&accesskey=${encodeURIComponent(cand.accesskey)}&fmt=lrc&charset=utf8`,
      4500
    );
    if (!dlRes || !dlRes.content) return null;
    const lrcText = Buffer.from(dlRes.content, 'base64').toString('utf8');
    if (!/\[\d{1,3}:\d{2}/.test(lrcText)) return null;
    return {
      syncedLyrics: lrcText,
      plainLyrics: '',
      trackName: bestSong.songname || title,
      artistName: bestSong.singername || artist,
      duration: Number(bestSong.duration || 0)
    };
  } catch {
    return null;
  }
}

async function fetchLyrics(rawTitle, rawArtist, album, durationSec, cacheDir) {
  const { title, artist, baseTitle, baseArtist, tempoKind, altSwapped } = cleanTrackInfo(rawTitle, rawArtist);
  const queryTitle = baseTitle || title;
  const queryArtist = baseArtist || artist;
  const isLiveTrack = tempoKind === 'live';
  const isLongMultiSongTitle = /\b(?:full\s*(?:concert|konser|album|set|show|live\s*set)|setlist|medley|non[\s-]?stop|mega[\s-]?mix|mixtape|compilations?|kompilasi|\d+\s*(?:jam|hour|hr)s?|playlist)\b/i.test(`${rawTitle || ''} ${album || ''}`);
  if (Number(durationSec) > 900 || isLongMultiSongTitle) {
    return { cacheV: 4, found: false, synced: false, lines: [], plain: [], isMultiSongLongVideo: true, tempoKind, isLiveTrack, title, artist };
  }
  if (!queryTitle) return { cacheV: 4, found: false, synced: false, lines: [], plain: [], tempoKind, isLiveTrack, title, artist };

  const cacheKey = crypto.createHash('sha1').update(`v4|${queryTitle.toLowerCase()}|${queryArtist.toLowerCase()}`).digest('hex');
  const cacheFile = path.join(cacheDir, `${cacheKey}.json`);
  try {
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (cached && cached.cacheV === 4 && ((cached.lines && cached.lines.length > 0) || (cached.plain && cached.plain.length > 0))) {
        return {
          ...cached,
          title: cached.trackName || queryTitle,
          artist: cached.artistName || queryArtist,
          tempoKind,
          isLiveTrack,
          rawTitle: String(rawTitle || ''),
          fromCache: true
        };
      }
    }
  } catch {}

  const pickBest = (candidates, tgtTitle = queryTitle, tgtArtist = queryArtist) => {
    if (!Array.isArray(candidates) || candidates.length === 0) return null;
    let best = null;
    let bestScore = -1e9;
    for (const c of candidates) {
      if (!c.syncedLyrics && !c.plainLyrics) continue;
      if (c.instrumental) continue;
      const ct = String(c.trackName || '');
      const ca = String(c.artistName || '');
      const tSim = titleSim(tgtTitle, ct);
      if (tSim < 0.42) continue;
      const aSim = tgtArtist ? titleSim(tgtArtist, ca) : 0.25;
      let score = (c.syncedLyrics ? 120 : 15) + tSim * 65 + aSim * 45;
      if (durationSec > 10 && c.duration) {
        const cDur = Number(c.duration);
        const diff = Math.abs(cDur - durationSec);
        if (tempoKind === 'slowed' || tempoKind === 'spedup') {
          const ratio = durationSec / Math.max(1, cDur);
          if (ratio >= 0.62 && ratio <= 1.48) score += 18;
          else score -= Math.min(35, diff * 0.5);
        } else if (tempoKind === 'live' || tempoKind === 'remix') {
          score -= Math.min(25, diff * 0.15);
        } else {
          score -= Math.min(45, diff * 0.8);
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  };

  let picked = null;
  if (!tempoKind) {
    try {
      const params = new URLSearchParams({ track_name: queryTitle, artist_name: queryArtist || queryTitle });
      if (album) params.set('album_name', album);
      if (durationSec > 10) params.set('duration', String(Math.round(durationSec)));
      const exactHit = await fetchJson(`https://lrclib.net/api/get?${params.toString()}`, 5000);
      if (exactHit && (exactHit.syncedLyrics || exactHit.plainLyrics) && titleSim(queryTitle, exactHit.trackName) >= 0.42) {
        picked = exactHit;
      }
    } catch {}
  }

  const noDjTitle = queryTitle.replace(/^dj\s+/i, '').trim();
  const lrclibQueries = [];
  if (queryArtist) {
    lrclibQueries.push({
      url: `https://lrclib.net/api/search?q=${encodeURIComponent(`${queryArtist} ${queryTitle}`)}`,
      tgtTitle: queryTitle,
      tgtArtist: queryArtist
    });
  }
  lrclibQueries.push({
    url: `https://lrclib.net/api/search?track_name=${encodeURIComponent(noDjTitle || queryTitle)}`,
    tgtTitle: noDjTitle || queryTitle,
    tgtArtist: queryArtist
  });
  if (altSwapped && altSwapped.title) {
    const swTitle = stripRemixNoise(altSwapped.title) || altSwapped.title;
    const swArtist = stripRemixNoise(altSwapped.artist) || altSwapped.artist;
    if (swTitle && (swTitle.toLowerCase() !== queryTitle.toLowerCase() || swArtist.toLowerCase() !== queryArtist.toLowerCase())) {
      lrclibQueries.push({
        url: `https://lrclib.net/api/search?q=${encodeURIComponent(swArtist ? `${swArtist} ${swTitle}` : swTitle)}`,
        tgtTitle: swTitle,
        tgtArtist: swArtist
      });
    }
  }

  for (const q of lrclibQueries.slice(0, 3)) {
    if (picked && picked.syncedLyrics && titleSim(q.tgtTitle, picked.trackName) >= 0.72) break;
    try {
      const list = await fetchJson(q.url, 5500);
      const cand = pickBest(list, q.tgtTitle, q.tgtArtist);
      if (cand && (!picked || (cand.syncedLyrics && !picked.syncedLyrics))) {
        picked = cand;
      }
    } catch {}
  }

  // Fallback 2: Canonical spelling lookup via iTunes -> LRCLIB
  if (!picked || !picked.syncedLyrics) {
    const canon = await resolveCanonicalViaItunes(queryArtist, noDjTitle || queryTitle);
    if (canon && canon.title) {
      for (const u of [
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${canon.artist} ${canon.title}`)}`,
        `https://lrclib.net/api/search?track_name=${encodeURIComponent(canon.title)}`
      ]) {
        if (picked && picked.syncedLyrics) break;
        try {
          const list = await fetchJson(u, 5500);
          const cand = pickBest(list, canon.title, canon.artist);
          if (cand && (!picked || (cand.syncedLyrics && !picked.syncedLyrics))) {
            picked = cand;
          }
        } catch {}
      }
    }
  }

  // Fallback 3: Similarity-guarded Kugou LRC database
  if (!picked || !picked.syncedLyrics) {
    const kugou = await fetchKugouLyrics(queryArtist, noDjTitle || queryTitle, durationSec);
    if (kugou && kugou.syncedLyrics) {
      picked = kugou;
    }
  }

  // Fallback 4: Plain lyrics from lyrics.ovh
  let plainFallback = [];
  if (!picked && queryArtist && (noDjTitle || queryTitle)) {
    try {
      const ovh = await fetchJson(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(queryArtist)}/${encodeURIComponent(noDjTitle || queryTitle)}`,
        3800
      );
      if (ovh && typeof ovh.lyrics === 'string' && ovh.lyrics.trim()) {
        plainFallback = ovh.lyrics.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      }
    } catch {}
  }

  const resolvedTitle = (picked && picked.trackName) || queryTitle;
  const resolvedArtist = (picked && picked.artistName) || queryArtist;
  const lines = picked && picked.syncedLyrics ? parseLrc(picked.syncedLyrics, resolvedTitle, resolvedArtist) : [];
  const plain = picked && picked.plainLyrics
    ? picked.plainLyrics.split(/\r?\n/).filter(Boolean)
    : plainFallback;
  const result = {
    cacheV: 4,
    found: lines.length > 0 || plain.length > 0,
    synced: lines.length > 0,
    lines,
    plain,
    sourceDuration: Number((picked && picked.duration) || 0),
    tempoKind: tempoKind || null,
    isLiveTrack,
    rawTitle: String(rawTitle || ''),
    trackName: resolvedTitle,
    artistName: resolvedArtist,
    title: resolvedTitle,
    artist: resolvedArtist
  };

  if (result.found) {
    try {
      const toCache = { ...result };
      delete toCache.rawTitle;
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(toCache));
      pruneCacheDir(cacheDir, 160);
    } catch {}
  }
  return result;
}

function parseBmkgTimeMs(s) {
  if (s.utc_datetime) {
    const t = new Date(String(s.utc_datetime).replace(' ', 'T') + 'Z').getTime();
    if (!Number.isNaN(t)) return t;
  }
  return new Date(String(s.local_datetime || '').replace(' ', 'T')).getTime();
}

async function fetchWeather(lat = -6.2088, lon = 106.8456, cityName = 'Jakarta') {
  const key = String(cityName || 'Jakarta').trim().toLowerCase();
  const adm4 = BMKG_ADM4_MAP[key] || (key.includes('jakarta') ? '31.71.01.1001' : (key.includes('bandung') ? '32.73.07.1003' : null));

  if (adm4) {
    try {
      const bmkgUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`;
      const b = await fetchJson(bmkgUrl, 7500);
      const groups = (b && b.data && b.data[0] && b.data[0].cuaca) || [];
      const flat = [];
      for (const grp of groups) {
        if (Array.isArray(grp)) {
          for (const item of grp) flat.push(item);
        }
      }

      if (flat.length > 0) {
        const nowMs = Date.now();
        let curSlot = flat[0];
        let minDiff = Infinity;
        for (const s of flat) {
          const tMs = parseBmkgTimeMs(s);
          const diff = Math.abs(tMs - nowMs);
          if (diff < minDiff) {
            minDiff = diff;
            curSlot = s;
          }
        }

        // Next 24h slots for daily min/max & weather state changes
        const windowSlots = flat.filter(s => {
          const tMs = parseBmkgTimeMs(s);
          return tMs >= nowMs - 2 * 3600 * 1000 && tMs <= nowMs + 26 * 3600 * 1000;
        });
        const sampleSlots = windowSlots.length > 0 ? windowSlots : flat.slice(0, 8);
        const tempsAll = sampleSlots.map(s => Number(s.t ?? 24));
        const minTemp = Math.round(Math.min(...tempsAll));
        const maxTemp = Math.round(Math.max(...tempsAll));

        const transitions = [];
        let prevDesc = '';
        let rainAlert = null;
        for (const s of sampleSlots) {
          const hhmm = String(s.local_datetime || '').slice(11, 16);
          const desc = String(s.weather_desc || 'Berawan').trim();
          const temp = Math.round(Number(s.t ?? 24));
          const icon = bmkgDescToIcon(desc);
          if (desc.toLowerCase() !== prevDesc.toLowerCase()) {
            transitions.push({ time: hhmm, label: desc, temp, icon });
            prevDesc = desc;
          }
          if (!rainAlert && /hujan|petir|badai/i.test(desc)) {
            rainAlert = { time: hhmm, desc };
          }
        }

        const transitionSummary = transitions.length > 1
          ? transitions.slice(0, 4).map(t => `${t.time} ${t.label}`).join(' → ')
          : `Stabil ${curSlot.weather_desc || 'Berawan'} sepanjang hari`;

        return {
          source: 'BMKG',
          city: (b?.lokasi?.kotkab || cityName).replace(/^Kota\s+/i, ''),
          subdistrict: b?.lokasi?.kecamatan || '',
          temp: Math.round(Number(curSlot.t ?? 24)),
          feelsLike: Math.round(Number(curSlot.t ?? 24)),
          humidity: Number(curSlot.hu ?? 75),
          wind: Math.round(Number(curSlot.ws ?? 0)),
          label: String(curSlot.weather_desc || 'Berawan'),
          icon: bmkgDescToIcon(curSlot.weather_desc),
          min: minTemp,
          max: maxTemp,
          rainAlert,
          transitions: transitions.slice(0, 5),
          transitionSummary,
          updatedAt: Date.now()
        };
      }
    } catch {}
  }

  // Fallback: Open-Meteo with Daily Weather Change Transitions
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=precipitation_probability,weather_code,temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=2`;
  const d = await fetchJson(url, 8000);
  const cur = d.current || {};
  const code = cur.weather_code ?? 0;
  const [label, icon] = WMO_MAP[code] || ['Berawan', 'cloud'];

  const nowMs = Date.now();
  const times = (d.hourly && d.hourly.time) || [];
  const probs = (d.hourly && d.hourly.precipitation_probability) || [];
  const codes = (d.hourly && d.hourly.weather_code) || [];
  const temps = (d.hourly && d.hourly.temperature_2m) || [];
  let rainAlert = null;
  const transitions = [];
  let prevLbl = '';

  for (let i = 0; i < times.length; i++) {
    const tMs = new Date(times[i]).getTime();
    if (tMs >= nowMs - 1800000 && tMs <= nowMs + 24 * 3600000) {
      const hhmm = times[i].slice(11, 16);
      const prob = probs[i] ?? 0;
      const [hLabel, hIcon] = WMO_MAP[codes[i] ?? 0] || ['Berawan', 'cloud'];
      if (hLabel !== prevLbl) {
        transitions.push({ time: hhmm, label: hLabel, temp: Math.round(temps[i] ?? cur.temperature_2m ?? 0), icon: hIcon });
        prevLbl = hLabel;
      }
      if (!rainAlert && (prob >= 50 || /hujan|badai/i.test(hLabel))) {
        rainAlert = { time: hhmm, prob, desc: hLabel };
      }
    }
  }

  return {
    source: 'Open-Meteo',
    city: cityName,
    temp: Math.round(cur.temperature_2m ?? 0),
    feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
    humidity: cur.relative_humidity_2m ?? 0,
    wind: Math.round(cur.wind_speed_10m ?? 0),
    label,
    icon,
    min: Math.round((d.daily && d.daily.temperature_2m_min && d.daily.temperature_2m_min[0]) ?? 0),
    max: Math.round((d.daily && d.daily.temperature_2m_max && d.daily.temperature_2m_max[0]) ?? 0),
    rainAlert,
    transitions: transitions.slice(0, 5),
    transitionSummary: transitions.length > 1
      ? transitions.slice(0, 4).map(t => `${t.time} ${t.label}`).join(' → ')
      : `Stabil ${label} hari ini`,
    updatedAt: Date.now()
  };
}

async function fetchPrayerTimes(city = 'Jakarta', country = 'Indonesia') {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;
  const cleanCity = String(city || 'Jakarta').trim().toLowerCase();

  // Primary: Official Kemenag RI via MyQuran v2 API
  try {
    let cityId = MYQURAN_CITY_CACHE[cleanCity] || (cleanCity.includes('jakarta') ? '1301' : (cleanCity.includes('bandung') ? '1219' : null));
    if (!cityId) {
      const searchRes = await fetchJson(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(cleanCity)}`, 5500);
      if (searchRes && searchRes.status && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        const kotaMatch = searchRes.data.find(x => /^KOTA\s+/i.test(x.lokasi)) || searchRes.data[0];
        cityId = kotaMatch.id;
        MYQURAN_CITY_CACHE[cleanCity] = cityId;
      }
    }
    if (cityId) {
      const kRes = await fetchJson(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${yyyy}/${mm}/${dd}`, 6500);
      const j = kRes && kRes.status && kRes.data && kRes.data.jadwal ? kRes.data.jadwal : null;
      if (j && j.subuh && j.dzuhur) {
        return {
          source: 'Kemenag RI',
          city: (kRes.data.lokasi || city).replace(/^KOTA\s+/i, 'Kota ').replace(/^KAB\.\s+/i, 'Kab. '),
          dateKey,
          tanggal: j.tanggal || `${dd}/${mm}/${yyyy}`,
          imsak: j.imsak || '',
          terbit: j.terbit || '',
          timings: [
            { key: 'Subuh', time: j.subuh },
            { key: 'Dzuhur', time: j.dzuhur },
            { key: 'Ashar', time: j.ashar },
            { key: 'Maghrib', time: j.maghrib },
            { key: 'Isya', time: j.isya }
          ],
          updatedAt: Date.now()
        };
      }
    }
  } catch {}

  // Fallback: Aladhan Method 20 (Kemenag RI)
  const url = `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=20`;
  const res = await fetchJson(url, 8000);
  const t = res && res.data && res.data.timings ? res.data.timings : {};
  const clean = (s) => (s || '').replace(/\s*\(.*\)/, '').trim();
  const list = [
    { key: 'Subuh', time: clean(t.Fajr) },
    { key: 'Dzuhur', time: clean(t.Dhuhr) },
    { key: 'Ashar', time: clean(t.Asr) },
    { key: 'Maghrib', time: clean(t.Maghrib) },
    { key: 'Isya', time: clean(t.Isha) }
  ].filter(x => /^\d{2}:\d{2}$/.test(x.time));

  return {
    source: 'Kemenag RI',
    city,
    dateKey,
    tanggal: `${dd}/${mm}/${yyyy}`,
    hijri: res?.data?.date?.hijri ? `${res.data.date.hijri.day} ${res.data.date.hijri.month?.en || ''} ${res.data.date.hijri.year}` : '',
    timings: list,
    updatedAt: Date.now()
  };
}

function parseIcsDate(val) {
  if (!val) return null;
  const clean = val.trim();
  const m = clean.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh, mm, ss, isUtc] = m;
  if (!hh) {
    return { date: new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0), allDay: true };
  }
  if (isUtc) {
    return { date: new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss))), allDay: false };
  }
  return { date: new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss)), allDay: false };
}

const ICS_DAY_MAP = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function expandRruleInstances(startDate, durationMs, rruleStr, exdatesSet, windowStart, windowEnd) {
  const parts = {};
  for (const kv of String(rruleStr || '').split(';')) {
    const [k, v] = kv.split('=');
    if (k && v) parts[k.toUpperCase().trim()] = v.trim();
  }
  const freq = (parts.FREQ || '').toUpperCase();
  if (freq !== 'WEEKLY' && freq !== 'DAILY') return [];

  const interval = Math.max(1, parseInt(parts.INTERVAL || '1', 10) || 1);
  const untilParsed = parts.UNTIL ? parseIcsDate(parts.UNTIL) : null;
  const untilMs = untilParsed ? untilParsed.date.getTime() + 86400000 : Infinity;
  if (untilMs < windowStart) return [];

  const byDays = parts.BYDAY
    ? parts.BYDAY.split(',').map(d => ICS_DAY_MAP[d.slice(-2).toUpperCase()]).filter(d => d !== undefined)
    : [startDate.getDay()];

  const results = [];
  const startH = startDate.getHours();
  const startM = startDate.getMinutes();
  const startS = startDate.getSeconds();
  const baseDayStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();

  const scanStart = new Date(windowStart);
  scanStart.setHours(0, 0, 0, 0);

  for (let dayMs = scanStart.getTime(); dayMs <= windowEnd; dayMs += 86400000) {
    if (dayMs < baseDayStart) continue;
    const cand = new Date(dayMs);
    cand.setHours(startH, startM, startS, 0);
    const candMs = cand.getTime();
    if (candMs > untilMs || candMs > windowEnd) continue;
    if (candMs + durationMs < windowStart) continue;

    const dayDiff = Math.round((dayMs - baseDayStart) / 86400000);
    if (freq === 'DAILY') {
      if (dayDiff % interval !== 0) continue;
    } else if (freq === 'WEEKLY') {
      const weekDiff = Math.floor(dayDiff / 7);
      if (weekDiff % interval !== 0) continue;
      if (!byDays.includes(cand.getDay())) continue;
    }

    const dateKey = `${cand.getFullYear()}${String(cand.getMonth() + 1).padStart(2, '0')}${String(cand.getDate()).padStart(2, '0')}`;
    if (exdatesSet && exdatesSet.has(dateKey)) continue;
    results.push({ startMs: candMs, endMs: candMs + durationMs });
  }
  return results;
}

function inferTagAndColor(title) {
  const s = String(title || '').toLowerCase();
  if (/^\[kuliah\]|kuliah|ta\b|skripsi|kampus|ujian|seminar/i.test(s)) return { tag: 'Kuliah', color: '#4986e7' };
  if (/^\[pro|proyek|project|kantor|meeting|rapat|kerja|client|deadline/i.test(s)) return { tag: 'Profesional', color: '#16a765' };
  if (/^\[sosial\]|nongkrong|bukber|reuni|komunitas/i.test(s)) return { tag: 'Sosial', color: '#fa573c' };
  if (/^\[personal\]|gym|olahraga|dokter|pribadi/i.test(s)) return { tag: 'Personal', color: '#cd74e6' };
  return { tag: 'Kalender', color: '#38bdf8' };
}

function parseIcs(icsText) {
  const unfolded = icsText.replace(/\r?\n[ \t]/g, '');
  const events = [];
  const blocks = unfolded.split(/BEGIN:VEVENT/i).slice(1);
  const now = Date.now();
  const windowStart = now - 3600 * 1000;
  const windowEnd = now + 7 * 24 * 3600 * 1000;

  for (const blk of blocks) {
    const body = blk.split(/END:VEVENT/i)[0] || '';
    const getProp = (name) => {
      const re = new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'im');
      const m = body.match(re);
      return m ? m[1].trim().replace(/\\n/g, ' ').replace(/\\,/g, ',') : '';
    };
    const summary = getProp('SUMMARY');
    const startRaw = getProp('DTSTART');
    const endRaw = getProp('DTEND');
    const rruleRaw = getProp('RRULE');
    const location = getProp('LOCATION');
    const parsed = parseIcsDate(startRaw);
    if (!summary || !parsed) continue;
    const endParsed = parseIcsDate(endRaw);
    const startMs = parsed.date.getTime();
    const endMs = endParsed ? endParsed.date.getTime() : startMs + 3600000;
    const durationMs = Math.max(900000, endMs - startMs);
    const { tag, color } = inferTagAndColor(summary);

    if (rruleRaw && !parsed.allDay) {
      const exdatesSet = new Set();
      const exRe = /^EXDATE(?:;[^:]*)?:(.*)$/gim;
      let exMatch;
      while ((exMatch = exRe.exec(body)) !== null) {
        for (const token of exMatch[1].split(',')) {
          const cleanTok = token.trim().slice(0, 8);
          if (/^\d{8}$/.test(cleanTok)) exdatesSet.add(cleanTok);
        }
      }
      const expanded = expandRruleInstances(parsed.date, durationMs, rruleRaw, exdatesSet, windowStart, windowEnd);
      for (const inst of expanded) {
        events.push({
          id: `ics_${inst.startMs}_${summary.slice(0, 16)}`,
          title: summary,
          tag,
          color,
          location,
          startMs: inst.startMs,
          endMs: inst.endMs,
          allDay: false,
          source: 'gcal'
        });
      }
    } else if (endMs >= windowStart && startMs <= windowEnd) {
      events.push({
        id: `ics_${startMs}_${summary.slice(0, 16)}`,
        title: summary,
        tag,
        color,
        location,
        startMs,
        endMs,
        allDay: parsed.allDay,
        source: 'gcal'
      });
    }
  }
  events.sort((a, b) => a.startMs - b.startMs);
  return events.slice(0, 24);
}

const DEFAULT_CALENDARS = [];

function parseGcalItems(items, calMeta = {}) {
  const mapped = [];
  for (const it of (items || [])) {
    const rawTitle = (it.summary || it.title || '').trim();
    const startStr = it.start?.dateTime || it.start?.date || it.startTime || it.start;
    const endStr   = it.end?.dateTime || it.end?.date || it.endTime || it.end;
    if (!rawTitle || !startStr) continue;
    const startMs = new Date(startStr).getTime();
    const endMs   = endStr ? new Date(endStr).getTime() : startMs + 3600000;
    if (Number.isNaN(startMs)) continue;
    mapped.push({
      id: `gcli_${it.id || startMs}`,
      title: rawTitle,
      tag: it.tag || calMeta.tag || 'Kalender',
      color: it.color || calMeta.color || '#38bdf8',
      location: it.location || '',
      htmlLink: it.htmlLink || '',
      startMs,
      endMs,
      allDay: typeof startStr === 'string' && startStr.length <= 10,
      source: 'gcal'
    });
  }
  return mapped;
}

function fetchSingleCalCli(exePath, prefixArgs, calMeta, customEnv) {
  return new Promise((resolve) => {
    execFile(exePath, [...prefixArgs, 'readonly', 'events', '--cal', calMeta.id, '--max', '20', '--json'], {
      timeout: 6500,
      windowsHide: true,
      env: customEnv || process.env
    }, (err, stdout) => {
      if (err || !stdout) {
        resolve(null);
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        const items = Array.isArray(parsed) ? parsed : (parsed.items || parsed.events || []);
        resolve(parseGcalItems(items, calMeta));
      } catch {
        resolve(null);
      }
    });
  });
}

async function fetchGcalendarCliEvents(calendarList = DEFAULT_CALENDARS, forceRefresh = false) {
  const calsToQuery = Array.isArray(calendarList) && calendarList.length > 0 ? calendarList : DEFAULT_CALENDARS;
  if (calsToQuery.length === 0) return { ok: false, events: [] };

  const userProfile = process.env.USERPROFILE || require('os').homedir();
  const appDataDir = path.join(process.env.APPDATA || path.join(userProfile, 'AppData', 'Roaming'), 'NotchFlow');
  const gcalCachePath = path.join(appDataDir, 'gcal-cache.json');
  const gcalEnvPath = path.join(appDataDir, 'gcal-env.json');

  // Fast-path: use recent cache (< 5 min old) during background polls to avoid spawning CLI processes
  if (!forceRefresh) {
    try {
      if (fs.existsSync(gcalCachePath)) {
        const cached = JSON.parse(fs.readFileSync(gcalCachePath, 'utf8'));
        if (cached && Array.isArray(cached.events) && (Date.now() - Number(cached.updatedAt || 0) < 5 * 60 * 1000)) {
          const now = Date.now();
          const upcoming = cached.events.filter(ev => (ev.endMs || ev.startMs + 3600000) >= now - 1800000);
          if (upcoming.length > 0) {
            return { ok: true, events: upcoming, fromCache: true };
          }
        }
      }
    } catch {}
  }

  let cliEnv = { ...process.env };
  try {
    if (fs.existsSync(gcalEnvPath)) {
      const savedEnv = JSON.parse(fs.readFileSync(gcalEnvPath, 'utf8'));
      cliEnv = { ...cliEnv, ...savedEnv };
    }
  } catch {}

  const bundledExe = path.join(__dirname, 'bin', 'gcalendar.exe');
  const candidates = [];
  if (fs.existsSync(bundledExe)) candidates.push({ exe: bundledExe, args: [] });

  for (const cand of candidates) {
    const results = await Promise.all(calsToQuery.map(c => fetchSingleCalCli(cand.exe, cand.args, c, cliEnv)));
    const validLists = results.filter(Array.isArray);
    if (validLists.length > 0) {
      const merged = validLists.flat();
      try {
        fs.mkdirSync(appDataDir, { recursive: true });
        fs.writeFileSync(gcalCachePath, JSON.stringify({ updatedAt: Date.now(), events: merged }, null, 2), 'utf8');
      } catch {}
      return { ok: true, events: merged };
    }
  }

  try {
    if (fs.existsSync(gcalCachePath)) {
      const cached = JSON.parse(fs.readFileSync(gcalCachePath, 'utf8'));
      if (cached && Array.isArray(cached.events)) {
        const now = Date.now();
        const upcoming = cached.events.filter(ev => (ev.endMs || ev.startMs + 3600000) >= now - 1800000);
        return { ok: true, events: upcoming, fromCache: true };
      }
    }
  } catch {}

  return { ok: false, events: [] };
}

function deduplicateEvents(events) {
  const seen = new Set();
  const out = [];
  for (const ev of events) {
    const normTitle = String(ev.title || '').trim().toLowerCase();
    const minuteBucket = Math.round((ev.startMs || 0) / 60000);
    const key = `${normTitle}|${minuteBucket}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ev);
  }
  return out;
}

async function fetchCalendarEvents(icsUrl, localEvents = [], gcalAccount = '', calendarList = DEFAULT_CALENDARS, forceRefresh = false) {
  let remote = [];
  let error = null;
  let gcalConnected = false;

  // 1. Optional Google Calendar CLI if user configured calendars explicitly
  const cliRes = await fetchGcalendarCliEvents(calendarList, forceRefresh);
  if (cliRes.ok) {
    gcalConnected = true;
    remote.push(...cliRes.events);
  }

  // 2. Private/Public iCal (.ics) URLs (supports single or multiple URLs separated by comma/newline)
  const urls = String(icsUrl || '').split(/[\s,;]+/).map(u => u.trim()).filter(u => /^https?:\/\//i.test(u));
  if (urls.length > 0) {
    const icsResults = await Promise.allSettled(urls.map(u => fetchText(u, 9000)));
    for (const r of icsResults) {
      if (r.status === 'fulfilled' && r.value) {
        remote.push(...parseIcs(r.value));
        gcalConnected = true;
      } else if (r.status === 'rejected' && !error) {
        error = r.reason?.message || 'Gagal memuat iCal';
      }
    }
  }

  const now = Date.now();
  const upcomingLocal = (localEvents || []).filter(ev => (ev.endMs || ev.startMs + 3600000) >= now - 1800000);
  const combined = deduplicateEvents([...remote, ...upcomingLocal]).sort((a, b) => a.startMs - b.startMs);
  return {
    events: combined.slice(0, 36),
    remoteCount: remote.length,
    gcalConnected,
    account: gcalAccount || '',
    error,
    updatedAt: Date.now()
  };
}

function isPrivateOrLocalIp(ip) {
  const clean = String(ip || '').trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!clean) return true;
  if (clean.startsWith('::ffff:')) {
    return isPrivateOrLocalIp(clean.slice(7));
  }
  const kind = net.isIP(clean);
  if (kind === 4) {
    const parts = clean.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127 || a >= 224) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (kind === 6) {
    if (clean === '::' || clean === '::1') return true;
    if (clean.startsWith('fc') || clean.startsWith('fd') || clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) return true;
    return false;
  }
  return false;
}

async function assertPublicHttpsUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl || '').trim());
  } catch {
    throw new Error('URL tidak valid');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Hanya URL HTTPS publik yang diizinkan');
  }
  if (parsed.username || parsed.password) {
    throw new Error('Kredensial pada URL tidak diizinkan');
  }
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Host lokal tidak diizinkan');
  }
  if (net.isIP(host)) {
    if (isPrivateOrLocalIp(host)) throw new Error('IP lokal/privat tidak diizinkan');
    return parsed.toString();
  }
  try {
    const addrs = await dns.promises.lookup(host, { all: true });
    if (addrs.some(entry => isPrivateOrLocalIp(entry.address))) {
      throw new Error('Domain mengarah ke IP lokal/privat');
    }
  } catch (err) {
    if (err && /lokal|privat/i.test(err.message)) throw err;
  }
  return parsed.toString();
}

function resolveJsonPath(obj, dotPath) {
  if (!dotPath) return obj;
  let cur = obj;
  for (const part of dotPath.split('.').filter(Boolean)) {
    if (part === '__proto__' || part === 'constructor' || part === 'prototype') return undefined;
    if (cur == null || !Object.prototype.hasOwnProperty.call(cur, part)) return undefined;
    cur = cur[part];
  }
  return cur;
}

async function fetchCustomFeed(feed) {
  if (!feed || !feed.enabled || !feed.url) return null;
  try {
    const safeUrl = await assertPublicHttpsUrl(feed.url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    let json;
    try {
      const res = await fetch(safeUrl, {
        signal: controller.signal,
        redirect: 'error',
        headers: { 'User-Agent': 'DynotchFlow/4.0 (Windows 11 Custom Dynamic Island)' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      json = await res.json();
    } finally {
      clearTimeout(timer);
    }
    const val = resolveJsonPath(json, feed.jsonPath || '');
    const formatted = typeof val === 'number'
      ? (Number.isInteger(val) ? val.toLocaleString('id-ID') : val.toLocaleString('id-ID', { maximumFractionDigits: 2 }))
      : String(val ?? '—');
    return {
      id: feed.id,
      label: feed.label || 'Custom Data',
      prefix: feed.prefix || '',
      suffix: feed.suffix || '',
      value: formatted,
      ok: true,
      updatedAt: Date.now()
    };
  } catch (e) {
    return {
      id: feed.id,
      label: feed.label || 'Custom Data',
      prefix: '',
      suffix: '',
      value: 'Err',
      error: e.message,
      ok: false,
      updatedAt: Date.now()
    };
  }
}

async function fetchAlbumArtHD(rawTitle, rawArtist, cacheDir) {
  const { title, artist } = cleanTrackInfo(rawTitle, rawArtist);
  if (!title) return '';
  const cacheKey = 'art_' + crypto.createHash('sha1').update(`${title.toLowerCase()}|${artist.toLowerCase()}`).digest('hex');
  const cacheFile = path.join(cacheDir, `${cacheKey}.txt`);
  try {
    if (fs.existsSync(cacheFile)) {
      return fs.readFileSync(cacheFile, 'utf8');
    }
  } catch {}

  try {
    const q = artist ? `${artist} ${title}` : title;
    const data = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=3`, 6000);
    const item = data && Array.isArray(data.results) && data.results[0];
    if (!item || !item.artworkUrl100) return '';
    const hdUrl = item.artworkUrl100.replace('100x100bb', '600x600bb');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    try {
      const imgRes = await fetch(hdUrl, { signal: controller.signal });
      if (!imgRes.ok) return '';
      const arrBuf = await imgRes.arrayBuffer();
      const b64 = `data:image/jpeg;base64,${Buffer.from(arrBuf).toString('base64')}`;
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(cacheFile, b64, 'utf8');
      pruneCacheDir(cacheDir, 160);
      return b64;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return '';
  }
}

async function geocodeCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=id&format=json`;
  const res = await fetchJson(url, 6000);
  const first = res && res.results && res.results[0];
  if (!first) return null;
  return { name: first.name || cityName, lat: first.latitude, lon: first.longitude };
}

module.exports = {
  DEFAULT_CALENDARS,
  cleanTrackInfo,
  parseLrc,
  parseIcs,
  fetchLyrics,
  fetchAlbumArtHD,
  fetchWeather,
  geocodeCity,
  fetchPrayerTimes,
  fetchCalendarEvents,
  fetchCustomFeed
};
