// Data Soal dan Grid TTS Bahasa Indonesia Kelas XI
// SMA Negeri 1 Batam - XI HJ 5
// Materi: Teks Berita & Berita Inovasi

// Kunci jawaban diobfuskasi dengan ROT13+Base64.
// Decoding dilakukan runtime oleh engine pengujian — jangan edit manual.
const _k = (s) => {
  const b = atob(s);
  return b.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 77) return String.fromCharCode(code + 13);
    if (code >= 78 && code <= 90) return String.fromCharCode(code - 13);
    if (code >= 97 && code <= 109) return String.fromCharCode(code + 13);
    if (code >= 110 && code <= 122) return String.fromCharCode(code - 13);
    return c;
  }).join('');
};

const TTS_DATA = {
  rows: 21,
  cols: 23,
  across: [
    {
      num: 1,
      row: 12,
      col: 6,
      length: 6,
      answer: _k("T1JFVkdO"),
      clue: "Informasi mengenai suatu peristiwa yang disampaikan kepada masyarakat melalui media disebut ....",
      level: "Mudah"
    },
    {
      num: 2,
      row: 13,
      col: 13,
      length: 5,
      answer: _k("V0hRSFk="),
      clue: "Bagian teks berita yang terletak di bagian paling atas dan menggambarkan inti pemberitaan disebut ....",
      level: "Mudah"
    },
    {
      num: 3,
      row: 6,
      col: 7,
      length: 5,
      answer: _k("WE5DTkE="),
      clue: "Unsur berita yang digunakan untuk menanyakan waktu terjadinya suatu peristiwa adalah ....",
      level: "Mudah"
    },
    {
      num: 4,
      row: 20,
      col: 4,
      length: 5,
      answer: _k("RlZOQ04="),
      clue: "Unsur berita yang digunakan untuk menanyakan orang atau pihak yang terlibat dalam suatu peristiwa adalah ....",
      level: "Mudah"
    },
    {
      num: 5,
      row: 8,
      col: 14,
      length: 5,
      answer: _k("R1JFTkY="),
      clue: "Bagian awal berita yang memuat inti informasi atau hal terpenting dari suatu peristiwa disebut .... berita.",
      level: "Sedang"
    },
    {
      num: 6,
      row: 17,
      col: 10,
      length: 8,
      answer: _k("V0hFQU5ZVkY="),
      clue: "Sebutan bagi orang yang mencari, mengolah, dan menyampaikan informasi berita kepada masyarakat adalah ....",
      level: "Sedang"
    },
    {
      num: 7,
      row: 10,
      col: 14,
      length: 7,
      answer: _k("U05YR0hOWQ=="),
      clue: "Sifat informasi berita yang didasarkan pada kenyataan dan fakta yang dapat diperiksa kebenarannya disebut ....",
      level: "Sedang"
    },
    {
      num: 8,
      row: 4,
      col: 7,
      length: 10,
      answer: _k("QU5FTkZIWk9SRQ=="),
      clue: "Orang yang memberikan keterangan atau informasi kepada wartawan mengenai suatu peristiwa disebut ....",
      level: "Sedang"
    },
    {
      num: 9,
      row: 16,
      col: 0,
      length: 7,
      answer: _k("VkFCSU5GVg=="),
      clue: "Pembaruan berupa gagasan, metode, atau produk baru yang memberikan manfaat untuk menyelesaikan suatu masalah disebut ....",
      level: "Sulit"
    },
    {
      num: 10,
      row: 6,
      col: 13,
      length: 10,
      answer: _k("SVJFVlNWWE5GVg=="),
      clue: "Proses memeriksa kebenaran dan ketepatan informasi sebelum berita dipublikasikan disebut ....",
      level: "Sulit"
    }
  ],
  down: [
    {
      num: 11,
      row: 1,
      col: 10,
      length: 6,
      answer: _k("UVZaTkFO"),
      clue: "Unsur berita yang digunakan untuk menanyakan tempat terjadinya suatu peristiwa adalah ....",
      level: "Mudah"
    },
    {
      num: 12,
      row: 0,
      col: 8,
      length: 7,
      answer: _k("WlJBVE5DTg=="),
      clue: "Unsur berita yang digunakan untuk menanyakan alasan terjadinya suatu peristiwa adalah ....",
      level: "Mudah"
    },
    {
      num: 13,
      row: 12,
      col: 6,
      length: 9,
      answer: _k("T05UTlZaTkFO"),
      clue: "Unsur berita yang digunakan untuk menanyakan proses atau cara terjadinya suatu peristiwa adalah ....",
      level: "Mudah"
    },
    {
      num: 14,
      row: 1,
      col: 12,
      length: 5,
      answer: _k("R0hPSFU="),
      clue: "Bagian struktur berita yang berisi penjelasan lebih terperinci mengenai peristiwa setelah teras berita disebut .... berita.",
      level: "Sedang"
    },
    {
      num: 15,
      row: 8,
      col: 17,
      length: 6,
      answer: _k("TlhHSE5Z"),
      clue: "Sifat berita yang menekankan kebaruan suatu peristiwa dan relevansinya pada waktu pemberitaan disebut ....",
      level: "Sedang"
    },
    {
      num: 16,
      row: 3,
      col: 14,
      length: 8,
      answer: _k("Qk9XUlhHVlM="),
      clue: "Sifat penyajian berita yang tidak dipengaruhi oleh pendapat atau keberpihakan pribadi penulis disebut ....",
      level: "Sedang"
    },
    {
      num: 17,
      row: 12,
      col: 14,
      length: 7,
      answer: _k("WEhHVkNOQQ=="),
      clue: "Bagian teks yang memuat perkataan seseorang yang dikutip sebagai bagian dari pemberitaan disebut ....",
      level: "Sedang"
    },
    {
      num: 18,
      row: 9,
      col: 19,
      length: 4,
      answer: _k("UU5HTg=="),
      clue: "Informasi berupa angka, hasil pengukuran, atau catatan pengamatan yang dapat digunakan sebagai bukti pendukung dalam berita inovasi disebut ....",
      level: "Sulit"
    },
    {
      num: 19,
      row: 6,
      col: 9,
      length: 9,
      answer: _k("Q1JCR0JHVkNS"),
      clue: "Model awal suatu produk yang dibuat untuk menguji fungsi dan desain sebelum dikembangkan menjadi produk akhir disebut ....",
      level: "Sulit"
    },
    {
      num: 20,
      row: 14,
      col: 4,
      length: 5,
      answer: _k("VUJOWEY="),
      clue: "Informasi palsu atau menyesatkan yang disebarkan seolah-olah merupakan informasi benar disebut ....",
      level: "Sulit"
    }
  ]
};
