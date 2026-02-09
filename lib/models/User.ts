import "server-only";
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Address sub-schema
export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

// Notification preferences sub-schema
export interface INotificationPreferences {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
}

// User - For individuals and institution contacts
export interface IUser extends Document {
    email: string;
    passwordHash?: string; // Optional for guest orders
    name: string;
    phone?: string;
    role: "INDIVIDUAL" | "INSTITUTION_CONTACT" | "ADMIN";
    institutionId?: Types.ObjectId; // For institution contacts
    preferredLanguage: "en" | "ar";
    address?: IAddress;
    notificationPreferences?: INotificationPreferences;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
    {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String, default: "SA" },
    },
    { _id: false }
);

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
    {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: false },
    },
    { _id: false }
);

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String },
        name: { type: String, required: true },
        phone: { type: String },
        role: {
            type: String,
            enum: ["INDIVIDUAL", "INSTITUTION_CONTACT", "ADMIN"],
            default: "INDIVIDUAL",
        },
        institutionId: { type: Schema.Types.ObjectId, ref: "Institution" },
        preferredLanguage: {
            type: String,
            enum: ["en", "ar"],
            default: "en",
        },
        address: { type: AddressSchema },
        notificationPreferences: {
            type: NotificationPreferencesSchema,
            default: () => ({ orderUpdates: true, promotions: false, newsletter: false }),
        },
        emailVerified: { type: Boolean, default: false },
        emailVerifiedAt: { type: Date },
        emailVerificationToken: { type: String },
        emailVerificationExpires: { type: Date },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ institutionId: 1 }, { sparse: true });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });

// Delete cached model in development
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.User;
}

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
