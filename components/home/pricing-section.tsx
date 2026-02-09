"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface PricingSectionProps {
  basePrice: number;
  vatPercent: number;
}

export function PricingSection({ basePrice, vatPercent }: PricingSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";

  const features = [
    "Official CompTIA voucher",
    "Valid for 12 months",
    "One exam attempt",
    "Delivery within 5-10 business days",
    "Arabic & English support",
    "Invoice included",
  ];

  const featuresAr = [
    "قسيمة CompTIA رسمية",
    "صالحة لمدة 12 شهر",
    "محاولة امتحان واحدة",
    "التسليم خلال 5-10 أيام عمل",
    "دعم بالعربية والإنجليزية",
    "فاتورة مضمنة",
  ];

  const displayFeatures = isRTL ? featuresAr : features;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center text-primary-foreground">
              <Badge
                variant="secondary"
                className="mb-4 bg-white/20 text-white"
              >
                CompTIA Security+ SY0-701
              </Badge>
              <h3 className="text-2xl font-bold">
                {isRTL ? "قسيمة الامتحان" : "Exam Voucher"}
              </h3>
            </div>

            {/* Price */}
            <div className="border-b border-border p-6 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-foreground" dir="ltr">
                  {formatPrice(basePrice)}
                </span>
                <span className="text-lg text-muted-foreground">
                  {t("common.sar")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("checkout.perVoucher")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                + {t("checkout.vat")}
              </p>
            </div>

            {/* Features */}
            <div className="p-6">
              <ul className="space-y-3">
                {displayFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-secondary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0">
              <Button asChild className="w-full gap-2" size="lg">
                <Link href="/checkout">
                  {t("hero.cta")}
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Link>
              </Button>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {isRTL
                  ? "أدخل كود الخصم عند إتمام الطلب للحصول على سعر خاص"
                  : "Enter a discount code at checkout for special university pricing"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
