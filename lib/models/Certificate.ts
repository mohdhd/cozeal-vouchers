import "server-only";
import mongoose, { Schema, Document, Model } from "mongoose";

// Certificate categories
export type CertificateCategory =
  | "CORE"
  | "INFRASTRUCTURE"
  | "CYBERSECURITY"
  | "DATA"
  | "PROFESSIONAL";

// Certificate - Product catalog for CompTIA certifications
export interface ICertificate extends Document {
  code: string; // 'SECURITY_PLUS', 'NETWORK_PLUS', etc.
  slug: string; // URL-friendly identifier: 'security-plus'
  category: CertificateCategory;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  examCode: string; // Primary exam code: 'SY0-701'
  examCodes: string[]; // All exam codes (for multi-exam certs like A+)
  numberOfExams: number; // 1 or 2
  featuresEn: string[]; // Bullet points for detail page
  featuresAr: string[]; // Bullet points in Arabic
  retailPrice: number; // Individual buyer price (SAR)
  institutionBasePrice: number; // Base price for institutions
  validityMonths: number; // Typically 12
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ["CORE", "INFRASTRUCTURE", "CYBERSECURITY", "DATA", "PROFESSIONAL"],
      required: true,
    },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    examCode: { type: String, required: true },
    examCodes: { type: [String], default: [] },
    numberOfExams: { type: Number, default: 1 },
    featuresEn: { type: [String], default: [] },
    featuresAr: { type: [String], default: [] },
    retailPrice: { type: Number, required: true },
    institutionBasePrice: { type: Number, required: true },
    validityMonths: { type: Number, default: 12 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Indexes
CertificateSchema.index({ slug: 1 });
CertificateSchema.index({ category: 1, isActive: 1 });
CertificateSchema.index({ isActive: 1, sortOrder: 1 });

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Certificate;
}

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);
