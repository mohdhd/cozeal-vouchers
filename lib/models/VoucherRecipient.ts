import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// VoucherRecipient - For institution direct-to-student distribution
export interface IVoucherRecipient extends Document {
    orderId: Types.ObjectId;
    institutionId: Types.ObjectId;
    name: string;
    email: string;
    studentId?: string; // Optional institutional ID
    department?: string;
    certificateId: Types.ObjectId;
    voucherId?: Types.ObjectId;
    status: "PENDING" | "ASSIGNED" | "DELIVERED" | "FAILED";
    deliveredAt?: Date;
    deliveryError?: string;
    emailOpenedAt?: Date; // Optional tracking
    createdAt: Date;
    updatedAt: Date;
}

const VoucherRecipientSchema = new Schema<IVoucherRecipient>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
        institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        studentId: { type: String },
        department: { type: String },
        certificateId: { type: Schema.Types.ObjectId, ref: "Certificate", required: true },
        voucherId: { type: Schema.Types.ObjectId, ref: "Voucher" },
        status: {
            type: String,
            enum: ["PENDING", "ASSIGNED", "DELIVERED", "FAILED"],
            default: "PENDING",
        },
        deliveredAt: { type: Date },
        deliveryError: { type: String },
        emailOpenedAt: { type: Date },
    },
    { timestamps: true }
);

// Indexes
VoucherRecipientSchema.index({ orderId: 1 });
VoucherRecipientSchema.index({ institutionId: 1 });
VoucherRecipientSchema.index({ status: 1 });
VoucherRecipientSchema.index({ email: 1 });

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.VoucherRecipient;
}

export const VoucherRecipient: Model<IVoucherRecipient> =
    mongoose.models.VoucherRecipient ||
    mongoose.model<IVoucherRecipient>("VoucherRecipient", VoucherRecipientSchema);
