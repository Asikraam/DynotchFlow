using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Diagnostics;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("DynotchFlow Setup")]
[assembly: AssemblyDescription("DynotchFlow — 1-Click Installer & Launcher")]
[assembly: AssemblyProduct("DynotchFlow")]
[assembly: AssemblyCompany("DynotchFlow Open Source")]
[assembly: AssemblyVersion("1.0.1.0")]
[assembly: AssemblyFileVersion("1.0.1.0")]

public static class DynotchFlowSetup {
    private const long PAYLOAD_MAGIC = 0x574F4C464843544EL; // "NTHCHFLW"

    private sealed class SetupForm : Form {
        private readonly Label lblStatus;
        private readonly ProgressBar bar;

        public SetupForm() {
            Text = "DynotchFlow Setup";
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;
            Size = new Size(380, 118);
            BackColor = Color.FromArgb(14, 16, 22);
            ForeColor = Color.White;
            TopMost = true;

            var lblTitle = new Label {
                Text = "DynotchFlow",
                Font = new Font("Segoe UI", 12f, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(22, 18),
                AutoSize = true
            };
            lblStatus = new Label {
                Text = "Preparing installation...",
                Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                ForeColor = Color.FromArgb(170, 182, 200),
                Location = new Point(22, 48),
                Size = new Size(336, 20)
            };
            bar = new ProgressBar {
                Location = new Point(22, 78),
                Size = new Size(336, 14),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100,
                Value = 5
            };

            Controls.Add(lblTitle);
            Controls.Add(lblStatus);
            Controls.Add(bar);

            Paint += (s, e) => {
                using (var pen = new Pen(Color.FromArgb(46, 52, 68), 1)) {
                    e.Graphics.DrawRectangle(pen, 0, 0, Width - 1, Height - 1);
                }
            };
        }

        public void SetProgress(string text, int pct) {
            if (IsDisposed) return;
            if (InvokeRequired) {
                BeginInvoke((Action)(() => SetProgress(text, pct)));
                return;
            }
            lblStatus.Text = text;
            bar.Value = Math.Max(0, Math.Min(100, pct));
        }
    }

    private static void KillProcesses(params string[] names) {
        foreach (string name in names) {
            try {
                foreach (Process p in Process.GetProcessesByName(name)) {
                    try {
                        p.Kill();
                        p.WaitForExit(2500);
                    } catch {} finally {
                        p.Dispose();
                    }
                }
            } catch {}
        }
        Thread.Sleep(350);
    }

    private static void CleanOldArtifacts(string progDir) {
        try {
            string appDataNotch = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "NotchFlow");
            string legacyToggl = Path.Combine(appDataNotch, "toggl.json");
            if (File.Exists(legacyToggl)) File.Delete(legacyToggl);
        } catch {}

        try {
            using (RegistryKey runKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true)) {
                if (runKey != null) {
                    object val = runKey.GetValue("electron.app.Electron");
                    if (val != null && val.ToString().IndexOf("notchflow", StringComparison.OrdinalIgnoreCase) >= 0) {
                        runKey.DeleteValue("electron.app.Electron", false);
                    }
                }
            }
        } catch {}

        try {
            string desk = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            string oldBat = Path.Combine(desk, "NOTCHFLOW.bat");
            if (File.Exists(oldBat)) File.Delete(oldBat);
            string oldExe = Path.Combine(desk, "NotchFlow.exe");
            if (File.Exists(oldExe) && new FileInfo(oldExe).Length < 100000) File.Delete(oldExe);
            string startup = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
            string oldStartupLnk = Path.Combine(startup, "NotchFlow.lnk");
            if (File.Exists(oldStartupLnk)) File.Delete(oldStartupLnk);
        } catch {}

        try {
            string oldV25 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "NotchFlow_Standalone_v25");
            if (Directory.Exists(oldV25)) Directory.Delete(oldV25, true);
        } catch {}

        try {
            string lapBat = Path.Combine(progDir, "JALANKAN_DAN_BUAT_SHORTCUT_LAPTOP.bat");
            if (File.Exists(lapBat)) File.Delete(lapBat);
        } catch {}
    }

    private static void CreateShortcut(string lnkPath, string targetExe, string workDir, string iconPath, string desc) {
        Type shellType = Type.GetTypeFromProgID("WScript.Shell");
        if (shellType == null) return;
        object ws = Activator.CreateInstance(shellType);
        object sc = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, ws, new object[] { lnkPath });
        Type scType = sc.GetType();
        scType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, sc, new object[] { targetExe });
        scType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, sc, new object[] { workDir });
        if (!string.IsNullOrEmpty(iconPath) && File.Exists(iconPath)) {
            scType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, sc, new object[] { iconPath });
        }
        scType.InvokeMember("Description", BindingFlags.SetProperty, null, sc, new object[] { desc });
        scType.InvokeMember("Save", BindingFlags.InvokeMethod, null, sc, null);
    }

    private static void ExtractEntryWithRetry(ZipArchiveEntry entry, string destPath) {
        for (int attempt = 0; attempt < 5; attempt++) {
            try {
                entry.ExtractToFile(destPath, true);
                return;
            } catch (IOException) {
                if (attempt == 4) throw;
                Thread.Sleep(180);
            } catch (UnauthorizedAccessException) {
                if (attempt == 4) throw;
                Thread.Sleep(180);
            }
        }
    }

    private static void ExtractPayload(string selfPath, string targetDir, SetupForm form) {
        using (var fs = new FileStream(selfPath, FileMode.Open, FileAccess.Read, FileShare.Read)) {
            if (fs.Length <= 16) throw new InvalidOperationException("Invalid installer payload.");
            fs.Seek(-16, SeekOrigin.End);
            byte[] footer = new byte[16];
            if (fs.Read(footer, 0, 16) != 16) throw new InvalidOperationException("Failed to read installer footer.");
            long magic = BitConverter.ToInt64(footer, 0);
            long zipLen = BitConverter.ToInt64(footer, 8);
            if (magic != PAYLOAD_MAGIC || zipLen <= 0 || zipLen + 16 >= fs.Length) {
                throw new InvalidOperationException("DynotchFlow package not found inside EXE.");
            }

            string tmpZip = Path.Combine(Path.GetTempPath(), "dynotchflow_pkg_" + Process.GetCurrentProcess().Id + ".zip");
            try {
                fs.Seek(-(zipLen + 16), SeekOrigin.End);
                using (var outZip = new FileStream(tmpZip, FileMode.Create, FileAccess.Write, FileShare.None)) {
                    byte[] buf = new byte[131072];
                    long rem = zipLen;
                    long total = zipLen;
                    while (rem > 0) {
                        int r = fs.Read(buf, 0, (int)Math.Min(buf.Length, rem));
                        if (r <= 0) break;
                        outZip.Write(buf, 0, r);
                        rem -= r;
                        int pct = 15 + (int)(((total - rem) * 20) / total);
                        form.SetProgress("Preparing DynotchFlow package...", pct);
                    }
                }

                Directory.CreateDirectory(targetDir);
                string rootFull = Path.GetFullPath(targetDir).TrimEnd('\\', '/') + Path.DirectorySeparatorChar;
                using (ZipArchive archive = ZipFile.OpenRead(tmpZip)) {
                    int count = Math.Max(1, archive.Entries.Count);
                    int idx = 0;
                    foreach (ZipArchiveEntry entry in archive.Entries) {
                        idx++;
                        if (idx % 6 == 0 || idx == count) {
                            int pct = 35 + (idx * 55) / count;
                            form.SetProgress("Installing to AppData\\Local\\Programs\\DynotchFlow...", pct);
                        }
                        string destPath = Path.GetFullPath(Path.Combine(targetDir, entry.FullName));
                        if (!destPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase)) continue;
                        if (string.IsNullOrEmpty(entry.Name)) {
                            Directory.CreateDirectory(destPath);
                            continue;
                        }
                        Directory.CreateDirectory(Path.GetDirectoryName(destPath));
                        ExtractEntryWithRetry(entry, destPath);
                    }
                }
            } finally {
                try { if (File.Exists(tmpZip)) File.Delete(tmpZip); } catch {}
            }
        }
    }

    [STAThread]
    public static void Main(string[] args) {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string progDir  = Path.Combine(localApp, "Programs", "DynotchFlow");
        string exePath  = Path.Combine(progDir, "DynotchFlow.exe");
        string legacyExe = Path.Combine(progDir, "NotchFlow.exe");
        string icoPath  = Path.Combine(progDir, "resources", "app", "NotchFlow.ico");
        string selfPath = Process.GetCurrentProcess().MainModule.FileName;

        using (var form = new SetupForm()) {
            Exception fatalErr = null;
            form.Shown += (s, e) => {
                Task.Run(() => {
                    try {
                        form.SetProgress("Stopping previous version...", 8);
                        KillProcesses("NotchFlow", "DynotchFlow", "NotchFlow_Launcher", "DynotchFlow_Launcher", "NotchBridge");

                        ExtractPayload(selfPath, progDir, form);

                        form.SetProgress("Cleaning legacy files & creating shortcuts...", 92);
                        CleanOldArtifacts(progDir);

                        string runExe = File.Exists(exePath) ? exePath : legacyExe;
                        string desk = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                        string startPrograms = Environment.GetFolderPath(Environment.SpecialFolder.Programs);

                        CreateShortcut(Path.Combine(desk, "DynotchFlow.lnk"), runExe, progDir, icoPath, "DynotchFlow — Windows 11 Dynamic Island");
                        if (!string.IsNullOrEmpty(startPrograms)) {
                            Directory.CreateDirectory(startPrograms);
                            CreateShortcut(Path.Combine(startPrograms, "DynotchFlow.lnk"), runExe, progDir, icoPath, "DynotchFlow — Windows 11 Dynamic Island");
                        }

                        if (!File.Exists(runExe)) {
                            throw new FileNotFoundException("DynotchFlow.exe was not found after extraction.", runExe);
                        }

                        form.SetProgress("Launching DynotchFlow...", 100);
                        var psi = new ProcessStartInfo {
                            FileName = runExe,
                            Arguments = "--just-installed-to-programs",
                            WorkingDirectory = progDir,
                            UseShellExecute = false,
                            CreateNoWindow = true
                        };
                        Process.Start(psi);
                        Thread.Sleep(550);
                    } catch (Exception ex) {
                        fatalErr = ex;
                    } finally {
                        try { form.BeginInvoke((Action)(() => form.Close())); } catch {}
                    }
                });
            };

            Application.Run(form);
            if (fatalErr != null) {
                MessageBox.Show("DynotchFlow installation failed:\n" + fatalErr.Message, "DynotchFlow Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
