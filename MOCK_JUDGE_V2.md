# Mock Judge v2 — Langit Nusantara v2 (best-flight-game-20261126-0057)

**Tanggal run:** 27 Nov 2026, ~00:45 WIB.
**Mengapa run ini:** v2 baru selesai dibangun dan shot kokpitnya baru diperbaiki — sebelum submit ke R2, entri ini harus diadu pairwise seperti juri asli, bukan sekadar lolos cek, karena mock judge v1 dulu yang membuktikan rev3 menang 1,0 lawan starter dan 0,7 lawan pra-360°, dan keputusan submit v2 bergantung pada verdict ini.

## Versi yang dinilai

- **Commit `fd53c18`** ("Cockpit shot fix: seat back over cabin roof so nose+props read, 9-gauge lit panel, closer final"), HEAD saat run ini. Dibangun di atas `dbc284c` (v2: cockpit view, 6-mission dispatch board, landing debrief).
- **Screenshot v2** (semua 1280×800, dilihat full-size DAN sebagai contact sheet): `1-cover.jpg` 73.850 B (chase, 115 kts/460 ft/HDG 270°, ring 0,4 km, MISI POS MERPATI 1/6), `2-cockpit.jpg` 73.859 B (kokpit final RWY 36, 82 kts/89 ft/−168 FPM, 1040 RPM, THR 40%, FUEL 54%, GEAR DOWN), `3-dispatch.jpg` 99.144 B (dispatch board 6 misi + peta kepulauan, SKOR PILOT 1250, 2/6 MEDALI), `4-debrief.jpg` 67.128 B (debrief ANGIN SAMPING, grade S, GREASED LANDING, sink 0,8 m/s · 157 FPM, centerline 1,0 m, grafik trace vs ideal 3°).
- **Contact sheet** dibangun meniru judge view asli (cover 768×480 di atas, 3 kecil di bawah, total 768×640) dan dicek juga di lebar ~320 px — keterbacaan di ukuran kecil itu yang dinilai juri asli.
- **Outline source:** 12 file `game/src/`, 3.459 baris (v1: 8 file, 2.564 baris): aircraft (`buildAircraft`, `makeWingGeometry`, `makeLiveryTexture`), cockpit (`createCockpit`), debrief (`createDebrief`, `gradeCaption`), dispatch (`createDispatch`), flight (`createFlightModel`, `updateFlightModel`, `gradeLandingMetrics`), game (`buildLegRings`, `startLeg`, `showBrief`, `showDispatch`, `showDebrief`, `debriefForLanding`, `updateCamera`, `stageShot`, `initGame`), hud (`createHud`), missions (`medalForGrade`, `createPilotProgress`), rng, sky, sound, terrain (`createTerrain`, `createAirfield`, `createTownAndTrees`). Dinilai dari daftar deklarasi saja, bukan isi penuh.

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter. Di VM ini TIDAK ADA `GLM_API_KEY` / `OPENROUTER_API_KEY`, Hermes juga belum punya API key — jadi GLM asli TIDAK bisa dipanggil. Mock judge v2 ini dijalankan oleh model yang tersedia di sini (Muse Spark) sebagai **stand-in**, dengan prompt + kriteria + format juri asli yang persis. Jangan klaim run ini sebagai hasil GLM.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang.
- **Yang dinilai:** contact sheet 4 screenshot + outline source (seperti judge view asli, ≤1536 token/entry). Saya membaca screenshot full-size 1280×800 DAN contact sheet yang dibangun ulang; keterbacaan di contact sheet dicatat terpisah di bawah.

## Lawan yang tersedia — CELAH v2

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect: balok merah, koin emas, paddle biru, score/level/lives — shot 2-play: Score 145, Level 3, Lives 3). Jadi v2 hanya bisa mengadu lawan starter + v1. Kekalahan dari anchor 3/4 tidak bisa diuji di sini.
- **v1 rev3 (`0cde5ef`)** diambil dari git history (`git show 0cde5ef:screenshots/...`): 1-cover (identik dengan cover v2 kecuali label misi), 2-start (parkir di runway, gear turun), 3-bank (mid-roll ~125°, attitude inverted), 4-landing (FINAL runway 36, 78 kts/80 ft, gear turun, RINGS 5/5 LEG 1/3).
- **Blind rounds:** R1 sudah dinilai (6.258 ranked) tapi v1 belum ada hasil (grading antre); R2 cutoff 27 Nov 07:57 WIB. Tidak ada skor asli yang bisa dipakai kalibrasi di run ini.

## Hasil

### Game 1 — Langit Nusantara v2 (`fd53c18`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (v2) |
|------|--------|--------|----------|--------|----------------|
| 1 | v2 | starter | v2 (A) | 5 | 1,0 |
| 2 | starter | v2 | v2 (B) | 5 | 1,0 |
| **Game** | | | **v2 MENANG** | | **1,0** |

Per kriteria: **C1** beda luar biasa — v2: chase + kokpit di atas terrain dikenali (pantai, gunung berapi, sawah, runway 36), pesawat twin-prop dengan 9 gauge menyala, ring di depan, altitude/speed/heading di HUD di semua shot terbang; starter: tidak ada pesawat, terrain, runway, atau instrumen sama sekali (balok 2D). **C2** beda besar — 6 misi bernama dengan tujuan, angin, fuel, dan waktu berbeda + medali + grade pendaratan vs satu mekanik dodge. **C3** beda besar — dua kamera (chase + kokpit), debrief grade S dengan grafik trace vs layar datar. **C4** beda besar — satu gaya golden-hour, pesawat berlivery "Merpati Nusantara" vs persegi warna. **C5** beda besar — 12 file bernama sesuai job (`cockpit.js`, `dispatch.js`, `debrief.js`, `missions.js`) vs starter seadanya.

Reason call 1 (447 karakter): "Not a contest on criterion 1: one entry is a complete 3D flight game — chase and cockpit views over recognisable coast and volcano, nine lit gauges, target ring ahead, runway 36 on final, altitude/speed/heading on the HUD, plus a six-mission dispatch board and a graded landing debrief — the other is a 2D block dodger with no aircraft, terrain, runway or instruments at all. Missions, fuel and grades beat one dodge mechanic. Winner: A, margin 5."

Reason call 2 (382 karakter): "Slots swapped, same verdict: the flight game wins on the first criterion alone, overwhelmingly. Its four screenshots each show a different system of a playable flight game — chase, cockpit, dispatch, debrief — with instruments lit and a mission in progress; the starter shows a paddle dodging red blocks. Depth, feel, look and structure all follow the same way. Winner: B, margin 5."

### Game 2 — Langit Nusantara v2 (`fd53c18`) vs v1 rev3 (`0cde5ef`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (v2) |
|------|--------|--------|----------|--------|----------------|
| 1 | v2 | v1 rev3 | v2 (A) | 2 | 0,7 |
| 2 | v1 rev3 | v2 | v2 (B) | 2 | 0,7 |
| **Game** | | | **v2 MENANG** | | **0,7** |

Per kriteria: **C1** v2 menang — v1 4 shot semuanya chase-view terbang (cover, parkir, bank, landing); v2 menambah kokpit view sungguhan dengan 9 gauge menyala di final (elemen C1 yang eksplisit: "a cockpit or chase view... instruments lit") dan tetap membuktikan landing lewat shot kokpit itu (82 kts, 89 ft, GEAR DOWN, RWY 36 di depan). Cover identik, jadi bukan blowout. **C2** v2 menang — 6 misi bernama dengan tujuan/angin/fuel/waktu berbeda + medali + grade vs 3 leg ring-run + fuel; TAPI shot bank v1 membuktikan roll 360° yang tidak pernah terlihat di set v2 (lihat kelemahan 3). **C3** v2 unggul tipis — debrief membuktikan landing/crash terbaca (grade S, sink rate, trace) yang tidak dimiliki v1; shot bank v1 membuktikan kamera mengikuti roll. **C4** seri — gaya, pesawat, dan terrain sama; cover identik. **C5** v2 unggul tipis — 12 file vs 8, dengan `cockpit.js`, `dispatch.js`, `debrief.js`, `missions.js` masing-masing satu job jelas.

Reason call 1 (476 karakter): "Same game, three real differences: a true cockpit view with nine lit gauges on final, a six-mission dispatch board with distinct goals, wind and fuel, and a graded landing debrief with an approach trace — the older version shows only chase-view flying, parked, banked and landing. The older bank shot proves the 360 roll, which the new set never shows, and the cover is identical, so this is not a blowout. But systems you can see beat systems you cannot. Winner: A, margin 2."

Reason call 2 (333 karakter): "Slots swapped, same verdict: the newer version wins on depth and completeness. Its cockpit final, mission board and grade-S debrief prove a cockpit, six different missions and readable landings, which the older version never shows; the older frame's mid-roll aerobatics and identical cover keep the margin small. Winner: B, margin 2."

## Keterbacaan contact sheet (yang dilihat juri asli)

- **Cover:** terbaca penuh di 768 px maupun ~320 px — pesawat, gunung berapi, laut, ring 0,4 km, HUD 115/460, attitude indicator semua terbaca.
- **Kokpit (kecil):** terbaca sebagai shot kokpit — runway di depan, hidung putih + prop, strip gauge gelap di bawah; angka gauge (82, 89, −168, 1040, 54%) masih terbaca sebagai digit kecil. Kompas atas terbaca.
- **Dispatch (kecil):** judul "DISPATCH BOARD" terbaca, struktur daftar misi + peta rute hijau terbaca; teks detail tiap misi tidak terbaca — tapi bentuknya jelas sebuah mission board.
- **Debrief (kecil):** huruf "S" emas besar + judul "ANGIN SAMPING" terbaca, panel grafik + dua tombol hijau terbaca sebagai layar hasil.
- **Kesimpulan:** keempat shot kecil tetap bisa dibedakan sebagai 4 sistem berbeda — ini perbaikan utama v2 atas v1, yang 3 shot kecilnya adalah 3 variasi adegan terbang yang sama. Di lebar ~320 px tidak ada shot yang runtuh jadi abstrak.

## Kriteria 1 — apa yang masih bisa kalah lawan anchor 3/4 (tidak bisa diuji)

1. **Cover tidak berubah dari v1.** Gunung berapi abu-abu polos tanpa vegetasi, runway hanya di tepi kiri, ring kecil (label 0,4 km nyaris tak terbaca). Cover anchor 4-strong yang setiap elemennya langsung terbaca bisa menang C1 dari cover saja.
2. **Shot kokpit: hidung putih mendominasi.** Lebih dari separuh frame adalah fuselage putih terang + langit pucat; runway tampil sebagai strip tipis dan prop terbaca sebagai tongkat gelap. YOKE hanya berupa gauge DOM, bukan yoke 3D; silau matahari mengaburkan kiri atas. Kokpit rival dengan panel lebih penuh + runway lebih jelas bisa terbaca lebih baik.
3. **Aerobatik 360° kini tidak terlihat.** Set v2 tidak punya satu pun shot roll/loop — pembeda v1 (shot bank mid-roll, attitude inverted) hilang dari judge view, dan outline source tidak menyebut fungsi roll/loop secara eksplisit (`updateFlightModel` saja). Lawan anchor 4 yang menampilkan aerobatik + kokpit + misi sekaligus bisa mengambil C2/C3 dari sini.
4. **Dispatch & debrief: teks kecil tidak terbaca di contact sheet.** Detail tiap misi (angin, fuel, waktu) dan label sumbu grafik ("DITERBANGKAN" menumpuk garis flown) hanya terbaca full-size; di ukuran juri hanya bentuknya yang terbukti. Peta dispatch juga abstrak (blob hijau), bukan peta yang terbaca sebagai kepulauan.
5. **Tidak ada variasi cuaca.** Keempat shot golden-hour tenang; lapangan (Kabut Suar, Soundward, Garuda M4) menunjukkan kabut malam, badai hujan, dan senja. Satu shot cuaca buruk akan membuktikan lebih banyak.
6. **Tidak ada musuh/boss.** Bukan kelemahan C1, tapi di C2: lapangan punya dogfight (DECK ZERO) dan boss (Bold Plinth). v2 mengandalkan misi + grade saja — cukup lawan starter dan v1, belum tentu lawan anchor 4 yang punya keduanya.

## Keputusan

**LAYAK SUBMIT R2 (cutoff 27 Nov 07:57 WIB) — mock judge PASS 2-0 (margin 5 lawan starter, margin 2 lawan v1 rev3).** Set screenshot v2 terbukti lebih lengkap di mata juri: 4 sistem berbeda yang masing-masing terbaca di contact sheet, lawan 4 variasi adegan terbang yang sama di v1. Kelemahan yang tersisa (cover lama, aerobatik tak terlihat, teks kecil di board/debrief, tanpa variasi cuaca) adalah polish, bukan kegagalan kriteria — tidak ada satu pun yang layak menahan submit R2, mengingat grading harus selesai sebelum cutoff dan v1 tetap bisa dipilih balik (`makefun final`) bila v2 bermasalah.

**Di luar cakupan run ini (bukan urusan mock judge — jangan submit sebelum ketiganya beres):**
1. **Kit check pasca-v2** — harus 0 failed.
2. **Re-bundle dengan SEMUA sesi** — termasuk sesi build v2 + sesi mock judge ini, supaya `thinking_reproduces` menghitung baris v2 sebagai authored.
3. **"Yes" user di main chat** — submit tetap butuh persetujuan user.

**Jadwal R2:** submit + grading harus selesai sebelum 27 Nov 07:57 WIB supaya dinilai di R2; grade yang telat tergelincir ke R3 (cutoff 27 Nov 19:57 WIB). Deadline final bounty 28 Nov 07:57 WIB.

## Yang dibutuhkan untuk GLM asli

`GLM_API_KEY` atau `OPENROUTER_API_KEY` dari user via secure vault (bukan di chat/file). Setelah ada, ganti model stand-in dengan `z-ai/glm-5.3-flash` via OpenRouter — prompt, kriteria, format, dan lawan tetap sama; ulangi kedua game ini dan bandingkan verdictnya dengan mock v2 ini sebagai kalibrasi. Anchor 3/4 + rung baru bisa diuji setelah final kit terbit (pasca-28 Nov) — saat itu ulangi mock lawan anchor 4-strong sebelum menilai peluang final.
