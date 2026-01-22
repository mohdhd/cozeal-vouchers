import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order, Invoice } from "@/lib/models";
import { incrementDiscountUsage } from "@/lib/discount";
import { isPaymentSuccessful } from "@/lib/tap";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    console.log("Tap webhook received:", JSON.stringify(body, null, 2));

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ tapChargeId: id });

    if (!order) {
      console.error("Order not found for charge:", id);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({ message: "Already processed" });
    }

    if (isPaymentSuccessful(status)) {
      await Order.updateOne(
        { _id: order._id },
        {
          status: "PAID",
          paidAt: new Date(),
          tapTransactionId: body.reference?.transaction || null,
          paymentMethod: body.source?.payment_method || null,
        }
      );

      if (order.discountCodeUsed) {
        await incrementDiscountUsage(order.discountCodeUsed);
      }

      const invoiceNumber = `INV-${order.orderNumber.replace("ORD-", "")}`;
      await Invoice.create({
        invoiceNumber,
        orderId: order._id,
      });

      console.log("Order paid successfully:", order.orderNumber);
    } else if (status === "DECLINED" || status === "CANCELLED" || status === "FAILED") {
      await Order.updateOne(
        { _id: order._id },
        { status: "CANCELLED" }
      );

      console.log("Order cancelled:", order.orderNumber, "Status:", status);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
