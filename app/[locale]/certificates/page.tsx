import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { CertificateGrid } from "@/components/certificates";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/lib/models/Certificate";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "certificates" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

async function getCertificates() {
  await connectDB();
  const certificates = await Certificate.find({ isActive: true })
    .sort({ sortOrder: 1, category: 1 })
    .lean();
  return JSON.parse(JSON.stringify(certificates));
}

export default async function CertificatesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const certificates = await getCertificates();
  const t = await getTranslations("certificates");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                {t("heroTitle")}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Certificates Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <CertificateGrid certificates={certificates} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t("ctaDescription")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
