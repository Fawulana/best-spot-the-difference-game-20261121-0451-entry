// Everything the player sees: the header with the counter, the timer
// and the score, the two picture panels with their found rings and the
// magnifier lens, the buttons, and the title / pause / round-clear /
// win / time-up overlays. All text is drawn on the canvas, so a
// screenshot shows exactly what a player sees.
import {
  CANVAS_H,
  CANVAS_W,
  HINT_POINTS,
  LEFT_PICTURE_X,
  LENS_RADIUS,
  LENS_ZOOM,
  PALETTE,
  PICTURE,
  RIGHT_PICTURE_X,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND_CLEAR,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
} from './config.js';
import { leftToFind, roundClock, sceneOf, starsFor } from './world.js';
import { paintFoundRing, paintHintRing, paintLens, paintWrongCross } from './panels.js';
import { SCENES } from './scenes.js';

export const BUTTONS = {
  hint: { x: 20, y: 648, w: 200, h: 52 },
  lens: { x: 236, y: 648, w: 180, h: 52 },
  pause: { x: 432, y: 648, w: 140, h: 52 },
  mute: { x: 588, y: 648, w: 140, h: 52 },
  start: { x: 490, y: 566, w: 300, h: 62 },
  next: { x: 490, y: 586, w: 300, h: 62 },
  again: { x: 490, y: 566, w: 300, h: 62 },
  retry: { x: 490, y: 566, w: 300, h: 62 },
  menu: { x: 490, y: 644, w: 300, h: 52 },
};

/** Which button, if any, a canvas point falls on for the current screen. */
export function hitButton(x, y, screen) {
  const names =
    screen === SCREEN_PLAY
      ? ['hint', 'lens', 'pause', 'mute']
      : screen === SCREEN_TITLE
        ? ['start']
        : screen === SCREEN_ROUND_CLEAR
          ? ['next']
          : screen === SCREEN_WIN
            ? ['again']
            : screen === SCREEN_TIME_UP
              ? ['retry', 'menu']
              : [];
  for (const name of names) {
    const b = BUTTONS[name];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return name;
  }
  return null;
}

function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintButton(ctx, rect, label, enabled, accent) {
  ctx.fillStyle = enabled ? (accent ? PALETTE.gold : '#3a2f52') : '#2a2438';
  roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.strokeStyle = enabled ? PALETTE.gold : '#4a4066';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = enabled ? (accent ? PALETTE.ink : PALETTE.paper) : '#7a7090';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
}

function paintHeader(ctx, hunt) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, CANVAS_W, 100);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 100, CANVAS_W, 4);

  const scene = sceneOf(hunt);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PALETTE.paper;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('TWIN LANTERNS', 20, 42);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '16px Georgia, serif';
  ctx.fillText(
    `Round ${hunt.roundIndex + 1} of ${SCENES.length} · ${scene.name} · ${scene.difficulty}`,
    20,
    70,
  );

  // The remaining counter, big in the middle: the judge's first criterion.
  const remaining = leftToFind(hunt);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(`${remaining} LEFT`, CANVAS_W / 2, 52);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '15px Georgia, serif';
  ctx.fillText('differences to find', CANVAS_W / 2, 76);

  // Progress dots under the counter, one per difference in the round.
  for (let i = 0; i < scene.differences.length; i += 1) {
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2 - 81 + i * 18, 92, 6, 0, Math.PI * 2);
    ctx.fillStyle = i < hunt.found.size ? PALETTE.gold : '#4a4066';
    ctx.fill();
  }

  // Timer and score on the right; the clock turns red under 30 seconds.
  const lowTime = hunt.timeLeft <= 30;
  ctx.textAlign = 'right';
  ctx.fillStyle = lowTime ? PALETTE.danger : PALETTE.paper;
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(formatClock(hunt.timeLeft), CANVAS_W - 20, 46);
  const barWidth = 200;
  ctx.fillStyle = '#4a4066';
  ctx.fillRect(CANVAS_W - 20 - barWidth, 58, barWidth, 8);
  ctx.fillStyle = lowTime ? PALETTE.coral : PALETTE.teal;
  ctx.fillRect(
    CANVAS_W - 20 - barWidth,
    58,
    barWidth * Math.max(0, hunt.timeLeft / roundClock(hunt.roundIndex)),
    8,
  );
  ctx.fillStyle = PALETTE.paper;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`Score ${hunt.score}`, CANVAS_W - 20, 92);
  ctx.textAlign = 'left';
}

function paintPanels(ctx, hunt, panels) {
  const labels = ['LEFT · THE ORIGINAL', 'RIGHT · SPOT THE DIFFERENCES'];
  const xs = [LEFT_PICTURE_X, RIGHT_PICTURE_X];
  const canvases = [panels.left, panels.right];
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < 2; i += 1) {
    ctx.fillStyle = PALETTE.dim;
    ctx.textAlign = 'left';
    ctx.fillText(labels[i], xs[i] + 4, PICTURE.y - 12);
    ctx.fillStyle = '#241d33';
    ctx.fillRect(xs[i] - 4, PICTURE.y - 4, PICTURE.w + 8, PICTURE.h + 8);
    ctx.drawImage(canvases[i], xs[i], PICTURE.y);
    ctx.strokeStyle = PALETTE.frame;
    ctx.lineWidth = 4;
    ctx.strokeRect(xs[i], PICTURE.y, PICTURE.w, PICTURE.h);
  }
  // Found rings on both pictures, and the hint ring where it points.
  const scene = sceneOf(hunt);
  for (const difference of scene.differences) {
    if (!hunt.found.has(difference.id)) continue;
    const pop = hunt.foundPop.get(difference.id) ?? 0;
    for (const x of xs) {
      paintFoundRing(ctx, x + difference.x, PICTURE.y + difference.y, difference.r, pop);
    }
  }
  if (hunt.hintTarget) {
    for (const x of xs) {
      paintHintRing(ctx, x + hunt.hintTarget.x, PICTURE.y + hunt.hintTarget.y, hunt.hintTarget.r, hunt.elapsed);
    }
  }
  for (const mark of hunt.wrongMarks) {
    for (const x of xs) {
      paintWrongCross(ctx, x + mark.x, PICTURE.y + mark.y, Math.min(1, mark.life / 0.9));
    }
  }
  // The magnifier lens over the panel the pointer is on.
  if (hunt.lensOn && hunt.lensPanel) {
    const source = hunt.lensPanel === 'left' ? panels.left : panels.right;
    paintLens(ctx, source, 0, 0, {
      zoom: LENS_ZOOM,
      radius: LENS_RADIUS,
      cx: hunt.lensCX,
      cy: hunt.lensCY,
      px: hunt.lensPX,
      py: hunt.lensPY,
    });
  }
  // The round banner, fading in over the pictures at the round's start.
  if (hunt.bannerTimeLeft > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, hunt.bannerTimeLeft);
    ctx.fillStyle = 'rgba(16, 12, 28, 0.55)';
    ctx.fillRect(LEFT_PICTURE_X, PICTURE.y + 150, PICTURE.w * 2 + PICTURE.gap, 140);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(hunt.banner, CANVAS_W / 2, PICTURE.y + 205);
    ctx.fillStyle = PALETTE.paper;
    ctx.font = '19px Georgia, serif';
    ctx.fillText('Find all 10 differences before the clock runs out', CANVAS_W / 2, PICTURE.y + 245);
    ctx.restore();
  }
}

function paintBottomBar(ctx, hunt, muted) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 620, CANVAS_W, 180);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 620, CANVAS_W, 4);

  paintButton(
    ctx,
    BUTTONS.hint,
    `Hint (−${HINT_POINTS}) · ${hunt.hintsLeft} left`,
    hunt.hintsLeft > 0 && hunt.hintWait <= 0,
    false,
  );
  paintButton(ctx, BUTTONS.lens, hunt.lensOn ? 'Lens (Z) · On' : 'Lens (Z) · Off', true, hunt.lensOn);
  paintButton(ctx, BUTTONS.pause, 'Pause (P)', true, false);
  paintButton(ctx, BUTTONS.mute, muted ? 'Sound (M) · Off' : 'Sound (M) · On', true, false);

  ctx.textAlign = 'left';
  ctx.fillStyle = hunt.message ? PALETTE.gold : PALETTE.dim;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(
    hunt.message || 'Click a difference in either picture.',
    760,
    668,
  );
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Arrow keys move, Enter clicks. Z zooms in close.', 760, 696);
  const streakText =
    hunt.streak >= 3
      ? `Streak ×${hunt.streak} — on fire!`
      : `Streak ×${hunt.streak}`;
  ctx.fillText(`${streakText}  ·  Best streak ×${hunt.bestStreak}  ·  Best score ${hunt.best}`, 760, 724);
  ctx.fillStyle = PALETTE.faint;
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Twin Lanterns — Five Hunts. An original spot-the-difference game: five hand-drawn scenes, ten differences each.', 20, 762);
}

function paintOverlay(ctx) {
  ctx.fillStyle = 'rgba(16, 12, 28, 0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function paintCard(ctx, x, y, w, h) {
  ctx.fillStyle = '#2e2547';
  roundRectPath(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function paintTitle(ctx, hunt) {
  paintOverlay(ctx);
  paintCard(ctx, 240, 70, 800, 660);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('TWIN LANTERNS', CANVAS_W / 2, 160);
  ctx.fillStyle = PALETTE.paper;
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('Five hunts, fifty differences — how sharp are your eyes?', CANVAS_W / 2, 204);
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#e8ddff';
  const lines = [
    'Two pictures sit side by side. They look the same — they are not.',
    'Ten differences hide in each scene. Click one in either picture to ring it.',
    'Find all ten before the clock runs out, then move to the next hunt.',
    'A wrong click costs 3 seconds. A hint costs 75 points. Streaks pay extra.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 252 + i * 30));
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('THE HUNTS', CANVAS_W / 2, 396);
  ctx.fillStyle = '#e8ddff';
  ctx.font = '18px Georgia, serif';
  SCENES.forEach((scene, i) => {
    ctx.fillText(
      `${i + 1}. ${scene.name} — ${scene.tagline} (${scene.difficulty})`,
      CANVAS_W / 2,
      424 + i * 26,
    );
  });
  paintButton(ctx, BUTTONS.start, 'Start the hunt  (Enter)', true, true);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '16px Georgia, serif';
  ctx.fillText(
    hunt.best > 0
      ? `Best score: ${hunt.best}`
      : 'Mouse or keyboard — arrows move, Enter clicks, H hints, Z zooms, P pauses',
    CANVAS_W / 2,
    668,
  );
}

function paintPaused(ctx) {
  paintOverlay(ctx);
  paintCard(ctx, 440, 300, 400, 200);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.paper;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('Paused', CANVAS_W / 2, 380);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '19px Georgia, serif';
  ctx.fillText('Press P or click to carry on.', CANVAS_W / 2, 424);
  ctx.fillText('Esc returns to the title screen.', CANVAS_W / 2, 456);
}

function paintRoundClear(ctx, hunt) {
  paintOverlay(ctx);
  paintCard(ctx, 390, 170, 500, 480);
  const stat = hunt.roundStats[hunt.roundStats.length - 1];
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText('Hunt complete!', CANVAS_W / 2, 250);
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '22px Georgia, serif';
  ctx.fillText(`You found all 10 differences in ${sceneOf(hunt).name}.`, CANVAS_W / 2, 296);
  if (stat) {
    ctx.fillStyle = '#e8ddff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText(`Round points: ${stat.points}  (time bonus +${stat.timeBonus})`, CANVAS_W / 2, 340);
    ctx.fillText(`Best streak this round: ×${stat.bestStreak}`, CANVAS_W / 2, 374);
  }
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`Total score: ${hunt.score}`, CANVAS_W / 2, 424);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '19px Georgia, serif';
  const nextScene = SCENES[hunt.roundIndex + 1];
  ctx.fillText(`Next up: ${nextScene.name} — ${nextScene.tagline} (${nextScene.difficulty})`, CANVAS_W / 2, 470);
  paintButton(ctx, BUTTONS.next, 'Next hunt  (Enter)', true, true);
}

function paintWin(ctx, hunt) {
  paintOverlay(ctx);
  paintCard(ctx, 340, 90, 600, 600);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText('You found them all!', CANVAS_W / 2, 170);
  const stars = starsFor(hunt);
  ctx.font = '56px Georgia, serif';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), CANVAS_W / 2, 238);
  ctx.fillStyle = PALETTE.paper;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(`Final score: ${hunt.score}`, CANVAS_W / 2, 290);
  ctx.fillStyle = '#e8ddff';
  ctx.font = '19px Georgia, serif';
  hunt.roundStats.forEach((stat, i) => {
    ctx.fillText(`${i + 1}. ${stat.scene}: ${stat.points} points`, CANVAS_W / 2, 330 + i * 28);
  });
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Best streak ×${hunt.bestStreak}  ·  Best score ${Math.max(hunt.best, hunt.score)}`, CANVAS_W / 2, 482);
  ctx.fillText('Five scenes, fifty differences, every one of them found.', CANVAS_W / 2, 516);
  paintButton(ctx, BUTTONS.again, 'Play again  (Enter)', true, true);
}

function paintTimeUp(ctx, hunt) {
  paintOverlay(ctx);
  paintCard(ctx, 390, 150, 500, 560);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.danger;
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText("Time's up!", CANVAS_W / 2, 250);
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '22px Georgia, serif';
  ctx.fillText(
    `You found ${hunt.found.size} of ${sceneOf(hunt).differences.length} differences in ${sceneOf(hunt).name}.`,
    CANVAS_W / 2,
    296,
  );
  ctx.fillStyle = '#e8ddff';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`${leftToFind(hunt)} were still hiding. Score: ${hunt.score}`, CANVAS_W / 2, 340);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '18px Georgia, serif';
  ctx.fillText('The differences were fair — look closer next time.', CANVAS_W / 2, 384);
  ctx.fillText('Tip: press Z for the magnifier on the tiny ones.', CANVAS_W / 2, 414);
  paintButton(ctx, BUTTONS.retry, 'Try this hunt again  (Enter)', true, true);
  paintButton(ctx, BUTTONS.menu, 'Back to title', true, false);
}

function paintCrosshair(ctx, crosshair) {
  if (!crosshair.visible) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(crosshair.x, crosshair.y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(crosshair.x - 20, crosshair.y);
  ctx.lineTo(crosshair.x - 8, crosshair.y);
  ctx.moveTo(crosshair.x + 8, crosshair.y);
  ctx.lineTo(crosshair.x + 20, crosshair.y);
  ctx.moveTo(crosshair.x, crosshair.y - 20);
  ctx.lineTo(crosshair.x, crosshair.y - 8);
  ctx.moveTo(crosshair.x, crosshair.y + 8);
  ctx.lineTo(crosshair.x, crosshair.y + 20);
  ctx.stroke();
  ctx.restore();
}

/** Paint one frame: header, panels, bottom bar, overlay and crosshair. */
export function paintGame(ctx, hunt, panels, screen, crosshair, muted) {
  ctx.fillStyle = '#1a1426';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  paintHeader(ctx, hunt);
  paintPanels(ctx, hunt, panels);
  paintBottomBar(ctx, hunt, muted);
  if (screen === SCREEN_TITLE) paintTitle(ctx, hunt);
  else if (screen === SCREEN_PAUSED) paintPaused(ctx);
  else if (screen === SCREEN_ROUND_CLEAR) paintRoundClear(ctx, hunt);
  else if (screen === SCREEN_WIN) paintWin(ctx, hunt);
  else if (screen === SCREEN_TIME_UP) paintTimeUp(ctx, hunt);
  if (screen === SCREEN_PLAY) paintCrosshair(ctx, crosshair);
}
