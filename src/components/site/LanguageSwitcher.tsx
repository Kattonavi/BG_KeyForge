"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as "es" | "en";
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <label
      className="relative inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-card/60 px-2.5 py-1.5 text-sm text-text-secondary hover:border-accent/40 transition-colors focus-within:border-accent/60"
      aria-label={t("language")}
    >
      <Languages className="h-4 w-4 text-accent" aria-hidden />
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        className="bg-transparent outline-none text-text-primary text-sm cursor-pointer pr-1 disabled:opacity-60"
      >
        <option value="es" className="bg-bg-card text-text-primary">
          {t("es")}
        </option>
        <option value="en" className="bg-bg-card text-text-primary">
          {t("en")}
        </option>
      </select>
    </label>
  );
}
