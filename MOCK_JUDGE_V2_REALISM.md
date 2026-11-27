# Mock Judge v2 + Realism Pass — Langit Nusantara v2-realism (best-flight-game-20261126-0057)

**Tanggal run:** 27 Nov 2026, ~01:15 WIB.
**Mengapa run ini:** tiga shot 3D baru saja diulang dengan realism pass (terrain bergradasi, kabut berlapis, sun glint di laut, panel kokpit kuningan/amber, peta hidrografi) atas penilaian user bahwa visual v2 kurang realistik — sebelum submit ke R2, entri yang berubah ini harus diadu pairwise seperti juri asli lagi, karena keputusan submit bergantung pada apakah versi realism ini masih menang dan lebih baik dari v2 pra-realism.

## Versi yang dinilai

- **Commit `5e8bf20`** ("Realism pass: Kabut Suar techniques, golden-hour identity kept"), HEAD saat run ini. Dibangun di atas `bcecf70` (mock judge v2) / `fd53c18` (v2 + cockpit fix).
- **Screenshot realism** (semua 1280×800, dilihat full-size DAN sebagai contact sheet gaya juri + dicek di lebar ~320 px): `1-cover.jpg` 77.731 B (chase, 115 kts/460 ft/HDG 270°, ring 0,4 km, MISI POS MERPATI 1/6 — gunung berapi kini bervegetasi hijau + puncak coklat, pantai berpasir, laut biru dengan sun glint, pohon tersebar), `2-cockpit.jpg` 83.613 B (kokpit final RWY 36, 82 kts/89 ft/−168 FPM, 1040 RPM, THR 40%, FUEL 54%, GEAR DOWN — panel kini kuningan/amber berbingkai emas, 9 gauge), `3-dispatch.jpg` 117.019 B (dispatch board 6 misi + PETA HIDROGRAFI: pulau hijau berkontur kedalaman 9/15/18/24/30, garis rute, kompas, marker RWY 36 + gunung), `4-debrief.jpg` 67.128 B (TIDAK BERUBAH dari v2: ANGIN SAMPING, grade S, sink 0,8 m/s, centerline 1,0 m, grafik trace vs ideal 3°).
- **Outline source:** 12 file `game/src/`, 3.719 baris (v2: 3.459 baris, +260): aircraft (`buildAircraft`, `makeWingGeometry`, `makeLiveryTexture`), cockpit (`createCockpit`), debrief (`createDebrief`, `gradeCaption`), dispatch (`createDispatch`), flight (`createFlightModel`, `updateFlightModel`, `gradeLandingMetrics`), game (`buildLegRings`, `startLeg`, `showBrief`, `showDispatch`, `showDebrief`, `debriefForLanding`, `updateCamera`, `stageShot`, `initGame`), hud (`createHud`), missions (`medalForGrade`, `createPilotProgress`), rng (`fbm2`, `valueNoise2`), sky (`makeCloudTexture`, `makeGlowTexture`, `makeSkyDome`, `createSky`), sound, terrain (`biomeColor`, `createTerrain`, `makeWaterNormalMap`, `createWater`, `buildRibbon`, `createRiverAndRoads`, `createTownAndTrees`, `makeRunwayTexture`, `createAirfield`). Dinilai dari daftar deklarasi saja, bukan isi penuh. Laporan builder realism TIDAK dibaca sebagai bukti; yang dinilai artefak saja.

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter. Di VM ini TIDAK ADA `GLM_API_KEY` / `OPENROUTER_API_KEY` — jadi GLM asli TIDAK bisa dipanggil. Mock judge ini dijalankan oleh model yang tersedia di sini (Muse Spark) sebagai **stand-in**, dengan prompt + kriteria + format juri asli yang persis. Jangan klaim run ini sebagai hasil GLM.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang.
- **Yang dinilai:** contact sheet 4 screenshot + outline source (seperti judge view asli, ≤1536 token/entry). Contact sheet dibangun ulang meniru judge view (cover 768×480 di atas, 3 kecil di bawah) dan dicek juga di lebar ~320 px.

## Lawan yang tersedia — CELAH

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect: balok merah, koin emas, paddle biru, score/level/lives — shot 2-play: Score 145, Level 3, Lives 3). Jadi versi realism hanya bisa mengadu lawan starter + v1. Kekalahan dari anchor 3/4 tidak bisa diuji di sini.
- **v1 rev3 (`0cde5ef`)** diambil dari git history (`git show 0cde5ef:screenshots/...`): 1-cover (komposisi sama dengan cover realism, tapi gunung abu-abu polos tanpa vegetasi, terrain datar, laut strip tipis), 2-start (parkir di runway), 3-bank (mid-roll ~125°, attitude inverted — membuktikan roll 360°), 4-landing (FINAL runway 36, 78 kts/80 ft, RINGS 5/5 LEG 1/3).

## Hasil

### Game 1 — Langit Nusantara v2-realism (`5e8bf20`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (realism) |
|------|--------|--------|----------|--------|---------------------|
| 1 | realism | starter | realism (A) | 5 | 1,0 |
| 2 | starter | realism | realism (B) | 5 | 1,0 |
| **Game** | | | **realism MENANG** | | **1,0** |

Per kriteria: **C1** beda luar biasa — realism: chase + kokpit di atas terrain dikenali (pantai, gunung berapi bervegetasi, runway 36), pesawat twin-prop dengan 9 gauge kuningan menyala, ring di depan, altitude/speed/heading di HUD; starter: tidak ada pesawat, terrain, runway, atau instrumen sama sekali. **C2** beda besar — 6 misi bernama + medali + grade vs satu mekanik dodge. **C3** beda besar — dua kamera + debrief grade S dengan grafik trace vs layar datar. **C4** beda besar dan MELEBAR dari v2 — terrain bergradasi + sun glint + panel kuningan vs persegi warna. **C5** beda besar — 12 file bernama sesuai job vs starter seadanya.

Reason call 1 (446 karakter): "Not a contest on criterion 1: one entry is a complete 3D flight game — chase and cockpit views over recognisable vegetated volcano, beach and sea glint, nine brass-lit gauges, target ring ahead, runway 36 on final, altitude/speed/heading on the HUD, plus a six-mission dispatch board and a graded landing debrief — the other is a 2D block dodger with no aircraft, terrain, runway or instruments at all. Missions, fuel and grades beat one dodge mechanic. Winner: A, margin 5."

Reason call 2 (381 karakter): "Slots swapped, same verdict: the flight game wins on the first criterion alone, overwhelmingly. Its four screenshots each show a different system of a playable flight game — chase, cockpit, hydrographic dispatch, debrief — with instruments lit and a mission in progress; the starter shows a paddle dodging red blocks. Depth, feel, look and structure all follow the same way. Winner: B, margin 5."

### Game 2 — Langit Nusantara v2-realism (`5e8bf20`) vs v1 rev3 (`0cde5ef`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (realism) |
|------|--------|--------|----------|--------|---------------------|
| 1 | realism | v1 rev3 | realism (A) | 3 | 0,8 |
| 2 | v1 rev3 | realism | realism (B) | 3 | 0,8 |
| **Game** | | | **realism MENANG** | | **0,8** |

Per kriteria: **C1** realism menang lebih jelas dari v2 — cover kini terrain-nya dikenali (gunung bervegetasi, garis pantai, laut berkilau) lawan gunung abu-abu polos v1; kokpit kini 9 gauge kuningan yang terbaca sebagai instrumen diterbangkan, bukan digambar. **C2** realism menang — 6 misi + medali + grade vs 3 leg ring-run; TAPI shot bank v1 tetap satu-satunya bukti roll 360°, yang set realism tidak punya. **C3** realism unggul tipis — debrief membuktikan landing terbaca (grade S, sink rate, trace); shot bank v1 membuktikan kamera mengikuti roll. **C4** realism menang JELAS — satu gaya golden-hour dengan terrain bergradasi, air berkilau, panel kuningan vs gaya v1 yang lebih datar; ini kriteria yang paling bergerak oleh realism pass. **C5** realism unggul tipis — 12 file, 3.719 baris, fungsi baru bernama jelas (`biomeColor`, `makeWaterNormalMap`, `createWater`, `createRiverAndRoads`, `makeSkyDome`, `makeLiveryTexture`) vs 8 file v1.

Reason call 1 (568 karakter): "Same game, one visible step up: the realism pass fixes the exact weaknesses of the older set — the cover volcano is now vegetated with a beach coastline and sun glint on the sea instead of a bare grey cone, the cockpit panel is brass-framed and reads as flown instruments, and the dispatch map is a real hydrographic chart with depth contours and routes instead of a green blob. The older bank shot still proves the 360 roll the new set never shows, and the cover composition is identical, so this is clear, not overwhelming. Winner: A, margin 3."

Reason call 2 (521 karakter): "Slots swapped, same verdict: the newer version wins clearly on look and completeness. Vegetated volcano, graded terrain, glinting water, brass cockpit gauges and a hydrographic mission chart beat the older version's flat grey volcano and abstract map at every glance, while the six missions and grade-S debrief beat three ring legs. The older mid-roll aerobatics and identical cover keep the margin at three, not more. Winner: B, margin 3."

## Perbandingan vs MOCK_JUDGE_V2 (pra-realism)

| Game | v2 pra-realism | v2-realism | Perubahan |
|------|----------------|------------|-----------|
| vs starter | 1,0 (margin 5) | 1,0 (margin 5) | Tidak berubah — sudah mentok; realism hanya melebarkan jarak C4 |
| vs v1 rev3 | 0,7 (margin 2) | 0,8 (margin 3) | **NAIK satu margin** — realism pass memperbaiki 3 dari 6 kelemahan yang dicatat MOCK_JUDGE_V2 (cover gunung polos, peta dispatch abstrak, panel kokpit), semuanya terlihat di ukuran juri |

**Kenapa naik, kenapa bukan 4:** naik karena perbaikan C1 + C4 terlihat langsung di contact sheet (gunung bervegetasi, sun glint, panel kuningan, peta hidrografi). Bukan 4 karena komposisi cover identik, hidung putih masih mendominasi kokpit, dan aerobatik 360° tetap tidak terlihat — tiga hal yang tidak disentuh realism pass.

## Keterbacaan contact sheet (yang dilihat juri asli)

- **Cover (768 px dan ~320 px):** terbaca penuh — pesawat, gunung bervegetasi, pantai, laut berkilau, ring 0,4 km, HUD 115/460, attitude indicator semua terbaca; di 320 px pun pesawat + gunung + laut tetap kebaca.
- **Kokpit (kecil):** terbaca sebagai shot kokpit — hidung putih + prop-disc ujung kuning + strip gauge gelap berbingkai emas di bawah; angka gauge masih terbaca sebagai digit kecil; runway 36 di depan terbaca.
- **Dispatch (kecil):** judul "DISPATCH BOARD" terbaca, peta hidrografi hijau dengan kontur terbaca sebagai peta (bukan lagi blob), daftar 6 misi terbaca sebagai board; teks detail tiap misi tidak terbaca — tapi bentuknya jelas sebuah mission board.
- **Debrief (kecil):** huruf "S" emas besar + judul "ANGIN SAMPING" terbaca, panel grafik + dua tombol hijau terbaca sebagai layar hasil.
- **Kesimpulan:** keempat shot kecil tetap bisa dibedakan sebagai 4 sistem berbeda, dan cover kini lebih kuat dari v2 pra-realism di ukuran kecil. Di lebar ~320 px tidak ada shot yang runtuh jadi abstrak.

## 3 kelemahan terbesar yang masih terlihat di contact sheet

1. **Aerobatik 360° tetap tidak terlihat.** Set realism tidak punya satu pun shot roll/loop — pembeda v1 (shot bank mid-roll, attitude inverted) hilang dari judge view, dan outline source tidak menyebut fungsi roll/loop secara eksplisit (`updateFlightModel` saja). Ini kini kelemahan nomor satu: lawan anchor 4 yang menampilkan aerobatik + kokpit + misi sekaligus bisa mengambil C2/C3 dari sini.
2. **Hidung putih masih mendominasi kokpit.** Lebih dari separuh frame adalah fuselage putih terang + silau matahari kiri atas yang mengaburkan; runway tampil sebagai strip dan ujung sayap tidak kelihatan. Panel kuningan memperbaiki instrumennya, bukan hidungnya. Kokpit rival dengan runway lebih besar + panel lebih penuh bisa terbaca lebih baik.
3. **Terrain masih low-poly kalau dilihat dekat.** Pohon berupa blob sederhana, bukit halus tanpa relief, awan berupa gumpalan lembut; "realisme" yang ditambah adalah gradasi warna + kilau, bukan geometri. Di full-size, dataran di bawah pesawat masih terasa datar. (Sekunder: label "DITERBANGKAN" di grafik debrief masih menumpuk garis flown; teks kecil dispatch/debrief tetap tidak terbaca di ukuran juri; tidak ada variasi cuaca; tidak ada musuh/boss.)

## Keputusan

**LAYAK SUBMIT R2 (cutoff 27 Nov 07:57 WIB) — mock judge PASS 2-0 (margin 5 lawan starter, margin 3 lawan v1 rev3).** Realism pass terbukti menaikkan skor lawan v1 dari 0,7 ke 0,8 dan memperbaiki tepat kelemahan visual yang dicatat mock judge v2 — tanpa merusak apa pun yang sudah menang (sistem, misi, debrief tidak berubah). Kelemahan yang tersisa (aerobatik tak terlihat, hidung kokpit mendominasi, terrain low-poly) adalah polish, bukan kegagalan kriteria — tidak ada satu pun yang layak menahan submit R2, mengingat grading harus selesai sebelum cutoff dan v1 tetap bisa dipilih balik (`makefun final`) bila versi ini bermasalah.

**Di luar cakupan run ini (bukan urusan mock judge — jangan submit sebelum ketiganya beres):**
1. **Kit check pasca-realism** — harus 0 failed (source berubah, bundle v2 lama tidak berlaku lagi).
2. **Re-bundle dengan SEMUA sesi** — termasuk sesi build realism + sesi mock judge ini, supaya `thinking_reproduces` menghitung baris realism sebagai authored.
3. **"Yes" user di main chat** — submit tetap butuh persetujuan user.

**Jadwal R2:** submit + grading harus selesai sebelum 27 Nov 07:57 WIB supaya dinilai di R2; grade yang telat tergelincir ke R3 (cutoff 27 Nov 19:57 WIB). Deadline final bounty 28 Nov 07:57 WIB.

## Yang dibutuhkan untuk GLM asli

`GLM_API_KEY` atau `OPENROUTER_API_KEY` dari user via secure vault (bukan di chat/file). Setelah ada, ganti model stand-in dengan `z-ai/glm-5.3-flash` via OpenRouter — prompt, kriteria, format, dan lawan tetap sama; ulangi kedua game ini dan bandingkan verdictnya dengan mock ini sebagai kalibrasi. Anchor 3/4 + rung baru bisa diuji setelah final kit terbit (pasca-28 Nov) — saat itu ulangi mock lawan anchor 4-strong sebelum menilai peluang final.
