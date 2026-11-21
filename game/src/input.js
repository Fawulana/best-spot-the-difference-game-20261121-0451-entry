// Mouse and keyboard input. The mouse clicks straight on the pictures;
// the keyboard drives a crosshair (arrow keys to move, Enter or Space to
// click where it stands), so the whole game plays without a mouse too.
// H asks for a hint, P pauses, Esc goes back to the title screen.
import { CANVAS, LEFT_X, PANEL, PANEL_Y, RIGHT_X } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_PAUSE = 4;
export const ACTION_BACK = 8;

/** Where a canvas click landed, in panel-local coordinates, or null. */
export function clickToPanel(clientX, clientY, rect) {
  const scaleX = CANVAS.width / rect.width;
  const scaleY = CANVAS.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  // cx/cy are the same point in canvas coordinates, for button hit-testing.
  const point = { panel: null, x, y, cx: x, cy: y };
  if (y >= PANEL_Y && y <= PANEL_Y + PANEL.height) {
    if (x >= LEFT_X && x <= LEFT_X + PANEL.width) {
      return { panel: 'left', x: x - LEFT_X, y: y - PANEL_Y, cx: x, cy: y };
    }
    if (x >= RIGHT_X && x <= RIGHT_X + PANEL.width) {
      return { panel: 'right', x: x - RIGHT_X, y: y - PANEL_Y, cx: x, cy: y };
    }
  }
  return point;
}

/** Read a click's canvas coordinates (used for buttons drawn on canvas). */
export function clickToCanvas(clientX, clientY, rect) {
  return {
    x: (clientX - rect.left) * (CANVAS.width / rect.width),
    y: (clientY - rect.top) * (CANVAS.height / rect.height),
  };
}

export function createInput(canvas) {
  const keys = new Set();
  const actions = { flags: 0 };
  let clicks = [];
  let crosshair = { x: CANVAS.width / 2, y: PANEL_Y + PANEL.height / 2, visible: false };
  let mouse = { x: CANVAS.width / 2, y: PANEL_Y + PANEL.height / 2 };

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse = clickToCanvas(event.clientX, event.clientY, rect);
    crosshair.visible = false;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    clicks.push(clickToPanel(event.clientX, event.clientY, rect));
  });

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(event.key);
    if (event.key === 'Enter' || event.key === ' ') actions.flags |= ACTION_CONFIRM;
    if (event.key === 'h' || event.key === 'H') actions.flags |= ACTION_HINT;
    if (event.key === 'p' || event.key === 'P') actions.flags |= ACTION_PAUSE;
    if (event.key === 'Escape') actions.flags |= ACTION_BACK;
    if (event.key.startsWith('Arrow')) crosshair.visible = true;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key));

  function moveCrosshair(dt) {
    const speed = 520 * dt;
    if (keys.has('ArrowLeft')) crosshair.x -= speed;
    if (keys.has('ArrowRight')) crosshair.x += speed;
    if (keys.has('ArrowUp')) crosshair.y -= speed;
    if (keys.has('ArrowDown')) crosshair.y += speed;
    crosshair.x = Math.max(0, Math.min(CANVAS.width, crosshair.x));
    crosshair.y = Math.max(0, Math.min(CANVAS.height, crosshair.y));
  }

  return {
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
    takeActions() {
      const taken = actions.flags;
      actions.flags = 0;
      return taken;
    },
    update(dt) {
      moveCrosshair(dt);
    },
    crosshair() {
      return crosshair;
    },
    mouse() {
      return mouse;
    },
    /** The keyboard's click: the panel under the crosshair, if any. */
    crosshairPanel() {
      if (!crosshair.visible) return null;
      return clickToPanel(
        crosshair.x,
        crosshair.y,
        { left: 0, top: 0, width: CANVAS.width, height: CANVAS.height },
      );
    },
  };
}
