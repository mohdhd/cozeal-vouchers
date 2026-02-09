"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Building2, User, Mail, CheckCircle } from "lucide-react";

const institutionTypes = [
  { value: "UNIVERSITY", labelEn: "University", labelAr: "جامعة" },
  { value: "TRAINING_CENTER", labelEn: "Training Center", labelAr: "مركز تدريب" },
  { value: "COMPANY", labelEn: "Company", labelAr: "شركة" },
  { value: "GOVERNMENT", labelEn: "Government Entity", labelAr: "جهة حكومية" },
  { value: "OTHER", labelEn: "Other", labelAr: "أخرى" },
];

export default function InstitutionRegisterPage() {
  const locale = useLocale();
  const t = useTranslations("institutions.register");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Institution info
    institutionNameEn: "",
    institutionNameAr: "",
    institutionType: "",
    vatNumber: "",
    crNumber: "",
    institutionEmail: "",
    institutionPhone: "",
    address: "",
    city: "",
    // Contact person info
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register-institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("registrationError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>{t("success.title")}</CardTitle>
              <CardDescription>{t("success.description")}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{t("success.nextSteps")}</h4>
                <ol className="text-sm text-muted-foreground text-start list-decimal list-inside space-y-2">
                  <li>{t("success.step1")}</li>
                  <li>{t("success.step2")}</li>
                  <li>{t("success.step3")}</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/login">
                <Button>{t("backToLogin")}</Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground mt-2">{t("description")}</p>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t("institutionInfo")}</CardTitle>
                  </div>
                  <CardDescription>{t("institutionInfoDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="institutionNameEn">{t("institutionNameEn")}</Label>
                      <Input
                        id="institutionNameEn"
                        name="institutionNameEn"
                        placeholder={t("institutionNameEnPlaceholder")}
                        value={formData.institutionNameEn}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institutionNameAr">{t("institutionNameAr")}</Label>
                      <Input
                        id="institutionNameAr"
                        name="institutionNameAr"
                        placeholder={t("institutionNameArPlaceholder")}
                        value={formData.institutionNameAr}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institutionType">{t("institutionType")}</Label>
                    <Select
                      value={formData.institutionType}
                      onValueChange={(value) => handleSelectChange("institutionType", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {institutionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {locale === "ar" ? type.labelAr : type.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="crNumber">{t("crNumber")}</Label>
                      <Input
                        id="crNumber"
                        name="crNumber"
                        placeholder={t("crNumberPlaceholder")}
                        value={formData.crNumber}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatNumber">{t("vatNumber")}</Label>
                      <Input
                        id="vatNumber"
                        name="vatNumber"
                        placeholder={t("vatNumberPlaceholder")}
                        value={formData.vatNumber}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="institutionEmail">{t("institutionEmail")}</Label>
                      <Input
                        id="institutionEmail"
                        name="institutionEmail"
                        type="email"
                        placeholder={t("institutionEmailPlaceholder")}
                        value={formData.institutionEmail}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institutionPhone">{t("institutionPhone")}</Label>
                      <Input
                        id="institutionPhone"
                        name="institutionPhone"
                        type="tel"
                        placeholder={t("institutionPhonePlaceholder")}
                        value={formData.institutionPhone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("city")}</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder={t("cityPlaceholder")}
                        value={formData.city}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t("address")}</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder={t("addressPlaceholder")}
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>

                <Separator className="my-4" />

                <CardHeader className="pt-0">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t("contactInfo")}</CardTitle>
                  </div>
                  <CardDescription>{t("contactInfoDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contactName")}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("contactNamePlaceholder")}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contactEmail")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("contactEmailPlaceholder")}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("contactPhone")}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t("contactPhonePlaceholder")}
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("password")}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("passwordPlaceholder")}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("passwordRequirements")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={t("confirmPasswordPlaceholder")}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("submit")}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    {t("alreadyRegistered")}{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      {t("signIn")}
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
