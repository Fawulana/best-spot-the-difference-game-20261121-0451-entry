// All of the game's sound, synthesized live with WebAudio: no audio
// files, no network, nothing to load. A found difference rings a little
// bell, a miss thuds, a hint plucks, a cleared round plays a fanfare and
// the win plays a short jingle. The clock ticks when time runs low.
// Browsers need a user gesture before audio starts, so the synth wakes
// up on the first click or key press and stays quiet before that.

let audioContext = null;
let muted = false;

function ensureContext() {
  if (audioContext) return audioContext;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  } catch {
    audioContext = null;
  }
  return audioContext;
}

/** Wake the synth after a gesture; safe to call any time. */
export function wakeAudio() {
  const ctx = ensureContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

/** Read or set the mute flag (persisted by the caller in localStorage). */
export function setMuted(value) {
  muted = value;
}
export function isMuted() {
  return muted;
}

/** One short tone: a sine or triangle blip with a quick fade. */
function blip(freq, startAt, length, kind, loudness) {
  const ctx = ensureContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(loudness, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + length);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + length + 0.05);
}

/** A found difference: a bright two-note chime, higher on a long streak. */
export function playFound(streak) {
  const lift = Math.min(streak, 8) * 18;
  blip(660 + lift, 0, 0.22, 'sine', 0.16);
  blip(990 + lift, 0.07, 0.3, 'sine', 0.12);
}

/** A wrong click: a low, short thud. */
export function playWrong() {
  blip(150, 0, 0.18, 'triangle', 0.2);
  blip(110, 0.05, 0.2, 'triangle', 0.14);
}

/** A hint: a soft pluck. */
export function playHint() {
  blip(520, 0, 0.18, 'triangle', 0.12);
  blip(780, 0.06, 0.22, 'sine', 0.08);
}

/** A round cleared: a rising four-note fanfare. */
export function playRoundClear() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => blip(freq, i * 0.09, 0.28, 'triangle', 0.14));
}

/** The whole hunt won: a longer jingle. */
export function playWin() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((freq, i) => blip(freq, i * 0.11, 0.3, 'sine', 0.13));
}

/** Time ran out: a falling pair of notes. */
export function playTimeUp() {
  blip(392, 0, 0.3, 'triangle', 0.15);
  blip(262, 0.18, 0.45, 'triangle', 0.15);
}

/** The clock's tick, called once a second while time is low. */
export function playTick() {
  blip(880, 0, 0.06, 'sine', 0.05);
}
