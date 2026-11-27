# Mock Judge v2 (Gemini) — Langit Nusantara (best-flight-game-20261126-0057)

**Tanggal run:** 26 Nov 2026, ~16:42–16:47 WIB (8 call, ±5 menit, selesai 16:47 WIB).
**Mengapa run ini:** mock judge v1 pakai Muse Spark sebagai stand-in karena GLM asli tidak bisa dipanggil; sekarang ada Gemini 3 flash preview yang terbukti jalan di tes semua model — ulangi adu yang sama dengan juri berbeda untuk kalibrasi apakah verdict v1 bertahan. Ini kalibrasi, bukan pengulangan untuk mengubah keputusan submit (entri sudah submit 26 Nov 16:28 WIB).

## Juri yang dipakai — BATASAN JUJUR

- **Bukan GLM asli.** Juri asli make.fun adalah `z-ai/glm-5.3-flash` via OpenRouter (superbot). Mock judge v2 ini memakai **`gemini-3-flash-preview`** via Google Generative Language API (`v1beta/models/gemini-3-flash-preview:generateContent`) sebagai juri. Jangan klaim run ini sebagai hasil GLM — ini Gemini, model dan vendor berbeda, verdictnya bisa berbeda.
- **Kriteria (dari `RULES.txt` bagian "The judge", word-for-word):** 1) game penerbangan lengkap di screenshot (cockpit/chase view di atas terrain yang dikenali, pesawat di frame dengan instrumen menyala, runway atau target ring di depan, altitude/speed/heading di HUD); 2) fun & depth (throttle & turn discipline, misi dengan tujuan berbeda, fuel/damage yang jadi keputusan); 3) feel & polish (kontrol responsif, kamera tidak melawan pilot, landing/crash terbaca); 4) look & originality (terrain + langit satu gaya, pesawat yang terlihat dibangun, instrumen yang terlihat diterbangkan, bukan digambar; dilarang menjiplak game komersial); 5) struktur (source sendiri terpisah per file dengan satu job jelas, nama sesuai fungsinya). Aturan: kriteria pertama yang berbeda yang memutuskan, kecuali kriteria belakangan berbeda jauh lebih besar.
- **Format verdict (house v2, persis):** `{"reason": "≤600 karakter", "winner": "A"|"B", "margin": 1-5}` — 1 by a hair, 2 slightly, 3 clearly, 4 much, 5 overwhelmingly. Tiap game = 2 call (kedua urutan slot); tiap call pemenang dapat 0,5 + margin/10; skor game = rata-rata; >0,5 menang. **Kepatuhan format:** semua 4 reason Gemini di run ini 487–578 karakter — di bawah batas 600.
- **Yang dinilai (mendekati house view):** contact sheet per entri (cover 768×480 di atas, 3 shot kecil di bawah, tidak diperbesar — dibuat dari screenshot yang sama dengan v1) + outline source (path, ukuran, deklarasi pertama tiap file). Berbeda dari v1: v1 membaca screenshot full-size 1280×800; Gemini di sini membaca contact sheet seperti juri asli.
- **Flakiness model:** tidak ada call yang gagal total, tapi tidak ada retry yang dibutuhkan di game flight. (Di game Token Radar, call pertama butuh 3 attempt karena 2× 503 overload — lihat laporan Token Radar.)

## Lawan yang tersedia — CELAH (sama seperti v1)

- **Anchor 1-weak, 3-mid, 4-strong + ladder rung r1–r3 TIDAK tersedia.** Mereka hanya ada di final kit (terbit setelah deadline 28 Nov 07:57 WIB). Di kit dev yang ada hanya **anchor 2-plain = starter kit** ("Block Dodger", game 2D canvas dodge-and-collect). Jadi v2, seperti v1, hanya mengadu lawan starter + versi sebelumnya. Kekalahan dari anchor 3/4 tidak bisa diuji di sini — jangan baca skor lawan starter sebagai skor lawan lapangan.

## Hasil

### Game F1 — Langit Nusantara rev3 (`0cde5ef`) vs starter (anchor 2-plain, "Block Dodger")

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (LN) |
|------|--------|--------|----------|--------|----------------|
| 1 | LN rev3 | starter | LN (A) | 5 | 1,0 |
| 2 | starter | LN rev3 | LN (B) | 5 | 1,0 |
| **Game** | | | **LN MENANG** | | **1,0** |

Reason call 1 (487 karakter): "Entry A is a sophisticated 3D flight simulation featuring complex HUD elements, flight physics including "STALL_SPEED" and "ROLL_RATE", and diverse procedural terrain. Entry B, despite its "starter-flight" path name, is actually a 2D arcade game called "Block Dodger" where the player avoids red blocks. Entry A meets every criterion, particularly the first, by providing a recognizable aircraft, cockpit-style HUD, and flight-based missions, whereas Entry B is not a flight game at all."

Reason call 2 (530 karakter): "Entry B is a comprehensive 3D flight simulator that meets all criteria, featuring a functional HUD (airspeed, altitude, heading), a flight model with stall speeds and roll rates, and procedurally generated terrain. Entry A is a simple 2D arcade game called "Block Dodger" which fails the first and most important criterion: it is not a flight game. Entry B's source code is well-structured into specific modules for aircraft, physics, HUD, and environment, whereas Entry A's scope is completely unrelated to the competition theme."

### Game F2 — Langit Nusantara rev3 (`0cde5ef`) vs pra-360° (`bf948d0`)

| Call | Slot A | Slot B | Pemenang | Margin | Skor call (rev3) |
|------|--------|--------|----------|--------|------------------|
| 1 | rev3 | pra-360 | rev3 (A) | 2 | 0,7 |
| 2 | pra-360 | rev3 | rev3 (B) | 2 | 0,7 |
| **Game** | | | **rev3 MENANG** | | **0,7** |

Reason call 1 (538 karakter): "Both entries present identical, high-quality screenshots of a complete flight game. However, the source code reveals that Entry A is the more substantive project. In 'flight.js', Entry A includes additional constants for 'ROLL_RATE' and 'LOOP_RATE' and is 50% larger than Entry B's version, indicating a deeper and more refined flight model. Entry A also contains more logic in 'game.js' and 'hud.js', suggesting a more polished experience with better defined game states and interface feedback than the lighter implementation in Entry B."

Reason call 2 (578 karakter): "Both entries share an excellent visual style and clear structure, but Entry B is the more capable simulator. Its flight.js is significantly larger and introduces ROLL_RATE, LOOP_RATE, and wrapPi, allowing for advanced aerobatics like loops and rolls that Entry A lacks. This is reflected in B's second screenshot showing a vertical maneuver. Entry B also provides more polish in its hud.js and game logic. By offering greater flight depth and maneuverability while maintaining the same high production value as A, Entry B provides a more rewarding and complete pilot experience."

## Perbandingan dengan v1 (Muse Spark stand-in)

| Game | v1 (Muse Spark) | v2 (Gemini 3 flash preview) | Kesimpulan |
|------|-----------------|------------------------------|------------|
| F1 rev3 vs starter | 1,0 (margin 5, 5) | 1,0 (margin 5, 5) | **Setuju persis** |
| F2 rev3 vs pra-360° | 0,7 (margin 2, 2) | 0,7 (margin 2, 2) | **Setuju persis** |

- **Verdict dan margin identik di kedua game.** Kalibrasi kuat: dua juri berbeda, dua cara baca berbeda (v1 full-size, v2 contact sheet), hasil sama.
- **Jalur alasan berbeda di F2 — dicatat, bukan disembunyikan.** v1 memutuskan dari yang terlihat: shot bank rev3 membuktikan roll 360° (attitude inverted, dunia miring), sementara shot bank pra-360 hanya bank sedang; v1 juga mencatat terrain pra-360 lebih terbaca. Gemini memutuskan dari outline source: `flight.js` rev3 lebih besar dan memuat `ROLL_RATE`/`LOOP_RATE`/`wrapPi`, plus `game.js`/`hud.js` lebih berisi — dan menyebut screenshot kedua entri "identical", yang tidak sepenuhnya benar (shot bank berbeda: mid-roll 360° vs bank sedang; cover/start/landing memang identik). Artinya: Gemini di game ini lebih mengandalkan outline daripada gambar. Verdictnya sama, tapi bukti yang dipakainya berbeda — bila juri asli (GLM) membaca contact sheet seperti Gemini, shot bank yang dramatis tapi abstrak tetap berisiko (lihat catatan v1 soal shot 3).
- **Risiko shot 3 (bank) tetap berlaku.** v1 sudah mencatat: shot bank paling tidak terbaca di ukuran contact sheet (terrain jadi pita diagonal abstrak, moiré laut, ring kecil). Gemini tidak menghukum ini di F2 karena lawannya versi lama yang shot-nya sama-sama satu game — lawan anchor 3/4 yang setiap shot-nya langsung terbaca tetap bisa menang di C1 dari shot ini saja. Tidak ada yang berubah dari catatan ini.

## Keputusan

**KALIBRASI SAJA — tidak ada keputusan submit baru.** Entri sudah DITERIMA 26 Nov 16:28 WIB (entry ID 01a2172f-150d-7187-bc84-b785eedb0567); mock judge v2 ini hanya mengonfirmasi verdict v1 dengan juri kedua: **PASS 2-0, skor identik (1,0 dan 0,7)**. Tidak ada perbaikan yang diminta dari run ini, dan entri yang sudah submit tidak bisa diubah. R1 cutoff 26 Nov 19:57 WIB; hasil R1 via `makefun rounds`.
