"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react";

interface CertificateCardProps {
  certificate: {
    slug: string;
    code: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    category: string;
    examCode: string;
    numberOfExams: number;
    retailPrice: number;
  };
}

const categoryColors: Record<string, string> = {
  CORE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  INFRASTRUCTURE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CYBERSECURITY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  DATA: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  PROFESSIONAL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
  CORE: { en: "Core", ar: "أساسي" },
  INFRASTRUCTURE: { en: "Infrastructure", ar: "البنية التحتية" },
  CYBERSECURITY: { en: "Cybersecurity", ar: "الأمن السيبراني" },
  DATA: { en: "Data", ar: "البيانات" },
  PROFESSIONAL: { en: "Professional", ar: "مهني" },
};

export function CertificateCard({ certificate }: CertificateCardProps) {
  const locale = useLocale();
  const t = useTranslations("certificates");
  const isRTL = locale === "ar";

  const name = isRTL ? certificate.nameAr : certificate.nameEn;
  const description = isRTL ? certificate.descriptionAr : certificate.descriptionEn;
  const categoryLabel = categoryLabels[certificate.category]?.[locale as "en" | "ar"] || certificate.category;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className={categoryColors[certificate.category]}>
            {categoryLabel}
          </Badge>
          {certificate.numberOfExams > 1 && (
            <Badge variant="outline" className="text-xs">
              {certificate.numberOfExams} {t("exams")}
            </Badge>
          )}
        </div>
        <h3 className="text-xl font-bold mt-2">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {t("examCode")}: {certificate.examCode}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{t("startingFrom")}</span>
          <span className="text-lg font-bold text-primary">
            {certificate.retailPrice.toLocaleString()} {t("sar")}
          </span>
        </div>
        <Link href={`/certificates/${certificate.slug}`}>
          <Button variant="default" size="sm" className="gap-1">
            <BookOpen className="h-4 w-4" />
            {t("viewDetails")}
            <ArrowIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
