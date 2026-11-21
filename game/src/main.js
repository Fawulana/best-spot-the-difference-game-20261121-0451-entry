// Boot and the one loop: input is read every frame, the hunt advances
// in fixed 1/60 s steps, and the renderer paints what is there. The hunt
// moves between six screens: title, play, paused, round clear, win and
// time up. Sounds are synthesized live by audio.js and wake on the first
// gesture, since browsers stay silent until one.
//
// ?shot=start|play|snow|end stages that scene instead of running the
// loop, paints it twice and sets window.__shotReady for a screenshot.
// window.__spot exposes the hunt for automated play-tests: tapAt,
// spendHint, toggleLens and the live state.
import {
  BEST_SCORE_KEY,
  CANVAS_H,
  CANVAS_W,
  LEFT_PICTURE_X,
  MUTE_KEY,
  PICTURE,
  RIGHT_PICTURE_X,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND_CLEAR,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  STEP,
} from './config.js';
import {
  EV_FOUND,
  EV_ROUND_DONE,
  EV_TICK,
  EV_TIME_UP,
  EV_WRONG,
  backToTitle,
  beginHunt,
  beginRound,
  nextRound,
  pauseHunt,
  resumeHunt,
  sceneOf,
  tapAt,
  tick,
  createHunt,
  spendHint,
} from './world.js';
import {
  ACT_BACK,
  ACT_CONFIRM,
  ACT_HINT,
  ACT_LENS,
  ACT_MUTE,
  ACT_PAUSE,
  createInput,
} from './input.js';
import { hitButton, paintGame } from './render.js';
import { paintScenePair } from './panels.js';
import { stageShot } from './shots.js';
import { SCENES } from './scenes.js';
import {
  isMuted,
  playFound,
  playHint,
  playRoundClear,
  playTick,
  playTimeUp,
  playWin,
  playWrong,
  setMuted,
  wakeAudio,
} from './audio.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const hunt = createHunt();
let panels = paintScenePair(SCENES[0]);

/** Re-paint the two pictures for the round the hunt is on. */
function refreshPanels() {
  panels = paintScenePair(sceneOf(hunt));
}

function readStored(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be off (private windows): the best score then lasts
    // this visit only.
  }
}

function saveBest() {
  if (hunt.score > hunt.best) {
    hunt.best = hunt.score;
    writeStored(BEST_SCORE_KEY, String(hunt.best));
  }
}

function playEvents(events) {
  if (events & EV_TICK) playTick();
  if (events & EV_WRONG) playWrong();
  if (events & EV_FOUND) playFound(hunt.streak);
  if (events & EV_ROUND_DONE) {
    if (hunt.screen === SCREEN_WIN) playWin();
    else playRoundClear();
  }
  if (events & EV_TIME_UP) playTimeUp();
}

function runShot(name) {
  const scene = stageShot(name, hunt);
  refreshPanels();
  let painted = 0;
  function paint() {
    paintGame(ctx, hunt, panels, scene.screen, { visible: false, x: 0, y: 0 }, isMuted());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  hunt.best = Number.parseInt(readStored(BEST_SCORE_KEY) ?? '0', 10) || 0;
  setMuted(readStored(MUTE_KEY) === '1');
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function start() {
    beginHunt(hunt);
    refreshPanels();
    screen = SCREEN_PLAY;
    announce(`Playing. Find 10 differences in ${sceneOf(hunt).name}.`);
  }

  function syncLens() {
    const pointer = input.pointer();
    if (!hunt.lensOn || !pointer.overPanel) return;
    hunt.lensCX = pointer.x;
    hunt.lensCY = pointer.y;
    hunt.lensPanel = pointer.overPanel;
    hunt.lensPX = pointer.x - (pointer.overPanel === 'left' ? LEFT_PICTURE_X : RIGHT_PICTURE_X);
    hunt.lensPY = pointer.y - PICTURE.y;
  }

  function toggleLens() {
    hunt.lensOn = !hunt.lensOn;
    syncLens();
    announce(hunt.lensOn ? 'Magnifier on.' : 'Magnifier off.');
  }

  function toggleMute() {
    setMuted(!isMuted());
    writeStored(MUTE_KEY, isMuted() ? '1' : '0');
    announce(isMuted() ? 'Sound off.' : 'Sound on.');
  }

  function handleTap(tap) {
    wakeAudio();
    const button = hitButton(tap.cx, tap.cy, screen);
    if (button === 'start' && screen === SCREEN_TITLE) {
      start();
      return;
    }
    if (button === 'next' && screen === SCREEN_ROUND_CLEAR) {
      nextRound(hunt);
      refreshPanels();
      screen = SCREEN_PLAY;
      return;
    }
    if (button === 'again' && screen === SCREEN_WIN) {
      saveBest();
      start();
      return;
    }
    if (button === 'retry' && screen === SCREEN_TIME_UP) {
      beginRound(hunt, hunt.roundIndex);
      refreshPanels();
      screen = SCREEN_PLAY;
      return;
    }
    if (button === 'menu' && screen === SCREEN_TIME_UP) {
      backToTitle(hunt);
      screen = SCREEN_TITLE;
      return;
    }
    if (button === 'hint' && screen === SCREEN_PLAY) {
      if (spendHint(hunt)) {
        playHint();
        announce('Hint used.');
      }
      return;
    }
    if (button === 'lens' && screen === SCREEN_PLAY) {
      toggleLens();
      return;
    }
    if (button === 'pause' && screen === SCREEN_PLAY) {
      pauseHunt(hunt);
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    if (button === 'mute' && screen === SCREEN_PLAY) {
      toggleMute();
      return;
    }
    if (screen === SCREEN_PLAY && tap.panel) {
      const events = tapAt(hunt, tap.x, tap.y);
      playEvents(events);
      if (events & EV_FOUND) announce(hunt.message);
      else if (events & EV_WRONG) announce('Not there. Minus 3 seconds.');
      if (hunt.screen === SCREEN_ROUND_CLEAR) screen = SCREEN_ROUND_CLEAR;
      else if (hunt.screen === SCREEN_WIN) {
        saveBest();
        screen = SCREEN_WIN;
      } else if (hunt.screen === SCREEN_TIME_UP) screen = SCREEN_TIME_UP;
      return;
    }
    if (screen === SCREEN_PAUSED) {
      resumeHunt(hunt);
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions) wakeAudio();
    if (actions & ACT_CONFIRM) {
      if (screen === SCREEN_TITLE) start();
      else if (screen === SCREEN_ROUND_CLEAR) {
        nextRound(hunt);
        refreshPanels();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_WIN) {
        saveBest();
        start();
      } else if (screen === SCREEN_TIME_UP) {
        beginRound(hunt, hunt.roundIndex);
        refreshPanels();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PAUSED) {
        resumeHunt(hunt);
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PLAY) {
        const panel = input.crosshairPanel();
        if (panel && panel.panel) handleTap(panel);
      }
    }
    if (actions & ACT_HINT && screen === SCREEN_PLAY) {
      if (spendHint(hunt)) playHint();
    }
    if (actions & ACT_LENS && screen === SCREEN_PLAY) toggleLens();
    if (actions & ACT_MUTE) toggleMute();
    if (actions & ACT_PAUSE) {
      if (screen === SCREEN_PLAY) {
        pauseHunt(hunt);
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        resumeHunt(hunt);
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACT_BACK) {
      if (screen === SCREEN_PAUSED || screen === SCREEN_PLAY) {
        backToTitle(hunt);
        screen = SCREEN_TITLE;
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    input.update(STEP);
    syncLens();
    handleActions();
    for (const tap of input.takeClicks()) handleTap(tap);
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        const events = tick(hunt, STEP);
        playEvents(events);
        accumulator -= STEP;
        if (hunt.screen === SCREEN_TIME_UP) screen = SCREEN_TIME_UP;
      }
    } else {
      accumulator = 0;
    }
    paintGame(ctx, hunt, panels, screen, input.crosshair(), isMuted());
  }

  // Leaving the tab pauses a running hunt rather than letting the clock
  // run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      pauseHunt(hunt);
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Lanterns, five hunts. Press Space or click to start.');
  requestAnimationFrame(frame);
}

// A small test hook: the play-test drives the real hunt through this.
window.__spot = {
  hunt,
  tapAt: (x, y) => tapAt(hunt, x, y),
  spendHint: () => spendHint(hunt),
  begin: () => beginHunt(hunt),
  toggleLens: () => {
    hunt.lensOn = !hunt.lensOn;
    return hunt.lensOn;
  },
  setTimeLeft: (seconds) => {
    hunt.timeLeft = seconds;
  },
  differences: () =>
    SCENES[hunt.roundIndex].differences.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r })),
};

if (shot) runShot(shot);
else runGame();
