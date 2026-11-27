# PLAN_V2 — Langit Nusantara v2 for Round 2 (best-flight-game-20261126-0057)

**Mengapa (satu kalimat):** R1 belum menilai kita dan kelima entri referensi yang dibaca 27 Nov 00:02–00:05 WIB semuanya punya kokpit + 6 sortie bernama + penilaian pendaratan yang terlihat di screenshot sementara kita tidak punya ketiganya, jadi v2 menutup ketiga celah itu — dengan kode yang ditulis fresh dari nol — sebelum R2 cutoff 27 Nov 07:57 WIB, karena juri hanya melihat contact sheet + outline dan celah sistem adalah yang memutuskan C2.

## Keputusan (satu paragraf, dari analisa 5 entri referensi)

Bold Plinth (8.818 baris, 12 sortie + boss + 3 pesawat + 12 refit), Kabut Suar (5.348, dispatch board + medali), Soundward (1.843, debrief grafik glidepath + ekonomi), DECK ZERO V7 (10.258, dogfight + 4 kamera, tapi klaim hangar tanpa bukti di screenshot), Garuda v2 (6.820, kokpit King Air + tangan pilot + TAWS + layar crash) — semuanya punya kamera kokpit/chase yang bisa diganti, misi/sortie bernama dengan tujuan beda, HUD fuel/hull/throttle/flap/gear yang konsisten, dan sistem nilai pendaratan; Soundward membuktikan baris bukan penentu (1.843 baris tapi screenshot kuat), dan Garuda v2 membuktikan tema King Air + kepulauan saja tidak cukup beda. Keputusan: v2 tetap "Langit Nusantara" (King Air Merpati Nusantara, golden hour, kepulauan Indonesia) tapi tambah 3 sistem yang kelihatan di screenshot — (1) kokpit view dengan panel instrumen menyala, (2) dispatch board 6 misi bernama Nusantara dengan tujuan beda + medali, (3) debrief nilai pendaratan dengan grafik approach trace — dan ganti 4 screenshot menjadi 4 sistem berbeda (chase / kokpit / dispatch / debrief), karena itulah pelajaran ROLLING BOIL dan pola yang dimenangi kelima referensi. Yang sengaja TIDAK ditiru: dogfight/misil, boss, tangan pilot animasi, dan nama/teks/layout HUD mereka verbatim. Target submit ~06:30 WIB agar grading selesai sebelum R2 cutoff 07:57 WIB; v1 tetap aman sebagai fallback via `makefun final` (Force_Last).

## Fakta R2 (terverifikasi 26 Nov 23:59 WIB via CLI)

- R1: judged, 6.258 ranked — Langit Nusantara BELUM ada hasil (grading antre).
- R2 cutoff: 27 Nov 00:57 UTC = **07:57 WIB**. R3 27 Nov 19:57 WIB, final 28 Nov 07:57 WIB.
- Aturan: Force_Last — submission terakhir sebelum deadline jadi entri final; bisa pilih balik v1 via `node cli/makefun.mjs final best-flight-game-20261126-0057 <submission_id>`. Kuota 10/hari, 20 total; baru pakai 1.
- Juri (RULES.txt word-for-word): (1) game penerbangan lengkap di screenshot, (2) fun & depth, (3) feel & polish, (4) look & originality, (5) struktur. Contact sheet + outline ≤1.536 token.
- Batas keras: screenshot 3–4, ≤256 KiB, long side ≤1280, short ≥480; game/ ≤993 file, ≤48 MiB; dossier ≤1,5 MiB; main.ts stdlib-only, 2x byte-identik.

## Batasan anti-salinan (wajib — pelanggaran = diskualifikasi)

- Kode ditulis FRESH di sesi build v2 ini. Jangan baca, unduh, atau salin kode/repo entri referensi mana pun (repo mereka privat; jangan coba mengaksesnya). Jangan salin gambar/screenshot mereka — screenshot v2 harus render asli kode kita di browser. Jangan salin nama misi, teks HUD, atau layout mereka verbatim; misi dan teks kita berbahasa/nuansa Nusantara sendiri.
- Jangan baca `starter/game/*` atau `starter/main.ts` sebelum menulis versi kita (aturan thinking_reproduces). `vendor/makefun-game.ts` BOLEH dibaca (library kit).
- File v1 yang diedit: tulis perubahan sebagai edit baru di sesi ini; jangan tempel ulang isi file lama dari hasil baca — edit secukupnya, baris baru tercatat authored di sesi v2. Bundle nanti WAJIB mencakup SEMUA sesi (v1: dabb5e22, eeb0d8e7, 1c6e77b7, 828ff0b1, b2cd5443, be82eca3, ac454171 + semua sesi v2), kalau tidak thinking_reproduces gagal seperti rev1–3 dulu. Bundle pakai `--prompt-origin other` + `--prompt-via` (brief sebagai prompt-file), BUKAN handed-off (pelajaran national stats 27 Nov 00:06 WIB).

## Konsep v2: 6 misi "Langit Nusantara"

Tetap twin-prop King Air "Merpati Nusantara", chase cam + kokpit, golden hour. 6 misi, masing-masing tujuan beda (parameter di `missions.js`, bukan 6 game berbeda):

1. **Pos Merpati** — mail run fajar: 5 ring pesisir, lalu landing & stop runway 36.
2. **Kawah Berapi** — ring slalom di bibir kaldera, jaga ketinggian.
3. **Badai Penyelamat** — terbang menembus squall ke drop zone, fuel ketat.
4. **Angin Samping** — 2 approach ring dalam crosswind 18 kt, lalu precision landing (dinilai).
5. **Medevac Senja** — short-field landing senja, sink rate ketat.
6. **Lintas Pulau** — island hop multi-leg, manajemen fuel.

Tiap misi: nama, deskripsi 1 baris, jumlah ring, cuaca/angin, fuel awal, target landing. Dipilih dari dispatch board (klik / tombol 1–6 / ESC kembali).

## Sistem baru (3)

1. **Kokpit view (`cockpit.js`)** — toggle tombol C (chase ↔ kokpit). Kamera di kursi pilot menghadap ke depan melewati hidung + prop; panel instrumen menyala: airspeed, altimeter, attitude indicator, kompas, throttle, fuel — datanya dari flight model yang sama (bukan gambar tempel). Yoke + throttle terlihat. Semua instrumen harus TERBACA di contact sheet.
2. **Dispatch board (`dispatch.js`)** — layar menu/title state: daftar 6 misi + status (selesai/belum, medali), skor pilot total, sketsa peta kepulauan (canvas, rute tiap misi), kontrol. Ini shot 3.
3. **Debrief nilai pendaratan (`debrief.js`)** — setelah landing/crash: grafik approach trace (height vs distance, garis ideal 3° vs flown dari trajektori yang direkam), sink rate saat touchdown, offset centerline, bank, grade S/A/B/C, skor, tombol Retry / Pilih Misi. Crash berjenjang: hard landing (sink melewati batas) → gear collapse → failed, dengan alasan tertulis. Ini shot 4.

Yang dipertahankan dari v1: flight model spring-damper + stall 3 fase + roll/loop 360° (sudah terverifikasi 19/19 + 13/13 — jangan rusak), terrain prosedural, awan, HUD chase, audio synth, gear fix rev3.

## Screenshot v2 (4, masing-masing sistem BERBEDA)

1. `1-cover.jpg` — chase, ring run golden hour (seperti v1, cover).
2. `2-cockpit.jpg` — kokpit view saat final (PAPI/ILS, panel menyala, runway di depan).
3. `3-dispatch.jpg` — dispatch board (6 misi + medali + peta).
4. `4-debrief.jpg` — layar debrief pasca-landing (grafik trace + grade S).

Semua render asli headless Chromium 1280×800 JPEG q82, ≤256 KiB, dilihat full-size + di ukuran contact sheet (~300px).

## Repo map (exact files)

- `PLAN_V2.md` (file ini).
- `game/src/missions.js` (BARU) — tabel 6 misi + pemilihan misi.
- `game/src/cockpit.js` (BARU) — kamera kokpit + render panel instrumen.
- `game/src/dispatch.js` (BARU) — layar dispatch board.
- `game/src/debrief.js` (BARU) — grading pendaratan + grafik trace + layar debrief.
- `game/src/game.js` (EDIT) — state dispatch/cockpit/debrief, loading misi, staged shots baru, toggle C.
- `game/src/flight.js` (EDIT) — rekam trajektori, metrik landing (sink, offset, bank).
- `game/src/hud.js` (EDIT) — baris objektif misi, penyesuaian HUD mode kokpit.
- `game/index.html` (EDIT) — script tag file baru + container DOM dispatch/debrief.
- `shots.json` (EDIT) — 4 shot: play / cockpit / dispatch / debrief.
- `screenshots/` (RE-RENDER) — 4 file di atas.
- `main.ts` (EDIT hanya bila perlu — idealnya tidak berubah; copy game/ + screenshots/ + dossier).
- `README.md` (EDIT — update judul/spec v2; edit di pesan ke-2 untuk thinking_revised).

## Langkah build (urutan tetap)

1. Tulis 4 file baru fresh di sesi ini (missions, cockpit, dispatch, debrief).
2. Edit game.js / flight.js / hud.js / index.html secukupnya untuk wiring (state + toggle + metrik).
3. Serve lokal + Playwright: 4 screenshot, cek tiap sistem berfungsi (ganti misi, toggle C, landing → debrief muncul dengan grade + grafik benar).
4. Regresi v1 jangan rusak: aerobatics 19/19 + bugfix 13/13 (harness di /tmp) tetap lolos.
5. `main.ts` 2x ke 2 dir, `diff -r` byte-identik.
6. STOP — laporan review-ready ke parent. NO SUBMIT (parent yang bundle + kit check + mock judge + submit setelah yes user).

## Gate sebelum lapor (urutan tetap)

Kit check 0 failed → mock judge menang lawan starter → user "yes" → submit. Submit TIDAK otomatis. Target lapor review-ready: ~05:30 WIB; target submit: ~06:30 WIB; R2 cutoff 07:57 WIB.

## Kriteria sukses

- 4 screenshot = 4 sistem berbeda, semua terbaca di contact sheet.
- Kokpit: panel menyala + runway/ring di depan + HUD altitude/speed/heading.
- Dispatch: 6 misi terlihat + medali + peta; semua misi bisa dipilih dan dimainkan.
- Debrief: grade + grafik trace + sink/offset/bank tampil dari data penerbangan nyata (bukan teks statis).
- Regresi v1 tetap hijau; main.ts 2x byte-identik; semua file `node --check` lolos.

## REALISM PASS (addendum, 27 Nov 00:56 WIB — atas instruksi user "visualnya kurang realistik", referensi Kabut Suar)

Mengapa: mock judge v2 memang menang, tapi user menilai visualnya kurang realistik setelah melihat preview — dan Kabut Suar membuktikan teknik visual (bukan paletnya) yang bikin render 3D terbaca nyata di ukuran juri: kabut berlapis, pantulan cahaya memanjang di air, lampu hangat melawan ambient dingin, dan instrumen bercahaya amber; keputusan yang dibuka langkah ini adalah apakah shot 3D kita bisa naik ke standar itu tanpa kehilangan identitas golden hour Nusantara.

Referensi (dilihat langsung, 4 render in-game dari harness grading — game live-nya TIDAK bisa dibuka: entry_link_url null, belum ada situs hosted):
- /tmp/kabut-suar/kabut-0.webp — kokpit final, kabut tebal, sorot mercusuar volumetrik, jalur pelampung ke titik lenyap, panel bawah 1/3 frame, 8 gauge kuningan amber.
- /tmp/kabut-suar/kabut-1.webp — kokpit rendah dekat air, pantulan lampu merah/hijau, tiang penanda, mercusuar besar di kiri sebagai penanda jarak.
- /tmp/kabut-suar/kabut-2.webp — chase flying-boat, wake putih-abu, garis pantai massa gelap + lampu rumah kuning hangat, cahaya mendung lembut tanpa bayangan keras.
- /tmp/kabut-suar/kabut-3.webp — dispatch: peta hidrografi di kertas krem (kontur kedalaman biru, garis pantai, penanda merah/hijau, panah kompas), palet arang/navy + emas + krem, judul serif emas.

Yang DIADOPSI (teknik saja, identitas golden hour + King Air Nusantara TETAP — JANGAN tiru palet biru-malam berkabut Kabut Suar):
1. Kabut/haze berlapis dengan distance fade — cakrawala larut hangat, bukan tepi keras; lapisan depan-tengah-belakang terbaca (panel → air → pantai → langit).
2. Air dengan riak + pantulan specular memanjang (sun glint golden hour di laut) + wake di belakang pesawat saat chase; bukan permukaan datar.
3. Terrain gradasi vertex-color (hijau dataran rendah → coklat → abu-abu puncak), vegetasi cluster bukan segitiga, garis pantai pasir, gunung berapi bergradasi vegetasi + asap tipis; runway lebih terbaca di cover.
4. Kokpit: gauge berbingkai kuningan dengan glow amber, yoke + throttle quadrant terlihat, panel tidak hitam datar (tone kayu/kuningan), sun glint di air di depan.
5. Dispatch map gaya peta hidrografi: kertas krem, kontur kedalaman biru, garis pantai, penanda merah/hijau, panah kompas, rute misi garis putus-putus — ganti blob hijau abstrak.
6. Material pesawat kurang flat: panel lines, aksen warna, weathering halus; prop blur.

Yang TIDAK disalin (anti-copy): nama/teks Kabut Suar (HALIMUN, PK-SGL, SUAR GELAP, TELUK BAKAU, KABUT SUAR, dsb.), layout HUD mereka verbatim, aset/kode mereka. Semua kode ditulis sendiri.

Shot yang diulang: 1-cover, 2-cockpit, 3-dispatch (peta baru). 4-debrief TIDAK disentuh. Flight model, misi, debrief, HUD tidak berubah fungsi. Regresi 34/34 + main.ts 2x byte-identik tetap wajib; commit baru setelah selesai.

## REALISM ROUND 2 (addendum, 27 Nov 01:46–02:35 WIB — atas instruksi user "masih kurang realistik" ke-3 + arahan perluas pencarian aset ke semua perpustakaan publik)

Mengapa: mock judge CC0 membuktikan tekstur tidak menggerakkan skor di ukuran juri, dan tiga kali user menilai visual kurang realistik — yang membatasi sekarang adalah geometri low-poly, hidung putih kokpit, dan aerobatik yang tak terlihat; keputusan yang dibuka langkah ini adalah apakah pesawat yang detail + interior kokpit bisa menggerakkan skor di ukuran juri, atau sudah mentok dan saatnya submit.

### Jalur pesawat yang dipilih: prosedural-detail (jalur b) — BUKAN GLTF
Pencarian model eksternal (semua sumber, 27 Nov 2026, hasil lengkap di
game/assets/NOTICE.md): Poly Haven models API — "aircraft" 0, "plane" cuma
perkakas, "hangar" 0, pohon/batu photogrammetry 100k–7,8M tris (tak usable);
Sketchfab — tak ada King Air CC0/CC-BY ≤5 MB yang bisa terbang (Free Standard
bukan CC0/CC-BY; CC-BY-NC-SA dikecualikan; CC0 56,6 MB); Blend Swap — tak ada
King Air/twin-prop sipil, unduhan butuh login (HTML interstitial terverifikasi),
`blender` TIDAK ada di VM sehingga .blend → .glb mustahil; Quaternius (CC0) —
cuma SmallPlane single-engine, stylized; Kenney (CC0) — tak ada paket pesawat
sama sekali; CGTrader/TurboSquid Free — unduhan butuh akun + lisensi
seller-chosen ambigu; Free3D — tak ada twin-prop CC0/CC-BY terverifikasi.
Kesimpulan: pesawat tetap prosedural, dibuat JAUH lebih detail dengan kode
sendiri (winglet, de-ice boot, flap track fairing, cheatline lebih lebar +
panel lines lebih gelap, belly band abu-abu, panel anti-glare diperlebar
2,1 → 2,6 rad + livery 176 → 212 px, prop disc lebih tegas).

### Yang diubah
1. Pesawat (game/src/aircraft.js): winglet biru di ujung sayap, boot de-ice
   hitam di leading edge (mengikuti sweep + dihedral), 3 flap track fairing
   per sayap (mengikuti dihedral), cheatline 44 → 58 px biru lebih dalam,
   panel lines 0,08 → 0,13 + lebih banyak ring, belly band abu-abu,
   anti-glare diperlebar (lihat atas).
2. Interior kokpit (BARU game/src/interior.js + wiring game.js
   setCockpitMode + index.html): glareshield walnut gelap + 2 A-pilar tipis
   (camera-space, ikut mode kokpit). Iterasi: v1 shelf raksasa → v2 slab →
   v3 tipis tapi mengambang (pilar tak sampai shield, pilar tengah membelah
   runway) → v4 final: shield tipis gelap + pilar tinggi menyambung shield,
   tanpa pilar tengah/side frame. Panel 9 gauge TIDAK diubah.
3. Geometri terrain (game/src/terrain.js): mesh 150 → 220 segmen; garis
   pantai berlekuk (fbm ±420 m, di-fade dekat gunung); pohon rain +1 blob
   (5), pine +1 (4), semak 380, klaster pohon di sisi final runway 36;
   atlas tanah 2x2 (rumput/batu/tanah/pasir, UV per-vertex per-biome,
   tiling 30 m); aspal Poly Haven di taxiway.
4. Aerobatik terlihat (game/src/game.js stageShot 'play'): bank lembut
   roll -0,38 rad (input -0,63; di bawah ambang rate-mode 0,95) — horizon
   miring ~22°, ring tetap di frame (0,4 km). TIDAK di-revert.
5. Kamera kokpit (game.js): seat naik 1,35 → 1,70, maju -3,0 → -2,2 +
   look.y -0,6 → +1,2. Alasan (terbukti probe panel merah): kursi v2 duduk
   tepat di garis singgung crown — permukaan panel hidung tersembunyi di
   balik siluet crown putih, cuma rim-nya yang tampil sebagai busur tipis;
   kursi yang dinaikkan membuat crown putih jatuh keluar frame dan busur
   panel gelap terbaca di bawah windshield. Hidung bukan lagi kubah putih
   dominan, melainkan tonjolan kecil berbusur gelap.
6. Aset CC0 baru (game/assets/): ground_atlas_2k.jpg (mosaik 4 tekstur
   Poly Haven 1k, desaturasi 0,35 + renormalisasi luminansi 0,91) dan
   aerial_asphalt_01_diff_1k.jpg; NOTICE.md diperbarui + daftar pencarian.
7. Harness direkonstruksi (tools/regression-v2.js + tools/probe-v2-flow.mjs):
   harness /tmp asli hilang saat /tmp dibersihkan antar sesi; dibangun ulang
   dengan cakupan setara (38 tes Node + 17 cek browser) dan disimpan di repo
   agar tidak hilang lagi. BUKAN file yang sama — laporkan sebagai
   rekonstruksi, bukan "harness yang sama".

### Yang TIDAK diubah
Flight model, misi, debrief, HUD, panel kokpit DOM, shot 3-dispatch dan
4-debrief (tidak disentuh). Tidak submit, tidak bundle.

### Verifikasi (27 Nov 02:35 WIB)
- node --check: aircraft.js, terrain.js, assets.js, interior.js, game.js lolos.
- Regresi (rekonstruksi): 38/38 lolos (≥34 yang disyaratkan).
- Probe (rekonstruksi): 17/17 lolos (semua shot SHOT-READY bersih, flow
  live title→dispatch→brief→flying, KeyC/KeyP, atlas di mesh 221x221).
- main.ts 2x ke /tmp/flight-r2-out1 & /tmp/flight-r2-out2: byte-identik
  (diff -r bersih). Dossier 745.688 byte, sha256
  72c3e6498e20b0430bc8d893e51d3c8bc4445f6a9ba70c572d24b723384f55b4.
  Game 4.348.907 byte (batas 48 MB).
- Screenshot baru: 1-cover.jpg 129.515 byte sha256 81c99711…,
  2-cockpit.jpg 119.083 byte sha256 16d238bf… (dilihat full-size).

### 3 perubahan visual terbesar per shot
- 1-cover: (1) horizon miring ~22° — roll terbaca, aerobatik terlihat;
  (2) winglet biru + cheatline/panel lines lebih tegas di pesawat;
  (3) garis pantai berlekuk + tekstur tanah per-biome (pasir pantai,
  ladang, hutan berlapis) + pepohonan lebih rapat di kejauhan.
- 2-cockpit: (1) frame windshield utuh (glareshield gelap menyambung
  2 A-pilar) — terbaca "di dalam pesawat"; (2) hidung putih besar hilang,
  tinggal tonjolan kecil berbusur panel gelap; (3) pohon di sisi final +
  taxiway aspal + tekstur tanah terlihat di bawah.

## FINAL POLISH (addendum, 27 Nov ~02:30 WIB — atas instruksi user "masih kurang sedikit lagi", pilih keduanya)

Mengapa: mock judge R2 mencatat dua sisa sebagai kelemahan nomor satu (roll penuh tak terlihat di screenshot manapun) dan nomor tiga (frame kokpit masih polos); user memilih keduanya dengan cakupan kecil — keputusan yang dibuka langkah ini adalah apakah polish kecil ini menutup celah terakhir atau sudah saatnya submit.

Yang dikerjakan (kecil, terbatas):
1. Cover mid-roll: staging 'play' di-override ke bank 50° (-0,87 rad) SETELAH 45 step settle — spring normal-mode cap 0,95 rad, jadi pose tajam harus di-set langsung (seperti staging 'bank' yang sudah ada), bukan via input. 66° (-1,15) dicoba dulu: roll terbaca, tapi gunung berapi keluar dari frame dan laut tinggal sliver — 50° menjaga horizon jelas diagonal (roll, bukan belokan) sementara gunung, pantai, dan ring tetap di frame. Vapour wingtip 0,5 (aturan vapour stepFixed sendiri).
2. Frame kokpit: A-pilar jadi grup — 4 rivet baja per pilar di sisi dalam + material konsisten (metalness 0,1, roughness 0,9, emissive kecil) supaya kiri-kanan sama-sama abu-abu, bukan kiri hitam/kanan terang; glareshield lebih tipis (0,055, dari 0,07) + seam strip walnut terang di tepi bawah; silau matahari dilembutkan (sprite opacity 0,35→0,25, skala 180→150; dome pow 220: 0,85→0,65, pow 32: 0,18→0,12). Panel 9 gauge TIDAK diubah.
3. 3-dispatch dan 4-debrief TIDAK di-restage — tapi ikut ter-render ulang oleh shoot-v2.mjs, dan hash-nya berubah: board/kontennya identik, background-nya kini menampilkan terrain R2 + matahari yang dilembutkan (file-file itu sebelumnya direstore dari HEAD pra-R2). Perbedaan byte antar render ulang berturut-turut ~0,1% (noise encoder) — konten sama.
4. Harness (rekonstruksi, tools/): ekspektasi staging bank diperbarui ke -0,87 (regression string check + probe check 3). Regresi 38/38, probe 17/17, main.ts 2x byte-identik, dossier 808.161 byte.
