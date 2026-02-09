"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Shield, Server, Network, Cloud, Code } from "lucide-react";

interface Certificate {
  _id: string;
  slug: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  retailPrice: number;
  examCodes: string[];
}

interface PopularCertificatesProps {
  certificates: Certificate[];
}

const categoryIcons: Record<string, React.ElementType> = {
  CORE: Shield,
  INFRASTRUCTURE: Server,
  CYBERSECURITY: Shield,
  DATA_ANALYTICS: Code,
  PROFESSIONAL: Cloud,
};

const categoryColors: Record<string, string> = {
  CORE: "bg-blue-500/10 text-blue-600",
  INFRASTRUCTURE: "bg-purple-500/10 text-purple-600",
  CYBERSECURITY: "bg-red-500/10 text-red-600",
  DATA_ANALYTICS: "bg-green-500/10 text-green-600",
  PROFESSIONAL: "bg-orange-500/10 text-orange-600",
};

export function PopularCertificates({ certificates }: PopularCertificatesProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {t("popularBadge")}
          </Badge>
          <h2 className="text-3xl font-bold mb-4">{t("popularTitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("popularDescription")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.slice(0, 6).map((cert) => {
            const Icon = categoryIcons[cert.category] || Shield;
            const colorClass = categoryColors[cert.category] || "bg-gray-500/10 text-gray-600";

            return (
              <Card key={cert._id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {cert.examCodes?.length > 1 
                        ? `${cert.examCodes.length} ${isRTL ? "امتحانات" : "exams"}`
                        : cert.examCodes?.[0] || cert.code
                      }
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mt-4">
                    {isRTL ? cert.nameAr : cert.nameEn}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {isRTL ? cert.descriptionAr : cert.descriptionEn}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(cert.retailPrice)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {isRTL ? "ر.س" : "SAR"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("priceNote")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={`/certificates/${cert.slug}`}>
                      {t("viewDetails")}
                      {isRTL ? (
                        <ArrowLeft className="h-4 w-4 ms-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 ms-2" />
                      )}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" variant="default">
            <Link href="/certificates">
              {t("viewAllCertificates")}
              {isRTL ? (
                <ArrowLeft className="h-4 w-4 ms-2" />
              ) : (
                <ArrowRight className="h-4 w-4 ms-2" />
              )}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
