"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="container relative z-10 py-20 md:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-bg-border bg-bg-card/60 px-3 py-1 text-xs text-text-secondary backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
            {t("badge")}
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            <span className="text-text-primary">{t("title1")}</span>{" "}
            <span className="bg-gradient-to-r from-accent via-accent-glow to-accent bg-clip-text text-transparent">
              {t("title2")}
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="#generator" aria-label={t("ctaGenerate")}>
                <Sparkles className="h-4 w-4" aria-hidden />
                {t("ctaGenerate")}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#how" aria-label={t("ctaHowItWorks")}>
                {t("ctaHowItWorks")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: t("stat1Label"), value: t("stat1Value") },
            { label: t("stat2Label"), value: t("stat2Value") },
            { label: t("stat3Label"), value: t("stat3Value") },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-soft rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-semibold text-accent font-mono-tight">
                {s.value}
              </div>
              <div className="text-xs text-text-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 -bottom-40 h-80 bg-gradient-to-t from-bg-primary to-transparent"
        aria-hidden
      />
    </section>
  );
}
