// Twin Lanterns — Five Hunts: the entry program (Node 22, stdlib only).
//
// The game itself is plain static files under game/ (index.html plus its
// ES modules, no library, no network request at run time), and the
// screenshots in screenshots/ are real renders of that game taken in
// headless Chromium. This program hands the entry in: it copies game/
// and screenshots/ from beside this file into /output and writes
// /output/dossier.json with the vendored make.fun library, which is the
// summary the judge reads.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is deterministic: it copies the same files every run, and
// the dossier is built from those bytes alone, so two runs write the
// same bytes. The library refuses an entry that would break any of the
// gate's caps (dossier text capped at 160 KiB, at most 4 screenshots of
// 256 KiB each, game/ at most 993 files and 48 MiB, no path under game/
// past 1,000 bytes), so a bad build fails here, loudly, instead of
// reaching the grader.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Count every file and directory under a path, for the stdout summary. */
function countEntries(path) {
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    total += 1;
    if (entry.isDirectory()) total += countEntries(join(path, entry.name));
  }
  return total;
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// A short summary on stdout: what landed in /output, so a failed or
// empty build is obvious without opening the dossier. The counts are
// read back from what was actually written, not from the source tree.
const gameEntries = countEntries(join(out, 'game'));
const shotCount = readdirSync(join(out, 'screenshots')).length;
console.log(`Twin Lanterns — Five Hunts entry written to ${out}`);
console.log(`  game/: ${gameEntries} entries, screenshots/: ${shotCount} files`);
console.log(`  dossier.json (${dossier.length} bytes)`);
