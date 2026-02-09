import { redirect, notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { connectDB } from "@/lib/db";
import { Order, Institution } from "@/lib/models";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  CreditCard,
  Mail,
  Phone,
  User,
  Building2,
  FileText,
  Download,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

async function getOrder(orderId: string, institutionId: string) {
  await connectDB();
  const order = await Order.findOne({ _id: orderId, institutionId }).lean();
  return order ? JSON.parse(JSON.stringify(order)) : null;
}

async function getInstitution(institutionId: string) {
  await connectDB();
  const institution = await Institution.findById(institutionId).lean();
  return institution ? JSON.parse(JSON.stringify(institution)) : null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const fulfillmentColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PENDING_REVIEW: "bg-orange-100 text-orange-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  VOUCHERS_ASSIGNED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
};

export default async function InstitutionOrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Ensure user is an institution contact
  if (session.user.role !== "INSTITUTION_CONTACT" || !session.user.institutionId) {
    redirect(`/${locale}/account`);
  }

  const [order, institution] = await Promise.all([
    getOrder(id, session.user.institutionId),
    getInstitution(session.user.institutionId),
  ]);

  if (!order || !institution) {
    notFound();
  }

  const t = await getTranslations();
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            href="/institutions/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowIcon className="h-4 w-4" />
            {t("institutions.dashboard.backToDashboard")}
          </Link>

          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">
                {t("account.order")} #{order.orderNumber}
              </h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[order.status] || "bg-gray-100"}>
                {t(`account.orderStatus.${order.status.toLowerCase()}`)}
              </Badge>
              {order.fulfillmentStatus && (
                <Badge className={fulfillmentColors[order.fulfillmentStatus] || "bg-gray-100"}>
                  {t(`account.fulfillmentStatus.${order.fulfillmentStatus.toLowerCase()}`)}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t("account.orderItems")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-4">
                      {order.items.map((item: { certificateId: string; certificateName: string; certificateCode: string; quantity: number; unitPrice: number; subtotal: number }, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium">{item.certificateName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.certificateCode} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatCurrency(item.subtotal)} {t("common.sar")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{t("account.voucherPurchase")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("account.quantity")}: {order.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(order.subtotal)} {t("common.sar")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Institution Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t("institutions.dashboard.institutionInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("institutions.dashboard.name")}</p>
                        <p className="font-medium">{isRTL ? institution.nameAr : institution.nameEn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("account.contactName")}</p>
                        <p className="font-medium">{order.contactName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("account.email")}</p>
                        <p className="font-medium">{order.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("account.phone")}</p>
                        <p className="font-medium" dir="ltr">{order.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.paidAt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {t("account.paymentInfo")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("account.paymentDate")}</span>
                      <span>{formatDate(order.paidAt)}</span>
                    </div>
                    {order.paymentMethod && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("account.paymentMethod")}</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                    )}
                    {order.tapTransactionId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("account.transactionId")}</span>
                        <span className="font-mono text-sm">{order.tapTransactionId}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("account.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                      <span>{formatCurrency(order.subtotal)} {t("common.sar")}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-sm text-green-600">
                        <span>{t("checkout.discount")}</span>
                        <span>-{formatCurrency(order.discountAmount)} {t("common.sar")}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("checkout.vat")}</span>
                      <span>{formatCurrency(order.vatAmount)} {t("common.sar")}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span>{t("checkout.total")}</span>
                    <span className="text-primary">
                      {formatCurrency(order.totalAmount)} {t("common.sar")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {order.status === "PAID" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t("account.documents")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a href={`/api/invoice/${order._id}/pdf`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        <Download className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("account.downloadInvoice")}
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Need Help */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    {t("account.needHelp")}
                  </p>
                  <p className="text-sm text-center mt-2">
                    <a href="mailto:support@cozeal.sa" className="text-primary hover:underline">
                      support@cozeal.sa
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
