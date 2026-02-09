"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Building2, Users, BadgePercent, Headphones, ArrowRight, ArrowLeft } from "lucide-react";

export function InstitutionCTA() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const benefits = [
    {
      icon: BadgePercent,
      title: t("institutionBenefit1Title"),
      description: t("institutionBenefit1Desc"),
    },
    {
      icon: Users,
      title: t("institutionBenefit2Title"),
      description: t("institutionBenefit2Desc"),
    },
    {
      icon: Headphones,
      title: t("institutionBenefit3Title"),
      description: t("institutionBenefit3Desc"),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              {t("institutionBadge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("institutionTitle")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("institutionDescription")}
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/institutions/register">
                  {t("institutionRegister")}
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4 ms-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 ms-2" />
                  )}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/institutions">
                  {t("institutionLearnMore")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="relative">
            <div className="bg-card rounded-2xl shadow-xl border p-8">
              <h3 className="text-xl font-bold mb-6 text-center">{t("institutionStatsTitle")}</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">{t("statInstitutions")}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-1">12+</div>
                  <div className="text-sm text-muted-foreground">{t("statCertifications")}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-secondary mb-1">30%</div>
                  <div className="text-sm text-muted-foreground">{t("statDiscount")}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-secondary mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">{t("statSupport")}</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  {t("institutionTrustText")}
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 top-4 -start-4 w-full h-full rounded-2xl bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
