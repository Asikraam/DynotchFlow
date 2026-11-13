[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8

$audioCs = @'
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface NFIAudioEndpointVolume {
    [PreserveSig] int RegisterControlChangeNotify(IntPtr pNotify);
    [PreserveSig] int UnregisterControlChangeNotify(IntPtr pNotify);
    [PreserveSig] int GetChannelCount(out uint pnChannelCount);
    [PreserveSig] int SetMasterVolumeLevel(float fLevelDB, ref Guid pguidEventContext);
    [PreserveSig] int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
    [PreserveSig] int GetMasterVolumeLevel(out float pfLevelDB);
    [PreserveSig] int GetMasterVolumeLevelScalar(out float pfLevel);
    [PreserveSig] int SetChannelVolumeLevel(uint nChannel, float fLevelDB, ref Guid pguidEventContext);
    [PreserveSig] int SetChannelVolumeLevelScalar(uint nChannel, float fLevel, ref Guid pguidEventContext);
    [PreserveSig] int GetChannelVolumeLevel(uint nChannel, out float pfLevelDB);
    [PreserveSig] int GetChannelVolumeLevelScalar(uint nChannel, out float pfLevel);
    [PreserveSig] int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid pguidEventContext);
    [PreserveSig] int GetMute([MarshalAs(UnmanagedType.Bool)] out bool pbMute);
}

[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface NFIMMDevice {
    [PreserveSig] int Activate(ref Guid iid, uint dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
}

[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface NFIMMDeviceEnumerator {
    [PreserveSig] int EnumAudioEndpoints(int dataFlow, int dwStateMask, out IntPtr ppDevices);
    [PreserveSig] int GetDefaultAudioEndpoint(int dataFlow, int role, out NFIMMDevice ppEndpoint);
}

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
public class NFMMDeviceEnumerator {}

public static class NFNative {
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential)]
    public struct MONITORINFO {
        public int cbSize;
        public RECT rcMonitor;
        public RECT rcWork;
        public uint dwFlags;
    }

    [DllImport("user32.dll")]
    public static extern bool SetProcessDPIAware();

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern IntPtr MonitorFromWindow(IntPtr hwnd, uint dwFlags);

    [DllImport("user32.dll")]
    public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MONITORINFO lpmi);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetClassName(IntPtr hWnd, System.Text.StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("psapi.dll")]
    public static extern bool EmptyWorkingSet(IntPtr hProcess);

    public static readonly ConcurrentQueue<string> CmdQueue = new ConcurrentQueue<string>();
    public static readonly ManualResetEventSlim WakeEvent = new ManualResetEventSlim(false);
    private static bool _readerStarted = false;

    public static void StartStdinReader() {
        if (_readerStarted) return;
        _readerStarted = true;
        Thread t = new Thread(() => {
            try {
                while (true) {
                    string line = Console.In.ReadLine();
                    if (line == null) {
                        CmdQueue.Enqueue("__EXIT__");
                        WakeEvent.Set();
                        break;
                    }
                    CmdQueue.Enqueue(line);
                    WakeEvent.Set();
                }
            } catch {
                CmdQueue.Enqueue("__EXIT__");
                WakeEvent.Set();
            }
        });
        t.IsBackground = true;
        t.Name = "NFStdinReader";
        t.Start();
    }

    public static void TrimWorkingSet(int targetPid) {
        try {
            if (targetPid <= 0) {
                using (Process cur = Process.GetCurrentProcess()) {
                    EmptyWorkingSet(cur.Handle);
                }
                return;
            }
            using (Process p = Process.GetProcessById(targetPid)) {
                EmptyWorkingSet(p.Handle);
            }
        } catch {}
    }

    public static void TrimElectronTree(int mainPid) {
        try {
            TrimWorkingSet(0);
            if (mainPid > 0) TrimWorkingSet(mainPid);
            Process[] procs = Process.GetProcessesByName("electron");
            foreach (Process p in procs) {
                try { EmptyWorkingSet(p.Handle); } catch {}
                finally { p.Dispose(); }
            }
        } catch {}
    }

    public static IntPtr NotchHwnd = IntPtr.Zero;

    public static void MoveWindowClean(long hwndVal, int x, int y) {
        try {
            IntPtr hWnd = new IntPtr(hwndVal);
            if (hWnd == IntPtr.Zero) return;
            NotchHwnd = hWnd;
            // SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE
            SetWindowPos(hWnd, IntPtr.Zero, x, y, 0, 0, 0x0001 | 0x0004 | 0x0010);
        } catch {}
    }

    public static void SuppressWindhawkLight() {
        try {
            Process[] whProcs = Process.GetProcessesByName("windhawk");
            if (whProcs == null || whProcs.Length == 0) return;
            foreach (Process p in whProcs) {
                try {
                    int pid = p.Id;
                    EnumWindows((hWnd, lParam) => {
                        uint wPid = 0;
                        GetWindowThreadProcessId(hWnd, out wPid);
                        if (wPid == (uint)pid) {
                            RECT r;
                            if (GetWindowRect(hWnd, out r) && r.Top <= 5 && (r.Bottom - r.Top) <= 420) {
                                ShowWindow(hWnd, 0);
                            }
                        }
                        return true;
                    }, IntPtr.Zero);
                } catch {}
                finally { p.Dispose(); }
            }
        } catch {}
    }

    private static NFIAudioEndpointVolume GetEndpoint() {
        try {
            var enumerator = (NFIMMDeviceEnumerator)(new NFMMDeviceEnumerator());
            NFIMMDevice dev;
            enumerator.GetDefaultAudioEndpoint(0, 1, out dev);
            if (dev == null) return null;
            object epObj;
            Guid iid = typeof(NFIAudioEndpointVolume).GUID;
            dev.Activate(ref iid, 23, IntPtr.Zero, out epObj);
            return epObj as NFIAudioEndpointVolume;
        } catch { return null; }
    }

    public static void GetVolume(out int pct, out bool mute) {
        pct = -1; mute = false;
        try {
            var ep = GetEndpoint();
            if (ep == null) return;
            float v; bool m;
            ep.GetMasterVolumeLevelScalar(out v);
            ep.GetMute(out m);
            pct = ((int)Math.Round(v * 50.0f)) * 2;
            mute = m;
        } catch {}
    }

    public static void SetVolume(int pct) {
        try {
            var ep = GetEndpoint();
            if (ep == null) return;
            int evenPct = ((int)Math.Round(pct / 2.0)) * 2;
            float v = Math.Max(0.0f, Math.Min(1.0f, evenPct / 100.0f));
            Guid ctx = Guid.Empty;
            ep.SetMasterVolumeLevelScalar(v, ref ctx);
            if (evenPct > 0) ep.SetMute(false, ref ctx);
        } catch {}
    }

    public static void ToggleMute() {
        try {
            var ep = GetEndpoint();
            if (ep == null) return;
            bool m;
            ep.GetMute(out m);
            Guid ctx = Guid.Empty;
            ep.SetMute(!m, ref ctx);
        } catch {}
    }

    public static bool IsFullscreenApp() {
        try {
            IntPtr h = GetForegroundWindow();
            if (h == IntPtr.Zero || h == NotchHwnd) return false;
            var sb = new System.Text.StringBuilder(64);
            GetClassName(h, sb, sb.Capacity);
            string cls = sb.ToString();
            if (cls == "Progman" || cls == "WorkerW" || cls == "Shell_TrayWnd" || cls == "Shell_SecondaryTrayWnd") {
                return false;
            }
            RECT r;
            if (!GetWindowRect(h, out r)) return false;

            IntPtr fgMon = MonitorFromWindow(h, 2);
            IntPtr targetMon = NotchHwnd != IntPtr.Zero ? MonitorFromWindow(NotchHwnd, 2) : MonitorFromWindow(IntPtr.Zero, 1);
            if (fgMon != IntPtr.Zero && targetMon != IntPtr.Zero && fgMon != targetMon) {
                return false;
            }

            if (fgMon != IntPtr.Zero) {
                MONITORINFO mi = new MONITORINFO();
                mi.cbSize = Marshal.SizeOf(typeof(MONITORINFO));
                if (GetMonitorInfo(fgMon, ref mi)) {
                    return r.Left <= mi.rcMonitor.Left &&
                           r.Top <= mi.rcMonitor.Top &&
                           r.Right >= mi.rcMonitor.Right &&
                           r.Bottom >= mi.rcMonitor.Bottom;
                }
            }

            int sw = GetSystemMetrics(0);
            int sh = GetSystemMetrics(1);
            return r.Left <= 0 && r.Top <= 0 && r.Right >= sw && r.Bottom >= sh;
        } catch { return false; }
    }
}
'@

Add-Type -TypeDefinition $audioCs
try { [void][NFNative]::SetProcessDPIAware() } catch {}
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
[void][Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]
$asStreamMethod = ([System.IO.WindowsRuntimeStreamExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsStreamForRead' -and $_.GetParameters().Count -eq 1
})[0]

function AwaitOp($op, $resultType) {
    $m = $asTaskGeneric.MakeGenericMethod($resultType)
    $t = $m.Invoke($null, @($op))
    $t.Wait()
    return $t.Result
}

function AwaitBool($op) {
    return (AwaitOp $op ([bool]))
}

$mgr = AwaitOp ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])

function ReadThumbBase64($thumbRef) {
    if (-not $thumbRef) { return "" }
    $stream = $null
    $netStream = $null
    $ms = $null
    try {
        $stream = AwaitOp ($thumbRef.OpenReadAsync()) ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
        if (-not $stream) { return "" }
        $netStream = $asStreamMethod.Invoke($null, @($stream))
        $ms = New-Object System.IO.MemoryStream
        $netStream.CopyTo($ms)
        $bytes = $ms.ToArray()
        if (-not $bytes -or $bytes.Length -eq 0 -or $bytes.Length -gt 4194304) { return "" }
        return ("data:image/jpeg;base64," + [Convert]::ToBase64String($bytes))
    } catch {
        return ""
    } finally {
        if ($ms) { $ms.Dispose() }
        if ($netStream) { $netStream.Dispose() }
        if ($stream) { $stream.Dispose() }
    }
}

# Start lightweight C# background stdin reader (Replaces heavy 2nd PowerShell Runspace!)
[NFNative]::StartStdinReader()

$lastTrackKey = ""
$cachedThumb  = ""
$cachedTitle  = ""
$cachedArtist = ""
$cachedAlbum  = ""
$cachedAppId  = ""
$cachedDur    = -1.0
$forceMetaRefresh = $true
$propTick     = 0
$lastVol      = -1
$lastMute     = $false
$lastMediaKey = ""
$lastFs       = $false
$whTick       = 0
$notchHwnd    = [long]0

[NFNative]::SuppressWindhawkLight()
[System.GC]::Collect()
[NFNative]::TrimWorkingSet(0)

while ($true) {
    $whTick++
    if ($whTick % 60 -eq 0) {
        [NFNative]::SuppressWindhawkLight()
    }
    if ($whTick % 90 -eq 0) {
        [System.GC]::Collect(1, [System.GCCollectionMode]::Optimized)
        [NFNative]::TrimWorkingSet(0)
    }

    $cmdLine = $null
    while ([NFNative]::CmdQueue.TryDequeue([ref]$cmdLine)) {
        if ($cmdLine -eq "__EXIT__") { exit 0 }
        try {
            if ($cmdLine -eq "media:playpause") {
                $cur = $mgr.GetCurrentSession()
                if ($cur) { [void](AwaitBool ($cur.TryTogglePlayPauseAsync())) }
            } elseif ($cmdLine -eq "media:next") {
                $cur = $mgr.GetCurrentSession()
                if ($cur) { [void](AwaitBool ($cur.TrySkipNextAsync())) }
                $forceMetaRefresh = $true
            } elseif ($cmdLine -eq "media:prev") {
                $cur = $mgr.GetCurrentSession()
                if ($cur) { [void](AwaitBool ($cur.TrySkipPreviousAsync())) }
                $forceMetaRefresh = $true
            } elseif ($cmdLine.StartsWith("media:seek:")) {
                $sec = [double]::Parse($cmdLine.Substring(11), [System.Globalization.CultureInfo]::InvariantCulture)
                $cur = $mgr.GetCurrentSession()
                if ($cur) {
                    $ticks = [long]([Math]::Max(0, $sec) * 10000000)
                    [void](AwaitBool ($cur.TryChangePlaybackPositionAsync($ticks)))
                }
            } elseif ($cmdLine.StartsWith("vol:set:")) {
                $pct = [int]$cmdLine.Substring(8)
                [NFNative]::SetVolume($pct)
            } elseif ($cmdLine -eq "vol:mute") {
                [NFNative]::ToggleMute()
            } elseif ($cmdLine.StartsWith("win:init:")) {
                $notchHwnd = [long]$cmdLine.Substring(9)
                [NFNative]::NotchHwnd = [IntPtr]::new($notchHwnd)
            } elseif ($cmdLine.StartsWith("win:move:")) {
                $parts = $cmdLine.Substring(9).Split(":")
                if ($parts.Length -ge 3) {
                    $notchHwnd = [long]$parts[0]
                    $mx = [int]$parts[1]
                    $my = [int]$parts[2]
                    [NFNative]::MoveWindowClean($notchHwnd, $mx, $my)
                }
            } elseif ($cmdLine -eq "mem:trim" -or $cmdLine.StartsWith("mem:trim:")) {
                $mainPid = 0
                if ($cmdLine.Length -gt 9) {
                    [void][int]::TryParse($cmdLine.Substring(9), [ref]$mainPid)
                }
                [NFNative]::TrimElectronTree($mainPid)
            }
        } catch {}
    }

    $vol = -1; $mute = $false
    [NFNative]::GetVolume([ref]$vol, [ref]$mute)
    if ($vol -ne $lastVol -or $mute -ne $lastMute) {
        $isInit = ($lastVol -lt 0)
        $lastVol = $vol
        $lastMute = $mute
        $vObj = [ordered]@{ type = "volume"; volume = $vol; muted = $mute; initial = $isInit }
        [Console]::Out.WriteLine(($vObj | ConvertTo-Json -Compress))
    }

    $fs = [NFNative]::IsFullscreenApp()

    $s = $null
    try { $s = $mgr.GetCurrentSession() } catch {}
    if ($s) {
        try {
            $pb = $s.GetPlaybackInfo()
            $tl = $s.GetTimelineProperties()
            $appId  = [string]$s.SourceAppUserModelId
            $status = [string]$pb.PlaybackStatus
            $dur = [Math]::Max(0.0, ($tl.EndTime - $tl.StartTime).TotalSeconds)

            $propTick++
            $needMeta = $forceMetaRefresh -or ($cachedTitle -eq "") -or ($appId -ne $cachedAppId) -or ([Math]::Abs($dur - $cachedDur) -gt 1.5) -or ($propTick % 8 -eq 0)
            if ($needMeta) {
                $props = AwaitOp ($s.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
                $cachedTitle  = if ($props.Title) { [string]$props.Title } else { "" }
                $cachedArtist = if ($props.Artist) { [string]$props.Artist } else { "" }
                $cachedAlbum  = if ($props.AlbumTitle) { [string]$props.AlbumTitle } else { "" }
                $cachedAppId  = $appId
                $cachedDur    = $dur
                $forceMetaRefresh = $false

                $trackKey = "$cachedTitle||$cachedArtist||$cachedAlbum"
                $thumbOut = $null
                if ($trackKey -ne $lastTrackKey) {
                    $lastTrackKey = $trackKey
                    $cachedThumb = ReadThumbBase64 $props.Thumbnail
                    $thumbOut = $cachedThumb
                }
            } else {
                $thumbOut = $null
            }

            $title  = $cachedTitle
            $artist = $cachedArtist
            $album  = $cachedAlbum

            $pos = ($tl.Position - $tl.StartTime).TotalSeconds
            if ($status -eq "Playing" -and $tl.LastUpdatedTime -ne [DateTimeOffset]::MinValue) {
                $delta = ([DateTimeOffset]::UtcNow - $tl.LastUpdatedTime.ToUniversalTime()).TotalSeconds
                if ($delta -gt 0 -and $delta -lt 7200) { $pos += $delta }
            }
            if ($dur -gt 0 -and $pos -gt $dur) { $pos = $dur }
            if ($pos -lt 0) { $pos = 0 }

            $stateSig = "$title|$artist|$status|$([Math]::Round($pos, 1))|$fs"
            if ($status -eq "Playing" -or $stateSig -ne $lastMediaKey -or $null -ne $thumbOut) {
                $mObj = [ordered]@{
                    type = "media"
                    active = ($title -ne "")
                    title = $title
                    artist = $artist
                    album = $album
                    app = $appId
                    status = $status
                    position = [Math]::Round($pos, 2)
                    duration = [Math]::Round($dur, 2)
                    fullscreen = $fs
                    ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                }
                if ($null -ne $thumbOut) { $mObj["thumbnail"] = $thumbOut }
                [Console]::Out.WriteLine(($mObj | ConvertTo-Json -Compress))
                $lastMediaKey = $stateSig
                $lastFs = $fs
            }
        } catch {
            [void][NFNative]::WakeEvent.Wait(220)
            [NFNative]::WakeEvent.Reset()
        }
    } else {
        if ($lastMediaKey -ne "none" -or $fs -ne $lastFs) {
            $mObj = [ordered]@{
                type = "media"
                active = $false
                fullscreen = $fs
                ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
            }
            [Console]::Out.WriteLine(($mObj | ConvertTo-Json -Compress))
            $lastTrackKey = ""
            $cachedThumb = ""
            $cachedTitle = ""
            $lastMediaKey = "none"
            $lastFs = $fs
        }
    }

    [Console]::Out.Flush()
    $waitMs = if ($s -and $status -eq "Playing") { 280 } else { 750 }
    [void][NFNative]::WakeEvent.Wait($waitMs)
    [NFNative]::WakeEvent.Reset()
}
