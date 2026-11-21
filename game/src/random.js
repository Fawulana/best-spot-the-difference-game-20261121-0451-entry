// A tiny deterministic generator (mulberry32). Every scene draws its stars,
// pebbles and bubbles from a fixed seed, so the left and right panels agree on
// everything except the differences themselves, and a screenshot staged with
// ?seed=N is byte-identical every time it is taken.

/** Return a function that yields the next pseudo-random number in [0, 1). */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick an integer in [min, max] from the generator. */
export function randomInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** Pick one element of an array from the generator. */
export function randomPick(random, items) {
  return items[Math.floor(random() * items.length)];
}
