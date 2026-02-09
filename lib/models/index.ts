import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Order status types
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

// Fulfillment status types
export type FulfillmentStatus =
  | "PENDING_PAYMENT"
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "APPROVED"
  | "VOUCHERS_ASSIGNED"
  | "DELIVERED"
  | "PARTIALLY_DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

// Customer types
export type CustomerType = "INDIVIDUAL" | "INSTITUTION";

// Delivery method types for orders
export type OrderDeliveryMethod = "BULK_TO_CONTACT" | "DIRECT_TO_STUDENTS";

// Order item interface (for multi-certificate orders)
export interface IOrderItem {
  certificateId: Types.ObjectId;
  certificateCode: string;
  certificateName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Voucher assignment tracking
export interface IVoucherAssignment {
  voucherId: Types.ObjectId;
  assignedAt: Date;
}

// Student recipient for direct delivery
export interface IStudentRecipient {
  name: string;
  email: string;
  studentId?: string;
  voucherId?: Types.ObjectId;
  deliveryStatus: "PENDING" | "SENT" | "OPENED" | "FAILED";
  deliveredAt?: Date;
  deliveryError?: string;
}

// Order
export interface IOrder extends Document {
  orderNumber: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;

  // Customer type and references
  customerType: CustomerType;
  userId?: Types.ObjectId; // For registered individuals
  institutionId?: Types.ObjectId; // For institutions

  // Customer info (denormalized for quick access)
  customerName: string; // Institution name or individual name
  customerVatNumber?: string;
  contactName: string;
  email: string;
  phone: string;

  // Order items (multi-certificate support)
  items: IOrderItem[];

  // Legacy single-product fields (for backward compatibility)
  quantity: number;
  unitPrice: number;
  subtotal: number;

  // Pricing
  discountCodeUsed?: string;
  discountAmount: number;
  vatAmount: number;
  totalAmount: number;

  // Payment
  tapChargeId?: string;
  tapTransactionId?: string;
  paymentMethod?: string;
  paidAt?: Date;

  // Fulfillment tracking
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;

  // Delivery
  deliveryMethod?: OrderDeliveryMethod;
  vouchersAssigned: IVoucherAssignment[];
  studentRecipients: IStudentRecipient[];

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    certificateId: { type: Schema.Types.ObjectId, ref: "Certificate", required: true },
    certificateCode: { type: String, required: true },
    certificateName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const VoucherAssignmentSchema = new Schema<IVoucherAssignment>(
  {
    voucherId: { type: Schema.Types.ObjectId, ref: "Voucher", required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentRecipientSchema = new Schema<IStudentRecipient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentId: { type: String },
    voucherId: { type: Schema.Types.ObjectId, ref: "Voucher" },
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "SENT", "OPENED", "FAILED"],
      default: "PENDING",
    },
    deliveredAt: { type: Date },
    deliveryError: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PENDING_REVIEW",
        "IN_REVIEW",
        "APPROVED",
        "VOUCHERS_ASSIGNED",
        "DELIVERED",
        "PARTIALLY_DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
    },

    // Customer type and references
    customerType: {
      type: String,
      enum: ["INDIVIDUAL", "INSTITUTION"],
      default: "INSTITUTION",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution" },

    // Customer info
    customerName: { type: String, required: true },
    customerVatNumber: { type: String },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Order items
    items: { type: [OrderItemSchema], default: [] },

    // Legacy fields
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },

    // Pricing
    discountCodeUsed: { type: String },
    discountAmount: { type: Number, default: 0 },
    vatAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // Payment
    tapChargeId: { type: String },
    tapTransactionId: { type: String },
    paymentMethod: { type: String },
    paidAt: { type: Date },

    // Fulfillment
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String },

    // Delivery
    deliveryMethod: {
      type: String,
      enum: ["BULK_TO_CONTACT", "DIRECT_TO_STUDENTS"],
    },
    vouchersAssigned: { type: [VoucherAssignmentSchema], default: [] },
    studentRecipients: { type: [StudentRecipientSchema], default: [] },
  },
  { timestamps: true }
);

// Indexes
OrderSchema.index({ status: 1 });
OrderSchema.index({ fulfillmentStatus: 1 });
OrderSchema.index({ customerType: 1 });
OrderSchema.index({ userId: 1 }, { sparse: true });
OrderSchema.index({ institutionId: 1 }, { sparse: true });
OrderSchema.index({ email: 1 });
OrderSchema.index({ createdAt: -1 });

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

// Re-export models from other files
export { User } from "./User";
export { Institution } from "./Institution";
export { Certificate } from "./Certificate";
export { Voucher } from "./Voucher";
export { VoucherBatch } from "./VoucherBatch";
export { VoucherRecipient } from "./VoucherRecipient";
export { LegalPage } from "./LegalPage";
