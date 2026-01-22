"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, ArrowRight, ArrowLeft } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -start-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -end-1/4 bottom-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 gap-2 px-4 py-2 text-sm font-medium"
          >
            <Award className="h-4 w-4" />
            {t("badge")}
          </Badge>

          {/* Main Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-primary">{t("title")}</span>
            <br />
            <span className="text-foreground">{t("subtitle")}</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href="/checkout">
                {t("cta")}
                {isRTL ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href="#features">{t("learnMore")}</a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">CompTIA Authorized</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-sm">SAR Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
