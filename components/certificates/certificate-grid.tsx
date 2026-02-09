"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CertificateCard } from "./certificate-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Certificate {
  _id: string;
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
}

interface CertificateGridProps {
  certificates: Certificate[];
}

const categories = [
  { value: "ALL", labelEn: "All Certifications", labelAr: "جميع الشهادات" },
  { value: "CORE", labelEn: "Core", labelAr: "أساسي" },
  { value: "INFRASTRUCTURE", labelEn: "Infrastructure", labelAr: "البنية التحتية" },
  { value: "CYBERSECURITY", labelEn: "Cybersecurity", labelAr: "الأمن السيبراني" },
  { value: "DATA", labelEn: "Data", labelAr: "البيانات" },
  { value: "PROFESSIONAL", labelEn: "Professional", labelAr: "مهني" },
];

export function CertificateGrid({ certificates }: CertificateGridProps) {
  const locale = useLocale();
  const t = useTranslations("certificates");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCertificates = certificates.filter((cert) => {
    const matchesCategory = selectedCategory === "ALL" || cert.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      cert.nameEn.toLowerCase().includes(searchLower) ||
      cert.nameAr.includes(searchQuery) ||
      cert.code.toLowerCase().includes(searchLower) ||
      cert.examCode.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  // Group certificates by category for display
  const groupedCertificates = categories
    .filter((cat) => cat.value !== "ALL")
    .map((cat) => ({
      ...cat,
      certificates: filteredCertificates.filter((cert) => cert.category === cat.value),
    }))
    .filter((group) => group.certificates.length > 0);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {locale === "ar" ? cat.labelAr : cat.labelEn}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {t("showing")} {filteredCertificates.length} {t("certificationsFound")}
      </p>

      {/* Certificate Groups */}
      {selectedCategory === "ALL" ? (
        // Grouped view
        <div className="space-y-12">
          {groupedCertificates.map((group) => (
            <section key={group.value}>
              <h2 className="text-2xl font-bold mb-6">
                {locale === "ar" ? group.labelAr : group.labelEn}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.certificates.map((cert) => (
                  <CertificateCard key={cert._id} certificate={cert} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // Flat view for single category
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((cert) => (
            <CertificateCard key={cert._id} certificate={cert} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">{t("noResults")}</p>
          <Button
            variant="link"
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
          >
            {t("clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
