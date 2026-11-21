// A small deterministic generator, so the two pictures of a scene agree
// on every scattered star, pebble and bubble, and so a staged screenshot
// paints the same pixels every time it is taken. mulberry32: a tiny
// well-tested generator that fits in a few lines and needs no tables.

/** Build a generator that yields numbers in [0, 1) from a fixed seed. */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** An integer from min to max inclusive, drawn from the generator. */
export function rollInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** One element of a list, drawn from the generator. */
export function rollPick(random, items) {
  return items[Math.floor(random() * items.length)];
}

/** A number between min and max, drawn from the generator. */
export function rollRange(random, min, max) {
  return min + random() * (max - min);
}
