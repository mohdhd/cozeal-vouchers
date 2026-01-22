import { setRequestLocale } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { PricingSection } from "@/components/home/pricing-section";
import { getSettings } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection basePrice={settings.basePrice} vatPercent={settings.vatPercent} />
      </main>
      <Footer />
    </div>
  );
}
