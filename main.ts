// Twin Lanterns — the entry program (Node 22, standard library only).
//
// The game itself is plain static files under game/ (index.html plus its ES
// modules, no library, no network request at run time), and the screenshots
// in screenshots/ are real renders of that game taken in headless Chromium.
// This program hands the entry in: it copies game/ and screenshots/ from
// beside this file into /output and writes /output/dossier.json with the
// vendored make.fun library, which is the summary the judge reads.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is deterministic: it copies the same files every run, and the
// dossier is built from those bytes alone, so two runs write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's own caps, as the kit's reference/gate.json states them: the
// dossier text is capped at 160 KiB, at most 4 screenshots of 256 KiB each,
// game/ holds at most 993 files and directories and 48 MiB in all, and no
// path under game/ runs past 1,000 bytes. The library refuses an entry that
// would break any of those, so a bad build fails here, loudly, instead of
// reaching the grader.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// A short summary on stdout: what landed in /output, so a failed or empty
// build is obvious without opening the dossier.
console.log(`Twin Lanterns entry written to ${out}`);
console.log(`  game files, screenshots and dossier.json (${dossier.length} bytes)`);
