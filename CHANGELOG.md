# Changelog

All notable changes to **DynotchFlow** are documented in this file.

## [1.0.0] — 2026-11-11 (Initial Public Release)
### Added
- **1-Click Standalone Installer (`installer/DynotchFlowSetup.cs`) & Portable ZIP:** Extracts runtime cleanly to `%LOCALAPPDATA%\Programs\DynotchFlow`, configures Desktop & Start Menu shortcuts, and launches immediately.
- **Native WinRT C# Bridge (`NotchBridge.cs`):** Compiled 64-bit WinRT GSMTC & CoreAudio bridge (`~6 MB` RAM) with **Per-Monitor DPI V2** and same-monitor fullscreen detection.
- **Smooth Anti-Aliased Frameless Corners:** Padded `SetWindowRgn` clipping paired with native `MakeFramelessClean` caption removal eliminates top DWM caption halo bars.
- **Hybrid Pill Lyrics & Proportional `30px` / `34px` / `40px` Scaling:** Automatically centers crisp short lyric lines without side mask fade, smoothly activates marquee on overflow, and scales pill typography/EQ bars across all three heights.
- **Universal Unofficial / Live Video Lyrics & 1-Tap Sync (`services.js`, `main.js`, `preload.js`, `renderer/`):**
  - Strips bracketed & unbracketed live/unofficial tags (`Live at ...`, `Stage`, `Fancam`, `Acoustic Cover`, `Slowed + Reverb`, `Sped Up`, `Full Bass`, `// Lirik`, `#shorts`) and resolves swapped *Artist — Title* formatting automatically.
  - Multi-source zero-RAM waterfall: **LRCLIB -> iTunes canonical spelling -> Kugou LRC (Unicode similarity guarded) -> `lyrics.ovh`**, with relaxed live duration weighting.
  - Added **1-Tap `"Pas-in"` / Right-Click line snap**, **2-Point Live Band Tempo Auto-Warp (`0.78x–1.28x`)**, compact `-5s / -0.5 / Pas-in / +0.5 / +5s` controls, active sync banner (`#lyrics-tap-banner`), and per-video JSON calibration persistence (`lyrics-sync.json`, capped at 200 entries).
- **Multi-Calendar (`.ics`), Atmospheric Weather & Prayer Alerts:** Single or multi-feed iCal URL parsing (`RRULE` + `EXDATE`), BMKG + Open-Meteo sky effects, Kemenag RI prayer countdowns & notifications, and Drag-In/Drag-Out Notch Shelf.

### Security & Performance
- Hard V8 heap cap (`--max-old-space-size=48`) and `--in-process-gpu` keeping idle footprint `< 50 MB RAM`.
- Enforced `contextIsolation: true`, `nodeIntegration: false`, full HTML escaping in `escapeHtml()`, strict HTTPS validation in `fetchCustomFeed()`, and non-wildcard localhost IPC boundaries (`127.0.0.1:17420`).
