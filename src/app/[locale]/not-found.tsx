"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("nav");
  return (
    <div className="container py-32 text-center">
      <h1 className="text-5xl font-bold text-accent">404</h1>
      <p className="mt-4 text-text-secondary">Page not found.</p>
      <Button asChild className="mt-6">
        <Link href="/">{t("brand")}</Link>
      </Button>
    </div>
  );
}
