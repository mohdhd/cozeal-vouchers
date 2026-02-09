import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Voucher status types
export type VoucherStatus =
    | "AVAILABLE"
    | "RESERVED"
    | "ASSIGNED"
    | "DELIVERED"
    | "USED"
    | "EXPIRED";

// Delivery method types
export type VoucherDeliveryMethod =
    | "EMAIL_INDIVIDUAL"
    | "EMAIL_BULK"
    | "EMAIL_STUDENT";

// Delivery status types
export type VoucherDeliveryStatus =
    | "PENDING"
    | "SENT"
    | "OPENED"
    | "FAILED";

// History entry interface
export interface IVoucherHistoryEntry {
    action: string;
    timestamp: Date;
    userId?: Types.ObjectId;
    details?: string;
}

// Voucher - Inventory item for exam voucher codes
export interface IVoucher extends Document {
    code: string; // Actual voucher code
    certificateId: Types.ObjectId; // Reference to Certificate
    status: VoucherStatus;

    // Import tracking
    batchId?: string; // Import batch identifier
    importedAt?: Date;
    importedBy?: Types.ObjectId; // Admin who imported
    purchasePrice: number; // What was paid to CompTIA

    // Validity
    purchasedAt: Date; // When purchased from CompTIA
    expiresAt: Date; // CompTIA's expiration date

    // Reservation (during checkout)
    reservedAt?: Date;
    reservedUntil?: Date; // Auto-release if not paid
    reservedForOrderId?: Types.ObjectId;

    // Assignment (after admin approval)
    assignedAt?: Date;
    assignedToOrderId?: Types.ObjectId;
    assignedToRecipientId?: Types.ObjectId;
    assignedBy?: Types.ObjectId; // Admin who assigned

    // Delivery tracking
    deliveredAt?: Date;
    deliveryMethod?: VoucherDeliveryMethod;
    recipientEmail?: string;
    recipientName?: string;
    deliveryStatus?: VoucherDeliveryStatus;
    emailOpenedAt?: Date;
    deliveryError?: string;

    // Usage tracking
    usedAt?: Date;
    usedBy?: string; // Name/ID of person who used it

    // Audit
    notes?: string; // Admin notes
    history: IVoucherHistoryEntry[];

    createdAt: Date;
    updatedAt: Date;
}

const VoucherHistorySchema = new Schema<IVoucherHistoryEntry>(
    {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        details: { type: String },
    },
    { _id: false }
);

const VoucherSchema = new Schema<IVoucher>(
    {
        code: { type: String, required: true, unique: true },
        certificateId: {
            type: Schema.Types.ObjectId,
            ref: "Certificate",
            required: true,
        },
        status: {
            type: String,
            enum: ["AVAILABLE", "RESERVED", "ASSIGNED", "DELIVERED", "USED", "EXPIRED"],
            default: "AVAILABLE",
        },

        // Import tracking
        batchId: { type: String },
        importedAt: { type: Date },
        importedBy: { type: Schema.Types.ObjectId, ref: "User" },
        purchasePrice: { type: Number, required: true },

        // Validity
        purchasedAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },

        // Reservation
        reservedAt: { type: Date },
        reservedUntil: { type: Date },
        reservedForOrderId: { type: Schema.Types.ObjectId, ref: "Order" },

        // Assignment
        assignedAt: { type: Date },
        assignedToOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
        assignedToRecipientId: { type: Schema.Types.ObjectId, ref: "VoucherRecipient" },
        assignedBy: { type: Schema.Types.ObjectId, ref: "User" },

        // Delivery tracking
        deliveredAt: { type: Date },
        deliveryMethod: {
            type: String,
            enum: ["EMAIL_INDIVIDUAL", "EMAIL_BULK", "EMAIL_STUDENT"],
        },
        recipientEmail: { type: String },
        recipientName: { type: String },
        deliveryStatus: {
            type: String,
            enum: ["PENDING", "SENT", "OPENED", "FAILED"],
        },
        emailOpenedAt: { type: Date },
        deliveryError: { type: String },

        // Usage tracking
        usedAt: { type: Date },
        usedBy: { type: String },

        // Audit
        notes: { type: String },
        history: { type: [VoucherHistorySchema], default: [] },
    },
    { timestamps: true }
);

// Indexes for efficient queries
VoucherSchema.index({ certificateId: 1, status: 1 });
VoucherSchema.index({ status: 1 });
VoucherSchema.index({ reservedUntil: 1 }, { sparse: true });
VoucherSchema.index({ expiresAt: 1 });
VoucherSchema.index({ batchId: 1 }, { sparse: true });
VoucherSchema.index({ assignedToOrderId: 1 }, { sparse: true });
VoucherSchema.index({ deliveryStatus: 1 }, { sparse: true });

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.Voucher;
}

export const Voucher: Model<IVoucher> =
    mongoose.models.Voucher || mongoose.model<IVoucher>("Voucher", VoucherSchema);
