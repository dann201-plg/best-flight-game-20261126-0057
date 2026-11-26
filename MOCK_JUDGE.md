# Mock Judge v1 — Langit Nusantara (best-flight-game-20261126-0057)

**Tanggal run:** 26 Nov 2026, ~16:12–16:30 WIB.
**Mengapa run ini:** entri ini belum pernah diadu lawan apa pun — hanya lolos cek kit. Mock judge ini menguji apakah game ini menang pairwise sebelum R1 (cutoff hari ini 19:57 WIB), bukan sekadar valid.

## Status tunggu — TERJAWAB SELAMA RUN

Perintah tugas: jangan nilai screenshot lama bila perbaikan gear/barrel roll di main chat masih jalan. Yang terjadi selama run ini:

- 16:06–16:09 WIB: working tree masih kotor (revisi 3 belum commit).
- **16:12 WIB: revisi 3 di-commit sebagai `0cde5ef` "Fix gear + barrel-roll glitches (bugfix rev 3)", tree bersih.** Screenshot di disk adalah render ulang pasca-perbaikan — ukurannya persis sama dengan catatan verifikasi di `PLAN.md` (1-cover 72.345 B, 2-start 63.230 B, 3-bank 72.210 B, 4-landing 59.952 B). Verifikasi revisi 3 per `PLAN.md`: harness `/tmp/test-bugfix.js` 13/13 (G1–G4, R1–R6), regresi aerobatics 19/19, `node --check` lolos 8 file, `main.ts` 2x byte-identical, dossier 466.211 byte.
- **Jadi mock judge ini menilai versi pasca-perbaikan yang sudah di-commit (`0cde5ef`), bukan screenshot lama.** Yang masih tertunda di main chat saat run ini: kit check pasca-rev-3 ("menyusul" di `PLAN.md`) + re-bundle + commit/persetujuan user — ketiganya TIDAK mengubah screenshot, jadi tidak menghalangi mock judge. Bila main chat me-render ulang screenshot lagi setelah run ini, mock judge ini kedaluwarsa dan harus diulang.

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter (superbot). Di VM ini TIDAK ADA `GLM_API_KEY` / `OPENROUTER_API_KEY`, Hermes juga belum punya API key — jadi GLM asli TIDAK bisa dipanggil. Mock judge v1 ini dijalankan oleh model yang tersedia di sini (Muse Spark) sebagai **stand-in**, dengan prompt + kriteria + format juri asli yang persis. Jangan klaim run ini sebagai hasil GLM.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang.
- **Yang dinilai:** contact sheet 4 screenshot (`1-cover` chase 115 kts/460 ft/HDG 270° ring 0,4 km; `2-start` parkir di runway gear turun; `3-bank` mid-roll 122 kts/613 ft/HDG 276° ring 1,5 km; `4-landing` FINAL runway 36, 78 kts/80 ft, gear turun) + outline source (8 file `game/src/`: aircraft, flight, game, hud, rng, sky, sound, terrain — 2.564 baris; Three.js r147 di `vendor/`). Saya membaca screenshot full-size 1280×800; juri asli membaca contact sheet yang di-downscale (cover besar di atas, 3 kecil di bawah, ≤1536 token/entry) — keterbacaan di juri asli bisa lebih buruk, terutama shot 3.

## Lawan yang tersedia — CELAH v1

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect: balok merah, koin emas, paddle biru, score/level/lives). Jadi v1 hanya bisa mengadu lawan starter + versi sebelumnya. Kekalahan dari anchor 3/4 tidak bisa diuji di sini.
- **Blind rounds:** tidak ada yang dinilai saat submit; R1 menilai semua entry yang diterima sebelum cutoff **26 Nov 19:57 WIB** (`2026-11-26T12:57:00Z`) dan gradenya selesai saat judging mulai (cutoff atau 15 menit sesudahnya, mana dulu). Entry yang gradenya telat tidak ada hasil di R1 dan baru dinilai di R2.

## Hasil

### Game 1 — Langit Nusantara rev3 (`0cde5ef`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (LN) |
|------|--------|--------|----------|--------|----------------|
| 1 | LN rev3 | starter | LN (A) | 5 | 1,0 |
| 2 | starter | LN rev3 | LN (B) | 5 | 1,0 |
| **Game** | | | **LN MENANG** | | **1,0** |

Per kriteria: **C1** beda luar biasa — LN: chase view di atas terrain dikenali (pantai, gunung berapi, sawah, runway), pesawat twin-prop dengan instrumen menyala, ring di depan, runway 36, altitude/speed/heading di HUD di keempat shot; starter: tidak ada pesawat, terrain, runway, atau HUD sama sekali (balok 2D). **C2** beda besar — 3 leg, 5 ring/leg, fuel, landing vs satu mekanik dodge. **C3** beda besar — chase cam mengikuti roll, attitude indicator inverted benar vs layar datar. **C4** beda besar — satu gaya golden-hour, pesawat berlivery "Merpati Nusantara" vs persegi warna. **C5** beda besar — 8 file bernama sesuai job vs starter seadanya.

Reason call 1 (≤600 karakter): "Not a contest on criterion 1: one entry is a complete 3D flight game — chase view over recognisable coast and volcano, lit attitude/airspeed/altitude/heading, target ring ahead, runway 36 on final with gear down — the other is a 2D block dodger with no aircraft, terrain, runway or instruments at all. Three legs, rings and fuel beat one dodge mechanic, and the original Nusantara livery beats coloured rectangles. Winner: A, margin 5."

Reason call 2 (≤600 karakter): "Slots swapped, same verdict: the flight game wins on the first criterion alone, overwhelmingly. Its four screenshots each show a playable flight game with instruments lit and a mission in progress; the starter shows a paddle dodging red blocks. Depth, feel and look all follow the same way. Winner: B, margin 5."

### Game 2 — Langit Nusantara rev3 (`0cde5ef`) vs pra-360° (`bf948d0`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (rev3) |
|------|--------|--------|----------|--------|------------------|
| 1 | rev3 | pra-360 | rev3 (A) | 2 | 0,7 |
| 2 | pra-360 | rev3 | rev3 (B) | 2 | 0,7 |
| **Game** | | | **rev3 MENANG** | | **0,7** |

Per kriteria: **C1** seri — scene cover & landing identik (nilai HUD sama persis); shot bank rev3 terrain-nya lebih abstrak (pita diagonal + moiré laut) dibanding pra-360 yang gunung berapinya terbaca jelas, tapi landing rev3 menampilkan gear turun yang diperbaiki. **C2** rev3 menang — full 360° roll + loop kelihatan di shot 3 (attitude inverted, dunia miring ~125°) vs pra-360 hanya bank sedang (~45–60°). **C3** rev3 unggul tipis — HUD attitude inverted-benar + kamera diperkaku saat manoeuvre. **C4/C5** seri (gaya & struktur sama).

Reason call 1 (≤600 karakter): "Same game, one real difference: the aerobatics. Rev3's bank shot proves a full 360 roll — inverted attitude indicator, world tilted past vertical — while the older shot shows only a moderate bank over the volcano. The older bank shot reads its terrain better, and cover and landing are identical, so this is not a blowout. But a roll you can see beats a roll you cannot. Winner: A, margin 2."

Reason call 2 (≤600 karakter): "Slots swapped, same verdict: the newer version wins on depth and feel. Its mid-roll frame shows the aircraft inverted with the attitude indicator agreeing, which the older version never shows; the older frame's volcano reads cleaner, so the margin stays small. Cover, start and landing are unchanged between them. Winner: B, margin 2."

## Kriteria 1 — apa yang masih bisa kalah lawan lapangan (bukan lawan starter)

1. **Shot 3 (bank) paling tidak terbaca di ukuran contact sheet.** Terrain jadi pita diagonal abstrak, laut menampilkan pola moiré/garis, ring kecil (1,5 km), pesawat kecil di frame. Ini shot paling dramatis sekaligus paling susah dibaca sekilas — lawan anchor 4-strong yang setiap shot-nya langsung terbaca bisa menang di C1 dari shot ini saja.
2. **Shot 1: gunung berapi abu-abu polos, runway hanya di tepi kiri.** Cover tetap kuat (chase view + ring + HUD lengkap), tapi gunung tanpa vegetasi dan runway yang terpotong mengurangi "recognisable terrain".
3. **Shot 2: pesawat parkir terlihat tinggi di atas gear jenjang, bayangan besar, scene runway + bukit hijau yang kosong.** Gear turun terlihat jelas (bagus pasca-perbaikan), tapi frame-nya sepi dibanding shot lain.
4. Tidak ada yang kalah di C1 lawan starter — catatan di atas adalah risiko lawan anchor 3/4 yang belum bisa diuji.

## Keputusan

**LAYAK SUBMIT R1 (cutoff 26 Nov 19:57 WIB) — mock judge PASS 2-0 (margin 5 lawan starter, margin 2 lawan pra-360°).** Perbaikan gear terverifikasi visual di shot 4 (gear turun jelas di bawah fuselage saat final) dan oleh harness 13/13 + regresi 19/19.

**TAPI submit masih diblokir 3 hal yang BUKAN urusan mock judge — jangan submit sebelum ketiganya beres:**
1. **Kit check pasca-rev-3** — di `PLAN.md` masih "menyusul"; harus lolos.
2. **Re-bundle dengan SEMUA sesi** — `thinking_reproduces` gagal di 296f5c1 (48,4% unwritten, batas 40%) karena bundle lama tidak berisi sesi aerobatics; re-bundle wajib mencakup semua sesi termasuk sesi revisi 3, kalau tidak entry TIDAK lolos gate.
3. **"Yes" user di main chat** — `PLAN.md` menulis STOP: jangan submit tanpa persetujuan user setelah ia memainkan gamenya.

**Jadwal R1:** submit sebelum 19:57 WIB hari ini dan grade harus selesai saat judging mulai (~19:57–20:12 WIB) supaya masuk R1; grade yang telat tergelincir ke R2. Deadline final bounty 28 Nov 07:57 WIB.

## Yang dibutuhkan untuk GLM asli

`GLM_API_KEY` atau `OPENROUTER_API_KEY` dari user via secure vault (bukan di chat/file). Setelah ada, ganti model stand-in dengan `z-ai/glm-5.3-flash` via OpenRouter — prompt, kriteria, format, dan lawan tetap sama; ulangi kedua game ini dan bandingkan verdictnya dengan mock v1 ini sebagai kalibrasi. Anchor 3/4 + rung baru bisa diuji setelah final kit terbit (pasca-28 Nov) — saat itu ulangi mock lawan anchor 4-strong sebelum menilai peluang final.
