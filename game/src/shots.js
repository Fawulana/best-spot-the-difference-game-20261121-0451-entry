// The staged scenes behind ?shot=start|play|snow|end. Each one drives
// the real hunt forward — no special-case painting — so a screenshot is
// a frame a player could really be looking at, with the same numbers
// every time.
//
// start: the title card over round 1's two pictures.
// play:  round 1 mid-hunt — 4 differences found (gold rings on both
//        pictures), 6 still hiding, the counter reading "6 LEFT", the
//        clock at 2:27.
// snow:  round 4 mid-hunt in the Snow Village — 3 found, 7 hiding, the
//        magnifier lens open over the icicle on the right picture.
// end:   the win screen after all five hunts, stars and final score.
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './config.js';
import { SCENES } from './scenes.js';
import { beginHunt, beginRound, tapAt } from './world.js';

/** Differences the play shot finds, in the order a player would spot them. */
const PLAY_FINDS = ['sun-rays', 'boat-flag', 'gull', 'buoy-colour'];

/** Differences the snow shot finds before the lens opens. */
const SNOW_FINDS = ['top-hat', 'skater', 'pine-star'];

function roundDifferences(hunt) {
  return SCENES[hunt.roundIndex].differences;
}

function findById(hunt, id) {
  return roundDifferences(hunt).find((difference) => difference.id === id);
}

/**
 * Set `hunt` to the named scene and return the screen to draw over it.
 * The caller re-renders the scene pair afterwards, so the panels match
 * the round the staged hunt is on.
 */
export function stageShot(name, hunt) {
  hunt.best = 9800;
  if (name === 'play') {
    beginHunt(hunt);
    for (const id of PLAY_FINDS) {
      const target = findById(hunt, id);
      tapAt(hunt, target.x, target.y);
    }
    hunt.timeLeft = 147;
    hunt.message = 'The boat lost its flag! +175';
    hunt.messageTimeLeft = 2.2;
    hunt.bannerTimeLeft = 0;
    return { screen: SCREEN_PLAY, roundIndex: 0 };
  }
  if (name === 'snow') {
    beginHunt(hunt);
    beginRound(hunt, 3);
    for (const id of SNOW_FINDS) {
      const target = findById(hunt, id);
      tapAt(hunt, target.x, target.y);
    }
    hunt.timeLeft = 96;
    hunt.message = 'The pine lost its star! +150';
    hunt.messageTimeLeft = 2.2;
    hunt.bannerTimeLeft = 0;
    // The lens sits over the icicle on the right picture, showing the
    // 2x zoom a player would use on a tiny difference.
    hunt.lensOn = true;
    hunt.lensPanel = 'right';
    hunt.lensCX = 660 + 456;
    hunt.lensCY = 150 + 214;
    hunt.lensPX = 456;
    hunt.lensPY = 214;
    return { screen: SCREEN_PLAY, roundIndex: 3 };
  }
  if (name === 'end') {
    beginHunt(hunt);
    for (let round = 0; round < SCENES.length; round += 1) {
      if (round > 0) beginRound(hunt, round);
      const differences = roundDifferences(hunt);
      for (let i = 0; i < differences.length; i += 1) {
        if (i === differences.length - 1) hunt.timeLeft = 60 + round * 10;
        tapAt(hunt, differences[i].x, differences[i].y);
      }
    }
    hunt.screen = SCREEN_WIN;
    hunt.best = Math.max(hunt.best, hunt.score);
    return { screen: SCREEN_WIN, roundIndex: SCENES.length - 1 };
  }
  beginHunt(hunt);
  hunt.screen = SCREEN_TITLE;
  hunt.timeLeft = 180;
  return { screen: SCREEN_TITLE, roundIndex: 0 };
}
