"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  EyeOff,
  WifiOff,
  Database,
  UserX,
  History,
} from "lucide-react";

export function Privacy() {
  const t = useTranslations("privacy");

  const items = [
    { icon: ShieldCheck, key: "noSave" as const },
    { icon: EyeOff, key: "noSee" as const },
    { icon: WifiOff, key: "noSend" as const },
    { icon: Database, key: "noDb" as const },
    { icon: UserX, key: "noAccount" as const },
    { icon: History, key: "noHistory" as const },
  ];

  return (
    <section
      id="privacy"
      className="relative scroll-mt-20 py-16 md:py-24 border-t border-bg-border/60"
    >
      <div className="container">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="glass rounded-xl p-5 flex items-start gap-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-success/10 border border-success/30 text-success shrink-0">
                <it.icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm text-text-primary leading-relaxed">
                {t(`items.${it.key}`)}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-sm text-text-secondary italic">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}
