import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Define schemas inline for the script
const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

const DiscountCodeSchema = new mongoose.Schema({
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
}, { timestamps: true });

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
const DiscountCode = mongoose.models.DiscountCode || mongoose.model("DiscountCode", DiscountCodeSchema);

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("Connecting to database...");
  await mongoose.connect(dbUrl);
  console.log("Connected!");

  console.log("Seeding database...");

  // Create admin user with a strong default password
  // IMPORTANT: Change this password after first login!
  const defaultPassword = "Cz@Admin#2026!Secure";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  
  const existingAdmin = await AdminUser.findOne({ email: "admin@cozeal.ai" });
  if (!existingAdmin) {
    await AdminUser.create({
      email: "admin@cozeal.ai",
      passwordHash,
      name: "Admin",
    });
    console.log("✓ Created admin user: admin@cozeal.ai");
  } else {
    console.log("• Admin user already exists");
  }

  // Create default settings
  const defaultSettings = [
    { key: "voucher_base_price", value: "1350" },
    { key: "vat_percentage", value: "15" },
    { key: "company_name_en", value: "Cozeal Vouchers" },
    { key: "company_name_ar", value: "كوزيل للقسائم" },
    { key: "company_vat_number", value: "" },
    { key: "company_cr_number", value: "7051993926" },
  ];

  for (const setting of defaultSettings) {
    await Settings.updateOne(
      { key: setting.key },
      { $setOnInsert: setting },
      { upsert: true }
    );
  }
  console.log("✓ Settings configured");

  // Create sample discount codes
  const discountCodes = [
    {
      code: "KSU2024",
      type: "PERCENTAGE",
      value: 20,
      descriptionEn: "King Saud University - 20% Off",
      descriptionAr: "جامعة الملك سعود - خصم ٢٠٪",
      minQuantity: 5,
      maxUses: 500,
      validFrom: new Date("2024-01-01"),
      validUntil: new Date("2025-12-31"),
      universityRestriction: "King Saud",
    },
    {
      code: "KFUPM25",
      type: "PERCENTAGE",
      value: 25,
      descriptionEn: "KFUPM - 25% Off",
      descriptionAr: "جامعة البترول - خصم ٢٥٪",
      minQuantity: 10,
      maxUses: 300,
      validFrom: new Date("2024-01-01"),
      validUntil: new Date("2025-12-31"),
    },
    {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      descriptionEn: "Welcome Discount - 10% Off",
      descriptionAr: "خصم الترحيب - ١٠٪",
      validFrom: new Date("2024-01-01"),
      validUntil: new Date("2025-12-31"),
    },
  ];

  for (const discount of discountCodes) {
    await DiscountCode.updateOne(
      { code: discount.code },
      { $setOnInsert: discount },
      { upsert: true }
    );
  }
  console.log("✓ Sample discount codes created");

  console.log("\n✅ Seeding complete!");
  console.log("\n" + "=".repeat(50));
  console.log("Admin login credentials:");
  console.log("  Email: admin@cozeal.ai");
  console.log("  Password: Cz@Admin#2026!Secure");
  console.log("=".repeat(50));
  console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");
  
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
