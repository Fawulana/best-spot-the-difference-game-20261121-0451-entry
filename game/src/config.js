// Twin Lanterns: every number the game balances on lives here, so tuning the
// feel of a round never means hunting through the renderer or the world.
export const CANVAS = { width: 1280, height: 800 };

/** One picture panel, in canvas pixels. The two panels sit side by side. */
export const PANEL = { width: 600, height: 440, gap: 40 };
export const PANEL_Y = 150;
export const LEFT_X = 20;
export const RIGHT_X = LEFT_X + PANEL.width + PANEL.gap;

/** A click counts as a find when it lands inside a difference's circle. */
export const FIND_RADIUS_PAD = 14;

export const ROUND_TIME_SECONDS = 150;
export const HINTS_PER_ROUND = 3;
export const HINT_COST = 75;
export const HINT_COOLDOWN_SECONDS = 10;
export const HINT_REVEAL_SECONDS = 3;
export const WRONG_CLICK_TIME_PENALTY = 3;
export const WRONG_CLICK_SCORE_PENALTY = 10;

export const FIND_BASE_POINTS = 100;
export const FIND_COMBO_STEP = 25;
export const ROUND_CLEAR_TIME_BONUS_PER_SECOND = 2;

export const BEST_KEY = 'twin-lanterns-best-score';

/** The fixed simulation step: the world advances in 1/60 s slices. */
export const STEP = 1 / 60;

/** The screens the world can be on. */
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_CLEAR = 'round-clear';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'time-up';

/** Colours shared by the renderer and the panels. */
export const COLOURS = {
  ink: '#241d33',
  paper: '#fff7e6',
  gold: '#f5b942',
  goldDeep: '#c77f1a',
  teal: '#2e8b8b',
  coral: '#e2604d',
  panelBorder: '#3a2f52',
  hudBar: '#241d33',
};
