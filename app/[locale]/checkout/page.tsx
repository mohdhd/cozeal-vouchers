import { setRequestLocale } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSettings } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ certificate?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { certificate } = await searchParams;
  setRequestLocale(locale);

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <CheckoutForm
            basePrice={settings.basePrice}
            vatPercent={settings.vatPercent}
            preselectedCertificate={certificate}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
