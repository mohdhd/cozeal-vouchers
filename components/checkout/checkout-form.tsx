"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  Minus,
  Plus,
  Tag,
  CheckCircle2,
  X,
  Lock,
  Building2,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { calculatePricingClient, type DiscountInfo } from "@/lib/pricing-client";

const checkoutSchema = z.object({
  universityName: z.string().min(2, "University name is required"),
  customerVatNumber: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(9, "Please enter a valid phone number"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  basePrice: number;
  vatPercent: number;
}

export function CheckoutForm({ basePrice, vatPercent }: CheckoutFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [quantity, setQuantity] = useState(10);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(
    null
  );
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      universityName: "",
      customerVatNumber: "",
      contactName: "",
      email: "",
      phone: "",
    },
  });

  const pricing = calculatePricingClient(
    quantity,
    basePrice,
    vatPercent,
    appliedDiscount
  );

  // Format currency with Latin numerals always
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;

    setIsValidatingCode(true);
    setDiscountError(null);

    try {
      const response = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode,
          quantity,
          universityName: form.getValues("universityName"),
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedDiscount(result.discount);
        setDiscountError(null);
        toast.success(
          isRTL ? "تم تطبيق كود الخصم بنجاح" : "Discount code applied successfully"
        );
      } else {
        setDiscountError(isRTL ? result.error.ar : result.error.en);
        setAppliedDiscount(null);
      }
    } catch {
      setDiscountError(t("errors.serverError"));
    } finally {
      setIsValidatingCode(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError(null);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payment/create-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          quantity,
          discountCode: appliedDiscount?.code || null,
          locale,
        }),
      });

      const result = await response.json();

      if (result.redirectUrl) {
        // Redirect to Tap payment page
        window.location.href = result.redirectUrl;
      } else {
        toast.error(t("errors.paymentFailed"));
      }
    } catch {
      toast.error(t("errors.serverError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
        {t("checkout.title")}
      </h1>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form Section */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* University Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    {t("checkout.universityInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="universityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("checkout.universityName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("checkout.universityNamePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerVatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("checkout.vatNumber")}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({t("checkout.optional")})
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("checkout.vatNumberPlaceholder")}
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("checkout.contactName")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="ps-10"
                              placeholder={t("checkout.contactNamePlaceholder")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.email")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="email"
                                className="ps-10"
                                placeholder={t("checkout.emailPlaceholder")}
                                dir="ltr"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.phone")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="tel"
                                className="ps-10"
                                placeholder={t("checkout.phonePlaceholder")}
                                dir="ltr"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="h-5 w-5 text-primary" />
                    {t("checkout.orderDetails")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quantity */}
                  <div>
                    <Label className="mb-3 block">{t("checkout.quantity")}</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-24 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        min={1}
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {t("common.vouchers")}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Discount Code */}
                  <div>
                    <Label className="mb-3 block">{t("checkout.discountCode")}</Label>
                    {appliedDiscount ? (
                      <div className="flex items-center justify-between rounded-lg border border-secondary/50 bg-secondary/10 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-secondary" />
                          <div>
                            <p className="font-semibold text-secondary">
                              {appliedDiscount.code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isRTL
                                ? appliedDiscount.descriptionAr
                                : appliedDiscount.descriptionEn}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeDiscount}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2" dir="ltr">
                          <Input
                            value={discountCode}
                            onChange={(e) => {
                              setDiscountCode(e.target.value.toUpperCase());
                              setDiscountError(null);
                            }}
                            placeholder={t("checkout.discountCodePlaceholder")}
                            className={`text-start ${discountError ? "border-destructive" : ""}`}
                            dir="ltr"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={validateDiscountCode}
                            disabled={isValidatingCode || !discountCode.trim()}
                          >
                            {isValidatingCode ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("checkout.applyCode")
                            )}
                          </Button>
                        </div>
                        {discountError && (
                          <p className="text-sm text-destructive">
                            {discountError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {t("checkout.payNow")}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Line Items */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      CompTIA Security+ × {quantity}
                    </span>
                    <span dir="ltr">
                      {formatCurrency(pricing.subtotal)} {t("common.sar")}
                    </span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-secondary">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {t("checkout.discount")} ({pricing.discountPercent}%)
                      </span>
                      <span dir="ltr">
                        -{formatCurrency(pricing.discountAmount)} {t("common.sar")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("checkout.vat")}</span>
                    <span dir="ltr">
                      {formatCurrency(pricing.vatAmount)} {t("common.sar")}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("checkout.total")}</span>
                  <span className="text-primary" dir="ltr">
                    {formatCurrency(pricing.total)} {t("common.sar")}
                  </span>
                </div>

                {pricing.discountAmount > 0 && (
                  <p className="text-center text-sm text-secondary">
                    🎉 {t("checkout.savings")} {formatCurrency(pricing.discountAmount)}{" "}
                    {t("common.sar")}!
                  </p>
                )}

                {/* Submit Button (Desktop) */}
                <div className="hidden lg:block">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {t("checkout.payNow")}
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  <Lock className="me-1 inline h-3 w-3" />
                  {t("checkout.securePayment")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
