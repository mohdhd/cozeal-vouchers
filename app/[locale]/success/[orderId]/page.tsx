import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import { Order, Invoice } from "@/lib/models";
import { Header, Footer } from "@/components/layout";
import { SuccessContent } from "@/components/success/success-content";
import { getTapCharge, isPaymentSuccessful } from "@/lib/tap";
import { incrementDiscountUsage } from "@/lib/discount";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

export default async function SuccessPage({ params }: Props) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);

  await dbConnect();
  let order = await Order.findById(orderId);

  if (!order) {
    notFound();
  }

  // If order is still pending and has a Tap charge ID, check the actual status
  if (order.status === "PENDING" && order.tapChargeId) {
    try {
      const charge = await getTapCharge(order.tapChargeId);

      if (isPaymentSuccessful(charge.status)) {
        // Payment was successful - update order
        await Order.updateOne(
          { _id: order._id },
          {
            status: "PAID",
            paidAt: new Date(),
            tapTransactionId: (charge as any).reference?.transaction || null,
            paymentMethod: (charge as any).source?.payment_method || null,
          }
        );

        // Increment discount usage if applicable
        if (order.discountCodeUsed) {
          await incrementDiscountUsage(order.discountCodeUsed);
        }

        // Create invoice if not exists
        const existingInvoice = await Invoice.findOne({ orderId: order._id });
        if (!existingInvoice) {
          const invoiceNumber = `INV-${order.orderNumber.replace("ORD-", "")}`;
          await Invoice.create({
            invoiceNumber,
            orderId: order._id,
          });
        }

        // Refresh order data
        order = await Order.findById(orderId);
      } else if (charge.status === "DECLINED" || charge.status === "CANCELLED" || charge.status === "FAILED") {
        // Payment failed - update order
        await Order.updateOne(
          { _id: order._id },
          { status: "CANCELLED" }
        );

        // Refresh order data
        order = await Order.findById(orderId);
      }
    } catch (error) {
      console.error("Error checking Tap charge status:", error);
      // Continue with current order status if we can't check Tap
    }
  }

  if (!order) {
    notFound();
  }

  const invoice = await Invoice.findOne({ orderId: order._id }).lean();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <SuccessContent
            order={{
              id: order._id.toString(),
              orderNumber: order.orderNumber,
              status: order.status,
              universityName: order.customerName,
              contactName: order.contactName,
              email: order.email,
              quantity: order.quantity,
              totalAmount: order.totalAmount,
              paidAt: order.paidAt?.toISOString() || null,
            }}
            invoiceNumber={invoice?.invoiceNumber || null}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
