import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Voucher, Certificate, VoucherBatch } from "@/lib/models";

// Generate a unique batch ID
function generateBatchId(): string {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BATCH-${dateStr}-${random}`;
}

// POST - Bulk import vouchers
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { certificateId, codes, purchasePrice, expiresAt, compTiaOrderRef, notes } = body;

        // Validate required fields
        if (!certificateId) {
            return NextResponse.json(
                { error: "Certificate is required" },
                { status: 400 }
            );
        }

        if (!Array.isArray(codes) || codes.length === 0) {
            return NextResponse.json(
                { error: "At least one voucher code is required" },
                { status: 400 }
            );
        }

        if (!expiresAt) {
            return NextResponse.json(
                { error: "Expiration date is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Validate certificate exists
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return NextResponse.json(
                { error: "Certificate not found" },
                { status: 404 }
            );
        }

        // Check for existing voucher codes
        const existingVouchers = await Voucher.find({ code: { $in: codes } });
        const existingCodes = new Set(existingVouchers.map((v) => v.code));

        // Generate batch ID
        const batchId = generateBatchId();
        const expiresAtDate = new Date(expiresAt);
        const now = new Date();

        // Prepare vouchers for insertion
        const vouchersToInsert: Array<{
            code: string;
            certificateId: typeof certificate._id;
            status: string;
            batchId: string;
            importedAt: Date;
            importedBy: string | undefined;
            purchasedAt: Date;
            purchasePrice: number;
            expiresAt: Date;
            history: Array<{ action: string; timestamp: Date; performedBy: string | undefined; details: string }>;
        }> = [];
        const duplicates: string[] = [];
        const errors: string[] = [];

        for (const code of codes) {
            const trimmedCode = code.trim();

            if (!trimmedCode) {
                continue; // Skip empty codes
            }

            if (existingCodes.has(trimmedCode)) {
                duplicates.push(trimmedCode);
                continue;
            }

            // Check for duplicates within the same import
            if (vouchersToInsert.some(v => v.code === trimmedCode)) {
                duplicates.push(trimmedCode);
                continue;
            }

            vouchersToInsert.push({
                code: trimmedCode,
                certificateId: certificate._id,
                status: "AVAILABLE",
                batchId,
                importedAt: now,
                importedBy: session.user.id,
                purchasedAt: now,
                purchasePrice: purchasePrice || 0,
                expiresAt: expiresAtDate,
                history: [{
                    action: "IMPORTED",
                    timestamp: now,
                    performedBy: session.user.id,
                    details: `Imported in batch ${batchId}`,
                }],
            });
        }

        // Insert vouchers
        let imported = 0;
        if (vouchersToInsert.length > 0) {
            try {
                const result = await Voucher.insertMany(vouchersToInsert, { ordered: false });
                imported = result.length;

                // Create batch record
                await VoucherBatch.create({
                    batchId,
                    certificateId: certificate._id,
                    totalCount: imported,
                    availableCount: imported,
                    assignedCount: 0,
                    deliveredCount: 0,
                    usedCount: 0,
                    expiredCount: 0,
                    importedAt: now,
                    importedBy: session.user.id,
                    purchasePricePerUnit: purchasePrice || 0,
                    compTiaOrderRef: compTiaOrderRef || undefined,
                    compTiaExpiresAt: expiresAtDate,
                    notes: notes || undefined,
                    source: "BULK_PURCHASE",
                    isActive: true,
                });
            } catch (insertError: any) {
                // Handle partial insertion errors
                if (insertError.writeErrors) {
                    for (const err of insertError.writeErrors) {
                        errors.push(`Failed to insert code: ${err.errmsg}`);
                    }
                    imported = insertError.insertedDocs?.length || 0;
                } else {
                    throw insertError;
                }
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            duplicates: duplicates.length,
            errors,
            batchId: imported > 0 ? batchId : null,
        });
    } catch (error) {
        console.error("Failed to import vouchers:", error);
        return NextResponse.json(
            { error: "Failed to import vouchers" },
            { status: 500 }
        );
    }
}
