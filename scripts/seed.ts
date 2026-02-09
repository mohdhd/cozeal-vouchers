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

const CertificateSchema = new mongoose.Schema({
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
}, { timestamps: true });

const LegalPageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  titleEn: { type: String, required: true },
  titleAr: { type: String, required: true },
  contentEn: { type: String, required: true },
  contentAr: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
const DiscountCode = mongoose.models.DiscountCode || mongoose.model("DiscountCode", DiscountCodeSchema);
const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
const LegalPage = mongoose.models.LegalPage || mongoose.model("LegalPage", LegalPageSchema);

// CompTIA Certificates Data
const certificates = [
  // CORE Certifications
  {
    code: "A_PLUS",
    slug: "a-plus",
    category: "CORE",
    nameEn: "CompTIA A+",
    nameAr: "CompTIA A+",
    descriptionEn: "CompTIA A+ is the industry standard for establishing a career in IT. This certification validates foundational IT skills across hardware, software, and networking.",
    descriptionAr: "شهادة CompTIA A+ هي المعيار الصناعي لبدء مسيرة مهنية في تكنولوجيا المعلومات. تُثبت هذه الشهادة المهارات الأساسية في الأجهزة والبرمجيات والشبكات.",
    examCode: "220-1101",
    examCodes: ["220-1101", "220-1102"],
    numberOfExams: 2,
    featuresEn: [
      "Hardware and network troubleshooting",
      "Operating system installation and configuration",
      "Security fundamentals",
      "Cloud computing basics",
      "Mobile device support"
    ],
    featuresAr: [
      "استكشاف أخطاء الأجهزة والشبكات",
      "تثبيت وتكوين أنظمة التشغيل",
      "أساسيات الأمان",
      "أساسيات الحوسبة السحابية",
      "دعم الأجهزة المحمولة"
    ],
    retailPrice: 1500,
    institutionBasePrice: 1350,
    sortOrder: 1,
  },
  {
    code: "NETWORK_PLUS",
    slug: "network-plus",
    category: "CORE",
    nameEn: "CompTIA Network+",
    nameAr: "CompTIA Network+",
    descriptionEn: "CompTIA Network+ validates the technical skills needed to securely establish, maintain, and troubleshoot essential networks.",
    descriptionAr: "تُثبت شهادة CompTIA Network+ المهارات التقنية اللازمة لإنشاء وصيانة واستكشاف أخطاء الشبكات الأساسية بشكل آمن.",
    examCode: "N10-009",
    examCodes: ["N10-009"],
    numberOfExams: 1,
    featuresEn: [
      "Network architecture and design",
      "Network operations and management",
      "Network security fundamentals",
      "Network troubleshooting",
      "Industry standards and best practices"
    ],
    featuresAr: [
      "هندسة وتصميم الشبكات",
      "تشغيل وإدارة الشبكات",
      "أساسيات أمان الشبكات",
      "استكشاف أخطاء الشبكات",
      "المعايير الصناعية وأفضل الممارسات"
    ],
    retailPrice: 1450,
    institutionBasePrice: 1300,
    sortOrder: 2,
  },
  {
    code: "SECURITY_PLUS",
    slug: "security-plus",
    category: "CORE",
    nameEn: "CompTIA Security+",
    nameAr: "CompTIA Security+",
    descriptionEn: "CompTIA Security+ is a global certification that validates the baseline skills necessary to perform core security functions and pursue an IT security career.",
    descriptionAr: "شهادة CompTIA Security+ هي شهادة عالمية تُثبت المهارات الأساسية اللازمة لأداء وظائف الأمان الأساسية ومتابعة مسيرة مهنية في أمن تكنولوجيا المعلومات.",
    examCode: "SY0-701",
    examCodes: ["SY0-701"],
    numberOfExams: 1,
    featuresEn: [
      "Threats, attacks, and vulnerabilities",
      "Security architecture and design",
      "Implementation of security solutions",
      "Security operations and incident response",
      "Governance, risk, and compliance"
    ],
    featuresAr: [
      "التهديدات والهجمات ونقاط الضعف",
      "هندسة وتصميم الأمان",
      "تنفيذ حلول الأمان",
      "عمليات الأمان والاستجابة للحوادث",
      "الحوكمة والمخاطر والامتثال"
    ],
    retailPrice: 1450,
    institutionBasePrice: 1350,
    sortOrder: 3,
  },
  // INFRASTRUCTURE Certifications
  {
    code: "CLOUD_PLUS",
    slug: "cloud-plus",
    category: "INFRASTRUCTURE",
    nameEn: "CompTIA Cloud+",
    nameAr: "CompTIA Cloud+",
    descriptionEn: "CompTIA Cloud+ validates the skills needed to maintain and optimize cloud infrastructure services.",
    descriptionAr: "تُثبت شهادة CompTIA Cloud+ المهارات اللازمة لصيانة وتحسين خدمات البنية التحتية السحابية.",
    examCode: "CV0-004",
    examCodes: ["CV0-004"],
    numberOfExams: 1,
    featuresEn: [
      "Cloud architecture and design",
      "Cloud security and compliance",
      "Cloud deployment and migration",
      "Operations and support",
      "Troubleshooting cloud environments"
    ],
    featuresAr: [
      "هندسة وتصميم السحابة",
      "أمان السحابة والامتثال",
      "نشر السحابة والترحيل",
      "العمليات والدعم",
      "استكشاف أخطاء بيئات السحابة"
    ],
    retailPrice: 1500,
    institutionBasePrice: 1350,
    sortOrder: 10,
  },
  {
    code: "LINUX_PLUS",
    slug: "linux-plus",
    category: "INFRASTRUCTURE",
    nameEn: "CompTIA Linux+",
    nameAr: "CompTIA Linux+",
    descriptionEn: "CompTIA Linux+ validates the competencies required of an early career Linux system administrator.",
    descriptionAr: "تُثبت شهادة CompTIA Linux+ الكفاءات المطلوبة لمسؤول نظام Linux في بداية مسيرته المهنية.",
    examCode: "XK0-005",
    examCodes: ["XK0-005"],
    numberOfExams: 1,
    featuresEn: [
      "System management and configuration",
      "Security and hardening",
      "Scripting and automation",
      "Linux troubleshooting",
      "Virtualization and cloud deployment"
    ],
    featuresAr: [
      "إدارة النظام والتكوين",
      "الأمان والتقوية",
      "البرمجة والأتمتة",
      "استكشاف أخطاء Linux",
      "المحاكاة الافتراضية والنشر السحابي"
    ],
    retailPrice: 1450,
    institutionBasePrice: 1300,
    sortOrder: 11,
  },
  {
    code: "SERVER_PLUS",
    slug: "server-plus",
    category: "INFRASTRUCTURE",
    nameEn: "CompTIA Server+",
    nameAr: "CompTIA Server+",
    descriptionEn: "CompTIA Server+ is a certification for IT professionals who install, manage, and troubleshoot servers in data centers and on-premises/hybrid environments.",
    descriptionAr: "شهادة CompTIA Server+ هي شهادة لمحترفي تكنولوجيا المعلومات الذين يقومون بتثبيت وإدارة واستكشاف أخطاء الخوادم في مراكز البيانات والبيئات المحلية/الهجينة.",
    examCode: "SK0-005",
    examCodes: ["SK0-005"],
    numberOfExams: 1,
    featuresEn: [
      "Server hardware installation",
      "Server administration",
      "Storage technologies",
      "Security and disaster recovery",
      "Troubleshooting server issues"
    ],
    featuresAr: [
      "تثبيت أجهزة الخادم",
      "إدارة الخادم",
      "تقنيات التخزين",
      "الأمان والتعافي من الكوارث",
      "استكشاف مشاكل الخادم"
    ],
    retailPrice: 1400,
    institutionBasePrice: 1250,
    sortOrder: 12,
  },
  // CYBERSECURITY Certifications
  {
    code: "CYSA_PLUS",
    slug: "cysa-plus",
    category: "CYBERSECURITY",
    nameEn: "CompTIA CySA+",
    nameAr: "CompTIA CySA+",
    descriptionEn: "CompTIA Cybersecurity Analyst (CySA+) is an IT workforce certification that applies behavioral analytics to networks to improve security.",
    descriptionAr: "شهادة محلل الأمن السيبراني CompTIA CySA+ هي شهادة قوى عاملة في تكنولوجيا المعلومات تطبق تحليلات السلوك على الشبكات لتحسين الأمان.",
    examCode: "CS0-003",
    examCodes: ["CS0-003"],
    numberOfExams: 1,
    featuresEn: [
      "Threat and vulnerability management",
      "Security operations and monitoring",
      "Incident response",
      "Compliance and assessment",
      "Software and application security"
    ],
    featuresAr: [
      "إدارة التهديدات ونقاط الضعف",
      "عمليات الأمان والمراقبة",
      "الاستجابة للحوادث",
      "الامتثال والتقييم",
      "أمان البرمجيات والتطبيقات"
    ],
    retailPrice: 1600,
    institutionBasePrice: 1450,
    sortOrder: 20,
  },
  {
    code: "PENTEST_PLUS",
    slug: "pentest-plus",
    category: "CYBERSECURITY",
    nameEn: "CompTIA PenTest+",
    nameAr: "CompTIA PenTest+",
    descriptionEn: "CompTIA PenTest+ is for cybersecurity professionals tasked with penetration testing and vulnerability management.",
    descriptionAr: "شهادة CompTIA PenTest+ مخصصة لمحترفي الأمن السيبراني المكلفين باختبار الاختراق وإدارة نقاط الضعف.",
    examCode: "PT0-002",
    examCodes: ["PT0-002"],
    numberOfExams: 1,
    featuresEn: [
      "Planning and scoping penetration tests",
      "Information gathering and vulnerability scanning",
      "Attacks and exploits",
      "Reporting and communication",
      "Tools and code analysis"
    ],
    featuresAr: [
      "تخطيط ونطاق اختبارات الاختراق",
      "جمع المعلومات وفحص نقاط الضعف",
      "الهجمات والاستغلال",
      "التقارير والتواصل",
      "الأدوات وتحليل الكود"
    ],
    retailPrice: 1600,
    institutionBasePrice: 1450,
    sortOrder: 21,
  },
  {
    code: "CASP_PLUS",
    slug: "casp-plus",
    category: "CYBERSECURITY",
    nameEn: "CompTIA CASP+",
    nameAr: "CompTIA CASP+",
    descriptionEn: "CompTIA Advanced Security Practitioner (CASP+) is an advanced-level cybersecurity certification for security architects and senior security engineers.",
    descriptionAr: "شهادة ممارس الأمان المتقدم CompTIA CASP+ هي شهادة متقدمة في الأمن السيبراني لمهندسي الأمان الرئيسيين ومعماريي الأمان.",
    examCode: "CAS-004",
    examCodes: ["CAS-004"],
    numberOfExams: 1,
    featuresEn: [
      "Security architecture",
      "Security operations",
      "Security engineering and cryptography",
      "Governance, risk, and compliance",
      "Enterprise security integration"
    ],
    featuresAr: [
      "هندسة الأمان",
      "عمليات الأمان",
      "هندسة الأمان والتشفير",
      "الحوكمة والمخاطر والامتثال",
      "تكامل أمان المؤسسة"
    ],
    retailPrice: 1800,
    institutionBasePrice: 1600,
    sortOrder: 22,
  },
  // DATA Certifications
  {
    code: "DATA_PLUS",
    slug: "data-plus",
    category: "DATA",
    nameEn: "CompTIA Data+",
    nameAr: "CompTIA Data+",
    descriptionEn: "CompTIA Data+ is an early-career data analytics certification for professionals tasked with developing and promoting data-driven business decisions.",
    descriptionAr: "شهادة CompTIA Data+ هي شهادة تحليل البيانات للمهنيين في بداية مسيرتهم المكلفين بتطوير وترويج القرارات التجارية المبنية على البيانات.",
    examCode: "DA0-001",
    examCodes: ["DA0-001"],
    numberOfExams: 1,
    featuresEn: [
      "Data concepts and environments",
      "Data mining and analysis",
      "Data visualization",
      "Data governance and quality",
      "Statistical analysis"
    ],
    featuresAr: [
      "مفاهيم البيانات والبيئات",
      "التنقيب عن البيانات والتحليل",
      "تصور البيانات",
      "حوكمة البيانات والجودة",
      "التحليل الإحصائي"
    ],
    retailPrice: 1400,
    institutionBasePrice: 1250,
    sortOrder: 30,
  },
  {
    code: "DATASYS_PLUS",
    slug: "datasys-plus",
    category: "DATA",
    nameEn: "CompTIA DataSys+",
    nameAr: "CompTIA DataSys+",
    descriptionEn: "CompTIA DataSys+ validates skills for database administrators to deploy, manage, and secure databases.",
    descriptionAr: "تُثبت شهادة CompTIA DataSys+ مهارات مسؤولي قواعد البيانات لنشر وإدارة وتأمين قواعد البيانات.",
    examCode: "DS0-001",
    examCodes: ["DS0-001"],
    numberOfExams: 1,
    featuresEn: [
      "Database fundamentals",
      "Database deployment",
      "Database management",
      "Data and database security",
      "Business continuity"
    ],
    featuresAr: [
      "أساسيات قواعد البيانات",
      "نشر قواعد البيانات",
      "إدارة قواعد البيانات",
      "أمان البيانات وقواعد البيانات",
      "استمرارية الأعمال"
    ],
    retailPrice: 1400,
    institutionBasePrice: 1250,
    sortOrder: 31,
  },
  // PROFESSIONAL Certifications
  {
    code: "PROJECT_PLUS",
    slug: "project-plus",
    category: "PROFESSIONAL",
    nameEn: "CompTIA Project+",
    nameAr: "CompTIA Project+",
    descriptionEn: "CompTIA Project+ is ideal for IT professionals who need to manage smaller projects as part of their job duties.",
    descriptionAr: "شهادة CompTIA Project+ مثالية لمحترفي تكنولوجيا المعلومات الذين يحتاجون إلى إدارة مشاريع أصغر كجزء من واجباتهم الوظيفية.",
    examCode: "PK0-005",
    examCodes: ["PK0-005"],
    numberOfExams: 1,
    featuresEn: [
      "Project basics and constraints",
      "Project planning and scheduling",
      "Project execution and delivery",
      "Change management",
      "Communication and documentation"
    ],
    featuresAr: [
      "أساسيات المشروع والقيود",
      "تخطيط وجدولة المشروع",
      "تنفيذ وتسليم المشروع",
      "إدارة التغيير",
      "التواصل والتوثيق"
    ],
    retailPrice: 1350,
    institutionBasePrice: 1200,
    sortOrder: 40,
  },
  {
    code: "CTT_PLUS",
    slug: "ctt-plus",
    category: "PROFESSIONAL",
    nameEn: "CompTIA CTT+",
    nameAr: "CompTIA CTT+",
    descriptionEn: "CompTIA Certified Technical Trainer (CTT+) is for instructors who want to verify they have attained a standard of excellence in training.",
    descriptionAr: "شهادة المدرب التقني المعتمد CompTIA CTT+ مخصصة للمدربين الذين يريدون التحقق من أنهم حققوا معيار التميز في التدريب.",
    examCode: "TK0-201",
    examCodes: ["TK0-201"],
    numberOfExams: 1,
    featuresEn: [
      "Preparing to teach",
      "Methods and media for instructional delivery",
      "Classroom management",
      "Evaluating training effectiveness",
      "Professional development"
    ],
    featuresAr: [
      "التحضير للتدريس",
      "طرق ووسائل التقديم التعليمي",
      "إدارة الفصل الدراسي",
      "تقييم فعالية التدريب",
      "التطوير المهني"
    ],
    retailPrice: 1350,
    institutionBasePrice: 1200,
    sortOrder: 41,
  },
];

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

  // Seed certificates
  console.log("\nSeeding CompTIA certificates...");
  for (const cert of certificates) {
    await Certificate.updateOne(
      { code: cert.code },
      { $set: cert },
      { upsert: true }
    );
  }
  console.log(`✓ ${certificates.length} CompTIA certificates seeded`);

  // Seed legal pages
  console.log("\nSeeding legal pages...");
  const legalPages = [
    {
      slug: "terms-of-service",
      titleEn: "Terms of Service",
      titleAr: "الشروط والأحكام",
      contentEn: `# Terms of Service

## 1. Acceptance of Terms
By accessing and using Cozeal Vouchers, you accept and agree to be bound by the terms and provisions of this agreement.

## 2. Services
Cozeal Vouchers provides CompTIA certification exam vouchers to individuals and institutions in Saudi Arabia.

## 3. User Accounts
- You are responsible for maintaining the confidentiality of your account credentials
- You agree to provide accurate and complete information
- You must be at least 18 years old to create an account

## 4. Pricing and Payment
- All prices are in Saudi Riyals (SAR) and include 15% VAT
- Payment is processed through Tap Payment Gateway
- Prices are subject to change without notice

## 5. Intellectual Property
All content on this website is the property of Cozeal and is protected by copyright laws.

## 6. Limitation of Liability
Cozeal shall not be liable for any indirect, incidental, special, or consequential damages.

## 7. Governing Law
These terms shall be governed by the laws of the Kingdom of Saudi Arabia.

## 8. Contact
For questions about these Terms, contact us at info@cozeal.ai`,
      contentAr: `# الشروط والأحكام

## 1. قبول الشروط
باستخدامك لموقع كوزيل للقسائم، فإنك توافق على الالتزام بشروط وأحكام هذه الاتفاقية.

## 2. الخدمات
تقدم كوزيل قسائم امتحانات شهادات CompTIA للأفراد والمؤسسات في المملكة العربية السعودية.

## 3. حسابات المستخدمين
- أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك
- توافق على تقديم معلومات دقيقة وكاملة
- يجب أن يكون عمرك 18 عاماً على الأقل لإنشاء حساب

## 4. الأسعار والدفع
- جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة 15%
- تتم معالجة الدفع عبر بوابة Tap للدفع
- الأسعار قابلة للتغيير دون إشعار مسبق

## 5. الملكية الفكرية
جميع المحتويات على هذا الموقع هي ملك لكوزيل ومحمية بموجب قوانين حقوق النشر.

## 6. تحديد المسؤولية
لن تكون كوزيل مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية.

## 7. القانون الحاكم
تخضع هذه الشروط لقوانين المملكة العربية السعودية.

## 8. التواصل
للاستفسارات حول هذه الشروط، تواصل معنا على info@cozeal.ai`,
      isPublished: true,
    },
    {
      slug: "privacy-policy",
      titleEn: "Privacy Policy",
      titleAr: "سياسة الخصوصية",
      contentEn: `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly, including:
- Name and contact information
- Payment information
- Institution details (for B2B customers)

## 2. How We Use Your Information
- To process your orders and deliver vouchers
- To communicate with you about your orders
- To improve our services
- To comply with legal obligations

## 3. Information Sharing
We do not sell your personal information. We may share information with:
- Payment processors (Tap Payments)
- CompTIA for voucher validation
- Law enforcement when required by law

## 4. Data Security
We implement appropriate security measures to protect your personal information.

## 5. Your Rights
You have the right to:
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Object to processing of your data

## 6. Cookies
We use cookies to improve your experience. You can control cookies through your browser settings.

## 7. Contact
For privacy inquiries, contact us at privacy@cozeal.ai

**Company Registration:**
- Commercial Registration: 7051993926
- Address: 7290 Muhammad Nur Jakhdar, Alsafa, Jeddah 23453 3592, Saudi Arabia`,
      contentAr: `# سياسة الخصوصية

## 1. المعلومات التي نجمعها
نجمع المعلومات التي تقدمها مباشرة، بما في ذلك:
- الاسم ومعلومات الاتصال
- معلومات الدفع
- تفاصيل المؤسسة (لعملاء الأعمال)

## 2. كيف نستخدم معلوماتك
- لمعالجة طلباتك وتسليم القسائم
- للتواصل معك بشأن طلباتك
- لتحسين خدماتنا
- للامتثال للالتزامات القانونية

## 3. مشاركة المعلومات
لا نبيع معلوماتك الشخصية. قد نشارك المعلومات مع:
- معالجي الدفع (Tap Payments)
- CompTIA للتحقق من القسائم
- الجهات القانونية عند الطلب بموجب القانون

## 4. أمان البيانات
نطبق إجراءات أمنية مناسبة لحماية معلوماتك الشخصية.

## 5. حقوقك
لديك الحق في:
- الوصول إلى بياناتك الشخصية
- طلب تصحيح البيانات غير الدقيقة
- طلب حذف بياناتك
- الاعتراض على معالجة بياناتك

## 6. ملفات تعريف الارتباط
نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم بها من خلال إعدادات المتصفح.

## 7. التواصل
للاستفسارات المتعلقة بالخصوصية، تواصل معنا على privacy@cozeal.ai

**معلومات الشركة:**
- السجل التجاري: 7051993926
- العنوان: 7290 محمد نور جخدار، الصفا، جدة 23453 3592، المملكة العربية السعودية`,
      isPublished: true,
    },
    {
      slug: "refund-policy",
      titleEn: "Refund Policy",
      titleAr: "سياسة الاسترداد",
      contentEn: `# Refund Policy

## Important Notice
Exam vouchers are digital products. Please read this policy carefully before purchasing.

## 1. No Refunds After Delivery
**Once a voucher code has been delivered or revealed, it is non-refundable.**

This is an industry standard practice for exam vouchers because:
- The voucher code can be used immediately after delivery
- We cannot verify if the code has been used

## 2. Cancellation Before Delivery
Orders can be cancelled and refunded only if:
- Payment has been made but voucher codes have NOT yet been sent
- You contact us within 24 hours of payment

## 3. Technical Issues
If you experience technical issues with your voucher:
- Contact us immediately with your order details
- We will work with CompTIA to resolve the issue
- A replacement voucher may be provided if the issue is verified

## 4. Expired Vouchers
**Expired vouchers cannot be refunded or exchanged.**
- Vouchers are valid for 12 months from date of purchase
- It is your responsibility to use the voucher before expiration

## 5. Institution Orders
For bulk institution orders:
- Unused, unassigned vouchers may be returned within 30 days
- A 5% administrative fee applies
- Contact us before returning any vouchers

## 6. Contact for Refund Requests
Email: support@cozeal.ai
Include your order number and reason for the request.`,
      contentAr: `# سياسة الاسترداد

## ملاحظة هامة
قسائم الامتحانات هي منتجات رقمية. يرجى قراءة هذه السياسة بعناية قبل الشراء.

## 1. لا استرداد بعد التسليم
**بمجرد تسليم أو الكشف عن كود القسيمة، لا يمكن استردادها.**

هذه ممارسة قياسية في صناعة قسائم الامتحانات لأن:
- يمكن استخدام كود القسيمة فور التسليم
- لا يمكننا التحقق مما إذا كان الكود قد استُخدم

## 2. الإلغاء قبل التسليم
يمكن إلغاء الطلبات واستردادها فقط إذا:
- تم الدفع ولكن لم يتم إرسال أكواد القسائم بعد
- تواصلت معنا خلال 24 ساعة من الدفع

## 3. المشاكل التقنية
إذا واجهت مشاكل تقنية مع قسيمتك:
- تواصل معنا فوراً مع تفاصيل طلبك
- سنعمل مع CompTIA لحل المشكلة
- قد يتم توفير قسيمة بديلة إذا تم التحقق من المشكلة

## 4. القسائم المنتهية الصلاحية
**لا يمكن استرداد أو استبدال القسائم المنتهية الصلاحية.**
- القسائم صالحة لمدة 12 شهراً من تاريخ الشراء
- أنت مسؤول عن استخدام القسيمة قبل انتهاء صلاحيتها

## 5. طلبات المؤسسات
لطلبات المؤسسات بالجملة:
- يمكن إرجاع القسائم غير المستخدمة وغير المخصصة خلال 30 يوماً
- تُطبق رسوم إدارية بنسبة 5%
- تواصل معنا قبل إرجاع أي قسائم

## 6. التواصل لطلبات الاسترداد
البريد الإلكتروني: support@cozeal.ai
أرفق رقم طلبك وسبب الطلب.`,
      isPublished: true,
    },
    {
      slug: "terms-of-sale",
      titleEn: "Terms of Sale",
      titleAr: "شروط البيع",
      contentEn: `# Terms of Sale

## 1. Products
We sell CompTIA certification exam vouchers. Each voucher is valid for one exam attempt.

## 2. Pricing
- All prices are in Saudi Riyals (SAR)
- Prices include 15% VAT
- Institutional pricing is available upon approval

## 3. Payment
- We accept credit/debit cards via Tap Payments
- Payment must be completed to process your order
- All payments are processed securely

## 4. Delivery
- Voucher codes are delivered via email
- Delivery requires admin review and approval
- Standard delivery: within 24 hours of payment verification

## 5. Voucher Usage
- Vouchers are valid for 12 months from purchase date
- One voucher = one exam attempt
- Vouchers are non-transferable after assignment

## 6. Consumer Rights (Saudi E-Commerce Law)
As per Saudi E-Commerce regulations:
- You have the right to receive complete product information before purchase
- You will receive an order confirmation via email
- Complaints can be filed via support@cozeal.ai

## 7. Seller Information
**Cozeal Vouchers**
- Commercial Registration: 7051993926
- Address: 7290 Muhammad Nur Jakhdar, Alsafa, Jeddah 23453 3592
- Email: info@cozeal.ai`,
      contentAr: `# شروط البيع

## 1. المنتجات
نبيع قسائم امتحانات شهادات CompTIA. كل قسيمة صالحة لمحاولة امتحان واحدة.

## 2. الأسعار
- جميع الأسعار بالريال السعودي
- الأسعار تشمل ضريبة القيمة المضافة 15%
- تتوفر أسعار المؤسسات عند الموافقة

## 3. الدفع
- نقبل البطاقات الائتمانية/مدى عبر Tap Payments
- يجب إتمام الدفع لمعالجة طلبك
- تتم معالجة جميع المدفوعات بشكل آمن

## 4. التسليم
- يتم تسليم أكواد القسائم عبر البريد الإلكتروني
- يتطلب التسليم مراجعة وموافقة الإدارة
- التسليم القياسي: خلال 24 ساعة من التحقق من الدفع

## 5. استخدام القسيمة
- القسائم صالحة لمدة 12 شهراً من تاريخ الشراء
- قسيمة واحدة = محاولة امتحان واحدة
- القسائم غير قابلة للتحويل بعد التخصيص

## 6. حقوق المستهلك (نظام التجارة الإلكترونية السعودي)
وفقاً لأنظمة التجارة الإلكترونية السعودية:
- لديك الحق في تلقي معلومات كاملة عن المنتج قبل الشراء
- ستتلقى تأكيد الطلب عبر البريد الإلكتروني
- يمكن تقديم الشكاوى عبر support@cozeal.ai

## 7. معلومات البائع
**كوزيل للقسائم**
- السجل التجاري: 7051993926
- العنوان: 7290 محمد نور جخدار، الصفا، جدة 23453 3592
- البريد الإلكتروني: info@cozeal.ai`,
      isPublished: true,
    },
  ];

  for (const page of legalPages) {
    await LegalPage.updateOne(
      { slug: page.slug },
      { $set: page },
      { upsert: true }
    );
  }
  console.log(`✓ ${legalPages.length} legal pages seeded`);

  console.log("\n✅ Seeding complete!");
  console.log("\n" + "=".repeat(50));
  console.log("Admin login credentials:");
  console.log("  Email: admin@cozeal.ai");
  console.log("  Password: Cz@Admin#2026!Secure");
  console.log("=".repeat(50));
  console.log("\nCompTIA Certificates seeded:");
  console.log("  - CORE: A+, Network+, Security+");
  console.log("  - INFRASTRUCTURE: Cloud+, Linux+, Server+");
  console.log("  - CYBERSECURITY: CySA+, PenTest+, CASP+");
  console.log("  - DATA: Data+, DataSys+");
  console.log("  - PROFESSIONAL: Project+, CTT+");
  console.log("=".repeat(50));
  console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");
  
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
