// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between six screens: title, play, paused, round clear, win and time up.
//
// ?shot=start|play|end stages that scene instead of running the loop, paints
// it twice and sets window.__shotReady for a screenshot. window.__spot
// exposes the world for automated play-tests: clickAt, useHint and the live
// state.
import { BEST_KEY, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_ROUND_CLEAR, SCREEN_TIME_UP, SCREEN_TITLE, SCREEN_WIN, STEP } from './config.js';
import { advanceRound, clickAt, createWorld, currentScene, pauseGame, resumeGame, startGame, startRound, stepWorld, toTitle, useHint } from './world.js';
import { ACTION_BACK, ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, createInput } from './input.js';
import { drawGame, hitButton } from './render.js';
import { renderScenePair } from './panels.js';
import { stageShot } from './shots.js';
import { SCENES } from './scenes.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const world = createWorld();
let panels = renderScenePair(SCENES[0]);

/** Re-render the two pictures for the round the world is on. */
function refreshPanels() {
  panels = renderScenePair(currentScene(world));
}

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function finishGame() {
  if (world.score > world.best) {
    world.best = world.score;
    saveBest(world.best);
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  refreshPanels();
  let painted = 0;
  function paint() {
    drawGame(ctx, world, panels, scene.screen, { visible: false, x: 0, y: 0 });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  world.best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function start() {
    startGame(world);
    refreshPanels();
    screen = SCREEN_PLAY;
    announce(`Playing. Find 8 differences in ${currentScene(world).name}.`);
  }

  function handleClick(click) {
    const button = hitButton(click.cx, click.cy, screen);
    if (button === 'start' && screen === SCREEN_TITLE) {
      start();
      return;
    }
    if (button === 'next' && screen === SCREEN_ROUND_CLEAR) {
      advanceRound(world);
      refreshPanels();
      screen = SCREEN_PLAY;
      return;
    }
    if (button === 'again' && screen === SCREEN_WIN) {
      finishGame();
      start();
      return;
    }
    if (button === 'retry' && screen === SCREEN_TIME_UP) {
      startRound(world, world.roundIndex);
      refreshPanels();
      screen = SCREEN_PLAY;
      return;
    }
    if (button === 'menu' && screen === SCREEN_TIME_UP) {
      toTitle(world);
      screen = SCREEN_TITLE;
      return;
    }
    if (button === 'hint' && screen === SCREEN_PLAY) {
      if (useHint(world)) announce('Hint used.');
      return;
    }
    if (button === 'pause' && screen === SCREEN_PLAY) {
      pauseGame(world);
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    if (screen === SCREEN_PLAY && click.panel) {
      const events = clickAt(world, click.x, click.y);
      if (events & 1) announce(world.message);
      else if (events & 2) announce('Not there. Minus 3 seconds.');
      if (world.screen === SCREEN_ROUND_CLEAR) screen = SCREEN_ROUND_CLEAR;
      else if (world.screen === SCREEN_WIN) {
        finishGame();
        screen = SCREEN_WIN;
      } else if (world.screen === SCREEN_TIME_UP) screen = SCREEN_TIME_UP;
      return;
    }
    if (screen === SCREEN_PAUSED) {
      resumeGame(world);
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE) start();
      else if (screen === SCREEN_ROUND_CLEAR) {
        advanceRound(world);
        refreshPanels();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_WIN) {
        finishGame();
        start();
      } else if (screen === SCREEN_TIME_UP) {
        startRound(world, world.roundIndex);
        refreshPanels();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PAUSED) {
        resumeGame(world);
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PLAY) {
        const panel = input.crosshairPanel();
        if (panel && panel.panel) handleClick(panel);
      }
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) useHint(world);
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        pauseGame(world);
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        resumeGame(world);
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_BACK) {
      if (screen === SCREEN_PAUSED || screen === SCREEN_PLAY) {
        toTitle(world);
        screen = SCREEN_TITLE;
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    input.update(1 / 60);
    handleActions();
    for (const click of input.takeClicks()) handleClick(click);
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        stepWorld(world, STEP);
        accumulator -= STEP;
        if (world.screen === SCREEN_TIME_UP) screen = SCREEN_TIME_UP;
      }
    } else {
      accumulator = 0;
    }
    drawGame(ctx, world, panels, screen, input.crosshair());
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      pauseGame(world);
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Lanterns. Press Space or click to start.');
  requestAnimationFrame(frame);
}

// A small test hook: the play-test drives the real world through this.
window.__spot = {
  world,
  clickAt: (x, y) => clickAt(world, x, y),
  useHint: () => useHint(world),
  start: () => startGame(world),
  differences: () => SCENES[world.roundIndex].differences.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r })),
};

if (shot) runShot(shot);
else runGame();
