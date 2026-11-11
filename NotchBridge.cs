using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Globalization;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Media.Control;
using Windows.Storage.Streams;

[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface NFIAudioEndpointVolume {
    int RegisterControlChangeNotify(IntPtr pNotify);
    int UnregisterControlChangeNotify(IntPtr pNotify);
    int GetChannelCount(out uint pnChannelCount);
    int SetMasterVolumeLevel(float fLevelDB, ref Guid pguidEventContext);
    int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
    int GetMasterVolumeLevel(out float pfLevelDB);
    int GetMasterVolumeLevelScalar(out float pfLevel);
    int SetChannelVolumeLevel(uint nChannel, float fLevelDB, ref Guid pguidEventContext);
    int SetChannelVolumeLevelScalar(uint nChannel, float fLevel, ref Guid pguidEventContext);
    int GetChannelVolumeLevel(uint nChannel, out float pfLevelDB);
    int GetChannelVolumeLevelScalar(uint nChannel, out float pfLevel);
    int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid pguidEventContext);
    int GetMute([MarshalAs(UnmanagedType.Bool)] out bool pbMute);
}

[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface NFIMMDevice {
    int Activate(ref Guid iid, uint dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
}

[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface NFIMMDeviceEnumerator {
    int EnumAudioEndpoints(int dataFlow, int dwStateMask, out IntPtr ppDevices);
    int GetDefaultAudioEndpoint(int dataFlow, int role, out NFIMMDevice ppEndpoint);
}

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
public class NFMMDeviceEnumerator {}

public static class Program {
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
    public static extern IntPtr SetProcessDpiAwarenessContext(IntPtr dpiContext);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern IntPtr MonitorFromWindow(IntPtr hwnd, uint dwFlags);

    [DllImport("user32.dll")]
    public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MONITORINFO lpmi);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("kernel32.dll")]
    public static extern bool K32EmptyWorkingSet(IntPtr hProcess);

    [DllImport("kernel32.dll")]
    public static extern bool SetProcessWorkingSetSize(IntPtr hProcess, IntPtr dwMinimumWorkingSetSize, IntPtr dwMaximumWorkingSetSize);

    private static NFIAudioEndpointVolume cachedEp = null;
    private static IntPtr notchHwnd = IntPtr.Zero;

    private static void EnablePerMonitorDpi() {
        try {
            // DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2 = -4
            SetProcessDpiAwarenessContext(new IntPtr(-4));
        } catch {
            try { SetProcessDPIAware(); } catch {}
        }
    }

    private static NFIAudioEndpointVolume GetEndpoint() {
        if (cachedEp != null) return cachedEp;
        try {
            var enumerator = (NFIMMDeviceEnumerator)(new NFMMDeviceEnumerator());
            NFIMMDevice dev;
            enumerator.GetDefaultAudioEndpoint(0, 1, out dev);
            if (dev == null) return null;
            object epObj;
            Guid iid = typeof(NFIAudioEndpointVolume).GUID;
            dev.Activate(ref iid, 23, IntPtr.Zero, out epObj);
            cachedEp = epObj as NFIAudioEndpointVolume;
            return cachedEp;
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
        } catch { cachedEp = null; }
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
        } catch { cachedEp = null; }
    }

    public static void ToggleMute() {
        try {
            var ep = GetEndpoint();
            if (ep == null) return;
            bool m;
            ep.GetMute(out m);
            Guid ctx = Guid.Empty;
            ep.SetMute(!m, ref ctx);
        } catch { cachedEp = null; }
    }

    public static void MoveWindowClean(long hwndVal, int x, int y) {
        try {
            IntPtr hWnd = new IntPtr(hwndVal);
            if (hWnd == IntPtr.Zero) return;
            notchHwnd = hWnd;
            SetWindowPos(hWnd, IntPtr.Zero, x, y, 0, 0, 0x0001 | 0x0004 | 0x0010);
        } catch {}
    }

    public static bool IsFullscreenApp() {
        try {
            IntPtr h = GetForegroundWindow();
            if (h == IntPtr.Zero || h == notchHwnd) return false;
            var sb = new StringBuilder(64);
            GetClassName(h, sb, sb.Capacity);
            string cls = sb.ToString();
            if (cls == "Progman" || cls == "WorkerW" || cls == "Shell_TrayWnd" || cls == "Shell_SecondaryTrayWnd") {
                return false;
            }
            RECT r;
            if (!GetWindowRect(h, out r)) return false;

            // Multi-monitor & DPI-aware check: only hide if foreground app is fullscreen on the same monitor as NotchFlow (or primary monitor)
            IntPtr fgMon = MonitorFromWindow(h, 2);
            IntPtr targetMon = notchHwnd != IntPtr.Zero ? MonitorFromWindow(notchHwnd, 2) : MonitorFromWindow(IntPtr.Zero, 1);
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

    public static void TrimMemoryFootprint() {
        try {
            GC.Collect(1, GCCollectionMode.Optimized, false);
            using (Process me = Process.GetCurrentProcess()) {
                K32EmptyWorkingSet(me.Handle);
            }
            foreach (string pName in new string[] { "NotchFlow", "electron" }) {
                Process[] procs = Process.GetProcessesByName(pName);
                foreach (Process p in procs) {
                    try {
                        K32EmptyWorkingSet(p.Handle);
                    } catch {} finally {
                        p.Dispose();
                    }
                }
            }
        } catch {}
    }

    private static System.Reflection.MethodInfo asTaskGeneric = null;
    private static System.Reflection.MethodInfo asStreamMethod = null;

    private static void InitWinRtHelpers() {
        if (asTaskGeneric != null) return;
        foreach (var m in typeof(System.WindowsRuntimeSystemExtensions).GetMethods()) {
            if (m.Name == "AsTask" && m.IsGenericMethod && m.GetParameters().Length == 1 && m.GetParameters()[0].ParameterType.Name == "IAsyncOperation`1") {
                asTaskGeneric = m;
                break;
            }
        }
        foreach (var m in typeof(System.IO.WindowsRuntimeStreamExtensions).GetMethods()) {
            if (m.Name == "AsStreamForRead" && m.GetParameters().Length == 1) {
                asStreamMethod = m;
                break;
            }
        }
    }

    private static T AwaitWinRT<T>(Windows.Foundation.IAsyncOperation<T> op, int timeoutMs = 1500) {
        InitWinRT:
        InitWinRtHelpers();
        var m = asTaskGeneric.MakeGenericMethod(typeof(T));
        var task = (System.Threading.Tasks.Task<T>)m.Invoke(null, new object[] { op });
        if (task.Wait(timeoutMs)) return task.Result;
        return default(T);
    }

    private static string ReadThumbBase64(IRandomAccessStreamReference thumbRef) {
        if (thumbRef == null) return "";
        Windows.Storage.Streams.IRandomAccessStreamWithContentType stream = null;
        try {
            stream = AwaitWinRT(thumbRef.OpenReadAsync(), 1200);
            if (stream == null) return "";
            using (var netStream = (Stream)asStreamMethod.Invoke(null, new object[] { stream }))
            using (var ms = new MemoryStream()) {
                netStream.CopyTo(ms);
                byte[] bytes = ms.ToArray();
                if (bytes == null || bytes.Length == 0 || bytes.Length > 2097152) return "";
                return "data:image/jpeg;base64," + Convert.ToBase64String(bytes);
            }
        } catch { return ""; }
        finally {
            if (stream != null) { try { stream.Dispose(); } catch {} }
        }
    }

    private static string JsonEsc(string s) {
        if (string.IsNullOrEmpty(s)) return "";
        var sb = new StringBuilder(s.Length + 8);
        foreach (char c in s) {
            switch (c) {
                case '\\': sb.Append("\\\\"); break;
                case '"':  sb.Append("\\\""); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (c < 32) sb.AppendFormat("\\u{0:x4}", (int)c);
                    else sb.Append(c);
                    break;
            }
        }
        return sb.ToString();
    }

    public static void Main(string[] args) {
        EnablePerMonitorDpi();
        Console.OutputEncoding = Encoding.UTF8;
        Console.InputEncoding  = Encoding.UTF8;

        GlobalSystemMediaTransportControlsSessionManager mgr = null;
        try {
            mgr = AwaitWinRT(GlobalSystemMediaTransportControlsSessionManager.RequestAsync(), 3000);
        } catch {}

        var cmdQueue = new ConcurrentQueue<string>();
        var wakeEvent = new ManualResetEventSlim(false);

        var readerThread = new Thread(() => {
            try {
                while (true) {
                    string line = Console.In.ReadLine();
                    if (line == null) {
                        cmdQueue.Enqueue("__EXIT__");
                        wakeEvent.Set();
                        break;
                    }
                    cmdQueue.Enqueue(line);
                    wakeEvent.Set();
                }
            } catch {
                cmdQueue.Enqueue("__EXIT__");
                wakeEvent.Set();
            }
        });
        readerThread.IsBackground = true;
        readerThread.Start();

        string lastTrackKey = "";
        string cachedTitle  = "";
        string cachedArtist = "";
        string cachedAlbum  = "";
        string cachedAppId  = "";
        double cachedDur    = -1.0;
        bool forceMetaRefresh = true;
        int propTick = 0;
        int idleTrimTick = 0;
        int lastVol = -1;
        bool lastMute = false;
        string lastMediaKey = "";
        string lastSentStatus = "";
        string lastSentTrack = "";
        bool lastSentFs = false;
        double lastSentPos = -999.0;
        bool isNotchExpanded = false;

        // Initial one-time gentle trim after startup
        TrimMemoryFootprint();

        while (true) {
            string cmdLine;
            while (cmdQueue.TryDequeue(out cmdLine)) {
                if (cmdLine == "__EXIT__") Environment.Exit(0);
                try {
                    if (cmdLine == "media:playpause") {
                        var cur = mgr != null ? mgr.GetCurrentSession() : null;
                        if (cur != null) AwaitWinRT(cur.TryTogglePlayPauseAsync(), 600);
                        lastSentStatus = "";
                    } else if (cmdLine == "media:next") {
                        var cur = mgr != null ? mgr.GetCurrentSession() : null;
                        if (cur != null) AwaitWinRT(cur.TrySkipNextAsync(), 600);
                        forceMetaRefresh = true;
                        lastSentStatus = "";
                    } else if (cmdLine == "media:prev") {
                        var cur = mgr != null ? mgr.GetCurrentSession() : null;
                        if (cur != null) AwaitWinRT(cur.TrySkipPreviousAsync(), 600);
                        forceMetaRefresh = true;
                        lastSentStatus = "";
                    } else if (cmdLine.StartsWith("media:seek:")) {
                        double sec = double.Parse(cmdLine.Substring(11), CultureInfo.InvariantCulture);
                        var cur = mgr != null ? mgr.GetCurrentSession() : null;
                        if (cur != null) {
                            long ticks = (long)(Math.Max(0.0, sec) * 10000000.0);
                            AwaitWinRT(cur.TryChangePlaybackPositionAsync(ticks), 600);
                        }
                        lastSentPos = -999.0;
                    } else if (cmdLine.StartsWith("vol:set:")) {
                        int pct = int.Parse(cmdLine.Substring(8), CultureInfo.InvariantCulture);
                        SetVolume(pct);
                    } else if (cmdLine == "vol:mute") {
                        ToggleMute();
                    } else if (cmdLine.StartsWith("win:init:")) {
                        long hwnd = long.Parse(cmdLine.Substring(9), CultureInfo.InvariantCulture);
                        notchHwnd = new IntPtr(hwnd);
                    } else if (cmdLine.StartsWith("win:move:")) {
                        string[] parts = cmdLine.Substring(9).Split(':');
                        if (parts.Length >= 3) {
                            long hwnd = long.Parse(parts[0], CultureInfo.InvariantCulture);
                            int mx = int.Parse(parts[1], CultureInfo.InvariantCulture);
                            int my = int.Parse(parts[2], CultureInfo.InvariantCulture);
                            MoveWindowClean(hwnd, mx, my);
                        }
                    } else if (cmdLine.StartsWith("win:expanded:")) {
                        isNotchExpanded = cmdLine.EndsWith("1");
                    } else if (cmdLine == "mem:trim" || cmdLine.StartsWith("mem:trim:")) {
                        if (!isNotchExpanded) TrimMemoryFootprint();
                    }
                } catch {}
            }

            int vol; bool mute;
            GetVolume(out vol, out mute);
            if (vol >= 0 && (vol != lastVol || mute != lastMute)) {
                bool isInit = (lastVol < 0);
                lastVol = vol;
                lastMute = mute;
                Console.Out.WriteLine(string.Format(
                    CultureInfo.InvariantCulture,
                    "{{\"type\":\"volume\",\"volume\":{0},\"muted\":{1},\"initial\":{2}}}",
                    vol, mute ? "true" : "false", isInit ? "true" : "false"
                ));
            }

            bool fs = IsFullscreenApp();
            GlobalSystemMediaTransportControlsSession s = null;
            try { if (mgr != null) s = mgr.GetCurrentSession(); } catch {}

            string statusStr = "Stopped";
            if (s != null) {
                try {
                    var pb = s.GetPlaybackInfo();
                    var tl = s.GetTimelineProperties();
                    string appId = s.SourceAppUserModelId ?? "";
                    statusStr = pb != null ? pb.PlaybackStatus.ToString() : "Stopped";
                    double dur = tl != null ? Math.Max(0.0, (tl.EndTime - tl.StartTime).TotalSeconds) : 0.0;

                    propTick++;
                    bool needMeta = forceMetaRefresh || string.IsNullOrEmpty(cachedTitle) || (appId != cachedAppId) || (Math.Abs(dur - cachedDur) > 1.5) || (propTick % 10 == 0);
                    string thumbOut = null;
                    if (needMeta) {
                        var props = AwaitWinRT(s.TryGetMediaPropertiesAsync(), 900);
                        if (props != null) {
                            cachedTitle  = props.Title ?? "";
                            cachedArtist = props.Artist ?? "";
                            cachedAlbum  = props.AlbumTitle ?? "";
                            cachedAppId  = appId;
                            cachedDur    = dur;
                            forceMetaRefresh = false;

                            string trackKey = cachedTitle + "||" + cachedArtist + "||" + cachedAlbum;
                            if (trackKey != lastTrackKey) {
                                lastTrackKey = trackKey;
                                thumbOut = ReadThumbBase64(props.Thumbnail);
                            }
                        }
                    }

                    double pos = tl != null ? (tl.Position - tl.StartTime).TotalSeconds : 0.0;
                    if (statusStr == "Playing" && tl != null && tl.LastUpdatedTime != DateTimeOffset.MinValue) {
                        double delta = (DateTimeOffset.UtcNow - tl.LastUpdatedTime.ToUniversalTime()).TotalSeconds;
                        if (delta > 0 && delta < 7200) pos += delta;
                    }
                    if (dur > 0 && pos > dur) pos = dur;
                    if (pos < 0) pos = 0;

                    long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                    bool active = !string.IsNullOrEmpty(cachedTitle);
                    bool shouldEmit = (statusStr == "Playing")
                        || (thumbOut != null)
                        || (statusStr != lastSentStatus)
                        || (lastTrackKey != lastSentTrack)
                        || (fs != lastSentFs)
                        || (Math.Abs(pos - lastSentPos) > 0.45);

                    if (shouldEmit) {
                        lastSentStatus = statusStr;
                        lastSentTrack  = lastTrackKey;
                        lastSentFs     = fs;
                        lastSentPos    = pos;
                        if (thumbOut != null) {
                            Console.Out.WriteLine(string.Format(
                                CultureInfo.InvariantCulture,
                                "{{\"type\":\"media\",\"active\":{0},\"title\":\"{1}\",\"artist\":\"{2}\",\"album\":\"{3}\",\"app\":\"{4}\",\"status\":\"{5}\",\"position\":{6:0.##},\"duration\":{7:0.##},\"fullscreen\":{8},\"ts\":{9},\"thumbnail\":\"{10}\"}}",
                                active ? "true" : "false",
                                JsonEsc(cachedTitle), JsonEsc(cachedArtist), JsonEsc(cachedAlbum), JsonEsc(appId),
                                JsonEsc(statusStr), pos, dur, fs ? "true" : "false", ts, JsonEsc(thumbOut)
                            ));
                        } else {
                            Console.Out.WriteLine(string.Format(
                                CultureInfo.InvariantCulture,
                                "{{\"type\":\"media\",\"active\":{0},\"title\":\"{1}\",\"artist\":\"{2}\",\"album\":\"{3}\",\"app\":\"{4}\",\"status\":\"{5}\",\"position\":{6:0.##},\"duration\":{7:0.##},\"fullscreen\":{8},\"ts\":{9}}}",
                                active ? "true" : "false",
                                JsonEsc(cachedTitle), JsonEsc(cachedArtist), JsonEsc(cachedAlbum), JsonEsc(appId),
                                JsonEsc(statusStr), pos, dur, fs ? "true" : "false", ts
                            ));
                        }
                    }
                    lastMediaKey = "active";
                } catch {}
            } else {
                if (lastMediaKey != "none" || fs != lastSentFs) {
                    long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                    Console.Out.WriteLine(string.Format(
                        CultureInfo.InvariantCulture,
                        "{{\"type\":\"media\",\"active\":false,\"title\":\"\",\"artist\":\"\",\"album\":\"\",\"app\":\"\",\"status\":\"Stopped\",\"position\":0,\"duration\":0,\"fullscreen\":{0},\"ts\":{1}}}",
                        fs ? "true" : "false", ts
                    ));
                    lastTrackKey = "";
                    cachedTitle = "";
                    lastSentTrack = "";
                    lastSentStatus = "none";
                    lastSentFs = fs;
                    lastMediaKey = "none";
                }
                idleTrimTick++;
                if (!isNotchExpanded && idleTrimTick % 800 == 0) {
                    TrimMemoryFootprint();
                }
            }

            Console.Out.Flush();
            int waitMs = (s != null && statusStr == "Playing") ? 300 : 700;
            wakeEvent.Wait(waitMs);
            wakeEvent.Reset();
        }
    }
}
