/**
 * GOOGLE APPS SCRIPT - TTS BAHASA INDONESIA REKAP NILAI
 * 
 * CARA PEMASANGAN DI GOOGLE SHEETS:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Beri nama file Spreadsheet, contoh: "Rekap Nilai TTS B. Indo - Kelompok 4"
 * 3. Klik menu: Ekstensi (Extensions) > Apps Script
 * 4. Hapus seluruh isi kode lama, lalu tempel (paste) seluruh kode script ini.
 * 5. Klik icon Disket (Simpan).
 * 6. Klik tombol "Deploy" (Terapkan) berwarna biru di kanan atas > "Penerapan baru" (New deployment).
 * 7. Pada icon Gerigi "Pilih jenis" > pilih "Aplikasi Web" (Web app).
 * 8. Konfigurasi Deployment:
 *    - Deskripsi: Rekap Nilai TTS
 *    - Jalankan sebagai (Execute as): "Saya" (Me - akun Google Anda)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> PENTING agar siswa bisa kirim nilai tanpa login.
 * 9. Klik "Terapkan" (Deploy). Berikan izin otorisasi akses Google Spreadsheet.
 * 10. Salin URL Aplikasi Web (Web App URL) yang berakhiran `/exec`.
 * 11. Masukkan URL tersebut pada tombol "Pengaturan Spreadsheet" di web aplikasi TTS!
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Endpoint Google Apps Script TTS Bahasa Indonesia Siap Menerima Data."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Siapkan Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Waktu Submit",
        "Nama Peserta",
        "No. Absen",
        "Kelompok",
        "Skor Murni (100)",
        "Penalti Pelanggaran",
        "Skor Akhir",
        "Status KKM (75)",
        "Durasi Pengerjaan",
        "Jumlah Pelanggaran",
        "Log Kejadian / Pelanggaran",
        "Jawaban Benar / Salah",
        "Detail Jawaban Lengkap (JSON)"
      ];
      sheet.appendRow(headers);
      
      // Styling header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var timestamp = new Date();
    var nama = data.nama || "-";
    var absen = data.absen || "-";
    var kelompok = data.kelompok || "-";
    var skorMurni = Number(data.skor_murni) || 0;
    var penalti = Number(data.penalti) || 0;
    var skorAkhir = Number(data.skor_akhir) || 0;
    var statusKKM = skorAkhir >= 75 ? "TUNTAS" : "BELUM TUNTAS";
    var durasi = data.durasi || "-";
    var pelanggaran = Number(data.jumlah_pelanggaran) || 0;
    var logPelanggaran = data.log_pelanggaran || "Tidak ada pelanggaran";
    var ringkasanJawaban = data.ringkasan_jawaban || "-";
    var detailJson = typeof data.detail_jawaban === "object" ? JSON.stringify(data.detail_jawaban) : (data.detail_jawaban || "-");

    sheet.appendRow([
      timestamp,
      nama,
      absen,
      kelompok,
      skorMurni,
      penalti,
      skorAkhir,
      statusKKM,
      durasi,
      pelanggaran,
      logPelanggaran,
      ringkasanJawaban,
      detailJson
    ]);

    // Format waktu
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      row: lastRow,
      message: "Data nilai berhasil direkap ke Google Spreadsheet!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
