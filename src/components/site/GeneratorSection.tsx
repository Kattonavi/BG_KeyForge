"use client";

import { useTranslations } from "next-intl";
import { GeneratorPanel } from "./GeneratorPanel";

export function GeneratorSection() {
  const t = useTranslations("generator");
  return (
    <section
      id="generator"
      className="relative scroll-mt-20 py-16 md:py-24 border-t border-bg-border/60"
    >
      <div className="container">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </div>
        <GeneratorPanel />
      </div>
    </section>
  );
}
