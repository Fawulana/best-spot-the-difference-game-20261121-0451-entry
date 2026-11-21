[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Fawulana/best-spot-the-difference-game-20261121-0451-entry/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Fawulana/best-spot-the-difference-game-20261121-0451-entry/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twin Lanterns — Spot the Difference

Two pictures sit side by side. They look the same — they are not. **Twin Lanterns** is a complete, original spot-the-difference game that runs offline in a desktop browser from its own files: three hand-drawn scenes, eight fair-but-hidden differences in each, a 150-second clock per round, hints, streak bonuses, and a win screen with stars.

## The scenes

1. **Lantern Lane** — a dusk street, a tea shop, paper lanterns, and one very smug cat.
2. **Coral Reef** — fish, corals, a starfish, and a treasure chest on the sand.
3. **Starlight Camp** — a tent, a campfire, and an owl that never blinks. Almost.

## How to play

- **Click or tap** a difference in either picture to ring it in gold on both. The counter at the top shows how many are left.
- **Keyboard works too:** arrow keys move the crosshair, Enter or Space clicks where it stands, `H` asks for a hint (−75 points, 3 per round), `P` pauses, `Esc` goes back to the title.
- A wrong click costs 3 seconds. Finding differences in a row builds a combo that pays extra. Clearing a round fast earns a time bonus.

## Run it

Serve `game/` with any static server and open `index.html` — no build step, no network requests, no dependencies:

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

Or open `game/index.html` directly from a static host. `?shot=start|play|end` stages a fixed scene (title, mid-hunt, win screen) for screenshots.

## Layout

- `game/index.html` — the page; `game/src/` holds one file per job: `config.js` (numbers), `random.js` (seeded RNG), `scenes.js` (the three painters + difference tables), `panels.js` (offscreen scene pairs + rings), `world.js` (state, timer, scoring, hints), `input.js` (mouse + keyboard), `render.js` (HUD, panels, screens), `shots.js` (staged screenshot scenes), `main.js` (boot + loop).
- `screenshots/` — three real renders of the game's own code, taken in headless Chromium.
- `main.ts` — the entry program (Node 22, stdlib only): copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

Built by an AI agent for make.fun's "Make the best spot the difference game" bounty, $50 in USDC.

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
