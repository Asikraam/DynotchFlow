# Panduan DynotchFlow (`v1.0.0`)

[Back to English README](../README.md)

<p align="center">
  <img src="../assets/demo.gif" alt="Demo UI DynotchFlow" width="100%" />
</p>

**DynotchFlow** adalah aplikasi **Dynamic Island** untuk Windows 10 & 11 yang super ringan (**`< 50 MB` RAM saat idle**, `0%` CPU idle), memadukan UI Electron dengan **Native C# WinRT Bridge** (`NotchBridge.exe`) dan OS window clipping tanpa bingkai kotak DWM.

---

## Daftar Unduhan & Dukungan Sistem Operasi

| Platform | Paket Rilis | Status | Keterangan |
| :--- | :--- | :--- | :--- |
| **Windows 10 / 11 (x64)** | `DynotchFlow-Setup-v1.0.0-win-x64.exe` | **Tersedia (`v1.0.0`)** | Installer 1-klik otomatis ke `%LOCALAPPDATA%\Programs\DynotchFlow` + shortcut |
| **Windows 10 / 11 (x64)** | `DynotchFlow-v1.0.0-win-x64-Portable.zip` | **Tersedia (`v1.0.0`)** | Ekstrak lalu langsung jalankan `DynotchFlow.exe` tanpa instalasi |
| **macOS (Apple Silicon / Intel)** | Native Bridge *(Direncanakan)* | **Source / Segera** | UI Electron lintas platform; bridge MediaRemote/CoreAudio dalam pengembangan |
| **Linux (X11 / Wayland)** | MPRIS2 D-Bus *(Eksperimental)* | **Source / Segera** | Dukungan MPRIS2 media & window shaping direncanakan |

---

## Cara Instal untuk Pengguna Umum (Tanpa Coding)

1. Unduh **`DynotchFlow-Setup-v1.0.0-win-x64.exe`** *(atau versi portabel `.zip`)* dari halaman [**GitHub Releases**](https://github.com/Asikraam/DynotchFlow/releases/latest).
2. Klik 2x `.exe` tersebut.  
   *(Catatan: Karena aplikasi open-source mandiri ini belum memakai sertifikat Authenticode komersial berbayar, jika muncul pop-up **Windows protected your PC / SmartScreen**, klik **More info** → **Run anyway**).*
3. Installer otomatis memasang aplikasi ke `%LOCALAPPDATA%\Programs\DynotchFlow`, membuat shortcut **Desktop & Start Menu**, lalu langsung menjalankannya.

---

## Fitur Utama & Pembaruan Terkini

- **Antarmuka Bahasa Inggris Ringkas (Siap Internasional):** Seluruh label UI (*Music*, *Calendar*, *Weather*, *Shelf*, *Settings*, filter kalender, waktu sholat internasional `Fajr–Isha`, dan installer Setup) kini memakai teks Inggris yang singkat & bersih tanpa terpotong, sambil tetap kompatibel dengan cache lokal yang sudah tersimpan.
- **Dual Tema Identik (`Normal` Glow & `Matte` Minimalist):** Pilih tema **Normal** (cahaya adaptif sampul lagu & efek langit) atau **Matte Minimalist** (`#09090b` / `#121215` bersih tanpa glow) di menu **Settings (`⚙`)**. Kedua tema memiliki ukuran jendela & tata letak yang **100% identik (`524x266`)** tanpa perubahan dimensi panel.
- **Lirik Sinkron Hybrid (Auto-Center + Marquee) & Hold Instrumen:** Baris lirik pendek/sedang tampil rata tengah dengan teks tajam tanpa bayangan tepi; baris lirik panjang otomatis bergeser halus (*marquee*). Saat lagu masih intro sebelum vokal, jeda instrumen panjang (`>= 10s` / `[Instrumental]` / `♪`), atau outro, pill otomatis menahan tampilan judul lagu dengan tenang tanpa kedip teks acak.
- **Auto-Sync R&B / Rap / Live & VEVO Tanpa Bebani RAM (`< 50 MB` Idle):**
  - Waterfall pencarian multi-sumber (**LRCLIB -> ejaan resmi iTunes -> Kugou LRC skor durasi -> `lyrics.ovh`**) lengkap dengan normalisasi `$ -> s` (*A$AP*, *Ty Dolla $ign*), pembersih channel *VEVO* / *COLORS SHOW* / *Tiny Desk*, pembersih `ft.` / `feat.` / `with` dan tag live (`Live at ...`, `Fancam`, `Acoustic Cover`, `Slowed + Reverb`, `Sped Up`, `Full Bass`).
  - Otomatis menghitung **skala tempo linier** pada varian *Slowed/Sped-Up*, penyesuaian ritme cepat R&B/Rap, `[offset:]` LRC, klik baris lirik untuk melompat ke detik lagu, serta penjagaan aman video konser / mix panjang (`> 15 menit`) agar RAM tetap ringan tanpa pemrosesan audio/ASR.
- **Tepi Halus & Keamanan Server Lokal (`:17420`):** Pemotongan wilayah jendela `SetWindowRgn` ber-padding dan strip titlebar win32 menghasilkan sudut lengkung bersih tanpa garis abu-abu, auto-trim RAM otomatis (`~12–45 MB` saat idle), serta endpoint webhook `127.0.0.1:17420` yang menolak permintaan browser lintas situs (*cross-origin* `403`).
- **Multi-Kalender `.ics`, Cuaca BMKG & Jadwal Sholat Kemenag RI:** Efek langit dinamis (Hujan, Cerah/Senja, Malam), pengingat Adzan & acara mendadak, serta **Shelf Drag-In / Drag-Out** file & catatan.

---

## Pengaturan Kota & Google Calendar (10 Detik)

- **Atur Kota Cuaca & Sholat:** Buka ikon **Settings (`⚙`)** → isi kota pada kolom **City (Weather & Prayer)** (default: `Jakarta`) → klik **Apply**.
- **Sambungkan Google Calendar Milikmu:**
  1. Buka tab **Calendar** → klik **Connect Google Calendar (.ics)** *(atau klik **Settings (`⚙`) → Get Link**)*.
  2. Di halaman pengaturan Google Calendar yang terbuka, pilih kalendermu → gulir ke **Secret address in iCal format** → klik **Copy**.
  3. DynotchFlow mendeteksi link `.ics` dari clipboard secara otomatis dan menampilkan jadwalmu *(mendukung beberapa link `.ics` dipisah koma/spasi)*.

## Pintasan Keyboard

- `Alt + H` / `Ctrl + Alt + H` — Sembunyikan island ke tepi atas layar (*Auto-Hide Top Edge*), sentuh tepi atas dengan kursor untuk memunculkan lagi.
- `Ctrl + Alt + N` — Sembunyikan / tampilkan total.
- Scroll mouse di ikon volume pada pill — Naik/turunkan volume Windows kelipatan genap (`±2`).
