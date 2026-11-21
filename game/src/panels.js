// The two pictures and the marks that go on them. A scene is painted
// twice — plain on the left, with its differences on the right — by the
// same painter, into offscreen canvases that are made once per round and
// then just blitted every frame. The marks (found rings, hint ring, wrong
// crosses, the magnifier lens) are drawn on the main canvas over them.
import { PICTURE } from './config.js';
import { seededRandom } from './random.js';

/** Paint one scene into a left and a right offscreen canvas. */
export function paintScenePair(scene) {
  const left = document.createElement('canvas');
  left.width = PICTURE.w;
  left.height = PICTURE.h;
  const right = document.createElement('canvas');
  right.width = PICTURE.w;
  right.height = PICTURE.h;
  const changed = new Set(scene.differences.map((d) => d.id));
  scene.paint(left.getContext('2d'), PICTURE.w, PICTURE.h, new Set(), seededRandom(scene.seed));
  scene.paint(right.getContext('2d'), PICTURE.w, PICTURE.h, changed, seededRandom(scene.seed));
  return { left, right };
}

/** A gold ring with a check mark over a difference just found. */
export function paintFoundRing(ctx, x, y, radius, pop) {
  const r = radius + 3 + pop * 3;
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

/** A fading red cross where a wrong click landed. */
export function paintWrongCross(ctx, x, y, alpha) {
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

/** A dashed teal ring pulsing around the difference a hint revealed. */
export function paintHintRing(ctx, x, y, radius, time) {
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

/**
 * The magnifier lens: a circle of the picture under the pointer, drawn
 * twice as large, with a gold rim and a little crosshair. `source` is the
 * offscreen canvas of the panel the pointer is over; the lens samples a
 * small square around the panel-local point and blows it up.
 */
export function paintLens(ctx, source, panelX, panelY, lens) {
  const zoom = lens.zoom;
  const radius = lens.radius;
  const half = radius / zoom;
  const sx = Math.max(0, Math.min(source.width - half * 2, lens.px - half));
  const sy = Math.max(0, Math.min(source.height - half * 2, lens.py - half));
  ctx.save();
  ctx.beginPath();
  ctx.arc(lens.cx, lens.cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(source, sx, sy, half * 2, half * 2, lens.cx - radius, lens.cy - radius, radius * 2, radius * 2);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#f5b942';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(245, 185, 66, 0.7)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(lens.cx, lens.cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 247, 230, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lens.cx - 10, lens.cy);
  ctx.lineTo(lens.cx + 10, lens.cy);
  ctx.moveTo(lens.cx, lens.cy - 10);
  ctx.lineTo(lens.cx, lens.cy + 10);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#241d33';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('2× ZOOM', lens.cx, lens.cy + radius + 16);
  ctx.restore();
}
