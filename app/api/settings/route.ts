import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Settings } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.find();
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, s.value])
    );

    return NextResponse.json({
      voucher_base_price: settingsMap.voucher_base_price || "1350",
      vat_percentage: settingsMap.vat_percentage || "15",
      company_name_en: settingsMap.company_name_en || "Cozeal",
      company_name_ar: settingsMap.company_name_ar || "كوزيل",
      company_vat_number: settingsMap.company_vat_number || "",
      company_cr_number: settingsMap.company_cr_number || "",
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const allowedKeys = [
      "voucher_base_price",
      "vat_percentage",
      "company_name_en",
      "company_name_ar",
      "company_vat_number",
      "company_cr_number",
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        await Settings.updateOne(
          { key },
          { key, value: String(body[key]) },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
