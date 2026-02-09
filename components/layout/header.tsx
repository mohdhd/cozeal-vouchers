"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { Shield, Menu, X, User, Building2, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Cozeal Vouchers</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/certificates"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("certificates")}
          </Link>
          <Link
            href="/institutions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("forInstitutions")}
          </Link>
          
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {session.user.name?.split(" ")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={session.user.role === "INSTITUTION_CONTACT" ? "/institutions/dashboard" : "/account"}>
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                {t("signIn")}
              </Button>
            </Link>
          )}
          
          <LanguageSwitcher />
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 z-40 bg-black/50 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-16 z-50 h-[calc(100vh-4rem)] w-72 transform bg-background shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isRTL ? "left-0" : "right-0"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : isRTL
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col p-6">
          <Link
            href="/"
            className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t("home")}
          </Link>
          <Link
            href="/certificates"
            className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t("certificates")}
          </Link>
          <Link
            href="/institutions"
            className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t("forInstitutions")}
          </Link>
          {session?.user ? (
            <>
              <Link
                href={session.user.role === "INSTITUTION_CONTACT" ? "/institutions/dashboard" : "/account"}
                className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors hover:text-primary"
                onClick={closeMenu}
              >
                {t("dashboard")}
              </Link>
              <button
                onClick={() => {
                  closeMenu();
                  signOut({ callbackUrl: "/" });
                }}
                className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors hover:text-primary text-left flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                {t("signOut")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors hover:text-primary"
              onClick={closeMenu}
            >
              {t("signIn")}
            </Link>
          )}
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
