"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const items = ["save", "sent", "length", "txt", "any", "noSymbols"] as const;

export function FAQ() {
  const t = useTranslations("faq");

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 py-16 md:py-24 border-t border-bg-border/60"
    >
      <div className="container max-w-3xl">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("title")}
          </h2>
        </div>
        <div className="glass rounded-xl px-4 md:px-6">
          <Accordion type="single" collapsible className="w-full">
            {items.map((k) => (
              <AccordionItem key={k} value={k}>
                <AccordionTrigger>{t(`items.${k}.q`)}</AccordionTrigger>
                <AccordionContent>{t(`items.${k}.a`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
