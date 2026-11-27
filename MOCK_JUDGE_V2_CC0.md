# Mock Judge v2 + Realism + Aset CC0 — Langit Nusantara v2-cc0 (best-flight-game-20261126-0057)

**Tanggal run:** 27 Nov 2026, ~01:40 WIB.
**Mengapa run ini:** aset CC0 Poly Haven (HDRI Qwantani Sunset + tekstur Grass Ground detail/normal) baru dipasang dan shot cover + kokpit diulang — sebelum submit ke R2, entri yang berubah ini harus diadu pairwise seperti juri asli lagi, karena keputusan submit bergantung pada apakah versi ber-aset ini masih menang dan apakah skornya naik, stagnan, atau turun dibanding mock judge realism (1,0 vs starter, 0,8 vs v1).

## Versi yang dinilai

- **Commit `105e772`** ("CC0 Poly Haven assets: Qwantani Sunset HDRI env + Grass Ground terrain detail"), HEAD saat run ini. Dibangun di atas `1307a3e` (mock judge realism) / `5e8bf20` (realism pass).
- **Screenshot CC0** (semua 1280×800, dilihat full-size DAN sebagai contact sheet gaya juri — cover 768×480 di atas, 3 kecil di bawah — + dicek di lebar ~320 px): `1-cover.jpg` 100.107 B (chase, 115 kts/460 ft/HDG 270°, ring 0,4 km, MISI POS MERPATI 1/6 — terrain depan kini bergrain tekstur rumput, matahari lebih lembut, gunung bervegetasi + pantai + laut tetap), `2-cockpit.jpg` 103.415 B (kokpit final RWY 36, 82 kts/89 ft/−168 FPM, 1040 RPM, THR 40%, FUEL 54%, GEAR DOWN — bukit kiri/kanan kini bergrain, panel kuningan/amber tidak berubah, hidung putih tetap dominan), `3-dispatch.jpg` 117.019 B (TIDAK BERUBAH dari realism: dispatch board 6 misi + PETA HIDROGRAFI), `4-debrief.jpg` 67.128 B (TIDAK BERUBAH dari v2: ANGIN SAMPING, grade S, sink 0,8 m/s, centerline 1,0 m, grafik trace vs ideal 3°).
- **Aset CC0 (dilihat dari `game/assets/` + `game/src/assets.js`, bukan dari laporan builder):** `qwantani_sunset_env_2k.jpg`, `grass_ground_detail_1k.jpg`, `grass_ground_nor_1k.jpg` (total 1,3 MB), + `NOTICE.md`; loader `loadGameAssets(renderer, scene, terrainMesh)` — PMREM-bake HDRI jadi `scene.environment`, detail map di-repeat 200× di terrain, normal map jadi bump; fallback prosedural bila file hilang. Semua file di dalam `game/`, tidak ada load jaringan.
- **Outline source:** 13 file `game/src/`, 3.810 baris (realism: 3.719, +91): aircraft (`makeLiveryTexture`, `makeWingGeometry`, `buildAircraft`), assets (`_loadTexture`, `loadGameAssets`) — BARU, cockpit (`createCockpit`), debrief (`createDebrief`, `gradeCaption`), dispatch (`createDispatch`), flight (`createFlightModel`, `updateFlightModel`, `gradeLandingMetrics`), game (`buildLegRings`, `startLeg`, `showBrief`, `showDispatch`, `showDebrief`, `debriefForLanding`, `updateCamera`, `stageShot`, `initGame`), hud (`createHud`), missions (`medalForGrade`, `createPilotProgress`), rng (`fbm2`, `valueNoise2`), sky (`makeCloudTexture`, `makeGlowTexture`, `makeSkyDome`, `createSky`), sound, terrain (`biomeColor`, `createTerrain`, `makeWaterNormalMap`, `createWater`, `buildRibbon`, `createRiverAndRoads`, `createTownAndTrees`, `makeRunwayTexture`, `createAirfield`). Dinilai dari daftar deklarasi saja, bukan isi penuh. Laporan builder aset TIDAK dibaca sebagai bukti; yang dinilai artefak saja.

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter. Di VM ini TIDAK ADA `GLM_API_KEY` / `OPENROUTER_API_KEY` — jadi GLM asli TIDAK bisa dipanggil. Mock judge ini dijalankan oleh model yang tersedia di sini (Muse Spark) sebagai **stand-in**, dengan prompt + kriteria + format juri asli yang persis. Jangan klaim run ini sebagai hasil GLM.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang.
- **Yang dinilai:** contact sheet 4 screenshot + outline source (seperti judge view asli, ≤1536 token/entry). Contact sheet dibangun ulang meniru judge view (cover 768×480 di atas, 3 kecil di bawah) dan dicek juga di lebar ~320 px.

## Lawan yang tersedia — CELAH

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect). Jadi versi CC0 hanya bisa mengadu lawan starter + v1. Kekalahan dari anchor 3/4 tidak bisa diuji di sini.
- **v1 rev3 (`0cde5ef`)** diambil dari git history (`git show 0cde5ef:screenshots/...`) dan dilihat langsung: 1-cover (komposisi sama dengan cover CC0, tapi gunung abu-abu polos tanpa vegetasi, terrain datar, laut strip tipis), 2-start (parkir di runway), 3-bank (mid-roll ~125°, attitude inverted — membuktikan roll 360°), 4-landing (FINAL runway 36, 78 kts/80 ft, RINGS 5/5 LEG 1/3).

## Systems inventory + screenshot diversity (hard rule dari skill)

- **4 screenshot = 4 sistem berbeda: PASS.** (1) chase gameplay ring-run, (2) kokpit final, (3) dispatch board 6 misi + peta hidrografi, (4) debrief grade S + grafik trace.
- **Systems inventory: PASS.** Core loop (terbang ring-run + landing) + meta: 6 misi bernama dengan tujuan/angin/fuel/waktu berbeda, medali EMAS/PERAK, fuel sebagai keputusan, grade debrief S/A/B/C, dua kamera (chase/kokpit), progress pilot + skor. Bukan variasi konten dalam satu sistem.

## Hasil

### Game 1 — Langit Nusantara v2-cc0 (`105e772`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (CC0) |
|------|--------|--------|----------|--------|-----------------|
| 1 | CC0 | starter | CC0 (A) | 5 | 1,0 |
| 2 | starter | CC0 | CC0 (B) | 5 | 1,0 |
| **Game** | | | **CC0 MENANG** | | **1,0** |

Per kriteria: **C1** beda luar biasa — CC0: chase + kokpit di atas terrain dikenali (pantai, gunung berapi bervegetasi, runway 36), pesawat twin-prop dengan 9 gauge kuningan menyala, ring di depan, altitude/speed/heading di HUD; starter: tidak ada pesawat, terrain, runway, atau instrumen sama sekali. **C2** beda besar — 6 misi bernama + medali + grade vs satu mekanik dodge. **C3** beda besar — dua kamera + debrief grade S dengan grafik trace vs layar datar. **C4** beda besar — terrain bertekstur + HDRI golden-hour vs persegi warna. **C5** beda besar — 13 file bernama sesuai job vs starter seadanya.

Reason call 1 (445 karakter): "Not a contest on criterion 1: one entry is a complete 3D flight game — chase and cockpit views over recognisable textured terrain, vegetated volcano, beach and sea, nine brass-lit gauges, target ring ahead, runway 36 on final, altitude/speed/heading on the HUD, plus a six-mission dispatch board and a graded landing debrief — the other is a 2D block dodger with no aircraft, terrain, runway or instruments at all. Winner: A, margin 5."

Reason call 2 (382 karakter): "Slots swapped, same verdict: the flight game wins on the first criterion alone, overwhelmingly. Its four screenshots each show a different system of a playable flight game — chase, cockpit, hydrographic dispatch, debrief — with instruments lit and a mission in progress; the starter shows a paddle dodging red blocks. Depth, feel, look and structure all follow the same way. Winner: B, margin 5."

### Game 2 — Langit Nusantara v2-cc0 (`105e772`) vs v1 rev3 (`0cde5ef`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (CC0) |
|------|--------|--------|----------|--------|-----------------|
| 1 | CC0 | v1 rev3 | CC0 (A) | 3 | 0,8 |
| 2 | v1 rev3 | CC0 | CC0 (B) | 3 | 0,8 |
| **Game** | | | **CC0 MENANG** | | **0,8** |

Per kriteria: **C1** CC0 menang — cover kini terrain-nya dikenali (gunung bervegetasi, garis pantai, laut) lawan gunung abu-abu polos v1; kokpit kini 9 gauge kuningan yang terbaca sebagai instrumen diterbangkan. **C2** CC0 menang — 6 misi + medali + grade vs 3 leg ring-run; TAPI shot bank v1 tetap satu-satunya bukti roll 360°, yang set CC0 tidak punya. **C3** CC0 unggul tipis — debrief membuktikan landing terbaca (grade S, sink rate, trace); shot bank v1 membuktikan kamera mengikuti roll. **C4** CC0 menang JELAS — terrain bertekstur + HDRI vs gaya v1 yang lebih datar; TAPI keunggulan ini hanya sedikit lebih besar dari versi realism (lihat bagian kejujuran grain di bawah). **C5** CC0 unggul tipis — 13 file, 3.810 baris, file baru `assets.js` (`loadGameAssets`) bernama jelas vs 8 file v1.

Reason call 1 (573 karakter): "Same game, one small visible step up from the realism version: the terrain now carries real grass-ground grain and the HDRI softens the sun, so the cover foreground reads as textured ground instead of flat green at full size — but the step is small at judge size, where the grain mostly vanishes and the set still wins on the same grounds as before: vegetated volcano, brass cockpit gauges, hydrographic dispatch chart, six missions and a grade-S debrief against the older flat grey volcano and three ring legs. The older bank shot still proves the 360 roll the new set never shows. Winner: A, margin 3."

Reason call 2 (542 karakter): "Slots swapped, same verdict: the newer version wins clearly on look and completeness. Textured terrain, softer HDRI light, brass cockpit gauges and a hydrographic mission chart beat the older version's flat grey volcano and abstract map, while the six missions and grade-S debrief beat three ring legs. The gain from the CC0 textures over the realism version is real but small at this size, and the identical cover composition plus the older mid-roll aerobatics keep the margin at three, not more. Winner: B, margin 3."

## Perbandingan vs MOCK_JUDGE_V2_REALISM — KEJUJURAN GRAIN

| Game | v2-realism | v2-cc0 | Perubahan |
|------|-----------|--------|-----------|
| vs starter | 1,0 (margin 5) | 1,0 (margin 5) | Tidak berubah — sudah mentok |
| vs v1 rev3 | 0,8 (margin 3) | 0,8 (margin 3) | **STAGNAN — aset CC0 tidak menggerakkan skor** |

**Apakah grain tekstur terrain terbaca di ukuran juri — jawaban jujur: hanya sebagian, dan hanya di cover.** Di full-size (1280×800) grain rumput jelas terlihat di foreground cover dan di bukit kokpit — itu perbaikan nyata. Di cover judge-view 768 px, grain masih terbaca sebagai mottling di foreground. Tapi di sel kecil contact sheet (~256 px) dan di lebar ~320 px, grain HILANG — terrain kembali terbaca sebagai hijau datar low-poly dengan pohon blob, praktis sama dengan versi realism. Matahari HDRI lebih lembut di semua ukuran, tapi itu perubahan kecil. Kesimpulan: aset CC0 memperbaiki tampilan full-size dan sedikit tampilan juri, tapi TIDAK mengubah verdict — skor vs v1 tetap 0,8, margin tetap 3. Yang membatasi sekarang bukan lagi tekstur terrain, melainkan geometri low-poly, hidung kokpit, dan aerobatik yang tak terlihat.

## Keterbacaan contact sheet (yang dilihat juri asli)

- **Cover (768 px dan ~320 px):** terbaca penuh — pesawat, gunung bervegetasi, pantai, laut, ring 0,4 km, HUD 115/460, attitude indicator semua terbaca; di 320 px pesawat + gunung + laut tetap kebaca; grain hanya samar di 768 px, hilang di 320 px.
- **Kokpit (kecil):** terbaca sebagai shot kokpit — hidung putih + prop-disc ujung kuning + strip gauge gelap berbingkai emas di bawah; runway 36 di depan terbaca; grain bukit hilang di ukuran kecil.
- **Dispatch (kecil):** judul "DISPATCH BOARD" terbaca, peta hidrografi hijau dengan kontur terbaca sebagai peta, daftar 6 misi terbaca sebagai board; teks detail tiap misi tidak terbaca — tapi bentuknya jelas sebuah mission board.
- **Debrief (kecil):** huruf "S" emas besar + judul "ANGIN SAMPING" terbaca, panel grafik + dua tombol hijau terbaca sebagai layar hasil.
- **Kesimpulan:** keempat shot kecil tetap bisa dibedakan sebagai 4 sistem berbeda; tidak ada shot yang runtuh jadi abstrak di ukuran juri.

## 3 kelemahan terbesar yang masih terlihat di contact sheet

1. **Aerobatik 360° tetap tidak terlihat.** Set CC0 tidak punya satu pun shot roll/loop — pembeda v1 (shot bank mid-roll, attitude inverted) hilang dari judge view, dan outline source tidak menyebut fungsi roll/loop secara eksplisit (`updateFlightModel` saja). Ini tetap kelemahan nomor satu: lawan yang menampilkan aerobatik + kokpit + misi sekaligus bisa mengambil C2/C3 dari sini.
2. **Hidung putih masih mendominasi kokpit.** Lebih dari separuh frame adalah fuselage putih terang + silau matahari kiri atas yang mengaburkan; aset CC0 tidak menyentuh model pesawat atau kamera, jadi kelemahan ini tidak bergerak sama sekali sejak v2.
3. **Terrain masih low-poly kalau dilihat dekat — dan grain-nya hilang di ukuran juri.** Pohon berupa blob sederhana, bukit halus tanpa relief, awan gumpalan lembut; yang ditambah aset adalah tekstur permukaan, bukan geometri. Di ukuran contact sheet, terrain CC0 praktis tidak bisa dibedakan dari terrain realism. (Sekunder: label "DITERBANGKAN" di grafik debrief masih menumpuk garis flown; teks kecil dispatch/debrief tetap tidak terbaca di ukuran juri; tidak ada variasi cuaca; tidak ada musuh/boss.)

## Keputusan

**LAYAK SUBMIT R2 (cutoff 27 Nov 07:57 WIB) — mock judge PASS 2-0 (margin 5 lawan starter, margin 3 lawan v1 rev3).** Aset CC0 tidak menurunkan apa pun dan memperbaiki tampilan full-size secara nyata, walau skor mock stagnan di 0,8 vs v1 — stagnan di sini bukan kegagalan: versi realism sudah menang 0,8, dan versi CC0 mempertahankannya dengan tampilan yang sedikit lebih baik di ukuran juri dan jelas lebih baik di full-size. Kelemahan yang tersisa (aerobatik tak terlihat, hidung kokpit mendominasi, geometri low-poly) adalah polish, bukan kegagalan kriteria — tidak ada satu pun yang layak menahan submit R2, mengingat grading harus selesai sebelum cutoff dan v1 tetap bisa dipilih balik (`makefun final`) bila versi ini bermasalah.

**Di luar cakupan run ini (bukan urusan mock judge — jangan submit sebelum ketiganya beres):**
1. **Kit check pasca-CC0** — harus 0 failed (source + aset berubah, bundle v3 lama tidak berlaku lagi).
2. **Re-bundle dengan SEMUA sesi** — termasuk sesi build aset CC0 + sesi mock judge ini, supaya `thinking_reproduces` menghitung baris aset sebagai authored.
3. **"Yes" user di main chat** — submit tetap butuh persetujuan user.

**Jadwal R2:** submit + grading harus selesai sebelum 27 Nov 07:57 WIB supaya dinilai di R2; grade yang telat tergelincir ke R3 (cutoff 27 Nov 19:57 WIB). Deadline final bounty 28 Nov 07:57 WIB.

## Yang dibutuhkan untuk GLM asli

`GLM_API_KEY` atau `OPENROUTER_API_KEY` dari user via secure vault (bukan di chat/file). Setelah ada, ganti model stand-in dengan `z-ai/glm-5.3-flash` via OpenRouter — prompt, kriteria, format, dan lawan tetap sama; ulangi kedua game ini dan bandingkan verdictnya dengan mock ini sebagai kalibrasi. Anchor 3/4 + rung baru bisa diuji setelah final kit terbit (pasca-28 Nov) — saat itu ulangi mock lawan anchor 4-strong sebelum menilai peluang final.
