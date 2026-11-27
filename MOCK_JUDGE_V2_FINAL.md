# Mock Judge v2 + Final Polish — Langit Nusantara v2-final (best-flight-game-20261126-0057)

**Tanggal run:** 27 Nov 2026, ~02:40 WIB.
**Mengapa run ini:** user menilai visual tinggal "kurang sedikit lagi" dan memilih keduanya — cover mid-roll + poles frame kokpit; sebelum submit final R2, entri yang berubah ini harus diadu pairwise seperti juri asli lagi, karena keputusan submit bergantung pada apakah polish kecil ini mengalahkan v1 (7ce33b3) atau stagnan sehingga versi sebelumnya yang harus disubmit.

## Versi yang dinilai

- **Commit `f3ca38a`** ("Final polish: mid-roll cover 50 deg, cockpit frame rivets + softer sun glare"), HEAD saat run ini. Dibangun di atas `7ce33b3` (mock judge R2).
- **Yang berubah di final polish (dari `git show --stat f3ca38a`, 10 file, +75/−21):** EDIT `game/src/game.js` (+18, staging `play` di-override ke bank 50°/−0,87 rad setelah 45 step settle — 66° dicoba dan dibatalkan karena gunung keluar frame), `game/src/interior.js` (+54/−, 4 rivet baja per A-pilar + glareshield lebih tipis 0,055 + seam strip walnut + material pilar konsisten), `game/src/sky.js` (silau matahari dilembutkan: sprite opacity 0,25, dome pow 220: 0,65); `tools/regression-v2.js` + `tools/probe-v2-flow.mjs` (ekspektasi staging bank diperbarui ke −0,87). Screenshot 1-cover + 2-cockpit di-restage; 3-dispatch + 4-debrief ikut ter-render ulang oleh shoot-v2.mjs (konten identik, background kini terrain R2 + matahari lembut). Total source kini ~4.083 baris (14 file); `game/` total 5,64 MB — jauh di bawah batas 48 MB.
- **Koreksi sha:** laporan builder menulis `2-cockpit.jpg` sha `783e4138…` — TIDAK cocok dengan file di disk. Verifikasi langsung (`sha256sum`): `2-cockpit.jpg` = `18a44a3b…` (120.660 B). Semua sha di bawah adalah hasil verifikasi sendiri, bukan kutipan laporan.
- **Screenshot final polish** (semua 1280×800, dilihat full-size DAN sebagai contact sheet gaya juri — cover 768×480 di atas, 3 kecil di bawah — + dicek di lebar ~320 px): `1-cover.jpg` 131.108 B sha `326aba70…` (chase MID-ROLL 50°: horizon diagonal tajam, gunung bervegetasi + pantai + laut tetap di frame, ring 0,4 km di depan, attitude indicator miring, HUD 115/460, MISI POS MERPATI 1/6, FUEL 82%), `2-cockpit.jpg` 120.660 B sha `18a44a3b…` (kokpit final RWY 36: A-pilar abu-abu konsisten kiri-kanan + rivet terlihat full-size, glareshield lebih tipis + seam, matahari kiri atas lebih lembut, hidung putih busur kecil, 82 kts/89 ft/−168 FPM, 1040 RPM, THR 40%, FUEL 54%, GEAR DOWN), `3-dispatch.jpg` 142.448 B sha `3f652f26…` (konten TIDAK BERUBAH: dispatch board 6 misi + PETA HIDROGRAFI), `4-debrief.jpg` 85.371 B sha `57abd1a9…` (konten TIDAK BERUBAH: ANGIN SAMPING, grade S, sink 0,8 m/s, centerline 1,0 m, grafik trace vs ideal 3°).
- **Outline source:** 14 file `game/src/`, ~4.083 baris: aircraft (500), assets (93), cockpit (258), debrief (158), dispatch (215), flight (348 — `ROLL_RATE` 1,9 rad/s "a full aileron roll in ~3.3 s", `LOOP_RATE` 1,0 rad/s "a full loop in ~6.3 s", state `st.rolling`/`st.looping` di `updateFlightModel`), game (864 — `buildLegRings`, `startLeg`, `showBrief`, `showDispatch`, `showDebrief`, `debriefForLanding`, `updateCamera`, `stageShot`, `initGame`), hud (334), interior (89 — `createCockpitInterior`, rivet di `interior.js:75`), missions (91 — `medalForGrade`, `createPilotProgress`), rng (75 — `fbm2`, `valueNoise2`), sky (214), sound (110), terrain (734 — `biomeColor`, `createTerrain`, `makeWaterNormalMap`, `createWater`, `buildRibbon`, `createRiverAndRoads`, `createTownAndTrees`, `makeRunwayTexture`, `createAirfield`). Dinilai dari daftar deklarasi saja, bukan isi penuh. Laporan builder final polish TIDAK dibaca sebagai bukti; yang dinilai artefak saja (screenshot dilihat langsung, source dicek via `git show`).

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter. Di VM ini TIDAK ADA `GLM_API_KEY` / `OPENROUTER_API_KEY` — jadi GLM asli TIDAK bisa dipanggil. Mock judge ini dijalankan oleh model yang tersedia di sini (Muse Spark) sebagai **stand-in**, dengan prompt + kriteria + format juri asli yang persis. Jangan klaim run ini sebagai hasil GLM.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang.
- **Yang dinilai:** contact sheet 4 screenshot + outline source (seperti judge view asli, ≤1536 token/entry). Contact sheet dibangun ulang meniru judge view (cover 768×480 di atas, 3 kecil di bawah) dan dicek juga di lebar ~320 px.

## Lawan yang tersedia — CELAH

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect — 3 screenshot starter: paddle biru + balok merah di layar gelap, Score/Lives/Level). Jadi versi final polish hanya bisa mengadu lawan starter + v1. Kekalahan dari anchor 3/4 tidak bisa diuji di sini.
- **v1 rev3 (`0cde5ef`)** diambil dari git history dan dilihat langsung: 1-cover (komposisi sama dengan cover R2 tapi level, gunung abu-abu polos tanpa vegetasi, terrain datar, laut strip tipis), 2-start (parkir di runway), 3-bank (mid-roll ~125°, attitude inverted — membuktikan roll 360°, tapi terrain-nya bentuk pasir/laut abstrak yang sulit dibaca), 4-landing (FINAL runway 36, 78 kts/80 ft, RINGS 5/5 LEG 1/3).

## Systems inventory + screenshot diversity (hard rule dari skill)

- **4 screenshot = 4 sistem berbeda: PASS.** (1) chase gameplay ring-run mid-roll 50°, (2) kokpit final dengan interior ber-rivet, (3) dispatch board 6 misi + peta hidrografi, (4) debrief grade S + grafik trace.
- **Systems inventory: PASS.** Core loop (terbang ring-run + landing) + meta: 6 misi bernama dengan tujuan/angin/fuel/waktu berbeda, medali EMAS/PERAK, fuel sebagai keputusan, grade debrief S/A/B/C, dua kamera (chase/kokpit), progress pilot + skor. Bukan variasi konten dalam satu sistem.

## Hasil

### Game 1 — Langit Nusantara v2-final (`f3ca38a`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (final) |
|------|--------|--------|----------|--------|-----------------|
| 1 | final | starter | final (A) | 5 | 1,0 |
| 2 | starter | final | final (B) | 5 | 1,0 |
| **Game** | | | **final MENANG** | | **1,0** |

Per kriteria: **C1** beda luar biasa — final: chase mid-roll 50° + kokpit berbingkai di atas terrain dikenali (pantai, gunung berapi bervegetasi, runway 36), pesawat twin-prop detail dengan 9 gauge kuningan menyala, ring di depan, altitude/speed/heading di HUD; starter: tidak ada pesawat, terrain, runway, atau instrumen sama sekali. **C2** beda besar — 6 misi bernama + medali + grade vs satu mekanik dodge. **C3** beda besar — dua kamera + interior + debrief grade S dengan grafik trace vs layar datar. **C4** beda besar — terrain bertekstur + HDRI golden-hour + livery detail vs persegi warna. **C5** beda besar — 14 file bernama sesuai job vs starter seadanya.

Reason call 1 (499 karakter): "Not a contest on criterion 1: one entry is a complete 3D flight game — a 50-degree mid-roll chase over recognisable textured terrain, vegetated volcano, beach and sea, a detailed twin-prop with blue winglets, nine brass-lit gauges in a framed cockpit, target ring ahead, runway 36 on final, altitude/speed/heading on the HUD, plus a six-mission dispatch board and a graded landing debrief — the other is a 2D block dodger with no aircraft, terrain, runway or instruments at all. Winner: A, margin 5."

Reason call 2 (389 karakter): "Slots swapped, same verdict: the flight game wins on the first criterion alone, overwhelmingly. Its four screenshots each show a different system — steep-banked chase, framed cockpit, hydrographic dispatch, debrief — with instruments lit and a mission in progress; the starter shows a paddle dodging red blocks. Depth, feel, look and structure all follow the same way. Winner: B, margin 5."

### Game 2 — Langit Nusantara v2-final (`f3ca38a`) vs v1 rev3 (`0cde5ef`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (final) |
|------|--------|--------|----------|--------|-----------------|
| 1 | final | v1 rev3 | final (A) | 4 | 0,9 |
| 2 | v1 rev3 | final | final (B) | 4 | 0,9 |
| **Game** | | | **final MENANG** | | **0,9** |

Per kriteria: **C1** final menang — cover mid-roll 50° kini menunjukkan roll DAN terrain dikenali (horizon diagonal, attitude miring, ring 0,4 km, gunung + pantai di frame) lawan cover level v1 dengan gunung abu-abu polos; kokpit kini framed view dengan runway 36 + 9 gauge kuningan, lawan start parkir v1. Shot bank inverted v1 (~125°) masih satu-satunya sikap inverted di antara kedua set — tapi terrain-nya abstrak, jadi di ukuran juri ia membuktikan roll dengan mengorbankan keterbacaan. **C2** final menang — 6 misi + medali + grade vs 3 leg ring-run; bank 50° membuktikan turn/roll discipline jauh lebih kuat dari bank 22° R2. **C3** final menang — interior + cover mid-roll + debrief membuktikan kamera mengikuti pesawat dan landing terbaca; shot bank v1 membuktikan kamera mengikuti roll tapi di terrain abstrak. **C4** final menang JELAS — livery detail, interior ber-rivet (full-size), terrain atlas + geometri vs gaya v1 yang lebih datar; di ukuran juri yang bergerak adalah komposisi (roll + frame konsisten), bukan rivetnya. **C5** final menang tipis — 14 file, ~4.083 baris, `interior.js` (`createCockpitInterior`, rivet) vs 8 file v1.

Reason call 1 (543 karakter): "The final polish closes the one edge the old set kept: the cover is now a genuine 50-degree mid-roll — horizon diagonal, attitude indicator tilted, ring ahead, volcano and coast still in frame — so the old inverted-roll shot no longer proves something the new set cannot, and its abstract sand-and-sea terrain reads worse at judge size. The framed cockpit, now with even grey pillars and softer sun, plus six named missions and a grade-S debrief, beat the flat volcano, parked start and three ring legs on every criterion. Winner: A, margin 4."

Reason call 2 (478 karakter): "Slots swapped, same verdict: the newer entry is much better, not just clearly. Its mid-roll cover proves roll over recognisable terrain where the old set proved it only abstractly; its cockpit reads as a real cockpit — framed windshield, runway 36 ahead, nine brass gauges — where the old set offered a parked plane and a white dome; six missions, medals, hydrographic dispatch and a graded debrief complete a game the older three-leg version only sketches. Winner: B, margin 4."

## Perbandingan vs MOCK_JUDGE_V2_R2 — SKOR STAGNAN, KEMENANGAN LEBIH BERSIH

| Game | v2-r2 | v2-final | Perubahan |
|------|-----------|--------|-----------|
| vs starter | 1,0 (margin 5) | 1,0 (margin 5) | Tidak berubah — sudah mentok |
| vs v1 rev3 | 0,9 (margin 4) | **0,9 (margin 4)** | **STAGNAN di band yang sama** |

**Apakah mid-roll 50° + rivet kokpit terbaca di ukuran juri — jawaban jujur: roll-nya ya, rivet-nya tidak.** Bank 50° terbaca di lebar ~320 px: horizon diagonal tajam + pesawat + attitude indicator yang miring langsung kebaca sebagai roll, bukan belokan — berbeda dengan bank 22° R2 yang masih bisa dibaca sebagai belokan biasa. Rivet A-pilar hanya terlihat full-size; yang bergerak di ukuran juri dari poles kokpit adalah konsistensi warna pilar (kiri-kanan kini sama-sama abu-abu, bukan kiri hitam/kanan terang) + glareshield yang lebih tipis + matahari yang lebih lembut. Jadi polish ini menutup celah terakhir v1 (bukti roll) — alasan R2 memberi margin 4 menyebut eksplisit "The old inverted-roll shot remains the one thing the new set never shows", dan kalimat itu kini tidak berlaku lagi — tapi perubahan ini lebih kecil dari perubahan R2 (bank 22° + interior baru) yang menggerakkan margin 3→4, sehingga band tidak naik ke 5. Margin 5 ("overwhelmingly") butuh lawan yang hampir tidak punya apa-apa; v1 tetap game penerbangan lengkap dengan sikap inverted ekstrem dan landing yang bersih. **Skor stagnan 0,9, tapi kualitas kemenangan naik: final kini menang atau seri di setiap sub-poin, tidak ada lagi satu pun dimensi di mana v1 lebih baik.**

## Keterbacaan contact sheet (yang dilihat juri asli)

- **Cover (768 px dan ~320 px):** terbaca penuh — pesawat dengan winglet biru, gunung bervegetasi, pantai, laut, ring 0,4 km, HUD 115/460, attitude indicator yang miring; di 320 px horizon diagonal + pesawat + gunung + laut tetap kebaca; roll adalah hal pertama yang terlihat. Silau matahari kanan bawah masih blob lembut besar, tapi tidak lagi menutupi pesawat.
- **Kokpit (kecil):** terbaca sebagai shot kokpit — frame gelap + runway 36 di depan + strip gauge berbingkai emas di bawah; di 768 px glareshield + A-pilar jelas membingkai pandangan; rivet hanya di full-size.
- **Dispatch (kecil):** judul "DISPATCH BOARD" terbaca, peta hidrografi hijau dengan kontur terbaca sebagai peta, daftar 6 misi terbaca sebagai board; teks detail tiap misi tidak terbaca — tapi bentuknya jelas sebuah mission board.
- **Debrief (kecil):** huruf "S" emas besar + judul "ANGIN SAMPING" terbaca, panel grafik + dua tombol hijau terbaca sebagai layar hasil.
- **Kesimpulan:** keempat shot kecil tetap bisa dibedakan sebagai 4 sistem berbeda; tidak ada shot yang runtuh jadi abstrak di ukuran juri.

## 3 kelemahan terbesar yang masih terlihat di contact sheet

1. **Terrain masih low-poly kalau dilihat dekat.** Pohon berupa blob sederhana, bukit halus tanpa relief, awan gumpalan lembut; atlas menambah tekstur permukaan, bukan bentuk baru. Di ukuran contact sheet terrain final hanya sedikit lebih baik dari CC0 — ini kini kelemahan nomor satu, karena roll sudah tertutup.
2. **Frame kokpit masih polos di ukuran juri.** Rivet hilang di ~320 px; A-pilar tetap slab lurus abu-abu (kini konsisten warnanya, tapi tetap slab), glareshield tetap pita gelap lebar di atas; silau matahari cover masih blob lembut besar. Frame-nya terbaca sebagai frame kokpit, bukan portal — tapi detailnya minim di ukuran yang dinilai.
3. **Sikap inverted penuh tetap tidak ada di screenshot.** Bank 50° membuktikan roll sedang berjalan, tapi pesawat tidak pernah tampak inverted; shot bank ~125° v1 masih satu-satunya sikap ekstrem — hanya saja terrain-nya abstrak. (Sekunder: label "DITERBANGKAN" di grafik debrief masih menumpuk garis flown; teks kecil dispatch/debrief tetap tidak terbaca di ukuran juri; tidak ada variasi cuaca; tidak ada musuh/boss.)

## Keputusan

**LAYAK SUBMIT R2 (cutoff 27 Nov 07:57 WIB) — mock judge PASS 2-0 (margin 5 lawan starter, margin 4 lawan v1 rev3), skor 1,0 / 0,9.** Final polish tidak menggerakkan band skor (0,9 tetap), tapi menutup celah terakhir yang dimiliki v1 — bukti roll kini ada di gambar, bukan cuma di outline — sehingga kemenangan atas v1 kini bersih di semua dimensi. Kelemahan yang tersisa (terrain low-poly dekat, frame kokpit polos di ukuran juri, tanpa sikap inverted) adalah polish dengan diminishing return, bukan kegagalan kriteria — tidak ada satu pun yang layak menahan submit R2, mengingat grading harus selesai sebelum cutoff dan v1 tetap bisa dipilih balik (`makefun final`) bila versi ini bermasalah.

**Di luar cakupan run ini (bukan urusan mock judge — jangan submit sebelum ketiganya beres):**
1. **Kit check pasca-final-polish** — harus 0 failed (source + screenshot berubah, bundle v5 lama tidak berlaku lagi).
2. **Re-bundle dengan SEMUA sesi** — termasuk sesi build final polish + sesi mock judge ini, supaya `thinking_reproduces` menghitung baris final polish sebagai authored.
3. **"Yes" user di main chat** — submit tetap butuh persetujuan user.

**Jadwal R2:** submit + grading harus selesai sebelum 27 Nov 07:57 WIB supaya dinilai di R2; grade yang telat tergelincir ke R3 (cutoff 27 Nov 19:57 WIB). Deadline final bounty 28 Nov 07:57 WIB.

## Yang dibutuhkan untuk GLM asli

`GLM_API_KEY` atau `OPENROUTER_API_KEY` dari user via secure vault (bukan di chat/file). Setelah ada, ganti model stand-in dengan `z-ai/glm-5.3-flash` via OpenRouter — prompt, kriteria, format, dan lawan tetap sama; ulangi kedua game ini dan bandingkan verdictnya dengan mock ini sebagai kalibrasi. Anchor 3/4 + rung baru bisa diuji setelah final kit terbit (pasca-28 Nov) — saat itu ulangi mock lawan anchor 4-strong sebelum menilai peluang final.
