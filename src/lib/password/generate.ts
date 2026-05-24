import { buildCharsets, type CharsetOptions } from "./charsets";
import { randomChar, secureShuffle } from "./random";

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 512;
export const DEFAULT_LENGTH = 100;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 100;
export const DEFAULT_QUANTITY = 1;

export interface GenerateOptions extends CharsetOptions {
  length: number;
  requireEachType: boolean;
}

export type GenerationErrorCode = "NO_TYPES" | "EMPTY_CHARSET";

export class GenerationError extends Error {
  code: GenerationErrorCode;
  constructor(code: GenerationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "GenerationError";
  }
}

function clampLength(length: number): number {
  const n = Math.floor(length);
  if (!Number.isFinite(n)) return DEFAULT_LENGTH;
  if (n < MIN_LENGTH) return MIN_LENGTH;
  if (n > MAX_LENGTH) return MAX_LENGTH;
  return n;
}

/**
 * Generate a single cryptographically random password.
 *
 * - Uses crypto.getRandomValues (never Math.random).
 * - Uses unbiased rejection sampling.
 * - If `requireEachType` is true, guarantees at least one char from each
 *   selected group and then performs a Fisher-Yates secure shuffle.
 * - If the requested length is smaller than the number of required groups,
 *   the length is automatically increased to fit them safely.
 */
export function generatePassword(opts: GenerateOptions): string {
  const length = clampLength(opts.length);
  const { groups, combined } = buildCharsets(opts);

  if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
    throw new GenerationError("NO_TYPES", "No character types selected.");
  }
  if (combined.length === 0) {
    throw new GenerationError(
      "EMPTY_CHARSET",
      "The resulting character set is empty after applying filters.",
    );
  }

  const effectiveLength = opts.requireEachType
    ? Math.max(length, groups.length)
    : length;

  const chars: string[] = [];

  if (opts.requireEachType) {
    for (const g of groups) chars.push(randomChar(g));
  }

  while (chars.length < effectiveLength) {
    chars.push(randomChar(combined));
  }

  if (opts.requireEachType) secureShuffle(chars);

  return chars.join("");
}

/**
 * Generate a batch of independent passwords.
 */
export function generatePasswords(
  opts: GenerateOptions,
  quantity: number,
): string[] {
  const n = Math.max(
    MIN_QUANTITY,
    Math.min(MAX_QUANTITY, Math.floor(quantity) || MIN_QUANTITY),
  );
  const out: string[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = generatePassword(opts);
  return out;
}

export function isLengthAdjustedForRequiredTypes(
  opts: GenerateOptions,
): boolean {
  if (!opts.requireEachType) return false;
  const { groups } = buildCharsets(opts);
  return opts.length < groups.length;
}
