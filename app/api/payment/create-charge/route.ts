import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order, Certificate, Institution } from "@/lib/models";
import { validateDiscountCode } from "@/lib/discount";
import { calculatePricing, type DiscountInfo } from "@/lib/pricing";
import { createTapCharge } from "@/lib/tap";
import { auth } from "@/lib/auth";

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

    // Get session to check if user is institution contact
    const session = await auth();
    const isInstitutionUser = session?.user?.role === "INSTITUTION_CONTACT" && session?.user?.institutionId;

    const body = await req.json();
    const {
      // Support both old and new field names for backward compatibility
      universityName,
      customerName: customerNameInput,
      customerVatNumber,
      contactName,
      email,
      phone,
      quantity,
      certificateId,
      discountCode,
      locale,
      // Institution delivery fields
      deliveryMethod,
      studentRecipients,
    } = body;

    // Use customerName if provided, fall back to universityName
    let customerName = customerNameInput || universityName;

    if (!customerName || !contactName || !email || !phone || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get certificate info if provided
    let certificate = null;
    let certificatePrice = null;
    if (certificateId) {
      certificate = await Certificate.findById(certificateId);
      if (certificate) {
        // Use institution base price for institution users, retail price for others
        certificatePrice = isInstitutionUser ? certificate.institutionBasePrice : certificate.retailPrice;
      }
    }

    // Fetch institution discount if user is institution contact
    let institutionDiscount: DiscountInfo | null = null;
    let institutionId = null;
    if (isInstitutionUser && session?.user?.institutionId) {
      const institution = await Institution.findById(session.user.institutionId);
      if (institution && institution.status === "APPROVED" && institution.discountType && institution.discountValue) {
        institutionId = institution._id;
        customerName = institution.nameEn; // Use institution name
        institutionDiscount = {
          code: `INST-${institution._id}`,
          type: institution.discountType,
          value: institution.discountValue,
          descriptionEn: `${institution.nameEn} Discount`,
          descriptionAr: `خصم ${institution.nameAr}`,
        };
      }
    }

    // Validate discount code if provided (only for non-institution users)
    let validatedDiscount: DiscountInfo | null = null;
    if (discountCode && !institutionDiscount) {
      const discountResult = await validateDiscountCode(
        discountCode,
        quantity,
        customerName
      );
      if (discountResult.valid && discountResult.discount) {
        validatedDiscount = discountResult.discount;
      }
    }

    // Use institution discount OR manual discount code (institution discount takes precedence)
    const effectiveDiscount = institutionDiscount || validatedDiscount;

    // Calculate pricing (use certificate price if available)
    const pricing = await calculatePricing(quantity, effectiveDiscount, certificatePrice);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Build order items array if certificate is selected
    const items = certificate ? [{
      certificateId: certificate._id,
      certificateCode: certificate.code,
      certificateName: certificate.nameEn,
      quantity,
      unitPrice: pricing.basePrice,
      subtotal: pricing.subtotal,
    }] : [];

    // Create order in database
    const order = await Order.create({
      orderNumber,
      status: "PENDING",
      fulfillmentStatus: "PENDING_PAYMENT",
      customerType: isInstitutionUser ? "INSTITUTION" : "INDIVIDUAL",
      userId: session?.user?.id || undefined,
      institutionId: institutionId || undefined,
      customerName,
      customerVatNumber: customerVatNumber || undefined,
      contactName,
      email,
      phone,
      items,
      quantity,
      unitPrice: pricing.basePrice,
      subtotal: pricing.subtotal,
      discountCodeUsed: effectiveDiscount?.code,
      discountAmount: pricing.discountAmount,
      vatAmount: pricing.vatAmount,
      totalAmount: pricing.total,
      // Institution delivery settings
      deliveryMethod: isInstitutionUser ? (deliveryMethod || "BULK_TO_CONTACT") : undefined,
      studentRecipients: isInstitutionUser && deliveryMethod === "DIRECT_TO_STUDENTS" && studentRecipients
        ? studentRecipients.map((s: { name: string; email: string; studentId?: string; department?: string }) => ({
          name: s.name,
          email: s.email,
          studentId: s.studentId || undefined,
          deliveryStatus: "PENDING",
        }))
        : [],
    });

    // Create Tap charge
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${appUrl}/${locale}/success/${order._id}`;

    const certificateName = certificate?.nameEn || "CompTIA Voucher";
    const charge = await createTapCharge({
      amount: Math.round(pricing.total * 100) / 100,
      currency: "SAR",
      customerName: contactName,
      customerEmail: email,
      customerPhone: phone,
      description: `${certificateName} x${quantity} - ${customerName}`,
      orderId: order._id.toString(),
      metadata: {
        order_number: orderNumber,
        customer: customerName,
        certificate: certificate?.code || "GENERAL",
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
