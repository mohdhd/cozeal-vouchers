"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BadgePercent, Headphones, Zap } from "lucide-react";

export function FeaturesSection() {
  const t = useTranslations("features");

  const features = [
    {
      icon: Award,
      title: t("official.title"),
      description: t("official.description"),
    },
    {
      icon: BadgePercent,
      title: t("pricing.title"),
      description: t("pricing.description"),
    },
    {
      icon: Headphones,
      title: t("support.title"),
      description: t("support.description"),
    },
    {
      icon: Zap,
      title: t("delivery.title"),
      description: t("delivery.description"),
    },
  ];

  return (
    <section id="features" className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("title")}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
