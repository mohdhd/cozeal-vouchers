import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/lib/models/Certificate";
import {
  CheckCircle,
  Clock,
  FileText,
  ShoppingCart,
  Building2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
  CORE: { en: "Core Certification", ar: "شهادة أساسية" },
  INFRASTRUCTURE: { en: "Infrastructure", ar: "البنية التحتية" },
  CYBERSECURITY: { en: "Cybersecurity", ar: "الأمن السيبراني" },
  DATA: { en: "Data & Analytics", ar: "البيانات والتحليلات" },
  PROFESSIONAL: { en: "Professional", ar: "مهني" },
};

async function getCertificate(slug: string) {
  await connectDB();
  const certificate = await Certificate.findOne({ slug, isActive: true }).lean();
  return certificate ? JSON.parse(JSON.stringify(certificate)) : null;
}

async function getRelatedCertificates(category: string, currentSlug: string) {
  await connectDB();
  const certificates = await Certificate.find({
    category,
    slug: { $ne: currentSlug },
    isActive: true,
  })
    .limit(3)
    .lean();
  return JSON.parse(JSON.stringify(certificates));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const certificate = await getCertificate(slug);

  if (!certificate) {
    return { title: "Certificate Not Found" };
  }

  const name = locale === "ar" ? certificate.nameAr : certificate.nameEn;
  const description = locale === "ar" ? certificate.descriptionAr : certificate.descriptionEn;

  return {
    title: `${name} | Cozeal Vouchers`,
    description: description.substring(0, 160),
  };
}

export default async function CertificateDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const certificate = await getCertificate(slug);

  if (!certificate) {
    notFound();
  }

  const relatedCertificates = await getRelatedCertificates(certificate.category, slug);
  const t = await getTranslations("certificates");
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const name = isRTL ? certificate.nameAr : certificate.nameEn;
  const description = isRTL ? certificate.descriptionAr : certificate.descriptionEn;
  const features = isRTL ? certificate.featuresAr : certificate.featuresEn;
  const categoryLabel = categoryLabels[certificate.category]?.[locale as "en" | "ar"];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <Link
              href="/certificates"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowIcon className="h-4 w-4" />
              {t("backToCatalog")}
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left Column - Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary">{categoryLabel}</Badge>
                  <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
                </div>

                <p className="text-lg text-muted-foreground">{description}</p>

                {/* Exam Info */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>
                      {t("examCode")}: <strong>{certificate.examCode}</strong>
                    </span>
                  </div>
                  {certificate.numberOfExams > 1 && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>
                        {certificate.numberOfExams} {t("examsRequired")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>
                      {t("validFor")} {certificate.validityMonths} {t("months")}
                    </span>
                  </div>
                </div>

                {/* Features */}
                {features && features.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">{t("whatYoullLearn")}</h3>
                    <ul className="space-y-2">
                      {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column - Pricing Card */}
              <div className="lg:sticky lg:top-24">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>{t("purchaseVoucher")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Individual Price */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="text-sm">{t("individualPrice")}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {certificate.retailPrice.toLocaleString()}
                        </span>
                        <span className="text-lg">{t("sar")}</span>
                        {certificate.numberOfExams > 1 && (
                          <span className="text-sm text-muted-foreground">
                            / {t("perVoucher")}
                          </span>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Institution Price */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">{t("institutionPrice")}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {certificate.institutionBasePrice.toLocaleString()}
                        </span>
                        <span>{t("sar")}</span>
                        <Badge variant="secondary">{t("bulkDiscount")}</Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                      <Link href={`/checkout?certificate=${certificate.slug}`} className="block w-full">
                        <Button className="w-full" size="lg">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t("buyNow")}
                        </Button>
                      </Link>
                      <Link href="/institutions" className="block w-full">
                        <Button variant="outline" className="w-full">
                          <Building2 className="h-4 w-4 mr-2" />
                          {t("institutionInquiry")}
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      {t("vatIncluded")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* All Exam Codes (for multi-exam certs) */}
        {certificate.examCodes && certificate.examCodes.length > 1 && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold mb-4">{t("requiredExams")}</h2>
              <div className="flex flex-wrap gap-3">
                {certificate.examCodes.map((code: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-base py-2 px-4">
                    {code}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t("multiExamNote")}
              </p>
            </div>
          </section>
        )}

        {/* Related Certificates */}
        {relatedCertificates.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">{t("relatedCertificates")}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedCertificates.map((cert: { _id: string; slug: string; nameEn: string; nameAr: string; examCode: string; retailPrice: number }) => (
                  <Link key={cert._id} href={`/certificates/${cert.slug}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="font-bold mb-2">
                          {isRTL ? cert.nameAr : cert.nameEn}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {cert.examCode}
                        </p>
                        <p className="font-bold text-primary">
                          {cert.retailPrice.toLocaleString()} {t("sar")}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
