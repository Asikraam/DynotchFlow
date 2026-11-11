# Contributing to DynotchFlow

Thank you for helping improve **DynotchFlow**!

## Development Workflow
1. Fork this repository and clone your fork on Windows 10/11 (64-bit) with Node.js 18+.
2. Run `npm install && npm start` — `prestart` automatically compiles `NotchBridge.exe` from `NotchBridge.cs` whenever needed.
3. Run `npm run build:bridge` to force-rebuild `NotchBridge.exe`, or `npm run build:native` to build all Windows binaries (`NotchBridge.exe`, `DynotchFlow_Launcher.exe`, `DynotchFlowSetup_Stub.exe`) into `build/`.
4. Verify syntax before opening a PR: `node --check main.js preload.js services.js renderer/app.js scripts/build-bridge.js`.

## Pull Request Checklist
- Keep `contextIsolation: true` and `nodeIntegration: false` intact.
- Keep Normal & Matte Minimalist dimensions aligned (`524x266` expanded) and respect the `< 50 MB` idle RAM target.
- Escape all external strings via `escapeHtml()` before inserting into `innerHTML`.
- Never commit personal `.ics` URLs, local cache files (`gcal-cache.json`, `external-cache.json`), or compiled `.exe` binaries.
