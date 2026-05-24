"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-bg-border/60 mt-8">
      <div className="container py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-accent/40 bg-accent/10">
            <KeyRound className="h-3.5 w-3.5 text-accent" aria-hidden />
          </span>
          <div>
            <div className="text-sm font-semibold">
              BG <span className="text-accent">KeyForge</span>
            </div>
            <p className="text-xs text-text-secondary">{t("tagline")}</p>
          </div>
        </div>
        <p className="text-xs text-text-secondary">
          {t("rights", { year })}
        </p>
      </div>
    </footer>
  );
}
