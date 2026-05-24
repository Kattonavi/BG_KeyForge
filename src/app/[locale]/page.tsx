import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/site/Hero";
import { GeneratorSection } from "@/components/site/GeneratorSection";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Privacy } from "@/components/site/Privacy";
import { SecurityTips } from "@/components/site/SecurityTips";
import { FAQ } from "@/components/site/FAQ";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <GeneratorSection />
      <HowItWorks />
      <Privacy />
      <SecurityTips />
      <FAQ />
    </>
  );
}
