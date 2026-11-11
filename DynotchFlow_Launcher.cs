using System;
using System.Diagnostics;
using System.IO;

class DynotchFlowLauncher {
    static void CopyDirectoryRecursive(string sourceDir, string targetDir) {
        Directory.CreateDirectory(targetDir);
        foreach (string file in Directory.GetFiles(sourceDir)) {
            string dest = Path.Combine(targetDir, Path.GetFileName(file));
            try { File.Copy(file, dest, true); } catch {}
        }
        foreach (string subDir in Directory.GetDirectories(sourceDir)) {
            string destSub = Path.Combine(targetDir, Path.GetFileName(subDir));
            CopyDirectoryRecursive(subDir, destSub);
        }
    }

    [STAThread]
    static void Main(string[] args) {
        try {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string userProfile  = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string progDir      = Path.Combine(localAppData, "Programs", "DynotchFlow");
            string progExe      = Path.Combine(progDir, "NotchFlow.exe");
            string baseDir      = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\', '/');

            // 1. If launched from a folder that contains standalone NotchFlow.exe (e.g. moved to Downloads/Desktop)
            //    and it is not yet in %LOCALAPPDATA%\Programs\DynotchFlow, auto-install it to Programs!
            string localExe = Path.Combine(baseDir, "NotchFlow.exe");
            string localRes = Path.Combine(baseDir, "resources", "app", "main.js");
            if (File.Exists(localExe) && File.Exists(localRes) &&
                !string.Equals(Path.GetFullPath(baseDir), Path.GetFullPath(progDir), StringComparison.OrdinalIgnoreCase)) {
                CopyDirectoryRecursive(baseDir, progDir);
            }

            // 2. Also check if Downloads\NotchFlow_App exists and Programs\DynotchFlow is not populated yet
            if (!File.Exists(progExe)) {
                string dlApp = Path.Combine(userProfile, "Downloads", "NotchFlow_App");
                if (File.Exists(Path.Combine(dlApp, "NotchFlow.exe"))) {
                    CopyDirectoryRecursive(dlApp, progDir);
                }
            }

            // 3. Launch from %LOCALAPPDATA%\Programs\DynotchFlow\NotchFlow.exe if available
            if (File.Exists(progExe)) {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = progExe;
                psi.WorkingDirectory = progDir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                Process.Start(psi);
                return;
            }

            // 4. Fallback: Launch via local Electron dev installation if standalone NotchFlow.exe is not present
            string devAppDir = Path.Combine(progDir, "resources", "app");
            if (!File.Exists(Path.Combine(devAppDir, "main.js"))) devAppDir = baseDir;
            string devElectron = Path.Combine(devAppDir, "node_modules", "electron", "dist", "electron.exe");
            if (File.Exists(devElectron) && File.Exists(Path.Combine(devAppDir, "main.js"))) {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = devElectron;
                psi.Arguments = "\"" + devAppDir + "\"";
                psi.WorkingDirectory = devAppDir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                Process.Start(psi);
            }
        } catch {}
    }
}
