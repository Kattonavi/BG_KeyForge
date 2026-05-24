function getCrypto(): Crypto {
  if (typeof globalThis === "undefined" || !globalThis.crypto?.getRandomValues) {
    throw new Error(
      "Web Crypto API is not available in this environment. A modern browser is required.",
    );
  }
  return globalThis.crypto;
}

/**
 * Unsigned 32-bit random integer drawn from crypto.getRandomValues.
 */
function randomUint32(): number {
  const buf = new Uint32Array(1);
  getCrypto().getRandomValues(buf);
  return buf[0]!;
}

/**
 * Unbiased integer in [0, max) using rejection sampling on 32-bit values.
 * For max <= 1 returns 0.
 */
export function randomIntBelow(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error("randomIntBelow: max must be a positive integer.");
  }
  if (max === 1) return 0;

  const range = 0x1_0000_0000;
  const limit = range - (range % max);

  let x: number;
  do {
    x = randomUint32();
  } while (x >= limit);

  return x % max;
}

/**
 * Pick a random character from a string using unbiased rejection sampling.
 */
export function randomChar(chars: string): string {
  if (!chars || chars.length === 0) {
    throw new Error("randomChar: chars must be a non-empty string.");
  }
  return chars.charAt(randomIntBelow(chars.length));
}

/**
 * In-place Fisher-Yates shuffle backed by crypto.getRandomValues.
 */
export function secureShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIntBelow(i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}
