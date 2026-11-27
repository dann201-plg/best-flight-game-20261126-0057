// main.ts — hands in the Langit Nusantara entry: copies game/ and
// screenshots/ to /output (or $MAKEFUN_OUTPUT_DIR) and writes
// /output/dossier.json with buildDossier from vendor/makefun-game.ts.
// Two runs are byte-identical: the copy is a plain recursive copy and the
// dossier is a pure function of the copied files.
import { buildDossier } from './vendor/makefun-game.ts';
import {
  chmodSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

// Remove one output child. cpSync preserves the source's read-only modes,
// so a plain recursive rm fails EACCES on a repeat run into the same
// output dir; make the tree writable and retry once. A second failure
// still throws (fail loudly instead of handing in a partial entry).
function removeChild(path: string): void {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
    makeWritable(path);
    rmSync(path, { recursive: true, force: true });
  }
}

function makeWritable(path: string): void {
  const st = lstatSync(path);
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) {
    for (const entry of readdirSync(path)) {
      makeWritable(join(path, entry));
    }
    chmodSync(path, 0o700);
  } else {
    chmodSync(path, 0o600);
  }
}

function main(): void {
  // Repo root is the directory containing this script, NOT the working
  // directory: the grader runs `node /bot/main.ts` from elsewhere, so
  // resolving from the working directory made run_completes fail (R2).
  const root = dirname(fileURLToPath(import.meta.url));
  const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
  // Fail loudly (instead of handing in a partial entry) when the game is absent.
  const indexHtml = join(root, 'game', 'index.html');
  if (!existsSync(indexHtml)) {
    throw new Error(`main.ts: no game/index.html under ${root}`);
  }
  // Clear only the CONTENTS of the output dir, never the dir itself:
  // the grader mounts /output under a read-only parent and runs as an
  // unprivileged user, so rmSync(out) failed EACCES and rejected R2+R3.
  mkdirSync(out, { recursive: true });
  for (const entry of readdirSync(out)) {
    removeChild(join(out, entry));
  }
  cpSync(join(root, 'game'), join(out, 'game'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  const dossier = buildDossier(out, CAPS);
  writeFileSync(join(out, 'dossier.json'), dossier);
  console.log(`wrote ${out}/dossier.json (${dossier.length} bytes)`);
}

main();
