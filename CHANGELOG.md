# Changelog

All notable changes to **DynotchFlow** are documented in this file.

## [4.0.0] — 2026-11-11
### Added
- **1-Click Standalone Installer (`DynotchFlowV4Setup.cs`):** Extracts runtime cleanly to `%LOCALAPPDATA%\Programs\DynotchFlow`, configures Desktop & Start Menu shortcuts, and launches immediately.
- **Native WinRT C# Bridge (`NotchBridge.cs`):** Replaces legacy PowerShell background workers with a 64-bit compiled WinRT GSMTC & CoreAudio bridge (`~6 MB` RAM), including **Per-Monitor DPI V2** and same-monitor fullscreen detection.
- **Google Calendar `.ics` Onboarding & Multi-Feed Support:** Supports single or multiple comma/whitespace-separated iCal URLs, `RRULE` (`DAILY` / `WEEKLY` with `INTERVAL`), `EXDATE` exclusions, and automatic clipboard `.ics` detection.
- **Atmospheric Weather & Tiered Prayer Alerts:** BMKG Indonesia forecast cards with Open-Meteo global fallback, Apple-Weather-style dynamic sky effects, and H-10m, H-5m & Adzan notifications.
- **Tray Controls & Diagnostics:** Added **Optimalkan RAM Sekarang** and **Buka Folder Program** menu items plus `/health` webhook endpoint on `127.0.0.1:17420`.

### Security & Hardening
- Removed wildcard CORS headers (`Access-Control-Allow-Origin: *`) from the localhost webhook server.
- Enforced `contextIsolation: true`, `nodeIntegration: false`, HTML escaping across dynamic renderer templates, and HTTP/HTTPS validation for external calendar event URLs.
