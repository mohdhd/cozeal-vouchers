"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ShoppingCart,
  Award,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import { calculatePricingClient, type DiscountInfo } from "@/lib/pricing-client";
import { ExcelUpload, type StudentData } from "@/components/checkout/excel-upload";

type DeliveryMethod = "BULK_TO_CONTACT" | "DIRECT_TO_STUDENTS";

interface Certificate {
  _id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  retailPrice: number;
  institutionBasePrice: number;
}

interface InstitutionDiscount {
  institutionId: string;
  institutionName: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerVatNumber: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(9, "Please enter a valid phone number"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  basePrice: number;
  vatPercent: number;
  preselectedCertificate?: string;
}

export function CheckoutForm({ basePrice, vatPercent, preselectedCertificate }: CheckoutFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const isRTL = locale === "ar";

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutionDiscount, setInstitutionDiscount] = useState<InstitutionDiscount | null>(null);

  // Institution delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("BULK_TO_CONTACT");
  const [studentRecipients, setStudentRecipients] = useState<StudentData[]>([]);

  // Check if user is institution contact
  const isInstitutionUser = session?.user?.role === "INSTITUTION_CONTACT" && session?.user?.institutionId;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: session?.user?.name || "",
      customerVatNumber: "",
      contactName: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
    },
  });

  // Update form when session loads
  useEffect(() => {
    if (session?.user) {
      form.setValue("customerName", session.user.name || "");
      form.setValue("contactName", session.user.name || "");
      form.setValue("email", session.user.email || "");
      if (session.user.phone) {
        form.setValue("phone", session.user.phone);
      }
    }
  }, [session, form]);

  // Fetch institution discount if user is institution contact
  useEffect(() => {
    const fetchInstitutionDiscount = async () => {
      if (!isInstitutionUser || !session?.user?.institutionId) return;

      try {
        const res = await fetch(`/api/institutions/${session.user.institutionId}`);
        const data = await res.json();
        if (data.success && data.institution) {
          const inst = data.institution;
          if (inst.discountType && inst.discountValue) {
            setInstitutionDiscount({
              institutionId: inst._id,
              institutionName: locale === "ar" ? inst.nameAr : inst.nameEn,
              discountType: inst.discountType,
              discountValue: inst.discountValue,
            });
            // Pre-fill institution name
            form.setValue("customerName", locale === "ar" ? inst.nameAr : inst.nameEn);
          }
        }
      } catch (error) {
        console.error("Failed to fetch institution:", error);
      }
    };

    fetchInstitutionDiscount();
  }, [isInstitutionUser, session?.user?.institutionId, locale, form]);

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/certificates");
        const data = await res.json();
        if (data.success) {
          setCertificates(data.certificates);
          // Preselect certificate if provided
          if (preselectedCertificate) {
            const cert = data.certificates.find(
              (c: Certificate) => c.slug === preselectedCertificate || c._id === preselectedCertificate
            );
            if (cert) setSelectedCertificate(cert);
          } else if (data.certificates.length === 1) {
            setSelectedCertificate(data.certificates[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoadingCertificates(false);
      }
    };
    fetchCertificates();
  }, [preselectedCertificate]);

  // Calculate current price - use institution price if applicable
  const getBasePrice = () => {
    if (!selectedCertificate) return basePrice;
    // Use institution base price for institution users, retail price for others
    return isInstitutionUser ? selectedCertificate.institutionBasePrice : selectedCertificate.retailPrice;
  };

  // Calculate institution discount if applicable
  const getInstitutionDiscountInfo = (): DiscountInfo | null => {
    if (!isInstitutionUser || !institutionDiscount) return null;
    return {
      code: `INST-${institutionDiscount.institutionId}`,
      type: institutionDiscount.discountType,
      value: institutionDiscount.discountValue,
      descriptionEn: `${institutionDiscount.institutionName} Discount`,
      descriptionAr: `خصم ${institutionDiscount.institutionName}`,
    };
  };

  const currentPrice = getBasePrice();
  // Apply institution discount OR manual discount code (institution discount takes precedence)
  const effectiveDiscount = isInstitutionUser && institutionDiscount ? getInstitutionDiscountInfo() : appliedDiscount;
  const pricing = calculatePricingClient(quantity, currentPrice, vatPercent, effectiveDiscount);

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
          universityName: form.getValues("customerName"),
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedDiscount(result.discount);
        setDiscountError(null);
        toast.success(isRTL ? "تم تطبيق كود الخصم بنجاح" : "Discount code applied successfully");
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
    if (!selectedCertificate) {
      toast.error(isRTL ? "يرجى اختيار شهادة" : "Please select a certificate");
      return;
    }

    // Validate student list for DIRECT_TO_STUDENTS delivery
    if (isInstitutionUser && deliveryMethod === "DIRECT_TO_STUDENTS" && studentRecipients.length === 0) {
      toast.error(isRTL ? "يرجى تحميل ملف Excel بمعلومات الطلاب" : "Please upload an Excel file with student information");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payment/create-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.customerName,
          customerVatNumber: data.customerVatNumber,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          quantity,
          certificateId: selectedCertificate._id,
          discountCode: appliedDiscount?.code || null,
          locale,
          // Institution-specific fields
          ...(isInstitutionUser && {
            deliveryMethod,
            studentRecipients: deliveryMethod === "DIRECT_TO_STUDENTS" ? studentRecipients : [],
          }),
        }),
      });

      const result = await response.json();

      if (result.redirectUrl) {
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

      {/* Institution Pricing Banner */}
      {isInstitutionUser && institutionDiscount && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-primary">
                {isRTL ? "تسعير المؤسسات" : "Institution Pricing"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? `أنت تحصل على أسعار مخفضة خاصة بـ ${institutionDiscount.institutionName}`
                  : `You're getting special discounted pricing for ${institutionDiscount.institutionName}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form Section */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Certificate Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    {t("checkout.selectCertificate")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCertificates ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Select
                      value={selectedCertificate?._id || ""}
                      onValueChange={(value) => {
                        const cert = certificates.find((c) => c._id === value);
                        setSelectedCertificate(cert || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("checkout.selectCertificatePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {certificates.map((cert) => (
                          <SelectItem key={cert._id} value={cert._id}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{isRTL ? cert.nameAr : cert.nameEn}</span>
                              <span className="text-muted-foreground">
                                {formatCurrency(isInstitutionUser ? cert.institutionBasePrice : cert.retailPrice)} {t("common.sar")}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    {t("checkout.customerInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("checkout.customerName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("checkout.customerNamePlaceholder")}
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
                    <ShoppingCart className="h-5 w-5 text-primary" />
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

                  {/* Discount Code / Institution Discount */}
                  <div>
                    <Label className="mb-3 block">{t("checkout.discountCode")}</Label>
                    {/* Institution Discount - Auto-applied */}
                    {isInstitutionUser && institutionDiscount ? (
                      <div className="flex items-center justify-between rounded-lg border border-primary/50 bg-primary/10 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold text-primary">
                              {isRTL ? "خصم المؤسسة" : "Institution Discount"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {institutionDiscount.discountType === "PERCENTAGE"
                                ? `${institutionDiscount.discountValue}% ${isRTL ? "خصم" : "off"}`
                                : `${formatCurrency(institutionDiscount.discountValue)} ${t("common.sar")} ${isRTL ? "خصم" : "off"}`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isRTL ? "يُطبق تلقائياً" : "Auto-applied"}
                        </span>
                      </div>
                    ) : appliedDiscount ? (
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
                          <p className="text-sm text-destructive">{discountError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Voucher Delivery Method - Only for Institution Users */}
              {isInstitutionUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      {isRTL ? "طريقة توزيع القسائم" : "Voucher Distribution Method"}
                    </CardTitle>
                    <CardDescription>
                      {isRTL
                        ? "اختر كيف تريد أن يتم توزيع القسائم"
                        : "Choose how you want the vouchers to be distributed"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Option 1: Bulk to Contact */}
                    <div
                      onClick={() => {
                        setDeliveryMethod("BULK_TO_CONTACT");
                        setStudentRecipients([]);
                      }}
                      className={`
                        cursor-pointer rounded-lg border-2 p-4 transition-all
                        ${deliveryMethod === "BULK_TO_CONTACT"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center
                          ${deliveryMethod === "BULK_TO_CONTACT"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"}
                        `}>
                          {deliveryMethod === "BULK_TO_CONTACT" && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <p className="font-medium">
                              {isRTL ? "إرسال جميع القسائم إلى بريدي" : "Send all vouchers to my email"}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {isRTL
                              ? "سنرسل جميع القسائم إلى بريدك الإلكتروني وستقوم أنت بتوزيعها على الطلاب"
                              : "We'll send all vouchers to your email and you'll distribute them to students yourself"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Direct to Students */}
                    <div
                      onClick={() => setDeliveryMethod("DIRECT_TO_STUDENTS")}
                      className={`
                        cursor-pointer rounded-lg border-2 p-4 transition-all
                        ${deliveryMethod === "DIRECT_TO_STUDENTS"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center
                          ${deliveryMethod === "DIRECT_TO_STUDENTS"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"}
                        `}>
                          {deliveryMethod === "DIRECT_TO_STUDENTS" && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                            <p className="font-medium">
                              {isRTL ? "إرسال القسائم مباشرة للطلاب" : "Send vouchers directly to students"}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {isRTL
                              ? "قم بتحميل ملف Excel بمعلومات الطلاب وسنرسل لكل طالب قسيمته"
                              : "Upload an Excel file with student info and we'll send each student their voucher"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Excel Upload - Only shown when DIRECT_TO_STUDENTS is selected */}
                    {deliveryMethod === "DIRECT_TO_STUDENTS" && (
                      <div className="pt-2">
                        <ExcelUpload
                          students={studentRecipients}
                          onStudentsChange={(students) => {
                            setStudentRecipients(students);
                            // Update quantity to match student count
                            if (students.length > 0) {
                              setQuantity(students.length);
                            }
                          }}
                          disabled={isSubmitting}
                        />

                        {studentRecipients.length > 0 && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {isRTL
                              ? `سيتم إرسال ${studentRecipients.length} قسيمة مباشرة للطلاب`
                              : `${studentRecipients.length} vouchers will be sent directly to students`}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting || !selectedCertificate}
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
                {/* Selected Certificate */}
                {selectedCertificate && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="font-medium">
                      {isRTL ? selectedCertificate.nameAr : selectedCertificate.nameEn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCertificate.code}
                    </p>
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {selectedCertificate
                        ? `${isRTL ? selectedCertificate.nameAr : selectedCertificate.nameEn} × ${quantity}`
                        : `${t("checkout.vouchers")} × ${quantity}`}
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
                    {t("checkout.savings")} {formatCurrency(pricing.discountAmount)} {t("common.sar")}!
                  </p>
                )}

                {/* Submit Button (Desktop) */}
                <div className="hidden lg:block">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting || !selectedCertificate}
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
