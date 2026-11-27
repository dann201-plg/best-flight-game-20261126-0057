/* missions.js — Langit Nusantara v2: the six named sorties of the
   "Langit Nusantara" campaign. Each mission is one set of parameters on
   the same flight model and the same archipelago — a different goal, not
   a different game. Names, places and wording are our own Nusantara
   flavour. Loaded before game.js; game.js reads MISSIONS as its LEGS. */

const MISSIONS = [
  {
    name: 'POS MERPATI',
    text: 'Surat fajar: lima ring di atas pesisir utara — laut di kiri, sawah di bawah — lalu mendarat dan berhenti di runway 36.',
    route: 'Pesisir → pulau-pulau → final runway 36',
    rings: [[400, 90, -500], [900, 110, -1100], [300, 100, -1700], [-400, 120, -1500], [-900, 100, -900]],
    fuel: 100,
    timeLimit: 200,
    windKt: 0,
    windDir: 1,
    goal: '5 ring pesisir, lalu landing',
  },
  {
    name: 'KAWAH BERAPI',
    text: 'Slalom di bibir kaldera: lima ring di atas kawah berasap — jaga ketinggian, jangan potong jalur terlalu rendah.',
    route: 'Bibir kawah → kawah → final runway 36',
    rings: [[-1200, 220, -800], [-1600, 320, -1200], [-2100, 380, -1600], [-1900, 300, -2000], [-1200, 200, -1900]],
    fuel: 100,
    timeLimit: 220,
    windKt: 6,
    windDir: -1,
    goal: '5 ring kaldera, jaga ketinggian',
  },
  {
    name: 'BADAI PENYELAMAT',
    text: 'Menembus squall menuju zona drop: bahan bakar ketat, angin kencang — terbang lurus, jangan berlama-lama.',
    route: 'Kota → sungai → zona drop',
    rings: [[600, 90, 200], [900, 110, 800], [700, 100, 1600], [200, 90, 1200], [-300, 100, 600]],
    fuel: 70,
    timeLimit: 180,
    windKt: 18,
    windDir: 1,
    goal: '5 ring menembus squall, fuel 70%',
  },
  {
    name: 'ANGIN SAMPING',
    text: 'Dua ring pendekatan dalam crosswind 18 kt, lalu precision landing yang dinilai — centerline dan sink rate menentukan grade.',
    route: 'Pendekatan → ring 1 → ring 2 → final runway 36',
    rings: [[300, 70, 1100], [100, 50, 750]],
    fuel: 85,
    timeLimit: 200,
    windKt: 18,
    windDir: -1,
    goal: '2 ring pendekatan + precision landing',
    strict: true,
  },
  {
    name: 'MEDEVAC SENJA',
    text: 'Short-field landing saat senja: tiga ring rendah, lalu mendarat selembut mungkin — sink rate ketat, pasien di belakang.',
    route: 'Pesisir rendah → lapangan → final runway 36',
    rings: [[400, 60, -300], [700, 70, -700], [300, 60, -1200]],
    fuel: 80,
    timeLimit: 160,
    windKt: 8,
    windDir: 1,
    goal: '3 ring rendah + soft landing',
    sinkLimit: 2.0,
  },
  {
    name: 'LINTAS PULAU',
    text: 'Island hop multi-leg: rute panjang lintas kepulauan — kelola bahan bakar sampai pulang, jangan sampai kering di tengah laut.',
    route: 'Pesisir → kaldera → pesisir → final runway 36',
    rings: [[400, 90, -500], [-1200, 220, -800], [900, 110, -1100], [-2100, 380, -1600], [-900, 100, -900]],
    fuel: 90,
    timeLimit: 280,
    windKt: 10,
    windDir: -1,
    goal: '5 ring lintas pulau, kelola fuel',
  },
];

// Medals: a landing grade earns a medal for that mission.
function medalForGrade(grade) {
  if (grade === 'S') return 'EMAS';
  if (grade === 'A') return 'PERAK';
  if (grade === 'B') return 'PERUNGGU';
  return null;
}

// Pilot progress for the dispatch board: medals per mission id (1-based)
// plus the pilot's total score. Kept in memory; the dispatch module owns
// the copy the board shows.
function createPilotProgress() {
  return { score: 0, medals: {}, completed: {} };
}
