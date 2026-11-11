# Changelog

All notable changes to **DynotchFlow** are documented in this file.

## [1.0.0] — 2026-11-11 (Initial Public Release)
### Added
- **1-Click Standalone Installer (`installer/DynotchFlowSetup.cs`) & Portable ZIP:** Extracts runtime cleanly to `%LOCALAPPDATA%\Programs\DynotchFlow`, configures Desktop & Start Menu shortcuts, and launches immediately.
- **Zero-Config Source Build (`scripts/build-bridge.js`):** Running `npm install && npm start` automatically compiles `NotchBridge.exe` when missing or stale via Windows' built-in `.NET Framework 4.x` compiler (no manual `csc.exe` command needed).
- **Native WinRT C# Bridge (`NotchBridge.cs`):** Compiled 64-bit WinRT GSMTC & CoreAudio bridge (`~6 MB` RAM) with **Per-Monitor DPI V2** and same-monitor fullscreen detection.
- **Smooth Anti-Aliased Frameless Corners:** Padded `SetWindowRgn` clipping paired with native `MakeFramelessClean` caption removal eliminates top DWM caption halo bars.
- **Hybrid Pill Lyrics & Proportional `30px` / `34px` / `40px` Scaling:** Automatically centers crisp short lyric lines without side mask fade, smoothly activates marquee on overflow, and scales pill typography/EQ bars across all three heights.
- **Dual Theme (`Normal` Glow & `Matte` Minimalist) with Exact Size Parity:** Switchable **Normal** (album-reactive ambient blur) and **Matte Minimalist** (`#09090b` / `#121215`, zero glow & disabled backdrop blur layer) themes with pixel-identical `524x266` expanded geometry, compact top-right `⚙` Settings icon (`icon-only-tab`), proportional toggle layout, and collapsible `+ JSON API` drawer.
- **Concise International English UI:** Standardized all navigation tabs (`Music`, `Calendar`, `Weather`, `Shelf`, `Settings`), calendar categories (`Study`, `Work`, `Social`, `Personal`), prayer names (`Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha`), weather conditions (`BMKG` & `Open-Meteo`), tray menu, and WinForms installer GUI into short, overflow-free English while keeping backward compatibility with existing local caches.
- **Universal Clean Auto-Sync Lyrics + Instrumental Hold (`services.js`, `renderer/`):**
  - Strips bracketed & unbracketed live/unofficial tags (`Live at ...`, `Stage`, `Fancam`, `Acoustic Cover`, `COLORS SHOW`, `Tiny Desk`, `Slowed + Reverb`, `Sped Up`, `Full Bass`, `// Lirik`, `#shorts`), cleans *VEVO* / separator spacing & `ft.`/`with` clauses, normalizes `$ -> s` symbols (*A$AP*, *Ty Dolla $ign*), and resolves swapped *Artist — Title* formatting automatically.
  - Multi-source zero-RAM waterfall (**LRCLIB -> iTunes canonical spelling -> duration-scored Kugou LRC -> `lyrics.ovh`**) with LRC `[offset:]` support, inline karaoke timestamp stripping, credit filtering, rapid R&B/Rap cadence transition responsiveness, automatic slowed/spedup/remix tempo scaling (`0.58x–1.55x`), click-any-line to seek, and multi-song long video (`>15 min` concert/mixtape) guard.
  - Holds the collapsed pill steady on clean track metadata (`Title · Artist`) during pre-vocal intros, `[Instrumental]`/`♪` breaks, `>= 10s` instrumental solos, and post-outro fadeouts.
- **Multi-Calendar (`.ics`), Global Timezone Auto-Detection, Atmospheric Weather & Prayer Alerts:** Zero-telemetry first-run city detection from Windows OS timezone outside Indonesia (`Open-Meteo` global weather + `AlAdhan MWL` global prayer calculations; automatic `BMKG` + `Kemenag RI` inside Indonesia), isolated per-user browser Google Calendar `Get Link` launcher (`webcal://` -> `https://`, `RRULE`, `EXDATE`, `STATUS:CANCELLED`, BOM-safe JSON loading), and Drag-In/Drag-Out Notch Shelf.

### Security & Performance
- Hard V8 heap cap (`--max-old-space-size=48`), `--in-process-gpu`, and automated post-boot (`3s`/`9s`/`18s`) + periodic (`30s`) working-set trimming keeping settled idle RAM under `< 50 MB` (`~23–40 MB`).
- Enforced `contextIsolation: true`, `nodeIntegration: false`, full HTML escaping in `escapeHtml()`, strict HTTPS validation in `fetchCustomFeed()`, and non-wildcard localhost IPC boundaries (`127.0.0.1:17420`) with explicit `HTTP 403` blocking of cross-origin browser requests (`Origin`, `OPTIONS`, `Sec-Fetch-Site: cross-site`).
