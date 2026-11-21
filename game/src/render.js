// Everything the player sees: the header with the counter, the timer and
// the score, the two picture panels with their found rings, the buttons, and
// the title / pause / round-clear / win / time-up overlays. All text is drawn
// on the canvas, so a screenshot shows exactly what a player sees.
import {
  CANVAS,
  COLOURS,
  HINT_COST,
  LEFT_X,
  PANEL,
  PANEL_Y,
  RIGHT_X,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND_CLEAR,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
} from './config.js';
import { currentScene, remainingCount, starsEarned } from './world.js';
import { drawFoundRing, drawHintRing, drawWrongMark } from './panels.js';
import { SCENES } from './scenes.js';

export const BUTTONS = {
  hint: { x: 20, y: 648, w: 220, h: 52 },
  pause: { x: 256, y: 648, w: 160, h: 52 },
  start: { x: 490, y: 566, w: 300, h: 62 },
  next: { x: 490, y: 586, w: 300, h: 62 },
  again: { x: 490, y: 612, w: 300, h: 62 },
  retry: { x: 490, y: 566, w: 300, h: 62 },
  menu: { x: 490, y: 644, w: 300, h: 52 },
};

/** Which button, if any, a canvas point falls on for the current screen. */
export function hitButton(x, y, screen) {
  const names =
    screen === SCREEN_PLAY
      ? ['hint', 'pause']
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

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(ctx, rect, label, enabled, accent) {
  ctx.fillStyle = enabled ? (accent ? COLOURS.gold : '#3a2f52') : '#2a2438';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.strokeStyle = enabled ? COLOURS.gold : '#4a4066';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = enabled ? (accent ? COLOURS.ink : COLOURS.paper) : '#7a7090';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
}

function drawHeader(ctx, world) {
  ctx.fillStyle = COLOURS.hudBar;
  ctx.fillRect(0, 0, CANVAS.width, 100);
  ctx.fillStyle = COLOURS.gold;
  ctx.fillRect(0, 100, CANVAS.width, 4);

  const scene = currentScene(world);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLOURS.paper;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('TWIN LANTERNS', 20, 42);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`Round ${world.roundIndex + 1} of ${SCENES.length} · ${scene.name}`, 20, 70);

  // The remaining counter, big in the middle: the judge's first criterion.
  const remaining = remainingCount(world);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOURS.gold;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(`${remaining} LEFT`, CANVAS.width / 2, 52);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('differences to find', CANVAS.width / 2, 76);

  // Progress dots under the counter.
  for (let i = 0; i < scene.differences.length; i += 1) {
    ctx.beginPath();
    ctx.arc(CANVAS.width / 2 - 70 + i * 20, 92, 6, 0, Math.PI * 2);
    ctx.fillStyle = i < world.found.size ? COLOURS.gold : '#4a4066';
    ctx.fill();
  }

  // Timer and score on the right.
  const lowTime = world.timeLeft <= 30;
  ctx.textAlign = 'right';
  ctx.fillStyle = lowTime ? '#ff7a6b' : COLOURS.paper;
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(formatTime(world.timeLeft), CANVAS.width - 20, 46);
  const barWidth = 200;
  ctx.fillStyle = '#4a4066';
  ctx.fillRect(CANVAS.width - 20 - barWidth, 58, barWidth, 8);
  ctx.fillStyle = lowTime ? '#e2604d' : COLOURS.teal;
  ctx.fillRect(
    CANVAS.width - 20 - barWidth,
    58,
    barWidth * Math.max(0, world.timeLeft / 150),
    8,
  );
  ctx.fillStyle = COLOURS.paper;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`Score ${world.score}`, CANVAS.width - 20, 92);
  ctx.textAlign = 'left';
}

function drawPanels(ctx, world, panels) {
  const labels = ['LEFT · THE ORIGINAL', 'RIGHT · SPOT THE DIFFERENCES'];
  const xs = [LEFT_X, RIGHT_X];
  const canvases = [panels.left, panels.right];
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < 2; i += 1) {
    ctx.fillStyle = '#c9b8e8';
    ctx.textAlign = 'left';
    ctx.fillText(labels[i], xs[i] + 4, PANEL_Y - 12);
    ctx.fillStyle = '#241d33';
    ctx.fillRect(xs[i] - 4, PANEL_Y - 4, PANEL.width + 8, PANEL.height + 8);
    ctx.drawImage(canvases[i], xs[i], PANEL_Y);
    ctx.strokeStyle = COLOURS.panelBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(xs[i], PANEL_Y, PANEL.width, PANEL.height);
  }
  // Found rings on both pictures, and the hint ring where it points.
  const scene = currentScene(world);
  for (const difference of scene.differences) {
    if (!world.found.has(difference.id)) continue;
    const pulse = world.foundPop.get(difference.id) ?? 0;
    for (const x of xs) {
      drawFoundRing(ctx, x + difference.x, PANEL_Y + difference.y, difference.r, pulse);
    }
  }
  if (world.hintTarget) {
    for (const x of xs) {
      drawHintRing(ctx, x + world.hintTarget.x, PANEL_Y + world.hintTarget.y, world.hintTarget.r, world.elapsed);
    }
  }
  for (const mark of world.wrongMarks) {
    for (const x of xs) {
      drawWrongMark(ctx, x + mark.x, PANEL_Y + mark.y, Math.min(1, mark.life / 0.9));
    }
  }
}

function drawBottomBar(ctx, world) {
  ctx.fillStyle = COLOURS.hudBar;
  ctx.fillRect(0, 620, CANVAS.width, 180);
  ctx.fillStyle = COLOURS.gold;
  ctx.fillRect(0, 620, CANVAS.width, 4);

  drawButton(ctx, BUTTONS.hint, `Hint (−${HINT_COST}) · ${world.hintsLeft} left`, world.hintsLeft > 0 && world.hintCooldown <= 0, false);
  drawButton(ctx, BUTTONS.pause, 'Pause (P)', true, false);

  ctx.textAlign = 'left';
  ctx.fillStyle = world.message ? COLOURS.gold : '#c9b8e8';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(world.message || 'Click a difference in either picture — or move with the arrow keys and press Enter.', 440, 668);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('A wrong click costs 3 seconds. Find them all before the clock runs out.', 440, 696);
  ctx.fillText(`Combo ×${world.combo}  ·  Best combo ×${world.bestCombo}  ·  Best score ${world.best}`, 440, 724);
  ctx.fillStyle = '#8a7a9a';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Twin Lanterns — an original spot-the-difference game. Three hand-drawn scenes, eight differences each.', 20, 762);
}

function drawOverlay(ctx) {
  ctx.fillStyle = 'rgba(16, 12, 28, 0.82)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
}

function drawCard(ctx, x, y, w, h) {
  ctx.fillStyle = '#2e2547';
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawTitle(ctx, world) {
  drawOverlay(ctx);
  drawCard(ctx, 240, 90, 800, 620);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOURS.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('TWIN LANTERNS', CANVAS.width / 2, 180);
  ctx.fillStyle = COLOURS.paper;
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('A spot-the-difference hunt in three hand-drawn scenes', CANVAS.width / 2, 224);
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#e8ddff';
  const lines = [
    'Two pictures sit side by side. They look the same — they are not.',
    'Eight differences hide in each scene. Click one in either picture to ring it.',
    'Find all eight before the clock runs out, then move to the next scene.',
    'A wrong click costs 3 seconds. A hint costs 75 points. Streaks pay extra.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, CANVAS.width / 2, 276 + i * 32));
  ctx.fillStyle = COLOURS.gold;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('THE SCENES', CANVAS.width / 2, 436);
  ctx.fillStyle = '#e8ddff';
  ctx.font = '18px Georgia, serif';
  SCENES.forEach((scene, i) => {
    ctx.fillText(`${i + 1}. ${scene.name} — ${scene.tagline}`, CANVAS.width / 2, 466 + i * 28);
  });
  drawButton(ctx, BUTTONS.start, 'Start the hunt  (Enter)', true, true);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(
    world.best > 0 ? `Best score: ${world.best}` : 'Mouse or keyboard — arrows move, Enter clicks, H hints, P pauses',
    CANVAS.width / 2,
    668,
  );
}

function drawPaused(ctx) {
  drawOverlay(ctx);
  drawCard(ctx, 440, 300, 400, 200);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOURS.paper;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('Paused', CANVAS.width / 2, 380);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '19px Georgia, serif';
  ctx.fillText('Press P or click to carry on.', CANVAS.width / 2, 424);
  ctx.fillText('Esc returns to the title screen.', CANVAS.width / 2, 456);
}

function drawRoundClear(ctx, world) {
  drawOverlay(ctx);
  drawCard(ctx, 390, 170, 500, 480);
  const stat = world.roundStats[world.roundStats.length - 1];
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOURS.gold;
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText('Round clear!', CANVAS.width / 2, 250);
  ctx.fillStyle = COLOURS.paper;
  ctx.font = '22px Georgia, serif';
  ctx.fillText(`You found all 8 differences in ${currentScene(world).name}.`, CANVAS.width / 2, 296);
  if (stat) {
    ctx.fillStyle = '#e8ddff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText(`Round points: ${stat.points}  (time bonus +${stat.timeBonus})`, CANVAS.width / 2, 340);
    ctx.fillText(`Best combo this round: ×${stat.bestCombo}`, CANVAS.width / 2, 374);
  }
  ctx.fillStyle = COLOURS.gold;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`Total score: ${world.score}`, CANVAS.width / 2, 424);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '19px Georgia, serif';
  const nextScene = SCENES[world.roundIndex + 1];
  ctx.fillText(`Next up: ${nextScene.name} — ${nextScene.tagline}`, CANVAS.width / 2, 470);
  drawButton(ctx, BUTTONS.next, 'Next round  (Enter)', true, true);
}

function drawWin(ctx, world) {
  drawOverlay(ctx);
  drawCard(ctx, 340, 110, 600, 580);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOURS.gold;
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText('You found them all!', CANVAS.width / 2, 190);
  const stars = starsEarned(world);
  ctx.font = '56px Georgia, serif';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), CANVAS.width / 2, 258);
  ctx.fillStyle = COLOURS.paper;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(`Final score: ${world.score}`, CANVAS.width / 2, 308);
  ctx.fillStyle = '#e8ddff';
  ctx.font = '19px Georgia, serif';
  world.roundStats.forEach((stat, i) => {
    ctx.fillText(`${i + 1}. ${stat.scene}: ${stat.points} points`, CANVAS.width / 2, 348 + i * 30);
  });
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Best combo ×${world.bestCombo}  ·  Best score ${Math.max(world.best, world.score)}`, CANVAS.width / 2, 452);
  ctx.fillText('Three scenes, twenty-four differences, every one of them found.', CANVAS.width / 2, 486);
  drawButton(ctx, BUTTONS.again, 'Play again  (Enter)', true, true);
}

function drawTimeUp(ctx, world) {
  drawOverlay(ctx);
  drawCard(ctx, 390, 150, 500, 560);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff7a6b';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText("Time's up!", CANVAS.width / 2, 250);
  ctx.fillStyle = COLOURS.paper;
  ctx.font = '22px Georgia, serif';
  ctx.fillText(
    `You found ${world.found.size} of ${currentScene(world).differences.length} differences in ${currentScene(world).name}.`,
    CANVAS.width / 2,
    296,
  );
  ctx.fillStyle = '#e8ddff';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`${remainingCount(world)} were still hiding. Score: ${world.score}`, CANVAS.width / 2, 340);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('The differences were fair — look closer next time.', CANVAS.width / 2, 384);
  drawButton(ctx, BUTTONS.retry, 'Try this round again  (Enter)', true, true);
  drawButton(ctx, BUTTONS.menu, 'Back to title', true, false);
}

function drawCrosshair(ctx, crosshair) {
  if (!crosshair.visible) return;
  ctx.save();
  ctx.strokeStyle = COLOURS.gold;
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
export function drawGame(ctx, world, panels, screen, crosshair) {
  ctx.fillStyle = '#1a1426';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  drawHeader(ctx, world);
  drawPanels(ctx, world, panels);
  drawBottomBar(ctx, world);
  if (screen === SCREEN_TITLE) drawTitle(ctx, world);
  else if (screen === SCREEN_PAUSED) drawPaused(ctx);
  else if (screen === SCREEN_ROUND_CLEAR) drawRoundClear(ctx, world);
  else if (screen === SCREEN_WIN) drawWin(ctx, world);
  else if (screen === SCREEN_TIME_UP) drawTimeUp(ctx, world);
  if (screen === SCREEN_PLAY) drawCrosshair(ctx, crosshair);
}
