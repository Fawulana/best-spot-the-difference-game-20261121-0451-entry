// The staged scenes behind ?shot=start|play|end. Each one drives the real
// world forward — no special-case painting — so a screenshot is a frame a
// player could really be looking at, with the same seed every time.
//
// start: the title card over round 1's two pictures.
// play:  round 1 mid-hunt — 3 differences found (gold rings on both pictures),
//        5 still hiding, the counter reading "5 LEFT", the clock at 1:47.
// end:   the win screen after all three rounds, stars and final score.
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './config.js';
import { SCENES } from './scenes.js';
import { clickAt, startGame, startRound } from './world.js';

/** Differences the play shot finds, in the order a player would spot them. */
const PLAY_FINDS = ['moon', 'window', 'lantern'];

function sceneDifferences(world) {
  return SCENES[world.roundIndex].differences;
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * The caller re-renders the scene pair afterwards, so the panels match the
 * round the staged world is on.
 */
export function stageShot(name, world) {
  world.best = 2450;
  if (name === 'play') {
    startGame(world);
    for (const id of PLAY_FINDS) {
      const target = sceneDifferences(world).find((difference) => difference.id === id);
      clickAt(world, target.x, target.y);
    }
    world.timeLeft = 107;
    world.message = 'A lantern went missing! +150';
    world.messageTimeLeft = 2.2;
    return { screen: SCREEN_PLAY, roundIndex: 0 };
  }
  if (name === 'end') {
    startGame(world);
    for (let round = 0; round < SCENES.length; round += 1) {
      if (round > 0) startRound(world, round);
      for (const difference of sceneDifferences(world)) {
        clickAt(world, difference.x, difference.y);
      }
      world.timeLeft = 60 + round * 10;
    }
    world.screen = SCREEN_WIN;
    world.best = Math.max(world.best, world.score);
    return { screen: SCREEN_WIN, roundIndex: SCENES.length - 1 };
  }
  startGame(world);
  world.screen = SCREEN_TITLE;
  world.timeLeft = 150;
  return { screen: SCREEN_TITLE, roundIndex: 0 };
}
