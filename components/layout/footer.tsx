"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Shield, Mail, MapPin, Building2 } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";

  const legalLinks = [
    { href: "/legal/terms-of-service", labelEn: "Terms of Service", labelAr: "الشروط والأحكام" },
    { href: "/legal/terms-of-sale", labelEn: "Terms of Sale", labelAr: "شروط البيع" },
    { href: "/legal/privacy-policy", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية" },
    { href: "/legal/refund-policy", labelEn: "Refund Policy", labelAr: "سياسة الاسترداد" },
  ];

  const quickLinks = [
    { href: "/certificates", labelEn: "Certificates", labelAr: "الشهادات" },
    { href: "/institutions", labelEn: "For Institutions", labelAr: "للمؤسسات" },
    { href: "/login", labelEn: "Sign In", labelAr: "تسجيل الدخول" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Company */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Cozeal Vouchers</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("hero.badge")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">
              {isRTL ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isRTL ? link.labelAr : link.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">
              {isRTL ? "القانونية" : "Legal"}
            </h4>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isRTL ? link.labelAr : link.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a 
                href="mailto:info@cozeal.ai" 
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@cozeal.ai
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span dir="ltr">
                  7290 Muhammad Nur Jakhdar, Alsafa<br />
                  Jeddah 23453 3592, Saudi Arabia
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>
                  {isRTL ? "سجل تجاري: " : "CR No: "}
                  <span dir="ltr">7051993926</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cozeal Vouchers. {isRTL ? "جميع الحقوق محفوظة" : "All rights reserved"}.
        </div>
      </div>
    </footer>
  );
}
