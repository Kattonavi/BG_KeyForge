export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
export const NUMBERS = "0123456789";
export const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~";

export const AMBIGUOUS = new Set(["O", "0", "I", "l", "1"]);
export const PROBLEMATIC_SYMBOLS = new Set([
  '"',
  "'",
  "`",
  "\\",
  "/",
  " ",
  "<",
  ">",
  "{",
  "}",
  ";",
  ":",
]);

export interface CharsetOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  avoidProblematic: boolean;
}

export interface CharsetBundle {
  groups: string[];
  combined: string;
}

function filterChars(input: string, opts: CharsetOptions): string {
  let chars = input;
  if (opts.excludeAmbiguous) {
    chars = chars
      .split("")
      .filter((c) => !AMBIGUOUS.has(c))
      .join("");
  }
  if (opts.avoidProblematic) {
    chars = chars
      .split("")
      .filter((c) => !PROBLEMATIC_SYMBOLS.has(c))
      .join("");
  }
  return chars;
}

export function buildCharsets(opts: CharsetOptions): CharsetBundle {
  const groups: string[] = [];

  if (opts.uppercase) {
    const g = filterChars(UPPERCASE, opts);
    if (g.length) groups.push(g);
  }
  if (opts.lowercase) {
    const g = filterChars(LOWERCASE, opts);
    if (g.length) groups.push(g);
  }
  if (opts.numbers) {
    const g = filterChars(NUMBERS, opts);
    if (g.length) groups.push(g);
  }
  if (opts.symbols) {
    const g = filterChars(SYMBOLS, opts);
    if (g.length) groups.push(g);
  }

  const combined = groups.join("");
  return { groups, combined };
}
