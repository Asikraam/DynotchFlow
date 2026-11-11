using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Globalization;
using System.Reflection;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Media.Control;
using Windows.Storage.Streams;

[assembly: AssemblyTitle("DynotchFlow Audio & Media Bridge")]
[assembly: AssemblyDescription("DynotchFlow Native WinRT Bridge")]
[assembly: AssemblyProduct("DynotchFlow")]
[assembly: AssemblyCompany("DynotchFlow")]
[assembly: AssemblyVersion("1.0.2.0")]
[assembly: AssemblyFileVersion("1.0.2.0")]

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

    [DllImport("user32.dll", EntryPoint = "GetWindowLong")]
    public static extern int GetWindowLong32(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", EntryPoint = "SetWindowLong")]
    public static extern int SetWindowLong32(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("dwmapi.dll")]
    public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

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

    public static void MakeFramelessClean(long hwndVal) {
        try {
            IntPtr hWnd = new IntPtr(hwndVal);
            if (hWnd == IntPtr.Zero) return;
            notchHwnd = hWnd;

            const int GWL_STYLE = -16;
            const int GWL_EXSTYLE = -20;
            const int WS_CAPTION = 0x00C00000;
            const int WS_THICKFRAME = 0x00040000;
            const int WS_MINIMIZEBOX = 0x00020000;
            const int WS_MAXIMIZEBOX = 0x00010000;
            const int WS_SYSMENU = 0x00080000;
            const int WS_BORDER = 0x00800000;
            const int WS_DLGFRAME = 0x00400000;
            int wsPopup = unchecked((int)0x80000000);

            int style = GetWindowLong32(hWnd, GWL_STYLE);
            int strip = WS_CAPTION | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU | WS_BORDER | WS_DLGFRAME;
            int newStyle = (style & ~strip) | wsPopup;
            if (newStyle != style) SetWindowLong32(hWnd, GWL_STYLE, newStyle);

            const int WS_EX_DLGMODALFRAME = 0x00000001;
            const int WS_EX_WINDOWEDGE = 0x00000100;
            const int WS_EX_CLIENTEDGE = 0x00000200;
            const int WS_EX_STATICEDGE = 0x00020000;
            const int WS_EX_TOOLWINDOW = 0x00000080;

            int exStyle = GetWindowLong32(hWnd, GWL_EXSTYLE);
            int exStrip = WS_EX_DLGMODALFRAME | WS_EX_WINDOWEDGE | WS_EX_CLIENTEDGE | WS_EX_STATICEDGE;
            int newExStyle = (exStyle & ~exStrip) | WS_EX_TOOLWINDOW;
            if (newExStyle != exStyle) SetWindowLong32(hWnd, GWL_EXSTYLE, newExStyle);

            try { int noRound = 1; DwmSetWindowAttribute(hWnd, 33, ref noRound, sizeof(int)); } catch {}
            try { int noBorder = unchecked((int)0xFFFFFFFE); DwmSetWindowAttribute(hWnd, 34, ref noBorder, sizeof(int)); } catch {}
            try { int noBackdrop = 1; DwmSetWindowAttribute(hWnd, 38, ref noBackdrop, sizeof(int)); } catch {}

            SetWindowPos(hWnd, IntPtr.Zero, 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0004 | 0x0010 | 0x0020);
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
            foreach (string pName in new string[] { "DynotchFlow", "NotchFlow", "electron" }) {
                Process[] procs = Process.GetProcessesByName(pName);
                foreach (Process p in procs) {
                    try {
                        K32EmptyWorkingSet(p.Handle);
                        SetProcessWorkingSetSize(p.Handle, new IntPtr(-1), new IntPtr(-1));
                    } catch {} finally {
                        p.Dispose();
                    }
                }
            }
            GC.Collect(2, GCCollectionMode.Forced, true);
            GC.WaitForPendingFinalizers();
            using (Process me = Process.GetCurrentProcess()) {
                K32EmptyWorkingSet(me.Handle);
                SetProcessWorkingSetSize(me.Handle, new IntPtr(-1), new IntPtr(-1));
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
        InitWinRtHelpers();
        var m = asTaskGeneric.MakeGenericMethod(typeof(T));
        var task = (System.Threading.Tasks.Task<T>)m.Invoke(null, new object[] { op });
        if (task.Wait(timeoutMs)) return task.Result;
        return default(T);
    }

    private static string ReadThumbBase64(IRandomAccessStreamReference thumbRef, ref ulong lastSig) {
        if (thumbRef == null) return null;
        Windows.Storage.Streams.IRandomAccessStreamWithContentType stream = null;
        try {
            stream = AwaitWinRT(thumbRef.OpenReadAsync(), 1200);
            if (stream == null) return null;
            using (var netStream = (Stream)asStreamMethod.Invoke(null, new object[] { stream }))
            using (var ms = new MemoryStream()) {
                netStream.CopyTo(ms);
                byte[] bytes = ms.ToArray();
                if (bytes == null || bytes.Length == 0 || bytes.Length > 2097152) return null;
                uint fnv = 2166136261u;
                for (int i = 0; i < bytes.Length; i++) {
                    fnv ^= bytes[i];
                    fnv *= 16777619u;
                }
                ulong sig = (((ulong)(uint)bytes.Length) << 32) | fnv;
                if (sig == lastSig) return null;
                lastSig = sig;
                string mime = "image/jpeg";
                if (bytes.Length >= 8 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) mime = "image/png";
                else if (bytes.Length >= 12 && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 && bytes[8] == 0x57 && bytes[9] == 0x45) mime = "image/webp";
                return "data:" + mime + ";base64," + Convert.ToBase64String(bytes);
            }
        } catch { return null; }
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
        int trimTick = 0;
        int lastVol = -1;
        bool lastMute = false;
        string lastMediaKey = "";
        string lastSentStatus = "";
        string lastSentTrack = "";
        bool lastSentFs = false;
        double lastSentPos = -999.0;
        bool isNotchExpanded = false;
        ulong lastThumbSig = 0;
        int thumbRetryTicks = 0;

        TrimMemoryFootprint();

        while (true) {
            trimTick++;
            if (!isNotchExpanded && (trimTick == 3 || trimTick == 10 || trimTick % 40 == 0)) {
                TrimMemoryFootprint();
            }

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
                        MakeFramelessClean(hwnd);
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
                    if (thumbRetryTicks > 0) thumbRetryTicks--;
                    bool checkDelayedThumb = (thumbRetryTicks > 0 && (thumbRetryTicks % 3 == 0));
                    bool needMeta = forceMetaRefresh || string.IsNullOrEmpty(cachedTitle) || (appId != cachedAppId) || (Math.Abs(dur - cachedDur) > 1.5) || (statusStr == "Playing" ? propTick % 15 == 0 : propTick % 30 == 0) || checkDelayedThumb;
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
                                lastThumbSig = 0;
                                thumbRetryTicks = 12;
                                thumbOut = ReadThumbBase64(props.Thumbnail, ref lastThumbSig) ?? "";
                            } else if (checkDelayedThumb || lastThumbSig == 0 || (propTick % 15 == 0)) {
                                thumbOut = ReadThumbBase64(props.Thumbnail, ref lastThumbSig);
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
                    lastThumbSig = 0;
                    thumbRetryTicks = 0;
                    cachedTitle = "";
                    lastSentTrack = "";
                    lastSentStatus = "none";
                    lastSentFs = fs;
                    lastMediaKey = "none";
                }
            }

            Console.Out.Flush();
            int waitMs = (s != null && statusStr == "Playing") ? 300 : 700;
            wakeEvent.Wait(waitMs);
            wakeEvent.Reset();
        }
    }
}
