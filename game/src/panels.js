// Renders a scene twice — plain and with differences — into offscreen
// canvases, then paints the pair (plus found-difference rings) onto the
// game's main canvas. The scenes are painted once per round, not every
// frame, so the loop stays cheap and the two pictures can never drift apart
// mid-round.
import { PANEL } from './config.js';
import { createRandom } from './random.js';

/** Paint one scene into two offscreen canvases and return them. */
export function renderScenePair(scene) {
  const left = document.createElement('canvas');
  left.width = PANEL.width;
  left.height = PANEL.height;
  const right = document.createElement('canvas');
  right.width = PANEL.width;
  right.height = PANEL.height;
  const changed = new Set(scene.differences.map((difference) => difference.id));
  scene.draw(left.getContext('2d'), PANEL.width, PANEL.height, new Set(), createRandom(scene.seed));
  scene.draw(right.getContext('2d'), PANEL.width, PANEL.height, changed, createRandom(scene.seed));
  return { left, right };
}

/** A gold ring with a check mark, drawn over a found difference. */
export function drawFoundRing(ctx, x, y, radius, pulse) {
  const r = radius + 3 + pulse * 3;
  ctx.save();
  ctx.strokeStyle = '#f5b942';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(245, 185, 66, 0.9)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#fff7e6';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x - 2, y + 8);
  ctx.lineTo(x + 10, y - 8);
  ctx.stroke();
}

/** A red X where a wrong click landed, fading out over its lifetime. */
export function drawWrongMark(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#e2604d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

/** A pulsing hint ring around a difference the hint gave away. */
export function drawHintRing(ctx, x, y, radius, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 6);
  ctx.save();
  ctx.strokeStyle = `rgba(46, 139, 139, ${0.5 + pulse * 0.5})`;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.arc(x, y, radius + 6 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
