"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
  TriangleAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_LENGTH,
  DEFAULT_QUANTITY,
  MAX_LENGTH,
  MAX_QUANTITY,
  MIN_LENGTH,
  MIN_QUANTITY,
  GenerationError,
  generatePassword,
  generatePasswords,
  type GenerateOptions,
} from "@/lib/password";
import {
  configureStrength,
  ensureStrengthReady,
  quickScore,
  scorePassword,
  scorePasswordsAsync,
  type Score,
} from "@/lib/password/strength";
import { cn } from "@/lib/utils";

interface PasswordEntry {
  id: string;
  value: string;
  score: Score;
}

const STRENGTH_COLORS: Record<number, string> = {
  0: "bg-danger",
  1: "bg-warning",
  2: "bg-warning/80",
  3: "bg-accent",
  4: "bg-success",
};

const STRENGTH_TEXT: Record<number, string> = {
  0: "text-danger",
  1: "text-warning",
  2: "text-warning",
  3: "text-accent",
  4: "text-success",
};

/** Cryptographically random hex id for React keys. No Math.random anywhere. */
function newId(): string {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  let s = "";
  for (let i = 0; i < buf.length; i++) {
    s += buf[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

function buildEntryQuick(value: string): PasswordEntry {
  return { id: newId(), value, score: quickScore(value) };
}

export function GeneratorPanel() {
  const t = useTranslations("generator");
  const locale = useLocale() as "es" | "en";

  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [avoidProblematic, setAvoidProblematic] = useState(false);
  const [requireEachType, setRequireEachType] = useState(true);
  const [maxSecurity, setMaxSecurity] = useState(false);
  const [easyRead, setEasyRead] = useState(false);

  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);

  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoringTokenRef = useRef(0);

  // Load zxcvbn lazily once the panel is interactive, and re-load on locale change.
  useEffect(() => {
    let active = true;
    configureStrength(locale).then(() => {
      if (!active) return;
      setEntries((prev) =>
        prev.length === 0
          ? prev
          : prev.map((e) => ({ ...e, score: scorePassword(e.value).score })),
      );
    });
    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    if (!maxSecurity) return;
    setUppercase(true);
    setLowercase(true);
    setNumbers(true);
    setSymbols(true);
    setExcludeAmbiguous(true);
    setRequireEachType(true);
    setLength((l) => Math.max(l, 128));
    if (easyRead) setEasyRead(false);
  }, [maxSecurity, easyRead]);

  useEffect(() => {
    if (!easyRead) return;
    setExcludeAmbiguous(true);
    setAvoidProblematic(true);
    if (maxSecurity) setMaxSecurity(false);
  }, [easyRead, maxSecurity]);

  const options: GenerateOptions = useMemo(
    () => ({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeAmbiguous,
      avoidProblematic,
      requireEachType,
    }),
    [
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeAmbiguous,
      avoidProblematic,
      requireEachType,
    ],
  );

  const anyType = uppercase || lowercase || numbers || symbols;

  const scoreEntriesAsync = useCallback(async (values: string[]) => {
    const token = ++scoringTokenRef.current;
    await ensureStrengthReady();
    if (token !== scoringTokenRef.current) return;
    const scores = await scorePasswordsAsync(values, (partial) => {
      if (token !== scoringTokenRef.current) return;
      setEntries((prev) =>
        prev.map((e, i) =>
          i < partial.length ? { ...e, score: partial[i]! } : e,
        ),
      );
    });
    if (token !== scoringTokenRef.current) return;
    setEntries((prev) =>
      prev.map((e, i) => (i < scores.length ? { ...e, score: scores[i]! } : e)),
    );
  }, []);

  const handleGenerate = useCallback(() => {
    setError(null);
    setWarning(null);
    if (!anyType) {
      setError(t("errorNoTypes"));
      return;
    }
    try {
      const selectedTypes = [uppercase, lowercase, numbers, symbols].filter(
        Boolean,
      ).length;
      if (requireEachType && length < selectedTypes) {
        setWarning(t("errorLength"));
      }
      const list = generatePasswords(options, quantity);
      const initial = list.map(buildEntryQuick);
      setEntries(initial);
      // Score asynchronously to keep the UI responsive even with 100 items.
      void scoreEntriesAsync(list);
    } catch (e) {
      if (e instanceof GenerationError) {
        setError(t("errorNoTypes"));
      } else {
        setError(t("errorNoTypes"));
      }
    }
  }, [
    options,
    quantity,
    anyType,
    requireEachType,
    length,
    uppercase,
    lowercase,
    numbers,
    symbols,
    t,
    scoreEntriesAsync,
  ]);

  // Generate the very first batch on mount so users see results immediately.
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerateOne = useCallback(
    (id: string) => {
      if (!anyType) {
        setError(t("errorNoTypes"));
        return;
      }
      try {
        const next = generatePassword(options);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id
              ? { id: newId(), value: next, score: scorePassword(next).score }
              : e,
          ),
        );
      } catch {
        setError(t("errorNoTypes"));
      }
    },
    [options, anyType, t],
  );

  const flashCopied = (id: string | null) => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    if (id === null) {
      setCopiedAll(true);
      copyResetTimer.current = setTimeout(() => setCopiedAll(false), 1400);
    } else {
      setCopiedId(id);
      copyResetTimer.current = setTimeout(() => setCopiedId(null), 1400);
    }
  };

  const handleCopy = useCallback(async (entry: PasswordEntry) => {
    try {
      await navigator.clipboard.writeText(entry.value);
      flashCopied(entry.id);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = entry.value;
      ta.setAttribute("aria-hidden", "true");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        flashCopied(entry.id);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (entries.length === 0) return;
    const text = entries.map((e) => e.value).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(null);
    } catch {
      /* silent — avoid leaving plaintext in the DOM */
    }
  }, [entries]);

  const toggleVisibility = useCallback((id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    scoringTokenRef.current++;
    setEntries([]);
    setVisibleIds(new Set());
    setError(null);
    setWarning(null);
  }, []);

  const confirmExport = useCallback(() => {
    if (entries.length === 0) {
      setExportOpen(false);
      return;
    }
    const content = entries.map((e) => e.value).join("\r\n") + "\r\n";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bg-keyforge-passwords.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }, [entries]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <aside className="lg:col-span-2 glass rounded-xl p-5 md:p-6 h-fit lg:sticky lg:top-24">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="h-4 w-4 text-accent" aria-hidden />
          <h3 className="text-base font-semibold">{t("configTitle")}</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="length-slider">{t("length")}</Label>
              <span className="text-sm font-mono-tight text-accent">
                {length}
              </span>
            </div>
            <Slider
              id="length-slider"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              step={1}
              value={[length]}
              onValueChange={(v) => setLength(v[0] ?? DEFAULT_LENGTH)}
              aria-label={t("length")}
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>{MIN_LENGTH}</span>
              <span>{MAX_LENGTH}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="qty-slider">{t("quantity")}</Label>
              <span className="text-sm font-mono-tight text-accent">
                {quantity}
              </span>
            </div>
            <Slider
              id="qty-slider"
              min={MIN_QUANTITY}
              max={MAX_QUANTITY}
              step={1}
              value={[quantity]}
              onValueChange={(v) => setQuantity(v[0] ?? DEFAULT_QUANTITY)}
              aria-label={t("quantity")}
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-3">{t("types")}</div>
            <div className="space-y-3">
              <ToggleRow
                id="t-upper"
                label={t("uppercase")}
                checked={uppercase}
                onCheckedChange={setUppercase}
              />
              <ToggleRow
                id="t-lower"
                label={t("lowercase")}
                checked={lowercase}
                onCheckedChange={setLowercase}
              />
              <ToggleRow
                id="t-num"
                label={t("numbers")}
                checked={numbers}
                onCheckedChange={setNumbers}
              />
              <ToggleRow
                id="t-sym"
                label={t("symbols")}
                checked={symbols}
                onCheckedChange={setSymbols}
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-3">{t("advanced")}</div>
            <div className="space-y-3">
              <ToggleRow
                id="o-amb"
                label={t("excludeAmbiguous")}
                hint={t("excludeAmbiguousHint")}
                checked={excludeAmbiguous}
                onCheckedChange={setExcludeAmbiguous}
              />
              <ToggleRow
                id="o-prob"
                label={t("avoidProblematic")}
                hint={t("avoidProblematicHint")}
                checked={avoidProblematic}
                onCheckedChange={setAvoidProblematic}
              />
              <ToggleRow
                id="o-req"
                label={t("requireEachType")}
                checked={requireEachType}
                onCheckedChange={setRequireEachType}
              />
              <ToggleRow
                id="o-max"
                label={t("maxSecurity")}
                hint={t("maxSecurityHint")}
                checked={maxSecurity}
                onCheckedChange={setMaxSecurity}
              />
              <ToggleRow
                id="o-easy"
                label={t("easyRead")}
                hint={t("easyReadHint")}
                checked={easyRead}
                onCheckedChange={setEasyRead}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full"
            aria-label={t("generate")}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {t("generate")}
          </Button>
        </div>
      </aside>

      <section className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-base font-semibold">{t("results")}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyAll}
              disabled={entries.length === 0}
              aria-label={t("copyAll")}
            >
              {copiedAll ? (
                <Check className="h-4 w-4 text-success" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copiedAll ? t("copied") : t("copyAll")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(true)}
              disabled={entries.length === 0}
              aria-label={t("export")}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("export")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={entries.length === 0}
              aria-label={t("clear")}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {t("clear")}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="alert"
              className="glass rounded-lg border-danger/40 bg-danger/10 text-danger px-4 py-3 text-sm flex items-center gap-2"
            >
              <TriangleAlert className="h-4 w-4" aria-hidden />
              {error}
            </motion.div>
          )}
          {warning && !error && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="status"
              className="glass rounded-lg border-warning/40 bg-warning/10 text-warning px-4 py-3 text-sm flex items-center gap-2"
            >
              <TriangleAlert className="h-4 w-4" aria-hidden />
              {warning}
            </motion.div>
          )}
        </AnimatePresence>

        {entries.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center text-text-secondary">
            {t("noResults")}
          </div>
        ) : (
          <ul className="space-y-3" aria-live="polite">
            <AnimatePresence initial={false}>
              {entries.map((entry) => {
                const visible = visibleIds.has(entry.id);
                const strengthLabel = t(
                  `strengthLabels.${entry.score}` as
                    | "strengthLabels.0"
                    | "strengthLabels.1"
                    | "strengthLabels.2"
                    | "strengthLabels.3"
                    | "strengthLabels.4",
                );
                return (
                  <motion.li
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="glass rounded-xl p-4 md:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {visible ? (
                          <div
                            className="font-mono-tight text-[13px] md:text-sm break-all rounded-md bg-bg-primary/60 border border-bg-border px-3 py-2 leading-relaxed select-all"
                          >
                            {entry.value}
                          </div>
                        ) : (
                          <div
                            className="font-mono-tight text-[13px] md:text-sm break-all rounded-md bg-bg-primary/60 border border-bg-border px-3 py-2 leading-relaxed tracking-widest"
                            role="img"
                            aria-label={t("passwordHiddenA11y")}
                          >
                            <span aria-hidden="true">
                              {"•".repeat(Math.min(entry.value.length, 80))}
                            </span>
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-1.5 flex-1 max-w-[160px] rounded-full bg-bg-border/60 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all duration-500",
                                  STRENGTH_COLORS[entry.score],
                                )}
                                style={{
                                  width: `${((entry.score + 1) / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                STRENGTH_TEXT[entry.score],
                              )}
                            >
                              {t("strength")}: {strengthLabel}
                            </span>
                          </div>
                          <span className="text-xs text-text-secondary font-mono-tight">
                            {t("chars", { count: entry.value.length })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(entry.id)}
                          aria-label={visible ? t("hide") : t("show")}
                          aria-pressed={visible}
                        >
                          {visible ? (
                            <EyeOff className="h-4 w-4" aria-hidden />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(entry)}
                          aria-label={t("copy")}
                        >
                          {copiedId === entry.id ? (
                            <Check
                              className="h-4 w-4 text-success"
                              aria-hidden
                            />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRegenerateOne(entry.id)}
                          aria-label={t("regenerateOne")}
                        >
                          <RefreshCw className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent closeLabel={t("close")}>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <span className="grid place-items-center h-9 w-9 rounded-md bg-warning/10 border border-warning/30 text-warning shrink-0">
                <TriangleAlert className="h-4 w-4" aria-hidden />
              </span>
              <div className="flex-1 pr-6">
                <DialogTitle>{t("exportWarningTitle")}</DialogTitle>
                <DialogDescription className="mt-2">
                  {t("exportWarningBody")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setExportOpen(false)}
              size="sm"
            >
              {t("exportCancel")}
            </Button>
            <Button onClick={confirmExport} size="sm">
              <Download className="h-4 w-4" aria-hidden />
              {t("exportConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {hint && (
          <p className="text-xs text-text-secondary mt-0.5">{hint}</p>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
