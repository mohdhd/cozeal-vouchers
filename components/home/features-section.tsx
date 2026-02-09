"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BadgePercent, Headphones, Zap, Shield, Globe } from "lucide-react";

export function FeaturesSection() {
  const t = useTranslations("features");

  const features = [
    {
      icon: Award,
      title: t("official.title"),
      description: t("official.description"),
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: BadgePercent,
      title: t("pricing.title"),
      description: t("pricing.description"),
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: Headphones,
      title: t("support.title"),
      description: t("support.description"),
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: Zap,
      title: t("delivery.title"),
      description: t("delivery.description"),
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-lg group"
            >
              <CardHeader>
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}>
                  <feature.icon className="h-7 w-7" />
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
