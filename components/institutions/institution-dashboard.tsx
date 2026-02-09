"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Building2,
  BadgePercent,
  TrendingUp,
  Clock,
  CheckCircle,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";

interface Institution {
  _id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  discountType?: string;
  discountValue?: number;
}

interface Certificate {
  _id: string;
  slug: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category: string;
  retailPrice: number;
  institutionBasePrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  fulfillmentStatus: string;
  totalAmount: number;
  quantity: number;
  createdAt: string;
}

interface InstitutionDashboardProps {
  institution: Institution;
  certificates: Certificate[];
  orders: Order[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export function InstitutionDashboard({
  institution,
  certificates,
  orders,
  user,
}: InstitutionDashboardProps) {
  const locale = useLocale();
  const t = useTranslations("institutions.dashboard");
  const isRTL = locale === "ar";

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === "ar" ? "ar-SA" : "en-US") + " " + t("sar");
  };

  const calculateDiscountedPrice = (basePrice: number) => {
    if (!institution.discountType || !institution.discountValue) {
      return basePrice;
    }
    if (institution.discountType === "PERCENTAGE") {
      return basePrice * (1 - institution.discountValue / 100);
    }
    return Math.max(0, basePrice - institution.discountValue);
  };

  // Stats
  const totalOrders = orders.length;
  const totalSpent = orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.totalAmount, 0);
  const totalVouchers = orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalOrders")}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalVouchers")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVouchers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalSpent")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("yourDiscount")}</CardTitle>
            <BadgePercent className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {institution.discountType === "PERCENTAGE"
                ? `${institution.discountValue}%`
                : institution.discountValue
                ? `${institution.discountValue} ${t("sar")}`
                : t("noDiscount")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t("orderVouchers")}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            {t("orderHistory")}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {t("settings")}
          </TabsTrigger>
        </TabsList>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>{t("availableCertificates")}</CardTitle>
              <CardDescription>{t("certificatesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => {
                  const discountedPrice = calculateDiscountedPrice(cert.institutionBasePrice);
                  const hasDiscount = discountedPrice < cert.institutionBasePrice;

                  return (
                    <Card key={cert._id} className="relative">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {isRTL ? cert.nameAr : cert.nameEn}
                        </CardTitle>
                        <CardDescription>{cert.code}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {hasDiscount && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatCurrency(cert.institutionBasePrice)}
                            </p>
                          )}
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(discountedPrice)}
                          </p>
                          <Link href={`/checkout?certificate=${cert.slug}`}>
                            <Button className="w-full mt-2" size="sm">
                              {t("orderNow")}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                      {hasDiscount && (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          {institution.discountType === "PERCENTAGE"
                            ? `-${institution.discountValue}%`
                            : `-${institution.discountValue} ${t("sar")}`}
                        </Badge>
                      )}
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t("orderHistory")}</CardTitle>
              <CardDescription>{t("orderHistoryDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">{t("noOrders")}</h3>
                  <p className="text-muted-foreground">{t("noOrdersDescription")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("orderNumber")}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("quantity")}</TableHead>
                      <TableHead>{t("total")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status] || ""}>
                            {t(`orderStatus.${order.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/institutions/orders/${order._id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountSettings")}</CardTitle>
              <CardDescription>{t("settingsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">{t("institutionInfo")}</h4>
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">{t("name")}: </span>
                    {isRTL ? institution.nameAr : institution.nameEn}
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t("type")}: </span>
                    {t(`institutionType.${institution.type}`)}
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t("contactPerson")}</h4>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">{t("contactName")}: </span>
                    {user.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t("contactEmail")}: </span>
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                <div>
                  <h4 className="font-medium text-red-700">{t("signOut")}</h4>
                  <p className="text-sm text-red-600">{t("signOutDescription")}</p>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("signOut")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
