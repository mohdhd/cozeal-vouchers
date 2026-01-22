"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Download,
  Home,
  Clock,
  AlertCircle,
} from "lucide-react";

interface SuccessContentProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    universityName: string;
    contactName: string;
    email: string;
    quantity: number;
    totalAmount: number;
    paidAt: string | null;
  };
  invoiceNumber: string | null;
}

export function SuccessContent({ order, invoiceNumber }: SuccessContentProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";

  const isPaid = order.status === "PAID";
  const isPending = order.status === "PENDING";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-SA", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-SA", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Status Icon */}
      <div className="mb-8 text-center">
        {isPaid ? (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
            <CheckCircle2 className="h-10 w-10 text-secondary" />
          </div>
        ) : isPending ? (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
        ) : (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        )}

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {isPaid
            ? t("success.title")
            : isPending
            ? isRTL
              ? "جاري معالجة الدفع..."
              : "Processing Payment..."
            : isRTL
            ? "فشل الدفع"
            : "Payment Failed"}
        </h1>

        {isPaid && (
          <p className="text-muted-foreground">{t("success.message")}</p>
        )}
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("success.orderDetails")}</CardTitle>
            <Badge
              variant={
                isPaid ? "default" : isPending ? "secondary" : "destructive"
              }
              className={isPaid ? "bg-secondary" : ""}
            >
              {isPaid
                ? t("admin.orderStatus.paid")
                : isPending
                ? t("admin.orderStatus.pending")
                : t("admin.orderStatus.cancelled")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("success.orderNumber")}
              </p>
              <p className="font-mono font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "التاريخ" : "Date"}
              </p>
              <p className="font-semibold">{formatDate(order.paidAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("checkout.universityName")}
              </p>
              <p className="font-semibold">{order.universityName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("checkout.quantity")}
              </p>
              <p className="font-semibold">
                {order.quantity} {t("common.vouchers")}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{t("checkout.total")}</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(order.totalAmount)} {t("common.sar")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next Card */}
      {isPaid && (
        <Card className="mb-6 border-secondary/50 bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-secondary">
              {t("success.whatNext")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("success.nextSteps")}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        {isPaid && invoiceNumber && (
          <Button asChild variant="outline" className="gap-2">
            <a href={`/api/invoice/${order.id}/pdf`} target="_blank">
              <Download className="h-4 w-4" />
              {t("success.downloadInvoice")}
            </a>
          </Button>
        )}
        <Button asChild className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            {t("success.backToHome")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
