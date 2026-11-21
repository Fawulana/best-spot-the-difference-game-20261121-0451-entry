// The hunt's state machine: screens, rounds, the shrinking clock,
// scoring, streaks, hints and the found set. It knows nothing about the
// canvas — the renderer reads this state and paints it — so the
// screenshot stager can drive it directly. Sounds are the caller's job:
// every tick and tap returns event flags, and main.js turns them into
// chimes, thuds and fanfares.
import {
  CLEAR_BONUS_PER_SECOND,
  FIND_POINTS,
  HINTS_EACH_ROUND,
  HINT_POINTS,
  HINT_SHOW_SECONDS,
  HINT_WAIT,
  ROUND_CLOCK,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND_CLEAR,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  STREAK_STEP,
  WRONG_POINTS_LOSS,
  WRONG_TIME_LOSS,
} from './config.js';
import { SCENES } from './scenes.js';

export const EV_FOUND = 1;
export const EV_WRONG = 2;
export const EV_ROUND_DONE = 4;
export const EV_TIME_UP = 8;
export const EV_TICK = 16;
export const EV_NONE = 0;

/** A fresh hunt: title screen, no round started, best score 0. */
export function createHunt() {
  return {
    screen: SCREEN_TITLE,
    roundIndex: 0,
    found: new Set(),
    score: 0,
    roundScore: 0,
    streak: 0,
    bestStreak: 0,
    roundBestStreak: 0,
    timeLeft: ROUND_CLOCK[0],
    hintsLeft: HINTS_EACH_ROUND,
    hintWait: 0,
    hintTarget: null,
    hintTimeLeft: 0,
    wrongMarks: [],
    foundPop: new Map(),
    roundStats: [],
    best: 0,
    elapsed: 0,
    banner: '',
    bannerTimeLeft: 0,
    message: '',
    messageTimeLeft: 0,
    lensOn: false,
    lensCX: 0,
    lensCY: 0,
    lensPX: 0,
    lensPY: 0,
    lensPanel: 'left',
    lastTickSecond: -1,
  };
}

/** The scene of the current round. */
export function sceneOf(hunt) {
  return SCENES[hunt.roundIndex];
}

/** How many differences are still hiding in this round. */
export function leftToFind(hunt) {
  return sceneOf(hunt).differences.length - hunt.found.size;
}

/** The clock for a round: shorter every round, so late hunts press. */
export function roundClock(roundIndex) {
  return ROUND_CLOCK[roundIndex] ?? ROUND_CLOCK[ROUND_CLOCK.length - 1];
}

function showBanner(hunt, text) {
  hunt.banner = text;
  hunt.bannerTimeLeft = 2.4;
}

function showMessage(hunt, text) {
  hunt.message = text;
  hunt.messageTimeLeft = 2.2;
}

export function beginRound(hunt, roundIndex) {
  hunt.roundIndex = roundIndex;
  hunt.found = new Set();
  hunt.roundScore = 0;
  hunt.streak = 0;
  hunt.roundBestStreak = 0;
  hunt.timeLeft = roundClock(roundIndex);
  hunt.hintsLeft = HINTS_EACH_ROUND;
  hunt.hintWait = 0;
  hunt.hintTarget = null;
  hunt.hintTimeLeft = 0;
  hunt.wrongMarks = [];
  hunt.foundPop = new Map();
  hunt.screen = SCREEN_PLAY;
  hunt.message = '';
  hunt.messageTimeLeft = 0;
  hunt.lastTickSecond = -1;
  const scene = sceneOf(hunt);
  showBanner(hunt, `${scene.name} — ${scene.difficulty}`);
}

export function beginHunt(hunt) {
  hunt.score = 0;
  hunt.bestStreak = 0;
  hunt.roundStats = [];
  beginRound(hunt, 0);
}

/** Advance the clock and the little animations. Call once per frame. */
export function tick(hunt, dt) {
  hunt.elapsed += dt;
  let events = EV_NONE;
  if (hunt.messageTimeLeft > 0) hunt.messageTimeLeft -= dt;
  if (hunt.bannerTimeLeft > 0) hunt.bannerTimeLeft -= dt;
  if (hunt.hintWait > 0) hunt.hintWait -= dt;
  if (hunt.hintTimeLeft > 0) {
    hunt.hintTimeLeft -= dt;
    if (hunt.hintTimeLeft <= 0) hunt.hintTarget = null;
  }
  for (const mark of hunt.wrongMarks) mark.life -= dt;
  hunt.wrongMarks = hunt.wrongMarks.filter((mark) => mark.life > 0);
  for (const [id, pop] of hunt.foundPop) {
    if (pop > 0) hunt.foundPop.set(id, Math.max(0, pop - dt * 3));
  }
  if (hunt.screen !== SCREEN_PLAY) return events;
  hunt.timeLeft -= dt;
  // The last ten seconds tick, so the pressure is audible.
  const whole = Math.ceil(hunt.timeLeft);
  if (hunt.timeLeft <= 10 && whole !== hunt.lastTickSecond) {
    hunt.lastTickSecond = whole;
    events |= EV_TICK;
  }
  if (hunt.timeLeft <= 0) {
    hunt.timeLeft = 0;
    hunt.screen = SCREEN_TIME_UP;
    return events | EV_TIME_UP;
  }
  return events;
}

/**
 * A tap at panel-local coordinates (the same point in either picture).
 * Returns event flags; the hunt records the find, the score and the
 * streak, or the miss and its penalty.
 */
export function tapAt(hunt, x, y) {
  if (hunt.screen !== SCREEN_PLAY) return EV_NONE;
  const scene = sceneOf(hunt);
  // A tap on a difference already found is ignored, not punished: the
  // ring already says it is done, and the player was aiming right.
  for (const difference of scene.differences) {
    if (!hunt.found.has(difference.id)) continue;
    const dx = x - difference.x;
    const dy = y - difference.y;
    const radius = difference.r + 14;
    if (dx * dx + dy * dy <= radius * radius) return EV_NONE;
  }
  for (const difference of scene.differences) {
    if (hunt.found.has(difference.id)) continue;
    const dx = x - difference.x;
    const dy = y - difference.y;
    const radius = difference.r + 14;
    if (dx * dx + dy * dy <= radius * radius) {
      hunt.found.add(difference.id);
      hunt.foundPop.set(difference.id, 1);
      hunt.streak += 1;
      hunt.bestStreak = Math.max(hunt.bestStreak, hunt.streak);
      hunt.roundBestStreak = Math.max(hunt.roundBestStreak, hunt.streak);
      const points = FIND_POINTS + (hunt.streak - 1) * STREAK_STEP;
      hunt.score += points;
      hunt.roundScore += points;
      showMessage(hunt, `${difference.label}! +${points}`);
      if (hunt.found.size === scene.differences.length) {
        const secondsLeft = Math.round(hunt.timeLeft);
        const timeBonus = secondsLeft * CLEAR_BONUS_PER_SECOND * (hunt.roundIndex + 1);
        hunt.score += timeBonus;
        hunt.roundScore += timeBonus;
        hunt.roundStats.push({
          scene: scene.name,
          points: hunt.roundScore,
          timeBonus,
          bestStreak: hunt.roundBestStreak,
        });
        if (hunt.roundIndex + 1 >= SCENES.length) {
          hunt.screen = SCREEN_WIN;
        } else {
          hunt.screen = SCREEN_ROUND_CLEAR;
        }
        return EV_FOUND | EV_ROUND_DONE;
      }
      return EV_FOUND;
    }
  }
  hunt.streak = 0;
  hunt.timeLeft = Math.max(0, hunt.timeLeft - WRONG_TIME_LOSS);
  hunt.score = Math.max(0, hunt.score - WRONG_POINTS_LOSS);
  hunt.wrongMarks.push({ x, y, life: 0.9 });
  showMessage(hunt, 'Not there — minus 3 seconds');
  return EV_WRONG;
}

/** Spend a hint: point at one unfound difference for a few seconds. */
export function spendHint(hunt) {
  if (hunt.screen !== SCREEN_PLAY) return false;
  if (hunt.hintsLeft <= 0 || hunt.hintWait > 0) return false;
  const scene = sceneOf(hunt);
  const hiding = scene.differences.filter((difference) => !hunt.found.has(difference.id));
  if (hiding.length === 0) return false;
  hunt.hintTarget = hiding[Math.floor(Math.random() * hiding.length)];
  hunt.hintTimeLeft = HINT_SHOW_SECONDS;
  hunt.hintsLeft -= 1;
  hunt.hintWait = HINT_WAIT;
  hunt.score = Math.max(0, hunt.score - HINT_POINTS);
  showMessage(hunt, `Hint: look near the ${hunt.hintTarget.label.toLowerCase()} (−${HINT_POINTS})`);
  return true;
}

export function pauseHunt(hunt) {
  if (hunt.screen === SCREEN_PLAY) hunt.screen = SCREEN_PAUSED;
}

export function resumeHunt(hunt) {
  if (hunt.screen === SCREEN_PAUSED) hunt.screen = SCREEN_PLAY;
}

export function backToTitle(hunt) {
  hunt.screen = SCREEN_TITLE;
}

export function nextRound(hunt) {
  if (hunt.screen === SCREEN_ROUND_CLEAR) beginRound(hunt, hunt.roundIndex + 1);
}

/** Stars for the win screen, out of five, by final score. */
export function starsFor(hunt) {
  if (hunt.score >= 14000) return 5;
  if (hunt.score >= 11000) return 4;
  if (hunt.score >= 8000) return 3;
  if (hunt.score >= 5000) return 2;
  return 1;
}

/** The total number of differences across all five scenes. */
export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.differences.length, 0);
}
