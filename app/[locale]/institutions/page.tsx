import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  BadgePercent,
  Users,
  Shield,
  HeadphonesIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "institutions" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function InstitutionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("institutions");
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const benefits = [
    {
      icon: BadgePercent,
      title: t("benefits.discount.title"),
      description: t("benefits.discount.description"),
    },
    {
      icon: Users,
      title: t("benefits.bulk.title"),
      description: t("benefits.bulk.description"),
    },
    {
      icon: Shield,
      title: t("benefits.official.title"),
      description: t("benefits.official.description"),
    },
    {
      icon: HeadphonesIcon,
      title: t("benefits.support.title"),
      description: t("benefits.support.description"),
    },
  ];

  const institutionTypes = [
    {
      icon: GraduationCap,
      title: t("types.university.title"),
      description: t("types.university.description"),
    },
    {
      icon: Building2,
      title: t("types.trainingCenter.title"),
      description: t("types.trainingCenter.description"),
    },
    {
      icon: Briefcase,
      title: t("types.company.title"),
      description: t("types.company.description"),
    },
    {
      icon: Award,
      title: t("types.government.title"),
      description: t("types.government.description"),
    },
  ];

  const steps = [
    { number: 1, title: t("steps.register.title"), description: t("steps.register.description") },
    { number: 2, title: t("steps.review.title"), description: t("steps.review.description") },
    { number: 3, title: t("steps.approval.title"), description: t("steps.approval.description") },
    { number: 4, title: t("steps.order.title"), description: t("steps.order.description") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                {t("heroTitle")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/institutions/register">
                  <Button size="lg" className="gap-2">
                    {t("registerNow")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    {t("existingInstitution")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("benefitsTitle")}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <benefit.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Institution Types */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">{t("typesTitle")}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t("typesSubtitle")}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {institutionTypes.map((type, index) => (
                <Card key={index}>
                  <CardHeader>
                    <type.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("howItWorksTitle")}</h2>
            <div className="grid gap-8 md:grid-cols-4 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("ctaTitle")}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              {t("ctaDescription")}
            </p>
            <Link href="/institutions/register">
              <Button size="lg" variant="secondary" className="gap-2">
                {t("getStarted")}
                <ArrowIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
