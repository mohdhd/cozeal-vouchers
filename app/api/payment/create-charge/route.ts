import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/lib/models";
import { validateDiscountCode } from "@/lib/discount";
import { calculatePricing } from "@/lib/pricing";
import { createTapCharge } from "@/lib/tap";

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}${month}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const {
      universityName,
      customerVatNumber,
      contactName,
      email,
      phone,
      quantity,
      discountCode,
      locale,
    } = body;

    // Debug: log customer VAT number received
    console.log("Received customerVatNumber:", customerVatNumber);

    if (!universityName || !contactName || !email || !phone || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate discount code if provided
    let validatedDiscount = null;
    if (discountCode) {
      const discountResult = await validateDiscountCode(
        discountCode,
        quantity,
        universityName
      );
      if (discountResult.valid && discountResult.discount) {
        validatedDiscount = discountResult.discount;
      }
    }

    // Calculate pricing
    const pricing = await calculatePricing(quantity, validatedDiscount);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const order = await Order.create({
      orderNumber,
      status: "PENDING",
      universityName,
      customerVatNumber: customerVatNumber || undefined,
      contactName,
      email,
      phone,
      quantity,
      unitPrice: pricing.basePrice,
      subtotal: pricing.subtotal,
      discountCodeUsed: validatedDiscount?.code,
      discountAmount: pricing.discountAmount,
      vatAmount: pricing.vatAmount,
      totalAmount: pricing.total,
    });

    // Create Tap charge
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${appUrl}/${locale}/success/${order._id}`;

    const charge = await createTapCharge({
      amount: Math.round(pricing.total * 100) / 100,
      currency: "SAR",
      customerName: contactName,
      customerEmail: email,
      customerPhone: phone,
      description: `CompTIA Security+ Voucher x${quantity} - ${universityName}`,
      orderId: order._id.toString(),
      metadata: {
        order_number: orderNumber,
        university: universityName,
        quantity: String(quantity),
      },
      redirectUrl,
    });

    // Update order with Tap charge ID
    await Order.updateOne(
      { _id: order._id },
      { tapChargeId: charge.id }
    );

    const paymentUrl = charge.transaction?.url || charge.redirect?.url;

    if (!paymentUrl) {
      throw new Error("No payment URL returned from Tap");
    }

    return NextResponse.json({
      success: true,
      orderId: order._id.toString(),
      orderNumber,
      redirectUrl: paymentUrl,
    });
  } catch (error) {
    console.error("Create charge error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
