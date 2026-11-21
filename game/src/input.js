// Mouse and keyboard. The mouse clicks straight on the pictures; the
// keyboard drives a crosshair (arrows to move, Enter or Space to click
// where it stands), so the whole hunt plays without a mouse too. Z
// toggles the magnifier lens, H asks for a hint, M mutes the sounds,
// P pauses, Esc goes back to the title screen.
import { CANVAS_H, CANVAS_W, LEFT_PICTURE_X, PICTURE, RIGHT_PICTURE_X } from './config.js';

export const ACT_CONFIRM = 1;
export const ACT_HINT = 2;
export const ACT_PAUSE = 4;
export const ACT_BACK = 8;
export const ACT_LENS = 16;
export const ACT_MUTE = 32;

/**
 * Turn a pointer position into panel-local coordinates. The return keeps
 * both: the panel-local point (x, y) for the game logic and the canvas
 * point (cx, cy) for button hit-testing.
 */
export function pointerToPanel(clientX, clientY, rect) {
  const scaleX = CANVAS_W / rect.width;
  const scaleY = CANVAS_H / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  const point = { panel: null, x, y, cx: x, cy: y };
  if (y >= PICTURE.y && y <= PICTURE.y + PICTURE.h) {
    if (x >= LEFT_PICTURE_X && x <= LEFT_PICTURE_X + PICTURE.w) {
      return { panel: 'left', x: x - LEFT_PICTURE_X, y: y - PICTURE.y, cx: x, cy: y };
    }
    if (x >= RIGHT_PICTURE_X && x <= RIGHT_PICTURE_X + PICTURE.w) {
      return { panel: 'right', x: x - RIGHT_PICTURE_X, y: y - PICTURE.y, cx: x, cy: y };
    }
  }
  return point;
}

/** Canvas coordinates of a pointer event, for buttons drawn on canvas. */
export function pointerToCanvas(clientX, clientY, rect) {
  return {
    x: (clientX - rect.left) * (CANVAS_W / rect.width),
    y: (clientY - rect.top) * (CANVAS_H / rect.height),
  };
}

export function createInput(canvas) {
  const keys = new Set();
  const pending = { flags: 0 };
  let clicks = [];
  const crosshair = { x: CANVAS_W / 2, y: PICTURE.y + PICTURE.h / 2, visible: false };
  const pointer = { x: CANVAS_W / 2, y: PICTURE.y + PICTURE.h / 2, overPanel: null };

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const p = pointerToCanvas(event.clientX, event.clientY, rect);
    pointer.x = p.x;
    pointer.y = p.y;
    const panel = pointerToPanel(event.clientX, event.clientY, rect);
    pointer.overPanel = panel.panel;
    crosshair.visible = false;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    clicks.push(pointerToPanel(event.clientX, event.clientY, rect));
  });

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(event.key);
    if (event.key === 'Enter' || event.key === ' ') pending.flags |= ACT_CONFIRM;
    if (event.key === 'h' || event.key === 'H') pending.flags |= ACT_HINT;
    if (event.key === 'p' || event.key === 'P') pending.flags |= ACT_PAUSE;
    if (event.key === 'Escape') pending.flags |= ACT_BACK;
    if (event.key === 'z' || event.key === 'Z') pending.flags |= ACT_LENS;
    if (event.key === 'm' || event.key === 'M') pending.flags |= ACT_MUTE;
    if (event.key.startsWith('Arrow')) crosshair.visible = true;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key));

  function moveCrosshair(dt) {
    const speed = 520 * dt;
    if (keys.has('ArrowLeft')) crosshair.x -= speed;
    if (keys.has('ArrowRight')) crosshair.x += speed;
    if (keys.has('ArrowUp')) crosshair.y -= speed;
    if (keys.has('ArrowDown')) crosshair.y += speed;
    crosshair.x = Math.max(0, Math.min(CANVAS_W, crosshair.x));
    crosshair.y = Math.max(0, Math.min(CANVAS_H, crosshair.y));
  }

  return {
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
    takeActions() {
      const taken = pending.flags;
      pending.flags = 0;
      return taken;
    },
    update(dt) {
      moveCrosshair(dt);
    },
    crosshair() {
      return crosshair;
    },
    pointer() {
      return pointer;
    },
    /** The keyboard's click: the panel under the crosshair, if any. */
    crosshairPanel() {
      if (!crosshair.visible) return null;
      return pointerToPanel(
        crosshair.x,
        crosshair.y,
        { left: 0, top: 0, width: CANVAS_W, height: CANVAS_H },
      );
    },
  };
}
