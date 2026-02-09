import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// LegalPage - Content-managed legal pages for Saudi compliance
export interface ILegalPage extends Document {
    slug: string; // 'privacy-policy', 'terms-of-service', etc.
    titleEn: string;
    titleAr: string;
    contentEn: string; // Markdown content
    contentAr: string;
    isPublished: boolean;
    lastUpdatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const LegalPageSchema = new Schema<ILegalPage>(
    {
        slug: { type: String, required: true, unique: true, lowercase: true },
        titleEn: { type: String, required: true },
        titleAr: { type: String, required: true },
        contentEn: { type: String, required: true },
        contentAr: { type: String, required: true },
        isPublished: { type: Boolean, default: false },
        lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    },
    { timestamps: true }
);

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.LegalPage;
}

export const LegalPage: Model<ILegalPage> =
    mongoose.models.LegalPage ||
    mongoose.model<ILegalPage>("LegalPage", LegalPageSchema);
