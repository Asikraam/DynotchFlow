'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const force = args.has('--force') || args.has('-f');
const buildAll = args.has('--all');

if (process.platform !== 'win32') {
  console.log('[build-bridge] Skipping native Windows C# bridge compilation on non-Windows platform.');
  process.exit(0);
}

function walkFind(dir, targetName, pickLast = false) {
  if (!dir || !fs.existsSync(dir)) return '';
  let found = '';
  const stack = [dir];
  while (stack.length > 0) {
    const cur = stack.pop();
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { continue; }
    for (const ent of entries) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.name.toLowerCase() === targetName.toLowerCase()) {
        found = full;
        if (!pickLast) return found;
      }
    }
  }
  return found;
}

function needsRebuild(srcFile, outFile) {
  if (force || !fs.existsSync(outFile)) return true;
  try {
    return fs.statSync(srcFile).mtimeMs > fs.statSync(outFile).mtimeMs;
  } catch {
    return true;
  }
}

const winDir = process.env.WINDIR || 'C:\\Windows';
const fwDir = path.join(winDir, 'Microsoft.NET', 'Framework64', 'v4.0.30319');
const cscExe = path.join(fwDir, 'csc.exe');

if (!fs.existsSync(cscExe)) {
  console.error(`[build-bridge] csc.exe not found at ${cscExe}`);
  process.exit(1);
}

function getWinRtRefs() {
  let wrtDll = walkFind(fwDir, 'System.Runtime.WindowsRuntime.dll', false);
  if (!wrtDll) {
    const refBase = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Reference Assemblies', 'Microsoft', 'Framework', '.NETFramework');
    wrtDll = walkFind(refBase, 'System.Runtime.WindowsRuntime.dll', true);
  }
  if (!wrtDll) {
    throw new Error('System.Runtime.WindowsRuntime.dll not found.');
  }

  const sysWinMd = path.join(winDir, 'System32', 'WinMetadata');
  const mediaMd = path.join(sysWinMd, 'Windows.Media.winmd');
  const foundMd = path.join(sysWinMd, 'Windows.Foundation.winmd');
  const storeMd = path.join(sysWinMd, 'Windows.Storage.winmd');

  let winMdRefs;
  if (fs.existsSync(mediaMd) && fs.existsSync(foundMd) && fs.existsSync(storeMd)) {
    winMdRefs = [`/r:${mediaMd}`, `/r:${foundMd}`, `/r:${storeMd}`];
  } else {
    const kitsDir = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Windows Kits', '10', 'UnionMetadata');
    const winMd = walkFind(kitsDir, 'Windows.winmd', true);
    if (!winMd) throw new Error('Windows.winmd / WinMetadata files not found.');
    winMdRefs = [`/r:${winMd}`];
  }

  return [
    `/r:${path.join(fwDir, 'System.Runtime.dll')}`,
    `/r:${path.join(fwDir, 'System.Threading.Tasks.dll')}`,
    `/r:${path.join(fwDir, 'System.IO.dll')}`,
    `/r:${path.join(fwDir, 'System.Runtime.InteropServices.WindowsRuntime.dll')}`,
    `/r:${wrtDll}`,
    ...winMdRefs,
  ];
}

function compile(cscArgs, label) {
  execFileSync(cscExe, cscArgs, { cwd: root, stdio: 'inherit' });
  console.log(`[build-bridge] Compiled ${label}`);
}

const bridgeSrc = path.join(root, 'NotchBridge.cs');
const bridgeOut = buildAll ? path.join(root, 'build', 'NotchBridge.exe') : path.join(root, 'NotchBridge.exe');

if (buildAll || needsRebuild(bridgeSrc, bridgeOut)) {
  if (buildAll) fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  compile([
    '/nologo',
    '/optimize+',
    '/target:exe',
    `/out:${bridgeOut}`,
    ...getWinRtRefs(),
    bridgeSrc,
  ], path.relative(root, bridgeOut));
}

if (buildAll) {
  const icoPath = path.join(root, 'NotchFlow.ico');
  const launcherSrc = path.join(root, 'DynotchFlow_Launcher.cs');
  const launcherOut = path.join(root, 'build', 'DynotchFlow_Launcher.exe');
  compile([
    '/nologo',
    '/optimize+',
    '/target:winexe',
    `/win32icon:${icoPath}`,
    `/out:${launcherOut}`,
    launcherSrc,
  ], 'build/DynotchFlow_Launcher.exe');

  const setupSrc = path.join(root, 'installer', 'DynotchFlowSetup.cs');
  const setupOut = path.join(root, 'build', 'DynotchFlowSetup_Stub.exe');
  compile([
    '/nologo',
    '/optimize+',
    '/target:winexe',
    `/win32icon:${icoPath}`,
    '/r:System.Windows.Forms.dll',
    '/r:System.Drawing.dll',
    '/r:System.IO.Compression.dll',
    '/r:System.IO.Compression.FileSystem.dll',
    `/out:${setupOut}`,
    setupSrc,
  ], 'build/DynotchFlowSetup_Stub.exe');
}
