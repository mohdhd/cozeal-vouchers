import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order, Invoice } from "@/lib/models";
import { getSettings } from "@/lib/pricing";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoice/invoice-pdf";
import { generateZATCAQRData } from "@/lib/zatca-qr";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await dbConnect();
    const { orderId } = await params;

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Debug: log customer VAT number
    console.log("Order customerVatNumber:", order.customerVatNumber);

    const invoice = await Invoice.findOne({ orderId: order._id });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const settings = await getSettings();

    // Generate ZATCA-compliant QR code
    const zatcaQRData = generateZATCAQRData({
      sellerName: settings.companyNameEn || "Cozeal Vouchers",
      vatNumber: settings.companyVatNumber || "",
      timestamp: order.paidAt || order.createdAt,
      totalAmount: order.totalAmount,
      vatAmount: order.vatAmount,
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(zatcaQRData, {
      errorCorrectionLevel: "M", // ZATCA requires level M (15%)
      width: 150,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const pdfBuffer = await renderToBuffer(
      InvoicePDF({
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          date: order.paidAt || order.createdAt,
        },
        order: {
          orderNumber: order.orderNumber,
          universityName: order.customerName,
          customerVatNumber: order.customerVatNumber,
          contactName: order.contactName,
          email: order.email,
          phone: order.phone,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          vatAmount: order.vatAmount,
          totalAmount: order.totalAmount,
          status: order.status,
        },
        company: {
          nameEn: settings.companyNameEn,
          nameAr: settings.companyNameAr,
          vatNumber: settings.companyVatNumber,
          crNumber: settings.companyCrNumber,
        },
        qrCode: qrCodeDataUrl,
      })
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
