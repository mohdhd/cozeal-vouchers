import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order, Invoice } from "@/lib/models";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StudentRecipientsCard } from "@/components/admin/student-recipients-card";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Package,
  CreditCard,
  FileText,
  Download,
  Calendar,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const { id } = await params;

  await dbConnect();
  const order = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  const invoice = await Invoice.findOne({ orderId: order._id }).lean();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "REFUNDED":
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 gap-2">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Order {order.orderNumber}
              </h1>
              <p className="text-muted-foreground">
                Created on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(order.status)}
              {invoice && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={`/api/invoice/${order._id}/pdf`} target="_blank">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-semibold">{order.customerName}</p>
                  {order.customerVatNumber && (
                    <p className="text-sm text-muted-foreground mt-1">
                      VAT: <span className="font-mono">{order.customerVatNumber}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-semibold">{order.contactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{order.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-semibold">CompTIA Security+ Voucher</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-semibold">{order.quantity} vouchers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Price</span>
                <span className="font-semibold">{formatCurrency(order.unitPrice)} SAR</span>
              </div>
              {order.discountCodeUsed && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount Code</span>
                  <span className="font-mono font-semibold text-green-600">
                    {order.discountCodeUsed}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(order.status)}
              </div>
              {order.tapChargeId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tap Charge ID</span>
                  <span className="font-mono text-sm">{order.tapChargeId}</span>
                </div>
              )}
              {order.tapTransactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{order.tapTransactionId}</span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid At</span>
                  <span className="font-semibold">{formatDate(order.paidAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice & Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoice & Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal + order.discountAmount)} SAR</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)} SAR</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (15%)</span>
                <span>{formatCurrency(order.vatAmount)} SAR</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.totalAmount)} SAR</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-semibold">Order Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-semibold">Payment Received</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.paidAt)}
                    </p>
                  </div>
                </div>
              )}
              {order.status === "CANCELLED" && (
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="font-semibold">Order Cancelled</p>
                    <p className="text-sm text-muted-foreground">
                      Payment was declined or cancelled
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Recipients - For DIRECT_TO_STUDENTS orders */}
        <StudentRecipientsCard
          orderId={order._id.toString()}
          orderStatus={order.status}
          deliveryMethod={order.deliveryMethod}
          recipients={(order.studentRecipients || []).map((r) => ({
            name: r.name,
            email: r.email,
            studentId: r.studentId,
            voucherId: r.voucherId?.toString(),
            deliveryStatus: r.deliveryStatus,
            deliveredAt: r.deliveredAt?.toISOString(),
            deliveryError: r.deliveryError,
          }))}
        />
      </main>
    </div>
  );
}
