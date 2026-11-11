# Contributing to DynotchFlow

Thank you for helping improve **DynotchFlow**!

## Development Workflow
1. Fork this repository and clone your fork on Windows 10/11 (64-bit).
2. Run `npm install` to install Electron `^35.0.0`.
3. Recompile `NotchBridge.exe` using the `.NET Framework 4.x csc.exe` command in [README.md](README.md#build-from-source) whenever modifying `NotchBridge.cs`.
4. Test syntax with `node --check main.js preload.js services.js renderer/app.js` and run `npm start`.

## Pull Request Checklist
- Keep `contextIsolation: true` and `nodeIntegration: false` intact.
- Escape all external strings via `escapeHtml()` before inserting into `innerHTML`.
- Never commit personal `.ics` URLs, local cache files (`gcal-cache.json`, `external-cache.json`), or compiled `.exe` binaries.
