/**
 * Strength scoring helpers.
 *
 * zxcvbn-ts (and its dictionaries) is heavy — we dynamically import it so the
 * landing page doesn't ship ~1MB of dictionaries before the user actually
 * interacts with the generator. All work runs in the browser; passwords are
 * never sent anywhere.
 */

export type Score = 0 | 1 | 2 | 3 | 4;
export interface StrengthInfo {
  score: Score;
}

// zxcvbn becomes very slow past ~30 chars. For our use case (cryptographically
// random output) anything beyond that already maxes out the score.
const ZXCVBN_INPUT_CAP = 32;

type ScoreFn = (password: string) => Score;
let scoreFn: ScoreFn | null = null;
let loaderPromise: Promise<ScoreFn> | null = null;
let currentLocale: "es" | "en" = "es";

async function loadZxcvbn(locale: "es" | "en"): Promise<ScoreFn> {
  const [{ zxcvbnOptions, zxcvbn }, common, lang] = await Promise.all([
    import("@zxcvbn-ts/core"),
    import("@zxcvbn-ts/language-common"),
    locale === "es"
      ? import("@zxcvbn-ts/language-es-es")
      : import("@zxcvbn-ts/language-en"),
  ]);

  zxcvbnOptions.setOptions({
    dictionary: { ...common.dictionary, ...lang.dictionary },
    graphs: common.adjacencyGraphs,
    translations: lang.translations,
  });

  return (password: string) => {
    const truncated =
      password.length > ZXCVBN_INPUT_CAP
        ? password.slice(0, ZXCVBN_INPUT_CAP)
        : password;
    return zxcvbn(truncated).score as Score;
  };
}

export function configureStrength(locale: "es" | "en"): Promise<void> {
  if (locale === currentLocale && scoreFn) return Promise.resolve();
  currentLocale = locale;
  scoreFn = null;
  loaderPromise = loadZxcvbn(locale).then((fn) => {
    scoreFn = fn;
    return fn;
  });
  return loaderPromise.then(() => undefined);
}

export async function ensureStrengthReady(
  locale: "es" | "en" = currentLocale,
): Promise<void> {
  if (scoreFn && locale === currentLocale) return;
  if (!loaderPromise || locale !== currentLocale) {
    currentLocale = locale;
    loaderPromise = loadZxcvbn(locale).then((fn) => {
      scoreFn = fn;
      return fn;
    });
  }
  await loaderPromise;
}

/**
 * Heuristic, lightweight fallback used before zxcvbn finishes loading.
 * Conservative — returns at most score 3 to avoid overstating strength.
 */
export function quickScore(password: string): Score {
  const len = password.length;
  const classes =
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const entropyBits = len * Math.log2(Math.max(26 * classes, 26));
  if (entropyBits < 28) return 0;
  if (entropyBits < 36) return 1;
  if (entropyBits < 60) return 2;
  return 3;
}

export function scorePassword(password: string): StrengthInfo {
  if (scoreFn) return { score: scoreFn(password) };
  return { score: quickScore(password) };
}

/**
 * Score many passwords without blocking the main thread.
 * Processes in small chunks, yielding to the event loop between batches.
 */
export async function scorePasswordsAsync(
  passwords: string[],
  onProgress?: (scores: Score[]) => void,
): Promise<Score[]> {
  await ensureStrengthReady();
  const out: Score[] = new Array(passwords.length);
  const CHUNK = 5;
  for (let i = 0; i < passwords.length; i += CHUNK) {
    const end = Math.min(i + CHUNK, passwords.length);
    for (let j = i; j < end; j++) {
      out[j] = scorePassword(passwords[j]!).score;
    }
    if (onProgress) onProgress(out.slice());
    // Yield to the browser so the UI stays responsive.
    await new Promise<void>((resolve) => {
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  }
  return out;
}
