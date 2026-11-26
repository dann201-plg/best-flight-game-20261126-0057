# REFERENCES — Realisme untuk revisi "Langit Nusantara"

**Game:** `best-flight-game-20261126-0057` — Three.js **r147 UMD** (classic script,
tanpa modul, tanpa import map, tanpa network), `WebGLRenderer` + `ACESFilmicToneMapping`,
`FogExp2`, shadows OFF + blob shadow. Semua adopsi di bawah ditulis agar **bisa
diterapkan di r147 offline** — tidak ada WebGPU, ES module, atau aset unduhan.
Kalau sebuah teknik aslinya butuh WebGPU/raymarching penuh, dicantumkan versi
murahnya (billboard cluster / shader sederhana) yang memberi 80% tampilan
dengan 20% biaya.

**Cara pakai file ini:** tiap seksi = (i) apa yang membuat game itu terlihat
nyata, (ii) teknik konkret yang bisa diadopsi di Three.js (geometri, parameter,
atau pendekatan spesifik), (iii) URL sumber. Revisi kode merujuk ke seksi di
sini (mis. `§6a`, `§6e`), bukan menebak dari ingatan.

**Baseline saat ini (26 Nov 2026, dari `game/src/`):** pesawat twin-prop
"Merpati Nusantara" dari lathe + extrude (panjang ±11,05 m, rentang ±15,2 m,
prop 3-blade, kaca kokpit satu dome bola), flight model arcade (lerp sikap,
stall = sink + pitch −0,12), langit = sky-dome gradient + 34 sprite awan
puff tunggal + 12 cirrus + 10 fog bank, air = `MeshPhongMaterial` shininess
tinggi, pohon belum ada (hanya warna bioma di terrain). Kesenjangan terbesar
vs referensi ada di §6 — itulah yang diprioritaskan di akhir file.

> Catatan tanggal: sumber War Thunder "Eagle's Shadow" (Nov 2026) dan MSFS 2024
> adalah yang terbaru saat riset ini (26 Nov 2026). Angka MSFS 2020 berasal dari
> Digital Foundry 2020 + Wikipedia; angka dimensi King Air/ATR dari panduan
> recognition & spesifikasi pabrikan yang dikutip.

---

## 1. Microsoft Flight Simulator 2020 / 2024

### 1.1 Apa yang membuatnya terlihat nyata
- **Separuh layar adalah langit.** Digital Foundry: "as around half of the
  screen is typically rendering the sky, a lot of the rendering budget is spent
  here" — awan, kabut dekat+jauh, dan light scattering mendapat porsi render
  terbesar, bukan terrain.
- **Awan volumetrik tanpa pop-in.** "Massive volumetric cloud formations stretch
  as far as the eye can see with no visible detail transitions or 'pop in'.
  Clouds cast shadows onto themselves, onto clouds below them and onto the
  ground, while they form and dissipate based upon wind and weather."
- **Terrain dari citra satelit + AI prosedural.** Basisnya citra satelit /
  fly-by scan untuk height + tekstur; AI offline membaca tekstur itu lalu
  mengisi terrain dengan material, jalan, bangunan, semak, dan pohon dari
  brush-set; seniman lalu memperhalus lokasi tertentu dengan fotogrametri.
  Hasilnya: 2 juta kota, 1,5 miliar bangunan, 2 triliun pohon (klaim MSFS 2020).
- **Atmosfer berlapis seperti dunia nyata.** "Light sources such as the sun,
  moon, or city lights scatter appropriately… pollution levels and humidity
  affect refraction and overall visibility, and the atmosphere is layered the
  same as it is in the real world." Awan dimodelkan volumetrik dengan
  **32 layer** yang menentukan bentuk, densitas, dan "fuzziness".
- **MSFS 2024 — grid 3D, bukan preset awan.** Bukan lagi konsep "jenis awan"
  per preset: "it's a 3D grid system of **64 altitude sections** (also for
  wind), and in each the cloud density/fluffiness/thinness/stretch/etc is set
  up differently, and then the lighting engine raymarches thru the cloud
  layers." Ada awan cirrus baru, scattering dikerjakan ulang, pencahayaan
  fotometrik (lihat §2), dan densitas awan badai lebih tinggi.
- **MSFS 2024 — dunia 3D penuh.** "Full 3D, not just a texture on the ground":
  vegetasi prosedural dalam **30 bioma**, 500+ kota TIN, 150 bandara
  hand-crafted, 40.000 bandara prosedural, 1,5 miliar bangunan, ~3 triliun
  pohon, 500.000 obstacle tinggi (menara, turbin), ray-traced ground shadows,
  dan pesawat AI berlivery.
- **Air & pantulan.** Sistem pantulan memakai ray marching lewat voxel untuk
  jarak dekat, dicampur screen-space reflections + cube map untuk air yang
  jauh; air mengalir mengikuti arah angin; volumetric lighting menyorot
  tetesan air di kaca kokpit.
- **Kokpit & pesawat presisi.** Kokpit dirender "second to none", dengan
  screen-space reflections di kaca; 45 pesawat baru di 2024 dengan kokpit 1:1.

### 1.2 Yang bisa diadopsi di Three.js (r147)
- **Anggaran layar 50% langit.** Jangan hemat di langit: sky-dome +
  sun-glow + awan harus mendominasi frame chase-cam. Di `sky.js`, naikkan
  jumlah dan variasi awan (lihat §6d), jangan tambah detail terrain dulu.
- **Awan berlapis, bukan satu ketinggian.** Tiru 32-layer / 64-seksi dalam
  bentuk murah: 3 slab ketinggian — cumulus rendah (240–520 m, sudah ada),
  stratocumulus menengah (550–750 m, deck bergelombang, opacity 0,55–0,75),
  cirrus tinggi (620–860 m, sudah ada, dibuat lebih tipis & memanjang).
  Tiap slab punya coverage, ukuran, dan drift berbeda.
- **Bayangan awan di tanah (fake).** Tanpa shadow map: tambahkan 6–10 elips
  gelap transparan (`CircleGeometry`, opacity 0,10–0,18, `depthWrite:false`)
  di atas terrain, bergerak mengikuti awan cumulus terbesar, skala
  300–600 m. Ini satu-satunya cara murah meniru "clouds cast shadows onto
  the ground" — dampak visual besar di screenshot dari ketinggian.
- **Kabut dekat + jauh + scattering.** Sudah ada `FogExp2(0xf2c9a0, 0,00011)`.
  Tambahkan: (a) horizon band hangat yang lebih lebar di sky-dome
  (`smoothstep(0,0, 0,30, h)` bukan 0,22), (b) warna kabut = warna horizon
  agar terrain jauh melebur ke langit tanpa garis keras, (c) sun-glow
  `pow(s, 8)` sudah ada — tambahkan halo Mie kedua `pow(s, 3) * 0,15`.
- **Terrain berbioma dari noise, bukan warna datar.** Tiru pipeline
  satelit→AI→brush dalam bentuk murah: heightfield fBm + peta bioma
  (vertex color) dari noise kedua — sawah = petak-petak hijau/kuning
  beraturan (grid 80–150 m), hutan = hijau gelap bergerombol (lihat §6c),
  pantai = pasir 10–20 m di garis pantai, kota = abu-abu + kotak instanced
  di dekat runway. Jalan = strip gelap 6–8 m mengikuti kontur, bukan garis
  lurus.
- **Bandara hand-crafted di tengah dunia prosedural.** Runway sudah ada;
  tambahkan marka yang dibaca juri dari udara: threshold stripes
  (8 garis putih 30×3 m), nomor runway "36" besar, garis tengah putus-putus
  tiap 30 m, taxiway + apron abu-abu, 4–6 lampu runway (sprite emissive
  oranye/putih), dan 2–3 bangunan terminal kotak beratap biru. Ini yang
  membedakan "bandara" dari "strip abu-abu".
- **Air: sun glint, bukan cermin.** Lihat §6e. Jangan pakai reflector
  (mahal, tidak ada di r147 UMD tanpa addon); pakai Phong shininess tinggi
  + normal ripple (lihat §6e).
- **Jangan tiru:** streaming Azure / fotogrametri / 2 PB data — mustahil
  offline dan dilarang (no network). Gantinya: seed deterministik
  (`mulberry32`, sudah ada) + CanvasTexture prosedural.

### 1.3 Sumber
- https://www.digitalfoundry.net/articles/digitalfoundry-2020-flight-simulator-preview-tech-analysis
- https://en.wikipedia.org/wiki/Microsoft_Flight_Simulator_(2020_video_game)
- https://www.flightsimulator.com/microsoft-flight-simulator-2024/
- https://www.pcgamer.com/games/sim/more-details-on-ms-flight-simulator-2024-including-full-3d-landscapes-in-30-biomes
- https://www.avsim.com/profile/406599-lwt1971/content/page/32/?all_activity=1

---

## 2. X-Plane 12

### 2.1 Apa yang membuatnya terlihat nyata
- **Photometric lighting.** "With photometric lighting, every surface is
  rendered with real light intensities, capturing the subtleties of natural
  light across different times of day and weather conditions. The addition of
  bloom effects further enhances realism." Intensitas cahaya dalam satuan
  fisik, bukan nilai 0–1 sembarangan — matahari terbenam terasa hangat dan
  redup secara benar, bukan sekadar di-tint oranye.
- **Awan volumetrik + live weather.** "Dramatically improved volumetric
  clouds and real live weather system. The new volumetric clouds create
  stunning, dynamic skies that evolve with the weather."
- **Vegetasi & air 3D.** "New 3D trees that sway in the wind, realistic 3D
  water that reacts naturally to weather, and updated autogen that brings
  cities and landscapes to vivid detail."
- **Bandara 3D massal.** "Over 20,000 3D airports sourced from the X-Plane
  Gateway, each with unique, community-driven enhancements" + tekstur segar,
  perahu bergerak.
- **Update 12.2.0 (2025):** dark-cockpit fix (exposure fusion — kokpit gelap
  tetap terbaca saat langit terang), revamped cloud scattering, tone-mapping
  baru, atmospheric rendering upgrade, ground texture bandara spesifik.

### 2.2 Yang bisa diadopsi di Three.js (r147)
- **Photometric-look dengan 2 cahaya, bukan 1.** Sudah ada pola ini di
  `sky.js` — pertahankan dan kuatkan rasionya: `DirectionalLight` hangat
  (`0xffd9a0`, intensitas 1,55) dari arah matahari rendah + `HemisphereLight`
  dingin (`sky 0x9fc4e8 / ground 0x5a6b46`, 0,75). Aturan: matahari =
  hangat & keras, langit = dingin & lembut. Jangan pakai ambient putih
  netral — itu yang membuat scene terlihat "flat".
- **Exposure ala 12.2.0.** `renderer.toneMappingExposure = 1,0–1,15`
  (sudah ACES, lihat §6e). Untuk shot kokpit/HUD: jangan naikkan exposure
  global; naikkan emissive HUD/instrumen saja, supaya langit tidak blow-out
  — itu inti "exposure fusion" versi murah.
- **Pohon 3D bergoyang (bukan sprite datar).** Lihat §6c. Goyang = rotasi
  kecil tajuk (`sin(t*0,8 + phase) * 0,02 rad`) — murah, cukup di vertex
  shader atau per-instance rotation tiap frame untuk pohon dekat saja.
- **Air 3D yang bereaksi terhadap cuaca.** Air bukan bidang datar statis:
  tambahkan 2–3 gelombang sinus di vertex shader air (amplitudo 0,3–0,8 m,
  panjang gelombang 20–60 m) + normal ripple di fragment. Angin = arah
  gelombang = arah drift awan (satu `windDir` global).
- **Bandara: tekstur tanah spesifik.** Apron/taxiway sedikit lebih gelap
  dan kasar dari runway; tambahkan noda ban (dark streaks, CanvasTexture)
  di touchdown zone runway — detail kecil yang langsung dibaca sebagai
  "bandara sungguhan" dari udara.

### 2.3 Sumber
- https://store.steampowered.com/app/2014780/XPlane_12/?snr=1_300_morelikev2__104_13
- https://flyawaysimulation.com/ask/answers/best-flight-simulators-steam/

---

## 3. DCS World & IL-2 Sturmovik

### 3.1 Apa yang membuatnya terlihat nyata
- **DCS — kokpit clickable 1:1 & sistem pesawat.** Modul full-fidelity DCS
  memodelkan tiap saklar, sistem elektrik/pneumatik/bahan bakar, dan
  keterbatasan spesifik pesawat. Pelajaran untuk game ringan: **instrumen
  harus merespons input**, bukan gambar statis — RPM/tekanan/flap/gear
  berubah saat tombol ditekan.
- **DCS — prop yang terlihat salah merusak semuanya.** Forum DCS 2.0:
  animasi prop yang berputar "simply looks unnatural, both seen from the
  outside and the cockpit" — komunitas meminta efek stroboskopik dan
  perilaku sesuai RPM, bukan sekadar disc buram. IL-2 1946 sudah memodelkan
  efek stroboskopik sampai batas tertentu dan itu dipuji sebagai sentuhan
  realisme.
- **IL-2 — kokpit 4K & instrumen hidup.** Update 4.505: "All player-controlled
  aircraft got 4K quality cockpit textures" + spinner kanan Pe-2 yang tidak
  boleh menggelap saat prop berputar. Panduan IL-2: kokpit P-39N-1 punya
  60+ item yang "compare closely in placement and detail to the documentation
  in actual pilot's handbooks"; gauge terpenting (airspeed, altimeter,
  artificial horizon, turn & bank, variometer, manifold pressure, tachometer)
  besar dan di tengah pandangan.
- **IL-2 — flight model setara DCS PFM.** "Flight model is comparable to
  that of DCS PFM", dengan prop pitch, oil/water shutter, dan fuel mixture
  yang memengaruhi performa; tiap tombol di kokpit punya animasi; damage
  model membuat sayap benar-benar patah/bengkok; stall & spin realistis
  (model F-14 FlightGear/JSBSim: "accurate stalls, spins, and other
  departures (including flat spin)", Dutch roll, control reversal di
  high-alpha — lihat §6b).

### 3.2 Yang bisa diadopsi di Three.js (r147)
- **Prop: 3 lapis, bukan 1 disc.** (a) Blade asli (lihat §6a: 4 blade
  King Air) yang terlihat saat RPM rendah / di darat; (b) disc transparan
  (`CircleGeometry`, opacity 0,10–0,18, warna gelap) saat RPM tinggi;
  (c) ring tip blur — torus tipis transparan di ujung radius blade.
  Cross-fade (a)→(b) berdasarkan throttle/RPM, jangan switch mendadak.
  Spinner **jangan** digelapkan saat berputar (bug IL-2 Pe-2 yang
  diperbaiki) — spinner tetap warna livery, putarannya tidak terlihat
  karena simetris.
- **Stroboskopik murah.** Pada 60 fps, putar prop dengan sudut
  `t * RPM` tapi tambahkan jitter kecil agar blade tidak terlihat
  "membeku" di satu posisi tiap frame; atau pada RPM tinggi sembunyikan
  blade dan tampilkan disc saja (yang sudah dilakukan `aircraft.js`,
  tapi threshold-nya harus dari throttle, bukan `airborne`).
- **Kokpit/instrumen hidup.** HUD sudah ada (airspeed tape, altimeter,
  horizon, kompas). Tambahkan 2 jarum yang bergerak dari state nyata:
  RPM prop (dari throttle + spool lag, §6b) dan slip ball (dari
  koordinasi belokan — lihat §6b). Instrumen yang bergerak = bukti
  "sistem", bukan dekorasi.
- **Panel: gelap + emissive, bukan putih terang.** Material kokpit
  `color 0x1a1e22, roughness 0,85`; gauge face emissive lembut
  (`emissive 0x0a2a1a`, jarum putih/hijau). Di golden hour, kokpit
  harus lebih gelap dari langit — kontras inilah yang membuat DCS/IL-2
  terlihat dalam.
- **Detail kecil yang dibaca juri:** pitot tube (§6a), landing light
  (§6a), nav light merah kiri / hijau kanan / putih ekor (sudah ada,
  pertahankan), strobe putih berkedip (sudah ada, 6 Hz), dan antena
  kecil di atas fuselage (2 blade antenna, `BoxGeometry` tipis).

### 3.3 Sumber
- https://forum.dcs.world/topic/113329-propellers-in-dcs-world-20/
- https://steamcommunity.com/app/307960/discussions/0/1489992080517876242/
- https://store.steampowered.com/oldnews/?l=german&feed=steam_community_announcements&appids=307960&appgroupname=IL-2+Sturmovik%3A+Battle+of+Stalingrad+Deluxe&enddate=1609488000
- https://zaretto.com/f-14
- https://flyawaysimulation.com/ask/answers/best-flight-simulators-steam/

---

## 4. War Thunder — Eagle's Shadow (Nov 2026)

### 4.1 Apa yang membuatnya terlihat nyata
- **Model kelembapan + vapor sayap.** "Each weather preset in battle now has
  a new variable called humidity data. The humidity model, together with data
  on speed, altitude and angle of attack, now determines the nature and
  intensity of vapor effects in flight. On a dry clear day you will hardly
  see any vapor, but under a low overcast or over the sea it becomes **three
  times stronger**!" Vapor sheet muncul di critical angle of attack, tumbuh
  dengan G dan kecepatan, memudar ke trailing edge, menipis di ketinggian
  (udara kering/dingin); pada sayap sweep variabel, sheet ikut berputar.
- **Glints & glow di air.** "Previously, only the sun could sparkle on the
  water… Every light source now has its own reflection. Muzzle flashes, fires,
  and lamps are now reflected on the water using the same model as the sun,
  refracting on waves and ripples… At night, light not only reflects off the
  water but also spreads beneath it, illuminating the water volume from
  within." Aktif di setting High/Ultra.
- **Godrays kembali + horizon tajam.** Renderer lama membuat banding gelap
  di ketinggian; fix cepat (fog blur lebih kuat) menghilangkan godrays.
  Renderer baru: "Fog and haze are now rendered smoothly and correctly at
  all altitudes and distances. The horizon line has become sharp, haze over
  the sea has appeared when looking from high altitude, and the crepuscular
  rays have returned."
- **Awan tidak berulang.** "Every patch of sky gets its own copy of the cloud
  shape with random offset and rotation, seamlessly blended with its
  neighbors. The cloud pattern no longer repeats… and it does not require
  additional system resources."
- **Cuaca 12 preset + pencahayaan per preset.** "New cloud formations with
  more realistic shapes and density… lighting has been improved. Light now
  interacts with surfaces in different ways, depending on the selected
  weather preset."

### 4.2 Yang bisa diadopsi di Three.js (r147)
- **Vapor = f(humidity, G, AoA, kecepatan, ketinggian).** Sudah ada sprite
  vapor di ujung sayap (`aircraft.js`, opacity dari bank). Perbaiki
  rumusnya — jangan dari bank saja:
  `vapor = clamp((G − 1) * 0,8 + (AoA − AoA_crit) * 0,5, 0, 1) * humidity * altitudeFactor`,
  dengan `humidity = 1,0` di atas laut / di bawah awan rendah, `0,3` di
  hari kering; `altitudeFactor = 1 − altitude/900 * 0,6`. Vapor muncul
  sebagai sheet di atas sayap (sprite memanjang sepanjang chord, bukan
  titik di ujung), memudar ke trailing edge (gradient opacity di tekstur),
  dan hilang saat G turun. Ini satu baris rumus, dampak besar di shot bank.
- **Sun glint = model yang sama untuk semua cahaya.** Di game ini hanya ada
  1 sumber (matahari) — tapi prinsipnya: glint harus mengikuti arah
  matahari, bukan posisi kamera semata. Lihat §6e untuk implementasi
  Phong/GGX-nya.
- **Godray palsu (sudah ada, perbaiki).** Sprite glow additive di posisi
  matahari (`sky.js`) sudah benar arahnya. Tambahkan 2–3 "shaft" tipis
  (plane transparan additive, opacity 0,05–0,10) dari arah matahari
  menembus celah awan saat kamera menghadap matahari — hanya terlihat
  saat `dot(viewDir, sunDir) > 0,85`, jadi tidak mengganggu frame lain.
- **Horizon tajam + sea haze.** Jangan biarkan fog mengaburkan garis
  horizon jadi pita gelap (bug War Thunder lama). Pastikan: warna fog =
  warna horizon sky-dome; transisi laut→langit di horizon dibuat dengan
  gradient sky-dome yang menyentuh `h ≈ 0`, bukan dengan fog yang
  menebal tiba-tiba. Cek di screenshot: tidak boleh ada garis/banding
  horizontal di kejauhan.
- **Awan acak per patch.** Sudah ada seeded RNG — pastikan tiap awan
  punya offset/rotasi/skala acak independen (sudah), dan **jangan** pakai
  grid beraturan atau pola berulang. Tambahkan 2 tekstur awan berbeda
  (puff bulat vs puff memanjang) dan pilih acak per awan.

### 4.3 Sumber
- https://warthunder.com/en/news/10317-development-eagles-shadow-new-rendering-part-1-en
- https://warthunder.com/en/news/10323-meet-the-eagles-shadow-major-update-en
- https://patchbeat.net/news/war-thunder-eagles-shadow-new-rendering-part-1/

---

## 5. Aerofly FS 4 & FlightGear — teknik game ringan

### 5.1 Apa yang membuatnya terlihat nyata (dengan budget kecil)
- **Aerofly FS 4: mulus dulu, dalam kemudian.** "Beautiful graphics, smooth
  frame rates… sharp cockpits, clean lighting, and realistic terrain…
  Smooth performance, quick loads, and responsive controls." Pelajaran:
  frame rate stabil + loading cepat + kontrol responsif terasa lebih
  "nyata" daripada fitur yang banyak tapi patah-patah. Di Steam, Aerofly
  adalah pilihan saat "consistently fluid performance matters more than an
  extensive add-on library".
- **FlightGear: open-source, JSBSim, kebebasan total.** "Free and open-source…
  realistic time-of-day modeling… 20,000 airports… Anyone familiar with
  programming can make changes." Flight model-nya JSBSim (C++, open source)
  adalah referensi standar untuk FDM berbasis tabel koefisien aerodinamika
  (lihat §6b). Kualitas pesawatnya tidak konsisten — pelajaran: **satu
  pesawat yang dibuat dengan benar mengalahkan 20 pesawat asal-asalan**.
- **GeoFS (web, ringan):** bukti bahwa flight sim bisa jalan di browser
  dengan terrain streaming + model sederhana — relevan karena game ini
  juga browser-only.

### 5.2 Yang bisa diadopsi di Three.js (r147)
- **Prioritas performa Aerofly:** kunci 60 fps di headless Chromium
  (SwiftShader) — itu syarat screenshot. Artinya: `InstancedMesh` untuk
  pohon/bangunan (1 draw call per jenis), geometri terrain 128×128 (sudah),
  awan sebagai sprite (bukan mesh volumetrik), shadows OFF (sudah),
  tekstur CanvasTexture 256–512 px (sudah). Jangan tambah shadow map
  atau raymarching penuh — keduanya membunuh frame di SwiftShader.
- **JSBSim sebagai pola pikir, bukan kode.** JSBSim menghitung gaya/momen
  dari tabel koefisien `CL(α), CD(α), Cm(α)` × dynamic pressure
  `q = ½ρV²` × area referensi. Di `flight.js`, tiru strukturnya dalam
  bentuk sederhana: lift ∝ `V² * CL(α)`, drag ∝ `V² * CD(α)`,
  `CL` naik linear sampai α kritis ±15° lalu jatuh (stall), `CD`
  naik kuadratik dengan α. Ini 10 baris, tapi memberi stall yang
  "terasa" benar — lihat §6b.
- **Satu pesawat, dibuat benar.** Jangan tambah jenis pesawat. Perbaiki
  "Merpati Nusantara" sampai proporsinya benar (§6a) — itu yang difoto
  juri di 4 screenshot.
- **Time-of-day modeling (FlightGear).** Golden hour sudah dipilih dengan
  benar (matahari rendah = relief terrain terlihat, bayangan panjang).
  Pertahankan matahari di elevasi ±14° (`SUN_DIR.y = 0,24`) — jangan
  naikkan ke siang hari, karena siang hari menghilangkan drama dan
  membuat terrain terlihat datar.

### 5.3 Sumber
- https://privatejetinsider.com/best-flight-simulator-pc/
- https://www.eneba.com/hub/gaming-gear/flight-simulator-setup-guide/
- https://flyawaysimulation.com/ask/answers/flight-simulators-mac-mini/
- https://jsbsim.sourceforge.net/Newsletter_3_1.pdf
- https://docs.rs/avian_fdm/latest/avian_fdm/

---

## 6. FOKUS KHUSUS

### 6a. Hidung pesawat twin-prop sungguhan (King Air / ATR 72 / Cessna Caravan)

**Kenapa ini penting:** di chase-cam, hidung + kaca kokpit adalah bagian
pesawat yang paling dekat dengan kamera dan paling sering difoto. Hidung
yang terlalu runcing / terlalu bulat / kaca yang salah bentuk langsung
terbaca sebagai "pesawat kartun" — sebaliknya, hidung yang benar membuat
seluruh pesawat terlihat benar meski bagian lain sederhana.

#### Dimensi acuan (King Air 350 — model acuan "Merpati Nusantara")
| Ukuran | Nilai | Rasio |
|---|---|---|
| Panjang keseluruhan | 14,22 m (46,7 ft) | 1,00 |
| Rentang sayap | 17,65 m (57,9 ft) | 1,24 × panjang |
| Tinggi keseluruhan | 4,37 m (14,4 ft) | 0,31 × panjang |
| Diameter fuselage | 1,60 m (5 ft 3 in) | 0,113 × panjang |
| Diameter prop | 2,67 m (104–105 in), 4-blade Hartzell | 1,67 × diameter fuselage; 0,151 × rentang |
| Mesin | 2× PT6A-60A, 1.050 shp | — |
| Kabin | 5,94 m × 1,37 m × 1,45 m | — |
| Konfigurasi | Low-wing, T-tail, 7 jendela kabin/sisi (350) | — |

Perbandingan: Cessna Caravan (single-prop, high-wing) panjang 11,46 m
(37,6 ft), rentang 15,88 m (52,1 ft), tinggi 4,57 m — lebih pendek dan
lebih "kotak". ATR 72: panjang 27,17 m, rentang 27,05 m (rasio ±1,00),
high-wing, T-tail, hidung **bulat membulat (bulbous)**, 6-blade (seri
-500/-600) atau 4-blade (seri -200/-210), nacelle teardrop bersih, dan
wing root sedikit anhedral (menukik ke bawah di pangkal sebelum panel
luar naik). **Keputusan untuk game ini:** tetap King Air 350 (low-wing,
T-tail) sebagai acuan — jangan campur dengan ATR (high-wing) atau
Caravan (single-prop, high-wing), karena mencampur konfigurasi adalah
kesalahan paling mudah terlihat.

#### Bentuk hidung yang benar (King Air)
- **Tidak runcing, tidak bulat penuh: blunt-rounded.** Hidung King Air
  adalah kerucut tumpul — radius mengecil dari diameter penuh (1,60 m)
  ke ujung dalam jarak ±1,8–2,2 m, dengan ujung membulat (radius ujung
  ±0,25–0,35 m), bukan titik. Di profil lathe, jangan pakai 1 titik
  lancip; pakai 3–4 titik yang melengkung (kurva, bukan garis lurus).
  Contoh profil lathe yang dikoreksi (jari-jari, jarak dari ujung hidung):
  `(0,28; 0) → (0,55; 0,25) → (0,72; 0,6) → (0,80; 1,0) → (0,80; 1,8)`
  lalu diameter penuh. Hidung ATR lebih bulat lagi (bulbous, hampir
  setengah bola); hidung Cessna (400 series) lebih panjang dan runcing —
  jangan tiru keduanya untuk King Air.
- **Hidung lebih rendah dari garis atap kokpit.** Garis atas fuselage
  turun landai dari atap kokpit ke ujung hidung; garis bawah naik lebih
  curam dari bawah. Akibatnya hidung terlihat "menunduk" sedikit dari
  samping — jangan buat sumbu hidung horizontal simetris.
- **Kaca kokpit — ini yang paling sering salah.** King Air punya kaca
  khas: **2 windshield depan** (kiri/kanan, trapesium, miring ke belakang
  ±25–30° dari vertikal, bertemu di tiang tengah yang tipis dan sedikit
  miring), lalu **jendela samping segitiga** di depan, lalu **jendela
  samping bentuk D** (sisi lurus di depan, melengkung di belakang) sebagai
  jendela kokpit terakhir. Jangan pakai satu dome bola (yang dipakai
  `aircraft.js` saat ini: `SphereGeometry(0,85)` scale `(0,95; 0,55; 1,7)`)
  — dome membuat pesawat terlihat seperti helikopter / pesawat kartun.
  Implementasi di Three.js: 2 plane trapesium (`ShapeGeometry`, miring
  ±28°) + 2 segitiga samping + 2 bentuk D (`Shape` dengan `absarc` untuk
  sisi lengkung), material kaca gelap mengkilap (`metalness 0,9,
  roughness 0,08–0,12, color 0x0a1c28`), dengan frame tipis gelap
  (`0x1a1e22`) di sekeliling tiap panel. Posisi: windshield mulai
  ±0,55 m di belakang ujung hidung, tinggi ±0,45 m, lebar tiap panel
  ±0,55 m; jendela D berakhir ±1,6 m di belakang ujung hidung.
- **Jendela kabin: bulat, bukan kotak.** King Air memakai jendela kabin
  **bulat** (round windows) — 5/sisi di seri 90/100, 7/sisi di 350 —
  diameter ±0,28 m, jarak antar pusat ±0,85 m, garis tengah jendela
  ±0,15 m di atas garis tengah fuselage. Jangan pakai jendela persegi
  (itu Queen Air awal / Piper PA-31) atau oval (itu Cessna 400).
- **Spinner + prop.** Spinner King Air 350: kerucut tumpul (bukan runcing
  panjang), panjang ±0,35 m, diameter dasar ±0,28 m, warna livery
  (biru di game ini) dengan ujung sedikit membulat. Prop: **4 blade**
  (bukan 3 seperti di `aircraft.js` saat ini), diameter 2,67 m, blade
  lebar di pangkal (±0,18 m) menipis ke ujung, twist ±15° di pangkal →
  ±5° di ujung (cukup dengan rotasi blade `rotation.x` kecil per blade),
  warna gelap (`0x22262a`) dengan ujung kuning tipis (stripe 0,08 m —
  detail yang sangat dibaca sebagai "prop sungguhan"). Disc blur
  transparan radius = radius prop, opacity 0,12–0,16.
- **Pitot tube.** King Air: pitot di **bawah hidung** (seri C90 ke atas)
  atau di bawah leading edge sayap kiri (seri 90/A90/B90 awal). Untuk
  game ini: 1 pitot di bawah hidung kiri-kanan? — cukup **2 pitot kecil
  di bawah hidung** (silinder `r 0,02 m, panjang 0,35 m`, mengarah ke
  depan, posisi `y −0,55 m, z +3,8 m` dalam skala game) + 1 di bawah
  sayap kiri. Jangan letakkan pitot di atas hidung atau di ekor.
- **Landing light.** King Air E90 ke atas: landing light **tidak lagi di
  leading edge sayap** — pindah ke hidung / nacelle. Untuk game ini:
  1 landing light di hidung bawah (lensa bulat `r 0,12 m`, emissive
  putih hangat, + cone cahaya transparan additive saat malam/landing)
  dan 1 di tiap nacelle. Jangan taruh di ujung sayap.
- **Nacelle mesin.** Nacelle PT6 King Air: silinder teardrop panjang
  ±2,7 m, diameter ±0,55 m, intake udara di depan berbentuk setengah
  cincin / oval di bawah spinner (bukan lubang bundar besar), exhaust
  kecil di samping belakang nacelle. Nacelle menonjol ±0,6 m ke depan
  leading edge sayap.
- **Ekor: T-tail.** King Air 200/300/350 memakai **T-tail** — horizontal
  stabilizer di puncak fin, bukan di fuselage bawah (itu seri 90/100
  low-tail). Fin: leading edge menyapu ke belakang ±35°, tinggi ±2,1 m
  di atas fuselage, ujung sedikit membulat; stabilizer rentang ±2,6 m
  (dalam skala game) dengan dihedral 0°. Ventral fin kecil di bawah ekor
  (sirip segitiga ±0,5 m) — detail yang sering dilupakan.
- **Skala game saat ini — koreksi.** `aircraft.js`: panjang 11,05 m,
  rentang 15,2 m → rasio rentang/panjang 1,37 (terlalu lebar/pendek vs
  King Air 1,24). Koreksi: panjangkan fuselage ke ±12,5 m (skala game)
  atau pendekkan rentang ke ±13,8 m, dan naikkan diameter prop dari
  2,30 m ke ±2,6 m. Prop 3-blade → 4-blade. Kaca dome → panel trapesium
  + segitiga + D (di atas).

#### Sumber
- https://www.aircraftrecognitionguide.com/beech-queen-air-king-air
- https://www.learn-atc.com/tools/aircraft/beechcraft-king-air-350i
- https://www.planetrackapp.com/aircraft-types/atr/atr-72-600
- https://www.planetrackapp.com/aircraft-types/atr/atr-72-200
- https://aviation.racetagger.cloud/blog/regional-jets-identification-guide

### 6b. Flight model yang stabil dan terasa berat

**Kenapa ini penting:** juri menilai dari screenshot + outline, tapi
"terasa berat" terlihat di screenshot bank/landing: pesawat yang stabil
tidak miring sembarangan, belokannya terkoordinasi, dan landing-nya
datar — pesawat arcade yang melayang-layang terlihat dari sikap yang
tidak konsisten antar shot.

#### Prinsip dari dunia nyata (JSBSim / FlightGear / teori stabilitas)
- **Stabilitas berasal dari turunan, bukan dari lerp.** JSBSim dan
  `avian_fdm` memakai metode **stability-derivative**: gaya/momen =
  koefisien tabel `CL(α), CD(α), Cm(α)` × `q = ½ρV²` × `S`.
  "JSBSim, FlightGear, and most fixed-wing game simulators use the same
  method. The method gives realistic stall behavior, Reynolds-number
  effects, and control-surface authority." Damping pitch/roll/yaw
  (`Cmq, Clp, Cnr`) adalah turunan yang membuat osilasi meluruh.
- **Tiga mode longitudinal:** short period (cepat, ±1–2 s, harus
  teredam kuat), phugoid (lambat, ±20–60 s, redaman lemah — pesawat
  naik-turun perlahan jika dibiarkan), dan trim. Tiga mode
  lateral-directional: roll subsidence (cepat), spiral (lambat, bisa
  divergen pelan), Dutch roll (osilasi yaw-roll, periode ±2,5 s,
  damping ratio ±0,32 pada contoh EC135 yang diuji).
- **Dihedral effect:** sayap ber-dihedral (ujung naik) membuat pesawat
  cenderung meratakan sayap saat sideslip — momen roll yang melawan
  slip. Terlalu besar = pesawat terasa "kaku" dan menolak bank;
  terlalu kecil = spiral divergen.
- **Weathervane stability:** fin vertikal membuat hidung cenderung
  menunjuk ke arah angin relatif (seperti baling-baling cuaca) — momen
  yaw yang melawan sideslip. Fin besar = weathervane kuat = pesawat
  stabil di yaw tapi butuh rudder lebih untuk slip.
- **Trim:** elevator trim menggeser sudut serang trim sehingga pesawat
  terbang lurus tanpa gaya di stick pada kecepatan tertentu. Tanpa trim,
  pilot harus menahan stick terus — di game, ini berarti pesawat harus
  punya kecepatan trim (mis. 55 m/s) di mana pitch netral.
- **Stall yang realistis (bukan sekadar sink).** "Lift & Airspeed: faster
  flight = more lift. If you slow down too much, you will stall and lose
  altitude rapidly… Exceed the critical angle (~15°) and airflow separates…
  To recover: push the nose DOWN, add throttle, and let speed build before
  pulling up again." Update Hellcat MSFS: "Improved stall characteristics
  with smoother airflow detachment and reattachment, and more predictable
  aileron response near the stall… clearer pre-stall warnings through the
  controls… Removed excessive virtual dihedral effect that made the aircraft
  feel artificially stable at times."
- **Stability Augmentation System (SAS).** FlightGear F-14 (JSBSim, dari
  NASA TM-81833): "pitch, roll, and yaw SAS channels using simulated
  angular velocity sensors" — SAS adalah feedback rate: elevator ∝
  −pitch-rate, aileron ∝ −roll-rate, rudder ∝ −yaw-rate. SAS tidak
  mengubah trim, hanya menambah redaman.

#### Implementasi di `flight.js` (r147, fixed-step 1/60)
1. **Ganti lerp sikap dengan pegas-redaman orde-2.** Saat ini:
   `pitch = lerp(pitch, input*MAX, 1−pow(0,0015, dt))` — ini
   eksponensial orde-1, terasa "licin" dan tidak punya inersia.
   Ganti dengan: `pitchRate += (input*MAX_PITCH_RATE − pitchRate) * dt / τ`
   lalu `pitch += pitchRate * dt`, dengan `τ pitch = 0,45 s, τ roll = 0,30 s,
   τ yaw = 0,60 s`. Tambahkan redaman: `pitchRate *= exp(−dt * 2,2)`
   saat input dilepas. Hasil: pesawat merespons dengan jeda, lalu
   berhenti dengan sedikit overshoot — terasa berat.
2. **Efektivitas kontrol ∝ V².** "Flight controls are more effective at
   higher speeds. At low speed, you'll notice sluggish response."
   Kalikan otoritas pitch/roll dengan `clamp((V/40)², 0,25, 1,0)`.
   Di bawah 25 m/s, kontrol terasa berat — ini yang membuat takeoff
   dan landing terasa berbeda dari cruise.
3. **Kurva kontrol progresif (expo).** Jangan linear: `out = input³ * 0,6
   + input * 0,4` (atau `input * |input|`). Stick kecil = koreksi halus
   di tengah; stick penuh = otoritas penuh di ujung. Ini mencegah
   over-control yang membuat screenshot bank terlihat ekstrem.
4. **Dihedral + weathervane sebagai momen pasif.** Tiap frame:
   `roll += −k_dihedral * sideslip * dt` (k ≈ 0,15/s) dan
   `heading += −k_weathervane * sideslip * dt` (k ≈ 0,25/s), dengan
   `sideslip` dari komponen kecepatan lateral. Efek: lepas stick →
   sayap merata perlahan (±3–5 s), hidung kembali ke arah gerak.
   Jangan terlalu kuat — Hellcat belajar bahwa "excessive virtual
   dihedral" terasa artifisial.
5. **SAS murah: rate damping.** `pitchRate *= exp(−dt*0,8)`,
   `rollRate *= exp(−dt*1,2)`, `yawRate *= exp(−dt*0,6)` tiap frame
   (nilai = SAS gain). Ini setara pitch/roll/yaw damper FlightGear,
   tanpa sensor. Matikan SAS saat stall (di bawah) agar pesawat terasa
   "lepas" — kontras yang memberi drama.
6. **Trim.** Tambahkan `trimPitch` (default = pitch untuk terbang lurus
   di 55 m/s). Input pitch = `input + trimPitch`. Saat pemain menahan
   pitch netral di kecepatan trim, pesawat terbang lurus tanpa input —
   ini yang membuat cruise terlihat tenang di screenshot.
7. **Stall: 3 fase, bukan 1.** (a) **Pre-stall** (V < 32 m/s atau
   α > 12°): buffet — getar kamera kecil (`camera shake ±0,02 rad`,
   HUD AoA kuning) + otoritas aileron turun 50%; (b) **Stall**
   (V < 26 m/s atau α > 15°): lift jatuh 40%, hidung turun
   (`pitch → −0,15`), satu sayap turun (`roll → ±0,25` acak pelan —
   wing drop), sink rate naik; (c) **Recovery:** hanya jika hidung
   diturunkan + throttle > 0,7 + V > 30 m/s. Jangan pulihkan stall
   hanya karena pemain menarik stick — itu kesalahan arcade yang
   paling terasa salah bagi yang tahu terbang.
8. **Throttle spool lag.** "The engine takes about 2 seconds to spool
   up or down. Throttle changes aren't instant." `throttleActual +=
   (throttleTarget − throttleActual) * dt / 2,0`. Prop RPM mengikuti
   `throttleActual`, bukan input langsung — suara + visual prop ikut.
9. **Prop torque & P-factor (opsional, murah).** "At high power settings,
   the spinning propeller creates a torque effect that tends to roll the
   aircraft left." Tambahkan `roll += −0,02 * throttleActual` saat
   takeoff/climb — cukup untuk memberi alasan memakai rudder/aileron
   kanan, dan memberi karakter twin-prop (dua prop yang berputar
   berlawanan? King Air: keduanya searah — torque tidak saling
   meniadakan, jadi efek ini nyata).
10. **Ground effect.** "When flying within one wingspan of the ground
    (~12 m), you'll experience extra lift." Tambahkan lift +15% dan
    drag −10% saat `height < 12 m` — membuat flare saat landing terasa
    mengambang, bukan jatuh.

#### Sumber
- https://itcallme.com/NanoFlight/index.html
- https://flyingironsimulations.com/blogs/news/msfs2020-f6f-5-hellcat-update-1-1-0-is-now-available
- https://docs.rs/avian_fdm/latest/avian_fdm/
- https://zaretto.com/f-14
- https://sourceforge.net/p/flightgear/fgaddon/19573/?page=13
- http://elearn.psgcas.ac.in/nptel/courses/video/101104064/lec37.pdf

### 6c. Pohon realistis di game

**Kenapa ini penting:** dari ketinggian, hutan adalah tekstur; dari
rendah (takeoff/landing), pohon adalah objek 3D. Pohon cone tunggal
adalah penanda "game murah" yang paling cepat dikenali — bahkan di
screenshot kecil.

#### Prinsip dari game & Three.js
- **InstancedMesh = 1 draw call untuk ribuan pohon.** "Draw thousands of
  copies with InstancedMesh or mix variations in one call with BatchedMesh;
  `THREE.LOD` is not per instance, so group instances by level per chunk."
  (FoliMesh). Di r147, `THREE.InstancedMesh` sudah tersedia — pakai itu,
  bukan `Mesh` per pohon.
- **Tajuk berlapis, bukan satu cone.** "Tree canopies are lumpy organic
  crowns, trunks taper and lean" — tajuk = 3–5 bola/icosahedron yang
  saling tumpang tindih (offset ±0,5–1,0 m, radius 0,6–1,2×), bukan 1
  cone. "Per-instance colour variation — each tree canopy gets a slightly
  different green tint so trees don't look identical."
- **Hutan padat = cluster, bukan sebaran merata.** "Distant dense forest
  patches use a single low-poly, vertex-coloured canopy mesh per chunk."
  Pohon tumbuh bergerombol (noise threshold) dengan celah terbuka —
  sebaran uniform terlihat seperti perkebunan, bukan hutan.
- **MSFS 2024:** 30 bioma, ratusan spesies vegetasi, "dynamically created
  details including grass, rocks, and flowers — all influenced by seasonal
  changes"; pohon 3D bergoyang di X-Plane 12.

#### Implementasi di Three.js (r147, offline)
- **3 spesies, 2 geometri tiap spesies.** (a) **Palem tropis** (paling
  Indonesia): batang melengkung (`CylinderGeometry` 5 segmen, miring
  ±8°) + 6–8 daun menjuntai (`PlaneGeometry` melengkung, DoubleSide);
  tinggi 8–14 m. (b) **Pohon hujan tropis:** batang lurus + tajuk 4 bola
  (`IcosahedronGeometry(r, 1)`, flat shading) bertumpuk; tinggi 12–20 m.
  (c) **Pinus pegunungan (dekat gunung berapi):** batang + 3 cone
  bertumpuk mengecil; tinggi 10–16 m. Tiap spesies = 1 `InstancedMesh`
  batang + 1 `InstancedMesh` tajuk (total 6 draw call untuk seluruh hutan).
- **Variasi per instance.** `setColorAt(i, color)` dengan hue hijau
  ±10%, skala `0,7–1,4×` (distribusi lognormal — banyak pohon sedang,
  sedikit yang sangat besar), rotasi Y acak, lean ±3°. Jangan pakai
  skala seragam.
- **Penempatan: cluster + mask bioma.** Pohon hanya di mana
  `forestNoise(x,z) > 0,55` DAN `height > 5 m` DAN `slope < 0,35` DAN
  jauh dari runway/jalan/kota (> 40 m). Jumlah: 800–1.500 instance
  dalam radius 1.200 m dari runway (dekat = detail), + 1 "canopy shell"
  per chunk jauh (mesh datar hijau gelap bertekstur noise, tanpa pohon
  individu) untuk hutan di kejauhan. Ini meniru "distant dense forest
  patches use a single low-poly canopy mesh per chunk".
- **LOD murah per chunk.** Bagi pohon ke 3 `InstancedMesh` per spesies
  berdasarkan jarak dari runway (dekat < 400 m: tajuk 3 bola; menengah
  400–900 m: tajuk 1 bola; jauh > 900 m: hanya canopy shell). Tidak
  perlu `THREE.LOD` per instance — kelompokkan per chunk, seperti
  saran FoliMesh.
- **Goyang angin.** Jangan animasi per pohon di CPU. Patch material
  tajuk dengan `onBeforeCompile`: `transformed.x += sin(time*0,8 +
  instancePhase) * 0,05 * position.y / height` — goyang kecil di
  ujung tajuk saja. Atau, lebih murah: goyangkan hanya 50 pohon terdekat
  dengan rotasi per-instance tiap frame.
- **Bayangan pohon.** Shadows OFF — ganti dengan darkening vertex color
  di sisi tajuk yang menjauhi matahari (bake `color = base * (0,75 +
  0,25 * dot(normal, sunDir))` saat membuat geometri). Tajuk yang
  setengah gelap terlihat 3D tanpa shadow map.

#### Sumber
- https://patch.gg/patch/forests
- https://folimesh.com/threejs/trees
- https://github.com/abhiverse01/fouryam/blob/HEAD/README.md
- https://www.flightsimulator.com/microsoft-flight-simulator-2024/
- https://store.steampowered.com/app/2014780/XPlane_12/?snr=1_300_morelikev2__104_13

### 6d. Formasi awan realistis & langit/atmosfer

**Kenapa ini penting:** awan puff seragam = wallpaper. Awan nyata punya
**jenis, ketinggian, dan struktur** — cumulus punya dasar datar dan puncak
kembang kol, stratus adalah lembaran, cirrus adalah sapuan tipis. Juri
melihat langit di separuh frame; variasi di sinilah yang membedakan
"langit game" dari "langit foto".

#### Taksonomi awan (untuk penempatan yang benar)
| Genus | Ketinggian | Bentuk kunci | Di game ini |
|---|---|---|---|
| Cumulus | Rendah (±600–2.000 m) | Dasar datar, puncak kembang kol, tumbuh vertikal | Cluster utama, bisa diterbangi |
| Stratocumulus | Rendah | Gulungan bergelombang, deck tambal sulam dengan celah | Deck menengah, opacity sedang |
| Stratus | Rendah | Lembaran seragam, abu-abu, menutup langit | Fog bank rendah (sudah ada) |
| Cumulonimbus | Rendah→tinggi | Menara besar + anvil di puncak, dasar gelap | 1–2 menara jauh sebagai landmark |
| Altocumulus | Menengah (2–6 km) | Petak beriak, pola teratur | Deck tipis jauh |
| Cirrus | Tinggi (6–12 km) | Sapuan tipis, ekor kuda, halo di sekitar matahari | Cirrus memanjang (sudah ada) |

#### Prinsip dari raymarching (dan versi murahnya)
- **Awan = volume, bukan permukaan.** "Clouds are not surfaces; they are
  volumes of water droplets that scatter light… density is 3D fractal noise
  minus a coverage threshold, so only the denser parts of the noise become
  cloud. The density is shaped by height within the slab, rounded at the
  bottom and wispy at the top, which mimics real cumulus."
- **Self-shadowing = sisi bawah gelap.** "At each sample, a short secondary
  march towards the sun accumulates density… Thick cloud between the point
  and the sun means little light arrives, which is what gives clouds their
  darker undersides." + **Beer–Lambert:** `T = e^(−density × distance)`.
- **Phase function = silver lining.** "A Henyey–Greenstein phase function
  with a forward lobe (controlled by *g*) makes clouds glow brightly when
  you look towards the sun, the silver lining effect." + **Powder effect:**
  tepi tipis yang menghadap matahari sedikit digelapkan → tampilan
  kembang kol.
- **MSFS 2024:** grid 64 seksi ketinggian, tiap seksi punya
  density/fluffiness/thinness/stretch berbeda, lalu raymarch. **Skydrift /
  @takram/three-clouds:** Perlin-Worley shape, weather cells, edge erosion,
  cone-sampled lighting, temporal accumulation, lapisan cirrus terpisah,
  light shafts.
- **War Thunder:** tiap patch langit punya copy bentuk awan dengan offset
  + rotasi acak, blend mulus dengan tetangga — tidak ada pengulangan.

#### Implementasi di Three.js r147 (tanpa raymarching penuh)
Raymarching penuh tidak feasible di r147 UMD + SwiftShader. Pakai
**billboard cluster berlapis** — 80% tampilan, 5% biaya:
1. **Satu awan = cluster 5–9 sprite, bukan 1 puff.** Tiap cluster:
   1 sprite dasar lebar (dasar datar — scale `w × w*0,25`), 3–5 sprite
   puncak (bulat, menumpuk di atas dasar, offset ±20% lebar), 1–2 sprite
   pinggir tipis. Semua sprite pakai 2 tekstur berbeda (bulat vs
   memanjang). Ini langsung memperbaiki "puff seragam" — awan terlihat
   punya struktur.
2. **Variasikan 4 parameter per cluster, bukan 1.** Skala (260–620 m
   sudah ada — perluas ke 200–900 m), opacity (0,45–0,90), rasio
   lebar/tinggi (0,30–0,55), dan rotasi sprite (±15°). Tambahkan
   **3 ukuran kelas**: kecil (200–350 m, banyak), sedang (400–600 m),
   besar (700–1.200 m, sedikit, sebagai landmark).
3. **Dasar gelap, puncak terang (fake self-shadowing).** Tiap cluster:
   sprite dasar pakai warna `0xd8d2e8` (abu-ungu dingin, opacity 0,7),
   sprite puncak pakai putih hangat `0xfff6e8` (opacity 0,85). Sisi yang
   menghadap matahari lebih terang: tint sprite berdasarkan
   `dot(clusterPos − sunDir)`. Ini meniru "darker undersides" tanpa
   light march.
4. **Silver lining murah.** Sprite di tepi cluster yang menghadap
   matahari: tambahkan sprite tipis additive (`blending: AdditiveBlending`,
   opacity 0,15–0,25) di sisi matahari. Hanya untuk 5–8 cluster terdekat
   dengan matahari — cukup untuk efek di shot cover.
5. **Tiga slab + 1 menara.** Cumulus 240–520 m (sudah ada, jadikan cluster),
   stratocumulus 550–750 m (deck 8–12 cluster besar, opacity 0,55),
   cirrus 620–860 m (sudah ada, buat lebih tipis: `w × w*0,10`), +
   **1 cumulonimbus jauh** (menara 1.200 m tinggi, dasar gelap, anvil
   di puncak — landmark di horizon, memberi skala pada dunia).
6. **Fly-through.** Saat kamera masuk ke dalam cluster (jarak < 100 m),
   fade opacity cluster itu ke 0,15 dan tampilkan fog putih sesaat
   (`scene.fog` naik sementara) — meniru "terbang menembus awan" tanpa
   volume nyata. Ini yang membuat MSFS terasa: awan bukan backdrop.
7. **Langit: Preetham, bukan gradient linear.** `THREE.Sky` (Preetham)
   memakai Rayleigh (biru, `1/λ⁴`) + Mie (halo putih di sekitar matahari,
   `g = 0,8`, `mieCoefficient 0,005`, `turbidity 2`). Di r147 UMD,
   `Sky` tidak tersedia tanpa addon — tiru dengan shader yang sudah ada
   di `sky.js`, tapi perbaiki: (a) `turbidity` tinggi saat golden hour
   (langit lebih hazy/oranye), (b) Mie halo `pow(s, 8)` sudah ada,
   tambahkan `pow(s, 32) * 0,5` untuk inti terang, (c) di bawah horizon
   (`vDir.y < 0`), jangan hitam — pakai warna laut/kabut agar tidak ada
   garis hitam di horizon.
8. **Aerial perspective.** Objek jauh (terrain, gunung) harus memudar ke
   warna horizon berdasarkan jarak — `FogExp2` sudah melakukan ini,
   tapi pastikan warna fog = warna horizon (`0xf2c9a0`) dan densitas
   cukup rendah (0,00011) agar gunung masih terlihat samar, bukan hilang.

#### Sumber
- https://threejsdemos.com/demos/raymarching/clouds
- https://getskydrift.com/
- https://npm.io/package/@takram/three-clouds
- https://skillsadd.com/smithery/ck42bb/procedural-clouds
- https://brewser.io/threejs-shaders-sky/
- https://masterallarts.com/learn/threejs-from-zero/s11-14-hillaire-atmosphere/
- https://www.avsim.com/profile/406599-lwt1971/content/page/32/?all_activity=1

### 6e. Sun glint di air, ACES tone mapping & bayangan

**Kenapa ini penting:** sun glint adalah satu garis cahaya di air yang
langsung berkata "matahari rendah, laut nyata". Tanpa glint, laut terlihat
seperti plastik biru. ACES adalah yang membuat matahari tidak blow-out
putih dan langit tidak clip — tanpanya, golden hour terlihat seperti
filter oranye.

#### Prinsip
- **Sun glint = specular sempit + Fresnel.** Permukaan air memantulkan
  langit dengan bobot Fresnel (Schlick, **2% di incidence normal**,
  mendekati 100% di grazing angle) — "The surface… reflect with a Fresnel
  weight (Schlick, 2% at normal incidence), so the reflection is faint
  looking straight down and strong at grazing angles." Matahari menambah
  2 lobe specular: glint tajam + sheen lembut. "The sun's glitter. The lobe
  is Gaussian, as the slopes of a wind-ruffled sea are, and gives the mean
  brightness of a pixel. Close to the eye a pixel holds only a few glinting
  wavelets… Far away… it shows the mean." (Cox–Munk slopes ±13° di angin
  12 knot; di tenang, slopes hilang dan pantulan menajam.)
- **Gerstner waves + analytic normal.** "Shade the sea per pixel from the
  analytic derivatives of a deep-water Gerstner sum, and fade each wave out
  once its wavelength falls below the pixel footprint." Spektrum: 8 gelombang
  Gerstner, dispersi air dalam `ω = √(g·k)`, panjang gelombang 78 m → 3,1 m.
  "Specular reflections combine… dual-lobe GGX microfacet solar glints,
  Schlick Fresnel… and translucent Subsurface Scattering (SSS) when thin
  wave crests are backlit."
- **ACES tone mapping.** `renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1,2` (contoh di skill procedural-clouds).
  ACES memetakan HDR ke LDR dengan roll-off halus di highlight — matahari
  tetap kuning/oranye, bukan putih clip, dan bayangan tetap punya detail.
  Render ke HalfFloat target lalu bloom + ACES adalah pipeline lengkapnya;
  versi murah: ACES di renderer (sudah ada di game ini) + exposure 1,0–1,15.
- **Bayangan: matahari rendah = bayangan panjang.** MSFS 2024: ray-traced
  ground shadows. X-Plane 12.2.0: perbaikan shadow artifact. War Thunder:
  godrays + horizon tajam (lihat §4).

#### Implementasi di Three.js r147
1. **Air — tingkat 1 (sudah ada, pertahankan + poles).**
   `MeshPhongMaterial({ color: 0x1a5a8a, shininess: 120, specular: 0xffe0b0 })`
   + `DirectionalLight` dari arah matahari. Naikkan `shininess` ke
   **100–150** (glint sempit) dan buat warna specular **hangat**
   (`0xffd9a0`, bukan putih) agar glint berwarna matahari terbenam.
   Tambahkan normal ripple murah: `onBeforeCompile` atau CanvasTexture
   noise sebagai `normalMap` (repeat 40×40, offset bergerak dengan waktu)
   — ripple inilah yang memecah glint jadi jalur berkilau, bukan satu
   titik.
2. **Air — tingkat 2 (disarankan, masih murah).** Custom `ShaderMaterial`
   air: 3 gelombang Gerstner di vertex shader (amplitudo 0,4 / 0,25 /
   0,12 m; panjang gelombang 60 / 25 / 8 m; arah = arah angin), normal
   analitik dari turunan gelombang, Fresnel Schlick
   `F = 0,02 + 0,98 * pow(1 − dot(V, N), 5)`, warna = campur
   `deepColor (0x0a3a5a)` ↔ `skyColor (horizon)` berdasarkan Fresnel,
   + specular Blinn-Phong `pow(max(dot(reflect(-L, N), V), 0), 200) *
   sunColor * 2,0` untuk glint. Glint harus **memanjang ke arah kamera
   dari matahari** (jalur cahaya), bukan lingkaran — itu terjadi otomatis
   jika normal bervariasi.
3. **Jalur glint (glitter path).** Pastikan matahari rendah (elevasi
   ±14°) dan kamera chase-cam menghadap ke arah matahari di shot cover
   — jalur glint akan terlihat sebagai garis emas di laut menuju horizon.
   Jangan letakkan matahari di belakang kamera untuk semua shot; 1 shot
   harus menghadap matahari.
4. **ACES — jangan diubah, tapi kalibrasi.** Sudah
   `ACESFilmicToneMapping` — pertahankan. `toneMappingExposure = 1,05`
   (jangan 1,5 — langit blow-out; jangan 0,7 — scene muram).
   `outputColorSpace = SRGBColorSpace` (r147: `outputEncoding =
   THREE.sRGBEncoding`). Semua warna material yang dipilih di atas
   diasumsikan dalam pipeline ini; jika exposure diubah, kalibrasi ulang
   warna langit & air.
5. **Bayangan — tetap OFF, tapi palsukan 3 hal.** (a) Blob shadow pesawat
   (sudah ada, opacity 0,22 — naikkan ke 0,28 saat rendah, turunkan ke
   0,10 saat tinggi, skala membesar dengan ketinggian); (b) bayangan
   awan di terrain (§1.2); (c) sisi gelap objek: bake darkening di
   vertex color berdasarkan `dot(normal, sunDir)` untuk fuselage,
   pohon, dan bangunan — sisi menjauhi matahari 25–30% lebih gelap.
   Jangan aktifkan shadow map: di SwiftShader headless, shadow map
   2048 px untuk dunia 6 km adalah biaya besar dengan hasil buruk
   (peter-panning / acne).
6. **Bloom murah (opsional).** Tanpa post-processing: sprite glow
   additive di matahari + di lampu runway + di nav light sudah memberi
   80% efek bloom. Jangan tambah `UnrealBloomPass` (tidak ada di r147
   UMD tanpa addon, dan mahal di SwiftShader).

#### Sumber
- https://github.com/getedgehq/skills/blob/HEAD/realistic-water/SKILL.md
- https://raw.githubusercontent.com/pibvbp/sailing-school/main/docs/rendering.md
- https://skillsadd.com/smithery/ck42bb/procedural-clouds
- https://zz85.github.io/random-sketches/vibes/koi/BLOG.html
- https://warthunder.com/en/news/10317-development-eagles-shadow-new-rendering-part-1-en

---

## 7. Daftar prioritas — 10 teknik dengan dampak visual terbesar

Diurutkan dari dampak terbesar per biaya implementasi, khusus untuk
"Langit Nusantara" (Three.js r147, chase-cam, golden hour, 4 screenshot
juri). Nomor 1–4 adalah yang terlihat di **setiap** screenshot; 5–10
memperkuat shot tertentu.

| # | Teknik | Dampak | Biaya | File yang diubah |
|---|---|---|---|---|
| 1 | **Hidung + kaca kokpit King Air yang benar (§6a)** — hidung blunt-rounded, 2 windshield trapesium + jendela segitiga + D, jendela kabin bulat, prop 4-blade | Pesawat berhenti terlihat kartun; ini objek utama di semua shot | Sedang (geometri baru, ~80 baris) | `aircraft.js` |
| 2 | **Awan cluster berlapis + dasar gelap/puncak terang (§6d)** — 1 awan = 5–9 sprite, 3 slab + 1 cumulonimbus jauh, silver lining | Langit (50% frame) berhenti terlihat wallpaper; depth & skala langsung naik | Sedang (ubah `sky.js`, 2 tekstur baru) | `sky.js` |
| 3 | **Sun glint + air Gerstner/Fresnel (§6e)** — shininess 100–150, specular hangat, normal ripple, 3 gelombang | Laut berubah dari plastik biru jadi laut golden-hour; jalur emas ke horizon di shot cover | Sedang (shader air / poles Phong) | `terrain.js` (air) / shader baru |
| 4 | **Flight model berat: pegas-redaman orde-2 + kontrol ∝ V² + expo + stall 3 fase (§6b)** — pesawat merespons dengan jeda, stall ada buffet & wing drop | Sikap pesawat di shot bank/landing terlihat konsisten & terkoordinasi; tidak melayang | Sedang (~60 baris di `flight.js`) | `flight.js` |
| 5 | **Pohon instanced berlapis 3 spesies (§6c)** — palem + hujan tropis + pinus, tajuk 3–5 bola, cluster noise, 800–1.500 instance | Terrain dekat runway & hutan dari udara terlihat hidup, bukan warna datar | Sedang (InstancedMesh ×6) | `terrain.js` baru / `trees.js` |
| 6 | **Photometric-look: matahari hangat keras + hemisphere dingin (§2.2) + ACES exposure 1,05 (§6e)** — kalibrasi, bukan tambah cahaya | Seluruh scene mendapat "rasa" foto golden-hour; bayangan panjang & relief terrain muncul | Rendah (parameter saja) | `sky.js`, `game.js` (renderer) |
| 7 | **Bandara hand-crafted (§1.2)** — threshold stripes, nomor "36", garis tengah, taxiway, lampu, terminal, noda ban | Shot landing/start langsung terbaca sebagai bandara sungguhan | Rendah–sedang (CanvasTexture + sprite) | `terrain.js` |
| 8 | **Vapor sayap = f(humidity, G, AoA) (§4.2) + prop 3-lapis + strobe (§3.2)** — vapor sheet di atas sayap saat bank curam, prop cross-fade by RPM | Shot bank mendapat drama & bukti "fisika"; prop tidak terlihat beku/salah | Rendah (rumus + material) | `aircraft.js`, `flight.js` |
| 9 | **Bayangan palsu: blob pesawat + bayangan awan + sisi gelap baked (§6e, §1.2)** — tanpa shadow map | Depth & ketinggian terbaca; pesawat "menempel" di dunia, bukan melayang | Rendah (elips + vertex color) | `aircraft.js`, `sky.js`, `terrain.js` |
| 10 | **Horizon tajam + sea haze + godray palsu (§4.2, §6d)** — fog = warna horizon, shaft additive saat menghadap matahari | Frame terlihat "lega" & sinematik; menghilangkan garis/banding di kejauhan | Rendah (parameter + 2–3 plane) | `sky.js` |

**Yang sengaja TIDAK diprioritaskan:** raymarching volumetrik penuh,
shadow map, bloom post-processing, streaming terrain, dan fotogrametri —
semuanya mahal di SwiftShader / mustahil offline di r147 UMD, dan
dampaknya kalah dari 10 teknik di atas untuk format juri (4 screenshot
statis + outline).

---

## 8. Cek cepat sebelum revisi dianggap selesai

- [ ] Hidung: profil lathe melengkung (bukan titik), kaca = trapesium +
  segitiga + D (bukan dome), jendela kabin bulat, prop 4-blade + stripe
  kuning, pitot di bawah hidung, landing light di hidung/nacelle.
- [ ] Rasio pesawat: rentang/panjang ±1,24; diameter prop ±1,67× diameter
  fuselage; T-tail (stabilizer di puncak fin).
- [ ] Flight model: lepas stick → sayap merata dalam 3–5 s; kontrol berat
  di kecepatan rendah; stall ada buffet → wing drop → recovery hanya
  dengan hidung turun + throttle; throttle spool ±2 s.
- [ ] Awan: tidak ada 2 cluster yang identik (skala/rotasi/opacity acak);
  dasar awan lebih gelap dari puncak; ada 3 ketinggian + 1 menara jauh.
- [ ] Air: glint hangat memanjang ke arah matahari di shot cover; tidak
  ada garis hitam/banding di horizon.
- [ ] Pohon: 3 spesies, tajuk berlapis, cluster (bukan grid), variasi
  skala/warna per instance.
- [ ] ACES exposure 1,05; matahari hangat + hemisphere dingin; blob
  shadow + bayangan awan ada; shadows tetap OFF.
- [ ] 4 screenshot dilihat full-size + 300 px: HUD terbaca, pesawat
  proporsional, langit mendominasi frame tanpa terlihat berulang.

---

*Riset: 26 Nov 2026, web search + fetch teks halaman (tanpa live browser).
Semua URL di atas disalin verbatim dari hasil search/fetch. Angka dimensi
King Air 350: panjang 14,22 m, rentang 17,65 m, tinggi 4,37 m, diameter
fuselage 1,60 m, diameter prop 2,67 m (104–105 in). ATR 72: panjang
27,17 m, rentang 27,05 m. Cessna Caravan: panjang 37,6 ft, rentang 52,1 ft.*
