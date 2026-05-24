"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Cpu, Dice5, Shuffle, EyeOff } from "lucide-react";

export function HowItWorks() {
  const t = useTranslations("how");

  const steps = [
    {
      icon: Cpu,
      title: t("step1Title"),
      body: t("step1Body"),
    },
    {
      icon: Dice5,
      title: t("step2Title"),
      body: t("step2Body"),
    },
    {
      icon: Shuffle,
      title: t("step3Title"),
      body: t("step3Body"),
    },
    {
      icon: EyeOff,
      title: t("step4Title"),
      body: t("step4Body"),
    },
  ];

  return (
    <section
      id="how"
      className="relative scroll-mt-20 py-16 md:py-24 border-t border-bg-border/60"
    >
      <div className="container">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-xl p-6 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-accent/10 border border-accent/30 text-accent shadow-glow-soft">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {s.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
