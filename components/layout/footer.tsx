"use client";

import { useTranslations, useLocale } from "next-intl";
import { Shield, Mail, MapPin, Building2 } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-3">
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
            </div>
          </div>

          {/* Company Registration */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">
              {isRTL ? "معلومات الشركة" : "Company Info"}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
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
