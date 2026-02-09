import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Institution - Universities, companies, training centers
export interface IInstitution extends Document {
    nameEn: string;
    nameAr: string;
    type: "UNIVERSITY" | "COMPANY" | "TRAINING_CENTER" | "GOVERNMENT" | "OTHER";
    vatNumber?: string;
    crNumber?: string; // Commercial Registration
    email: string; // Official contact email
    phone: string;
    address?: string;
    city?: string;
    // Approval workflow
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    approvedAt?: Date;
    approvedBy?: Types.ObjectId;
    rejectionReason?: string;
    // Custom pricing (admin-set discount)
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    // Documents
    documents?: Array<{
        type: string;
        filename: string;
        url: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
    {
        nameEn: { type: String, required: true },
        nameAr: { type: String, required: true },
        type: {
            type: String,
            enum: ["UNIVERSITY", "COMPANY", "TRAINING_CENTER", "GOVERNMENT", "OTHER"],
            required: true,
        },
        vatNumber: { type: String },
        crNumber: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String },
        city: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
            default: "PENDING",
        },
        approvedAt: { type: Date },
        approvedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
        rejectionReason: { type: String },
        discountType: { type: String, enum: ["PERCENTAGE", "FIXED"] },
        discountValue: { type: Number },
        documents: [
            {
                type: { type: String, required: true },
                filename: { type: String, required: true },
                url: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Indexes
InstitutionSchema.index({ status: 1 });
InstitutionSchema.index({ email: 1 });

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.Institution;
}

export const Institution: Model<IInstitution> =
    mongoose.models.Institution ||
    mongoose.model<IInstitution>("Institution", InstitutionSchema);
