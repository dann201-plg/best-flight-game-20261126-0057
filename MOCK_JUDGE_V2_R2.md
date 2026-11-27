# Mock Judge v2 + Realism Round 2 — Langit Nusantara v2-r2 (best-flight-game-20261126-0057)

**Tanggal run:** 27 Nov 2026, ~02:17 WIB.
**Mengapa run ini:** round 2 mengubah hal yang tekstur tidak bisa perbaiki — pesawat prosedural detail (winglet biru, cheatline, panel lines), interior kokpit (glareshield + A-pilar, hidung putih kini tinggal busur kecil), terrain atlas + geometri, dan cover bank ~22° sehingga roll terbaca; sebelum submit ke R2, entri yang berubah ini harus diadu pairwise seperti juri asli lagi, karena keputusan submit bergantung pada apakah round 2 akhirnya menggerakkan skor yang stagnan di 0,8.

## Versi yang dinilai

- **Commit `ebc0db4`** ("Realism Round 2: detailed procedural King Air, cockpit interior, terrain atlas + geometry, banked cover"), HEAD saat run ini. Dibangun di atas `7a39a82` (mock judge CC0) / `105e772` (aset CC0).
- **Yang berubah di round 2 (dari `git show --stat ebc0db4`, 14 file, +1004/−49):** BARU `game/src/interior.js` (65 baris, `createCockpitInterior`), `game/assets/ground_atlas_2k.jpg` (1.672.215 B), `game/assets/aerial_asphalt_01_diff_1k.jpg` (635.143 B), `game/assets/NOTICE.md` (+64 baris); EDIT `game/src/aircraft.js` (+71), `game/src/terrain.js` (+91), `game/src/assets.js` (+56), `game/src/game.js` (+44), `game/index.html` (+1). Total source kini 4.194 baris (CC0: 3.810, +384); `game/` total 4,35 MB — jauh di bawah batas 48 MB.
- **Screenshot R2** (semua 1280×800, dilihat full-size DAN sebagai contact sheet gaya juri — cover 768×480 di atas, 3 kecil di bawah — + dicek di lebar ~320 px): `1-cover.jpg` 129.515 B (chase BANK ~22°: horizon miring, runway diagonal, ring 0,4 km, MISI POS MERPATI 1/6, pesawat dengan winglet biru + cheatline, gunung bervegetasi + pantai + laut, terrain depan bergrain), `2-cockpit.jpg` 119.083 B (kokpit final RWY 36 dengan INTERIOR BARU: glareshield gelap + A-pilar kiri-kanan membingkai windshield, hidung putih tinggal busur kecil di tengah bawah, prop-disc ujung kuning di tepi, 82 kts/89 ft/−168 FPM, 1040 RPM, THR 40%, FUEL 54%, GEAR DOWN), `3-dispatch.jpg` 117.019 B (TIDAK BERUBAH: dispatch board 6 misi + PETA HIDROGRAFI), `4-debrief.jpg` 67.128 B (TIDAK BERUBAH: ANGIN SAMPING, grade S, sink 0,8 m/s, centerline 1,0 m, grafik trace vs ideal 3°).
- **Outline source:** 14 file `game/src/`, 4.194 baris: aircraft (`makeLiveryTexture`, `makeWingGeometry`, `buildAircraft`), assets (`_loadTexture`, `loadGameAssets`), cockpit (`createCockpit`), debrief (`createDebrief`, `gradeCaption`), dispatch (`createDispatch`), flight (`ROLL_RATE`, `LOOP_RATE`, `createFlightModel`, `updateFlightModel`, `gradeLandingMetrics`), game (`buildLegRings`, `startLeg`, `showBrief`, `showDispatch`, `showDebrief`, `debriefForLanding`, `updateCamera`, `stageShot`, `initGame`), hud (`createHud`), interior (`createCockpitInterior`) — BARU, missions (`medalForGrade`, `createPilotProgress`), rng (`fbm2`, `valueNoise2`), sky (`makeCloudTexture`, `makeGlowTexture`, `makeSkyDome`, `createSky`), sound, terrain (`biomeColor`, `createTerrain`, `makeWaterNormalMap`, `createWater`, `buildRibbon`, `createRiverAndRoads`, `createTownAndTrees`, `makeRunwayTexture`, `createAirfield`). Dinilai dari daftar deklarasi saja, bukan isi penuh. Laporan builder round 2 TIDAK dibaca sebagai bukti; yang dinilai artefak saja.

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter. Di VM ini TIDAK ADA `GLM_API_KEY` / `OPENROUTER_API_KEY` — jadi GLM asli TIDAK bisa dipanggil. Mock judge ini dijalankan oleh model yang tersedia di sini (Muse Spark) sebagai **stand-in**, dengan prompt + kriteria + format juri asli yang persis. Jangan klaim run ini sebagai hasil GLM.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang.
- **Yang dinilai:** contact sheet 4 screenshot + outline source (seperti judge view asli, ≤1536 token/entry). Contact sheet dibangun ulang meniru judge view (cover 768×480 di atas, 3 kecil di bawah) dan dicek juga di lebar ~320 px.

## Lawan yang tersedia — CELAH

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect — dilihat langsung: paddle biru + balok merah di layar gelap, Score/Lives/Level). Jadi versi R2 hanya bisa mengadu lawan starter + v1. Kekalahan dari anchor 3/4 tidak bisa diuji di sini.
- **v1 rev3 (`0cde5ef`)** diambil dari git history (`git show 0cde5ef:screenshots/...`) dan dilihat langsung: 1-cover (komposisi sama dengan cover R2 tapi level, gunung abu-abu polos tanpa vegetasi, terrain datar, laut strip tipis), 2-start (parkir di runway), 3-bank (mid-roll ~125°, attitude inverted — membuktikan roll 360°, tapi terrain-nya bentuk pasir/laut abstrak yang sulit dibaca), 4-landing (FINAL runway 36, 78 kts/80 ft, RINGS 5/5 LEG 1/3).

## Systems inventory + screenshot diversity (hard rule dari skill)

- **4 screenshot = 4 sistem berbeda: PASS.** (1) chase gameplay ring-run banked, (2) kokpit final dengan interior, (3) dispatch board 6 misi + peta hidrografi, (4) debrief grade S + grafik trace.
- **Systems inventory: PASS.** Core loop (terbang ring-run + landing) + meta: 6 misi bernama dengan tujuan/angin/fuel/waktu berbeda, medali EMAS/PERAK, fuel sebagai keputusan, grade debrief S/A/B/C, dua kamera (chase/kokpit), progress pilot + skor. Bukan variasi konten dalam satu sistem.

## Hasil

### Game 1 — Langit Nusantara v2-r2 (`ebc0db4`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (R2) |
|------|--------|--------|----------|--------|-----------------|
| 1 | R2 | starter | R2 (A) | 5 | 1,0 |
| 2 | starter | R2 | R2 (B) | 5 | 1,0 |
| **Game** | | | **R2 MENANG** | | **1,0** |

Per kriteria: **C1** beda luar biasa — R2: chase banked + kokpit berbingkai di atas terrain dikenali (pantai, gunung berapi bervegetasi, runway 36), pesawat twin-prop detail dengan 9 gauge kuningan menyala, ring di depan, altitude/speed/heading di HUD; starter: tidak ada pesawat, terrain, runway, atau instrumen sama sekali. **C2** beda besar — 6 misi bernama + medali + grade vs satu mekanik dodge. **C3** beda besar — dua kamera + interior + debrief grade S dengan grafik trace vs layar datar. **C4** beda besar — terrain bertekstur + HDRI golden-hour + livery detail vs persegi warna. **C5** beda besar — 14 file bernama sesuai job vs starter seadanya.

Reason call 1 (490 karakter): "Not a contest on criterion 1: one entry is a complete 3D flight game — banked chase and framed cockpit views over recognisable textured terrain, vegetated volcano, beach and sea, a detailed twin-prop with blue winglets, nine brass-lit gauges, target ring ahead, runway 36 on final, altitude/speed/heading on the HUD, plus a six-mission dispatch board and a graded landing debrief — the other is a 2D block dodger with no aircraft, terrain, runway or instruments at all. Winner: A, margin 5."

Reason call 2 (409 karakter): "Slots swapped, same verdict: the flight game wins on the first criterion alone, overwhelmingly. Its four screenshots each show a different system of a playable flight game — banked chase, framed cockpit, hydrographic dispatch, debrief — with instruments lit and a mission in progress; the starter shows a paddle dodging red blocks. Depth, feel, look and structure all follow the same way. Winner: B, margin 5."

### Game 2 — Langit Nusantara v2-r2 (`ebc0db4`) vs v1 rev3 (`0cde5ef`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (R2) |
|------|--------|--------|----------|--------|-----------------|
| 1 | R2 | v1 rev3 | R2 (A) | 4 | 0,9 |
| 2 | v1 rev3 | R2 | R2 (B) | 4 | 0,9 |
| **Game** | | | **R2 MENANG** | | **0,9** |

Per kriteria: **C1** R2 menang — cover banked kini terrain-nya dikenali DAN menunjukkan belokan (horizon miring, runway diagonal, ring di depan) lawan cover level v1 dengan gunung abu-abu polos; kokpit kini framed windshield view dengan runway 36 di depan dan 9 gauge kuningan, lawan start parkir v1. **C2** R2 menang — 6 misi + medali + grade vs 3 leg ring-run; bank ~22° membuktikan turn discipline, tapi BUKAN roll penuh — shot bank inverted v1 tetap satu-satunya bukti roll 360° di screenshot. **C3** R2 menang tipis — interior + banked cover + debrief membuktikan kamera mengikuti pesawat dan landing terbaca; shot bank v1 membuktikan kamera mengikuti roll. **C4** R2 menang JELAS — livery detail (winglet biru, cheatline, panel lines), interior kokpit, terrain atlas + geometri vs gaya v1 yang lebih datar; ini kriteria yang paling bergerak di round 2. **C5** R2 menang tipis — 14 file, 4.194 baris, file baru `interior.js` (`createCockpitInterior`) + aset atlas bernama jelas vs 8 file v1.

Reason call 1 (562 karakter): "Round 2 finally moves the score: the banked cover shows a real ~22-degree turn — horizon tilted, runway diagonal, ring ahead — readable even at 320px, and the cockpit is now a framed windshield view, glareshield and A-pillars with the white nose reduced to a small arc, instead of a bare dome filling half the frame. Detailed livery, textured terrain and the same six-mission dispatch and grade-S debrief beat the older flat volcano, parked start and three ring legs. The old inverted-roll shot remains the one thing the new set never shows. Winner: A, margin 4."

Reason call 2 (492 karakter): "Slots swapped, same verdict: the newer entry is much better, not just clearly. Its cockpit reads as a real cockpit at judge size — dark frame, pillars, runway 36 ahead, nine brass gauges — where the old set offered a parked plane and a white dome; its banked cover proves turn discipline the old mid-roll shot only proved abstractly at small size. Six missions, medals, hydrographic dispatch and a graded debrief complete a game the older three-leg version only sketches. Winner: B, margin 4."

## Perbandingan vs MOCK_JUDGE_V2_CC0 — ROUND 2 AKHIRNYA BERGERAK

| Game | v2-cc0 | v2-r2 | Perubahan |
|------|-----------|--------|-----------|
| vs starter | 1,0 (margin 5) | 1,0 (margin 5) | Tidak berubah — sudah mentok |
| vs v1 rev3 | 0,8 (margin 3) | **0,9 (margin 4)** | **NAIK — round 2 menggerakkan skor** |

**Apakah bank cover + interior kokpit terbaca di ukuran juri — jawaban jujur: ya, keduanya terbaca, dan itulah yang menggerakkan margin dari 3 ke 4.** Bank ~22° terbaca di lebar ~320 px: horizon miring + runway diagonal + attitude indicator yang miring langsung kebaca sebagai belokan — berbeda dengan shot bank inverted v1 yang di ukuran kecil justru terbaca sebagai bentuk pasir/laut abstrak. Interior kokpit terbaca sebagai frame kokpit di 768 px DAN di ~320 px: balok glareshield gelap di atas, dua A-pilar di tepi, strip gauge di bawah, runway di tengah — hidung putih yang dulu mendominasi kini tinggal busur kecil. Livery detail (winglet biru, cheatline) jelas di full-size tapi HANYA samar di 320 px — pesawatnya kecil, jadi kontribusi livery di ukuran juri kecil. Grain/atlas terrain masih sebagian besar efek full-size. Jadi yang menggerakkan skor bukan tekstur, melainkan dua perbaikan komposisi: bank + interior — tepat dua kelemahan terbesar yang dicatat mock judge CC0.

**Koreksi atas laporan sebelumnya:** mock judge v2/CC0 menulis outline "tidak menyebut fungsi roll/loop eksplisit". Itu TIDAK tepat: `flight.js` memuat konstanta top-level `ROLL_RATE` ("a full aileron roll in ~3.3 s") dan `LOOP_RATE` ("a full loop in ~6.3 s") plus state `st.rolling`/`st.looping` di `updateFlightModel` — semuanya deklarasi awal file, jadi outline judge-view MEMANG membawa bukti roll/loop. Yang tetap benar: tidak ada screenshot yang menunjukkan roll/loop penuh — celah itu tinggal di gambar, bukan di outline.

## Keterbacaan contact sheet (yang dilihat juri asli)

- **Cover (768 px dan ~320 px):** terbaca penuh — pesawat dengan winglet biru, gunung bervegetasi, pantai, laut, ring 0,4 km, HUD 115/460, attitude indicator yang miring; di 320 px horizon miring + pesawat + gunung + laut tetap kebaca; bank adalah hal pertama yang terlihat.
- **Kokpit (kecil):** terbaca sebagai shot kokpit — frame gelap + runway 36 di depan + strip gauge berbingkai emas di bawah; di 768 px glareshield + A-pilar jelas membingkai pandangan.
- **Dispatch (kecil):** judul "DISPATCH BOARD" terbaca, peta hidrografi hijau dengan kontur terbaca sebagai peta, daftar 6 misi terbaca sebagai board; teks detail tiap misi tidak terbaca — tapi bentuknya jelas sebuah mission board.
- **Debrief (kecil):** huruf "S" emas besar + judul "ANGIN SAMPING" terbaca, panel grafik + dua tombol hijau terbaca sebagai layar hasil.
- **Kesimpulan:** keempat shot kecil tetap bisa dibedakan sebagai 4 sistem berbeda; tidak ada shot yang runtuh jadi abstrak di ukuran juri.

## 3 kelemahan terbesar yang masih terlihat di contact sheet

1. **Roll/loop 360° penuh tetap tidak terlihat di screenshot.** Bank ~22° membuktikan turn discipline, bukan roll — shot bank inverted v1 tetap satu-satunya bukti roll penuh di antara kedua set. Outline memang menyebut `ROLL_RATE`/`LOOP_RATE`, tapi juri menilai dari screenshot dulu. Ini tetap kelemahan nomor satu, meski kini sebagian tertutup oleh cover banked.
2. **Terrain masih low-poly kalau dilihat dekat — dan atlas-nya sebagian besar efek full-size.** Pohon berupa blob sederhana, bukit halus tanpa relief, awan gumpalan lembut; yang ditambah round 2 adalah tekstur permukaan + sedikit geometri, bukan bentuk baru. Di ukuran contact sheet, terrain R2 hanya sedikit lebih baik dari CC0.
3. **Frame kokpit masih polos.** A-pilar adalah slab datar tanpa seal/rivet — pilar kiri sangat gelap, kanan abu-abu terang (pencahayaan tidak konsisten), balok glareshield atas tebal dan rata; silau matahari kiri atas masih blob putih besar. Frame-nya terbaca sebagai frame kokpit, bukan portal — tapi detailnya minim. (Sekunder: label "DITERBANGKAN" di grafik debrief masih menumpuk garis flown; teks kecil dispatch/debrief tetap tidak terbaca di ukuran juri; tidak ada variasi cuaca; tidak ada musuh/boss.)

## Keputusan

**LAYAK SUBMIT R2 (cutoff 27 Nov 07:57 WIB) — mock judge PASS 2-0 (margin 5 lawan starter, margin 4 lawan v1 rev3), skor naik 0,8 → 0,9 vs v1.** Round 2 adalah putaran pertama sejak v2 yang menggerakkan skor: bank cover + interior kokpit memperbaiki dua kelemahan terbesar di ukuran juri, bukan cuma di full-size. Kelemahan yang tersisa (roll penuh tak terlihat, terrain low-poly, frame kokpit polos) adalah polish, bukan kegagalan kriteria — tidak ada satu pun yang layak menahan submit R2, mengingat grading harus selesai sebelum cutoff dan v1 tetap bisa dipilih balik (`makefun final`) bila versi ini bermasalah.

**Di luar cakupan run ini (bukan urusan mock judge — jangan submit sebelum ketiganya beres):**
1. **Kit check pasca-R2** — harus 0 failed (source + aset berubah, bundle v4 lama tidak berlaku lagi).
2. **Re-bundle dengan SEMUA sesi** — termasuk sesi build round 2 + sesi mock judge ini, supaya `thinking_reproduces` menghitung baris round 2 sebagai authored.
3. **"Yes" user di main chat** — submit tetap butuh persetujuan user.

**Jadwal R2:** submit + grading harus selesai sebelum 27 Nov 07:57 WIB supaya dinilai di R2; grade yang telat tergelincir ke R3 (cutoff 27 Nov 19:57 WIB). Deadline final bounty 28 Nov 07:57 WIB.

## Yang dibutuhkan untuk GLM asli

`GLM_API_KEY` atau `OPENROUTER_API_KEY` dari user via secure vault (bukan di chat/file). Setelah ada, ganti model stand-in dengan `z-ai/glm-5.3-flash` via OpenRouter — prompt, kriteria, format, dan lawan tetap sama; ulangi kedua game ini dan bandingkan verdictnya dengan mock ini sebagai kalibrasi. Anchor 3/4 + rung baru bisa diuji setelah final kit terbit (pasca-28 Nov) — saat itu ulangi mock lawan anchor 4-strong sebelum menilai peluang final.
