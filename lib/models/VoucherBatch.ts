import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Batch source types
export type BatchSource = "BULK_PURCHASE" | "ON_DEMAND";

// VoucherBatch - For tracking bulk imports
export interface IVoucherBatch extends Document {
    batchId: string; // Auto-generated: BATCH-YYYYMMDD-XXXX
    certificateId: Types.ObjectId;
    totalCount: number;
    availableCount: number; // Cached count of available vouchers
    assignedCount: number; // Cached count of assigned vouchers
    deliveredCount: number; // Cached count of delivered vouchers
    usedCount: number; // Cached count of used vouchers
    expiredCount: number; // Cached count of expired vouchers
    importedAt: Date;
    importedBy: Types.ObjectId; // Admin who imported
    purchasePricePerUnit: number; // Cost per voucher
    compTiaOrderRef?: string; // CompTIA order reference
    compTiaExpiresAt: Date; // When vouchers in this batch expire
    notes?: string;
    source: BatchSource;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const VoucherBatchSchema = new Schema<IVoucherBatch>(
    {
        batchId: { type: String, required: true, unique: true },
        certificateId: {
            type: Schema.Types.ObjectId,
            ref: "Certificate",
            required: true,
        },
        totalCount: { type: Number, required: true },
        availableCount: { type: Number, default: 0 },
        assignedCount: { type: Number, default: 0 },
        deliveredCount: { type: Number, default: 0 },
        usedCount: { type: Number, default: 0 },
        expiredCount: { type: Number, default: 0 },
        importedAt: { type: Date, default: Date.now },
        importedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        purchasePricePerUnit: { type: Number, required: true },
        compTiaOrderRef: { type: String },
        compTiaExpiresAt: { type: Date, required: true },
        notes: { type: String },
        source: {
            type: String,
            enum: ["BULK_PURCHASE", "ON_DEMAND"],
            default: "BULK_PURCHASE",
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes
VoucherBatchSchema.index({ certificateId: 1 });
VoucherBatchSchema.index({ importedAt: -1 });
VoucherBatchSchema.index({ compTiaExpiresAt: 1 });
VoucherBatchSchema.index({ isActive: 1 });

// Static method to generate batch ID
VoucherBatchSchema.statics.generateBatchId = function (): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BATCH-${dateStr}-${random}`;
};

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.VoucherBatch;
}

export const VoucherBatch: Model<IVoucherBatch> =
    mongoose.models.VoucherBatch ||
    mongoose.model<IVoucherBatch>("VoucherBatch", VoucherBatchSchema);
