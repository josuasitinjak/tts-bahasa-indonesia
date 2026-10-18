import json

ACROSS = [
    (1, "BERITA", "Informasi mengenai suatu peristiwa yang disampaikan kepada masyarakat melalui media disebut ....", "Mudah"),
    (2, "JUDUL", "Bagian teks berita yang terletak di bagian paling atas dan menggambarkan inti pemberitaan disebut ....", "Mudah"),
    (3, "KAPAN", "Unsur berita yang digunakan untuk menanyakan waktu terjadinya suatu peristiwa adalah ....", "Mudah"),
    (4, "SIAPA", "Unsur berita yang digunakan untuk menanyakan orang atau pihak yang terlibat dalam suatu peristiwa adalah ....", "Mudah"),
    (5, "TERAS", "Bagian awal berita yang memuat inti informasi atau hal terpenting dari suatu peristiwa disebut .... berita.", "Sedang"),
    (6, "JURNALIS", "Sebutan bagi orang yang mencari, mengolah, dan menyampaikan informasi berita kepada masyarakat adalah ....", "Sedang"),
    (7, "FAKTUAL", "Sifat informasi berita yang didasarkan pada kenyataan dan fakta yang dapat diperiksa kebenarannya disebut ....", "Sedang"),
    (8, "NARASUMBER", "Orang yang memberikan keterangan atau informasi kepada wartawan mengenai suatu peristiwa disebut ....", "Sedang"),
    (9, "INOVASI", "Pembaruan berupa gagasan, metode, atau produk baru yang memberikan manfaat untuk menyelesaikan suatu masalah disebut ....", "Sulit"),
    (10, "VERIFIKASI", "Proses memeriksa kebenaran dan ketepatan informasi sebelum berita dipublikasikan disebut ....", "Sulit"),
]

DOWN = [
    (11, "DIMANA", "Unsur berita yang digunakan untuk menanyakan tempat terjadinya suatu peristiwa adalah ....", "Mudah"),
    (12, "MENGAPA", "Unsur berita yang digunakan untuk menanyakan alasan terjadinya suatu peristiwa adalah ....", "Mudah"),
    (13, "BAGAIMANA", "Unsur berita yang digunakan untuk menanyakan proses atau cara terjadinya suatu peristiwa adalah ....", "Mudah"),
    (14, "TUBUH", "Bagian struktur berita yang berisi penjelasan lebih terperinci mengenai peristiwa setelah teras berita disebut .... berita.", "Sedang"),
    (15, "AKTUAL", "Sifat berita yang menekankan kebaruan suatu peristiwa dan relevansinya pada waktu pemberitaan disebut ....", "Sedang"),
    (16, "OBJEKTIF", "Sifat penyajian berita yang tidak dipengaruhi oleh pendapat atau keberpihakan pribadi penulis disebut ....", "Sedang"),
    (17, "KUTIPAN", "Bagian teks yang memuat perkataan seseorang yang dikutip sebagai bagian dari pemberitaan disebut ....", "Sedang"),
    (18, "DATA", "Informasi berupa angka, hasil pengukuran, atau catatan pengamatan yang dapat digunakan sebagai bukti pendukung dalam berita inovasi disebut ....", "Sulit"),
    (19, "PROTOTIPE", "Model awal suatu produk yang dibuat untuk menguji fungsi dan desain sebelum dikembangkan menjadi produk akhir disebut ....", "Sulit"),
    (20, "HOAKS", "Informasi palsu atau menyesatkan yang disebarkan seolah-olah merupakan informasi benar disebut ....", "Sulit"),
]

# Let's verify the placements obtained:
placements = {
    8: (4, 7, 'across'),
    16: (3, 14, 'down'),
    5: (8, 14, 'across'),
    11: (1, 10, 'down'),
    3: (6, 7, 'across'),
    12: (0, 8, 'down'),
    7: (10, 14, 'across'),
    19: (6, 9, 'down'),
    1: (12, 6, 'across'),
    13: (12, 6, 'down'),
    9: (16, 0, 'across'),
    18: (9, 19, 'down'),
    4: (20, 4, 'across'),
    20: (14, 4, 'down'),
    10: (6, 13, 'across'),
    15: (8, 17, 'down'),
    2: (13, 13, 'across'),
    17: (12, 14, 'down'),
    6: (17, 10, 'across'),
    14: (1, 12, 'down'),
}

height = 21
width = 23

grid = [['' for _ in range(width)] for _ in range(height)]
cell_data = {} # (r, c) -> {'letter': ..., 'across': num, 'down': num, 'number': int}

across_dict = {item[0]: item for item in ACROSS}
down_dict = {item[0]: item for item in DOWN}

for num, (r, c, d) in placements.items():
    if d == 'across':
        item = across_dict[num]
        word = item[1]
        for i, ch in enumerate(word):
            gr, gc = r, c + i
            if grid[gr][gc] != '' and grid[gr][gc] != ch:
                print(f"ERROR conflict at {gr},{gc}: {grid[gr][gc]} vs {ch}")
            grid[gr][gc] = ch
    else:
        item = down_dict[num]
        word = item[1]
        for i, ch in enumerate(word):
            gr, gc = r + i, c
            if grid[gr][gc] != '' and grid[gr][gc] != ch:
                print(f"ERROR conflict at {gr},{gc}: {grid[gr][gc]} vs {ch}")
            grid[gr][gc] = ch

# Check word starting cell numbers
start_numbers = {} # (r, c) -> [word_ids]
for num, (r, c, d) in placements.items():
    start_numbers.setdefault((r, c), []).append(num)

print("All intersections match perfectly! Start numbers count:", len(start_numbers))

# Generate clean JSON data for web app
questions_data = {
    "rows": height,
    "cols": width,
    "across": [],
    "down": []
}

for item in ACROSS:
    num, word, clue, level = item
    r, c, d = placements[num]
    questions_data["across"].append({
        "num": num,
        "row": r,
        "col": c,
        "length": len(word),
        "answer": word,
        "clue": clue,
        "level": level
    })

for item in DOWN:
    num, word, clue, level = item
    r, c, d = placements[num]
    questions_data["down"].append({
        "num": num,
        "row": r,
        "col": c,
        "length": len(word),
        "answer": word,
        "clue": clue,
        "level": level
    })

with open("tts_data.json", "w", encoding="utf-8") as f:
    json.dump(questions_data, f, indent=2, ensure_ascii=False)

print("Saved tts_data.json successfully!")
