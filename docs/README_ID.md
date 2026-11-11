# Panduan DynotchFlow V4 (Bahasa Indonesia)

[Back to English README](../README.md)

**DynotchFlow V4** adalah aplikasi **Dynamic Island** untuk Windows 10 & 11 yang ringan (`~53 MB` RAM idle, `0%` CPU idle), memadukan UI Electron dengan **Native C# WinRT Bridge** (`NotchBridge.exe`).

## Cara Instal untuk Pengguna Umum (Tanpa Coding)
1. Unduh **`DynotchFlow_V4_Public_Setup.exe`** dari tab [**GitHub Releases**](https://github.com/Asikraam/DynotchFlow/releases/latest).
2. Klik 2x `.exe` tersebut.  
   *(Catatan: Karena aplikasi open-source indie ini belum memakai sertifikat komersial berbayar, jika muncul pop-up **Windows protected your PC / SmartScreen**, klik **More info** → **Run anyway**).*
3. Installer otomatis memasang aplikasi ke `%LOCALAPPDATA%\Programs\DynotchFlow`, membuat shortcut **Desktop & Start Menu**, lalu langsung menjalankannya.

## Pengaturan Kota & Google Calendar (10 Detik)
- **Atur Kota Cuaca & Sholat:** Buka tab **Setting** → isi kota pada kolom **Kota BMKG & Sholat Kemenag** (default: `Jakarta`) → klik **Terapkan**.
- **Sambungkan Google Calendar Milikmu:**
  1. Buka tab **Kalender** → klik **Sambungkan Google Calendar (.ics)** *(atau klik **Setting → Ambil Link**)*.
  2. Di halaman pengaturan Google Calendar yang terbuka, pilih kalendermu → gulir ke **Secret address in iCal format** → klik **Copy**.
  3. DynotchFlow mendeteksi link dari clipboard secara otomatis dan langsung menampilkan jadwalmu *(mendukung beberapa link `.ics` dipisah koma/spasi)*.

## Pintasan Keyboard
- `Alt + H` / `Ctrl + Alt + H` — Sembunyikan island ke tepi atas layar (*Auto-Hide Top Edge*), sentuh tepi atas dengan kursor untuk memunculkan lagi.
- `Ctrl + Alt + N` — Sembunyikan / tampilkan total.
- Scroll mouse di ikon volume pada pill — Naik/turunkan volume Windows kelipatan genap (`±2`).
