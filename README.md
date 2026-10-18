# 📰 Platform Teka-Teki Silang (TTS) Bahasa Indonesia
**SMA Negeri 1 Batam • Kelas XI HJ 5**

Website Teka-Teki Silang (TTS) interaktif dengan desain **terang, bersih, dan modern (*clean academic light theme*)** yang dirancang khusus untuk pembelajaran Bahasa Indonesia di **SMA Negeri 1 Batam (Kelas XI HJ 5)**. Dilengkapi dengan **sistem anti-contek (proctoring & alarm audio)**, **pemberian nilai otomatis**, dan **rekapitulasi langsung ke Google Spreadsheet**.

---

## ✨ Fitur Utama

1. **Formulir Identitas Peserta Ringkas & Bersih**:
   - Input hanya: **Nama Lengkap Peserta** dan **Nomor Absen**.
   - Kelas otomatis disetel: **XI HJ 5 (SMA Negeri 1 Batam)**.
   - Pakta integritas kejujuran akademik.

2. **Arena TTS Responsif (Mobile & Desktop)**:
   - **Tampilan Premium**: Tema gelap modern (*glassmorphism*) dengan tipografi tajam (*Outfit* & *Plus Jakarta Sans*).
   - **Navigasi Cerdas**:
     - *Auto-advance*: Kursor otomatis maju ke kotak berikutnya saat mengetik huruf.
     - *Backspace cerdas*: Menghapus huruf dan otomatis mundur ke kotak sebelumnya jika kosong.
     - *Toggle Arah*: Klik kotak persimpangan kata atau tekan `Spasi`/`Enter` untuk beralih antara **Mendatar** $\leftrightarrow$ **Menurun**.
     - Tombol navigasi soal cepat: `◀ Sebelumnya` dan `Berikutnya ▶`.
     - *Zoom In / Zoom Out / Reset View* untuk kenyamanan di smartphone maupun laptop.
   - **Bar Petunjuk Melayang**: Menampilkan nomor soal, arah, panjang huruf, tingkat kesulitan (Mudah/Sedang/Sulit), dan pertanyaan dengan jelas.

3. **Sistem Pengawasan Integritas & Anti-Cheat**:
   - **Deteksi Pindah Tab / Window Blur**: Jika peserta membuka tab lain, beralih aplikasi, atau meminimize browser, sistem akan langsung:
     - Membunyikan **alarm sirine nyaring** frekuensi ganda (menggunakan *Web Audio API* bawaan tanpa perlu unduh file audio).
     - Menampilkan layar peringatan merah (*Screen Flashing Alert*).
     - Menghitung jumlah pelanggaran (*Cheat Counter*).
     - Memotong nilai sebesar **-5 poin per pelanggaran**.
     - Mencatat riwayat waktu kejadian ke dalam log pelanggaran.
   - **Anti-Inspect & Anti-Copy-Paste**: Memblokir klik kanan, copy, paste, dan shortcut inspeksi elemen browser.

4. **Penilaian Objektif & Rekapitulasi Realtime**:
   - Total 20 Soal (10 Mendatar, 10 Menurun).
   - Bobot 5 poin per soal $\rightarrow$ Total skor murni 100 poin.
   - Skor Akhir = $\max(0, \text{Skor Murni} - \text{Total Penalti Pelanggaran})$.
   - Indikator Kriteria Ketuntasan Minimal (KKM 75): **TUNTAS** atau **BELUM TUNTAS**.
   - Review kunci jawaban setelah ujian selesai.
   - Tombol **Salin Rapor Nilai** (format siap kirim ke WhatsApp guru) dan **Unduh Rapor TXT**.

5. **Integrasi Google Spreadsheet (Otomatis via Google Apps Script)**:
   - Nilai, durasi pengerjaan, skor murni, penalti, skor akhir, dan log pelanggaran otomatis terkirim dan tersusun rapi di Google Sheets.

---

## 🚀 Cara Menjalankan Website

### Opsi 1: Buka Langsung (Tanpa Install Apapun)
Cukup klik ganda (double click) pada file `index.html` di File Explorer Anda. Website akan langsung terbuka di browser (Chrome, Edge, Firefox, Safari).

### Opsi 2: Jalankan dengan Web Server Lokal
Jalankan perintah berikut di terminal/PowerShell pada folder proyek:
```bash
python -m http.server 8080
```
Lalu buka browser Anda di: `http://localhost:8080`

### Opsi 3: Publikasi Online Gratis
Unggah folder proyek ini ke layanan hosting statis gratis seperti **GitHub Pages**, **Vercel**, atau **Netlify** agar tautan dapat langsung dibagikan dan dikerjakan oleh seluruh siswa melalui smartphone masing-masing.

---

## 📊 Cara Menghubungkan ke Google Spreadsheet

Agar nilai seluruh peserta otomatis masuk ke Google Sheets Anda, ikuti langkah berikut:

1. Buka Google Sheets baru di [https://sheets.new](https://sheets.new).
2. Beri nama spreadsheet, contoh: `Rekap Nilai TTS B. Indo - Kelompok 4`.
3. Buka menu **Ekstensi (Extensions)** > **Apps Script**.
4. Hapus semua kode default di Apps Script, lalu salin dan tempelkan seluruh isi file `google_apps_script.js` yang ada di proyek ini.
5. Klik icon **Simpan** (💾).
6. Klik tombol **Deploy (Terapkan)** di kanan atas > pilih **New deployment (Penerapan baru)**.
7. Pilih jenis deployment: **Web app (Aplikasi Web)**.
8. Atur konfigurasi:
   - **Execute as (Jalankan sebagai)**: *Me (Akun Google Anda)*
   - **Who has access (Siapa yang memiliki akses)**: *Anyone (Siapa saja)* $\rightarrow$ **Wajib dipilih agar siswa dapat mengirim nilai tanpa kendala login**.
9. Klik **Deploy (Terapkan)** dan setujui izin otorisasi Google.
10. Salin **Web App URL** yang berakhiran `/exec`.
11. Buka website TTS, klik tombol **⚙️ Pengaturan Spreadsheet** (pada layar registrasi atau di menu atas), tempelkan URL tersebut, lalu klik **Simpan URL**.

---

## 📋 Daftar 20 Soal & Kunci Jawaban

### Kategori Mendatar
1. **BERITA** (6) - *Informasi mengenai suatu peristiwa yang disampaikan kepada masyarakat melalui media disebut ....* [Mudah]
2. **JUDUL** (5) - *Bagian teks berita yang terletak di bagian paling atas dan menggambarkan inti pemberitaan disebut ....* [Mudah]
3. **KAPAN** (5) - *Unsur berita yang digunakan untuk menanyakan waktu terjadinya suatu peristiwa adalah ....* [Mudah]
4. **SIAPA** (5) - *Unsur berita yang digunakan untuk menanyakan orang atau pihak yang terlibat dalam suatu peristiwa adalah ....* [Mudah]
5. **TERAS** (5) - *Bagian awal berita yang memuat inti informasi atau hal terpenting dari suatu peristiwa disebut .... berita.* [Sedang]
6. **JURNALIS** (8) - *Sebutan bagi orang yang mencari, mengolah, dan menyampaikan informasi berita kepada masyarakat adalah ....* [Sedang]
7. **FAKTUAL** (7) - *Sifat informasi berita yang didasarkan pada kenyataan dan fakta yang dapat diperiksa kebenarannya disebut ....* [Sedang]
8. **NARASUMBER** (10) - *Orang yang memberikan keterangan atau informasi kepada wartawan mengenai suatu peristiwa disebut ....* [Sedang]
9. **INOVASI** (7) - *Pembaruan berupa gagasan, metode, atau produk baru yang memberikan manfaat untuk menyelesaikan suatu masalah disebut ....* [Sulit]
10. **VERIFIKASI** (10) - *Proses memeriksa kebenaran dan ketepatan informasi sebelum berita dipublikasikan disebut ....* [Sulit]

### Kategori Menurun
11. **DIMANA** (6) - *Unsur berita yang digunakan untuk menanyakan tempat terjadinya suatu peristiwa adalah ....* [Mudah]
12. **MENGAPA** (7) - *Unsur berita yang digunakan untuk menanyakan alasan terjadinya suatu peristiwa adalah ....* [Mudah]
13. **BAGAIMANA** (9) - *Unsur berita yang digunakan untuk menanyakan proses atau cara terjadinya suatu peristiwa adalah ....* [Mudah]
14. **TUBUH** (5) - *Bagian struktur berita yang berisi penjelasan lebih terperinci mengenai peristiwa setelah teras berita disebut .... berita.* [Sedang]
15. **AKTUAL** (6) - *Sifat berita yang menekankan kebaruan suatu peristiwa dan relevansinya pada waktu pemberitaan disebut ....* [Sedang]
16. **OBJEKTIF** (8) - *Sifat penyajian berita yang tidak dipengaruhi oleh pendapat atau keberpihakan pribadi penulis disebut ....* [Sedang]
17. **KUTIPAN** (7) - *Bagian teks yang memuat perkataan seseorang yang dikutip sebagai bagian dari pemberitaan disebut ....* [Sedang]
18. **DATA** (4) - *Informasi berupa angka, hasil pengukuran, atau catatan pengamatan yang dapat digunakan sebagai bukti pendukung dalam berita inovasi disebut ....* [Sulit]
19. **PROTOTIPE** (9) - *Model awal suatu produk yang dibuat untuk menguji fungsi dan desain sebelum dikembangkan menjadi produk akhir disebut ....* [Sulit]
20. **HOAKS** (5) - *Informasi palsu atau menyesatkan yang disebarkan seolah-olah merupakan informasi benar disebut ....* [Sulit]
