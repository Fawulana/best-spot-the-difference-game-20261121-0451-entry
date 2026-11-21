// The game's state machine: screens, rounds, the timer, scoring, hints and
// the found set. It knows nothing about the canvas — the renderer reads this
// state and paints it — so the screenshot stager can drive it directly.
import {
  FIND_BASE_POINTS,
  FIND_COMBO_STEP,
  HINTS_PER_ROUND,
  HINT_COOLDOWN_SECONDS,
  HINT_COST,
  HINT_REVEAL_SECONDS,
  ROUND_CLEAR_TIME_BONUS_PER_SECOND,
  ROUND_TIME_SECONDS,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND_CLEAR,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  WRONG_CLICK_SCORE_PENALTY,
  WRONG_CLICK_TIME_PENALTY,
} from './config.js';
import { SCENES } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_ROUND_CLEAR = 4;
export const EVENT_TIME_UP = 8;

/** A fresh world: title screen, no round started, best score 0. */
export function createWorld() {
  return {
    screen: SCREEN_TITLE,
    roundIndex: 0,
    found: new Set(),
    score: 0,
    roundScore: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: ROUND_TIME_SECONDS,
    hintsLeft: HINTS_PER_ROUND,
    hintCooldown: 0,
    hintTarget: null,
    hintTimeLeft: 0,
    wrongMarks: [],
    foundPop: new Map(),
    roundStats: [],
    best: 0,
    elapsed: 0,
    message: '',
    messageTimeLeft: 0,
  };
}

/** The scene of the current round. */
export function currentScene(world) {
  return SCENES[world.roundIndex];
}

/** How many differences are still unfound in this round. */
export function remainingCount(world) {
  return currentScene(world).differences.length - world.found.size;
}

export function startRound(world, roundIndex) {
  world.roundIndex = roundIndex;
  world.found = new Set();
  world.roundScore = 0;
  world.combo = 0;
  world.timeLeft = ROUND_TIME_SECONDS;
  world.hintsLeft = HINTS_PER_ROUND;
  world.hintCooldown = 0;
  world.hintTarget = null;
  world.hintTimeLeft = 0;
  world.wrongMarks = [];
  world.foundPop = new Map();
  world.screen = SCREEN_PLAY;
  world.message = '';
  world.messageTimeLeft = 0;
}

export function startGame(world) {
  world.score = 0;
  world.bestCombo = 0;
  world.roundStats = [];
  startRound(world, 0);
}

function showMessage(world, text) {
  world.message = text;
  world.messageTimeLeft = 2.2;
}

/** Advance the timer and the little animations. Call once per frame. */
export function stepWorld(world, dt) {
  world.elapsed += dt;
  if (world.messageTimeLeft > 0) world.messageTimeLeft -= dt;
  if (world.hintCooldown > 0) world.hintCooldown -= dt;
  if (world.hintTimeLeft > 0) {
    world.hintTimeLeft -= dt;
    if (world.hintTimeLeft <= 0) world.hintTarget = null;
  }
  for (const mark of world.wrongMarks) mark.life -= dt;
  world.wrongMarks = world.wrongMarks.filter((mark) => mark.life > 0);
  for (const [id, pop] of world.foundPop) {
    if (pop > 0) world.foundPop.set(id, Math.max(0, pop - dt * 3));
  }
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  world.timeLeft -= dt;
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.screen = SCREEN_TIME_UP;
    return EVENT_TIME_UP;
  }
  return EVENT_NONE;
}

/**
 * A click at panel-local coordinates (the same point in either picture).
 * Returns an event flag; the world records the find, the score and the
 * combo, or the miss and its penalty.
 */
export function clickAt(world, x, y) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  const scene = currentScene(world);
  // A click on a difference already found is ignored, not punished: the
  // ring already says it is done, and the player was aiming at the right
  // place.
  for (const difference of scene.differences) {
    if (!world.found.has(difference.id)) continue;
    const dx = x - difference.x;
    const dy = y - difference.y;
    const radius = difference.r + 14;
    if (dx * dx + dy * dy <= radius * radius) return EVENT_NONE;
  }
  for (const difference of scene.differences) {
    if (world.found.has(difference.id)) continue;
    const dx = x - difference.x;
    const dy = y - difference.y;
    const radius = difference.r + 14;
    if (dx * dx + dy * dy <= radius * radius) {
      world.found.add(difference.id);
      world.foundPop.set(difference.id, 1);
      world.combo += 1;
      world.bestCombo = Math.max(world.bestCombo, world.combo);
      const points = FIND_BASE_POINTS + (world.combo - 1) * FIND_COMBO_STEP;
      world.score += points;
      world.roundScore += points;
      showMessage(world, `${difference.label}! +${points}`);
      if (world.found.size === scene.differences.length) {
        const timeBonus = Math.round(world.timeLeft) * ROUND_CLEAR_TIME_BONUS_PER_SECOND;
        world.score += timeBonus;
        world.roundScore += timeBonus;
        world.roundStats.push({
          scene: scene.name,
          points: world.roundScore,
          timeBonus,
          bestCombo: world.bestCombo,
        });
        if (world.roundIndex + 1 >= SCENES.length) {
          world.screen = SCREEN_WIN;
        } else {
          world.screen = SCREEN_ROUND_CLEAR;
        }
        return EVENT_FOUND | EVENT_ROUND_CLEAR;
      }
      return EVENT_FOUND;
    }
  }
  world.combo = 0;
  world.timeLeft = Math.max(0, world.timeLeft - WRONG_CLICK_TIME_PENALTY);
  world.score = Math.max(0, world.score - WRONG_CLICK_SCORE_PENALTY);
  world.wrongMarks.push({ x, y, life: 0.9 });
  showMessage(world, 'Not there — minus 3 seconds');
  return EVENT_WRONG;
}

/** Spend a hint: reveal one unfound difference for a few seconds. */
export function useHint(world) {
  if (world.screen !== SCREEN_PLAY) return false;
  if (world.hintsLeft <= 0 || world.hintCooldown > 0) return false;
  const scene = currentScene(world);
  const unfound = scene.differences.filter((difference) => !world.found.has(difference.id));
  if (unfound.length === 0) return false;
  world.hintTarget = unfound[Math.floor(Math.random() * unfound.length)];
  world.hintTimeLeft = HINT_REVEAL_SECONDS;
  world.hintsLeft -= 1;
  world.hintCooldown = HINT_COOLDOWN_SECONDS;
  world.score = Math.max(0, world.score - HINT_COST);
  showMessage(world, `Hint: look near the ${world.hintTarget.label.toLowerCase()} (−${HINT_COST})`);
  return true;
}

export function pauseGame(world) {
  if (world.screen === SCREEN_PLAY) world.screen = SCREEN_PAUSED;
}

export function resumeGame(world) {
  if (world.screen === SCREEN_PAUSED) world.screen = SCREEN_PLAY;
}

export function toTitle(world) {
  world.screen = SCREEN_TITLE;
}

export function advanceRound(world) {
  if (world.screen === SCREEN_ROUND_CLEAR) startRound(world, world.roundIndex + 1);
}

/** Stars for the win screen: 1 for finishing, up to 3 for a high score. */
export function starsEarned(world) {
  if (world.score >= 3200) return 3;
  if (world.score >= 2600) return 2;
  return 1;
}
