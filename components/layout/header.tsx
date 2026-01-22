"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { Shield } from "lucide-react";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Cozeal Vouchers</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/checkout"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("checkout")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
