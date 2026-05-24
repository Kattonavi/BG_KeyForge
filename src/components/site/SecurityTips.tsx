"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  KeyRound,
  RotateCw,
  Smartphone,
  Fingerprint,
  MessageSquareOff,
  FileLock,
  AlertTriangle,
  Download,
} from "lucide-react";

const tips = [
  { key: "manager", icon: KeyRound },
  { key: "noReuse", icon: RotateCw },
  { key: "twoFactor", icon: Smartphone },
  { key: "passkeys", icon: Fingerprint },
  { key: "noShare", icon: MessageSquareOff },
  { key: "noPlain", icon: FileLock },
  { key: "rotate", icon: AlertTriangle },
  { key: "update", icon: Download },
] as const;

export function SecurityTips() {
  const t = useTranslations("tips");

  return (
    <section
      id="tips"
      className="relative scroll-mt-20 py-16 md:py-24 border-t border-bg-border/60"
    >
      <div className="container">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="glass rounded-xl p-5 hover:border-accent/30 transition-colors group"
            >
              <span className="inline-grid h-10 w-10 place-items-center rounded-md bg-bg-card border border-bg-border text-accent group-hover:shadow-glow-soft transition-shadow">
                <tip.icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold">
                {t(`items.${tip.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {t(`items.${tip.key}.body`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
