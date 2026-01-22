import "server-only";
import mongoose, { Schema, Document, Model } from "mongoose";

// Order
export interface IOrder extends Document {
  orderNumber: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  universityName: string;
  customerVatNumber?: string;
  contactName: string;
  email: string;
  phone: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountCodeUsed?: string;
  discountAmount: number;
  vatAmount: number;
  totalAmount: number;
  tapChargeId?: string;
  tapTransactionId?: string;
  paymentMethod?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["PENDING", "PAID", "CANCELLED", "REFUNDED"], default: "PENDING" },
    universityName: { type: String, required: true },
    customerVatNumber: { type: String },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discountCodeUsed: { type: String },
    discountAmount: { type: Number, default: 0 },
    vatAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    tapChargeId: { type: String },
    tapTransactionId: { type: String },
    paymentMethod: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// Discount Code
export interface IDiscountCode extends Document {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  descriptionEn: string;
  descriptionAr: string;
  minQuantity?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  universityRestriction?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    value: { type: Number, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    minQuantity: { type: Number },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    universityRestriction: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Invoice
export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  },
  { timestamps: true }
);

// Settings
export interface ISettings extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

// Admin User
export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

// Delete cached models in development to pick up schema changes
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Order;
  delete mongoose.models.DiscountCode;
  delete mongoose.models.Invoice;
  delete mongoose.models.Settings;
  delete mongoose.models.AdminUser;
}

// Export models
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export const DiscountCode: Model<IDiscountCode> = mongoose.models.DiscountCode || mongoose.model<IDiscountCode>("DiscountCode", DiscountCodeSchema);
export const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
export const AdminUser: Model<IAdminUser> = mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
