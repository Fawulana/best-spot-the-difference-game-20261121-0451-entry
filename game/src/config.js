// Twin Lanterns — Five Hunts: every tunable number in one place.
// The hunt gets harder as it goes on: later scenes give less time, and
// their differences are smaller, so a player who breezes through the
// harbour has to slow down and really look by the kite festival.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// The two pictures sit side by side in the middle of the frame.
export const PICTURE = { w: 600, h: 440, y: 150, gap: 40 };
export const LEFT_PICTURE_X = 20;
export const RIGHT_PICTURE_X = LEFT_PICTURE_X + PICTURE.w + PICTURE.gap;

// A click lands when it falls inside a difference's circle, with a small
// forgiveness ring so near-misses on tiny targets still count.
export const HIT_PAD = 14;

// One hunt per scene: the clock shrinks and the targets shrink as the
// scenes get harder. The scene table carries its own time and the radius
// scale for its differences.
export const HUNT_COUNT = 5;
export const ROUND_CLOCK = [180, 170, 160, 140, 120];
export const ROUND_RADIUS_SCALE = [1.0, 1.0, 0.95, 0.9, 0.85];

// Hints and mistakes.
export const HINTS_EACH_ROUND = 3;
export const HINT_POINTS = 75;
export const HINT_WAIT = 10;
export const HINT_SHOW_SECONDS = 3;
export const WRONG_TIME_LOSS = 3;
export const WRONG_POINTS_LOSS = 10;

// Scoring: a find is worth 100, and every find in a row without a miss
// adds 25 more. Clearing a round pays 2 points per second left, times
// the round number, so late rounds are worth more.
export const FIND_POINTS = 100;
export const STREAK_STEP = 25;
export const CLEAR_BONUS_PER_SECOND = 2;

// The magnifier: a 2x lens that follows the pointer, for the tiny
// differences in the late scenes. Z toggles it; it starts off.
export const LENS_ZOOM = 2;
export const LENS_RADIUS = 90;

// The fixed simulation step for the world clock.
export const STEP = 1 / 60;

// The screens the hunt can be on.
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_CLEAR = 'round-clear';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'time-up';

// The palette the whole game is painted from.
export const PALETTE = {
  ink: '#241d33',
  paper: '#fff7e6',
  gold: '#f5b942',
  goldDark: '#c77f1a',
  teal: '#2e8b8b',
  coral: '#e2604d',
  frame: '#3a2f52',
  hud: '#241d33',
  dim: '#c9b8e8',
  faint: '#8a7a9a',
  danger: '#ff7a6b',
};

export const BEST_SCORE_KEY = 'twin-lanterns-five-hunts-best';
export const MUTE_KEY = 'twin-lanterns-five-hunts-muted';
