import nodemailer from "nodemailer";

// Email configuration using Google Workspace SMTP Relay
// When server IP is whitelisted in Google Workspace, no auth is needed
const smtpConfig: any = {
  host: process.env.SMTP_HOST || "smtp-relay.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587 (STARTTLS)
  tls: {
    rejectUnauthorized: false,
  },
};

// Only add auth if credentials are provided
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  smtpConfig.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

const transporter = nodemailer.createTransport(smtpConfig);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Cozeal Vouchers"}" <${process.env.EMAIL_FROM || "info@cozeal.ai"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// Email Templates

export function getVerificationEmailHtml(name: string, verificationUrl: string, locale: string = "en"): string {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const content = isArabic
    ? {
      greeting: `مرحباً ${name}،`,
      title: "تأكيد بريدك الإلكتروني",
      message: "شكراً لتسجيلك في Cozeal Vouchers. يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني.",
      button: "تأكيد البريد الإلكتروني",
      expiry: "هذا الرابط صالح لمدة 24 ساعة.",
      ignore: "إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد.",
    }
    : {
      greeting: `Hello ${name},`,
      title: "Verify Your Email",
      message: "Thank you for registering with Cozeal Vouchers. Please click the button below to verify your email address.",
      button: "Verify Email",
      expiry: "This link is valid for 24 hours.",
      ignore: "If you didn't create an account, you can safely ignore this email.",
    };

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${content.title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: ${isArabic ? "right" : "left"};">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">${content.greeting}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">${content.message}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 14px;">${content.button}</a>
                  </div>
                  <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">${content.expiry}</p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">${content.ignore}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cozeal Vouchers. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailHtml(name: string, resetUrl: string, locale: string = "en"): string {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const content = isArabic
    ? {
      greeting: `مرحباً ${name}،`,
      title: "إعادة تعيين كلمة المرور",
      message: "لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة.",
      button: "إعادة تعيين كلمة المرور",
      expiry: "هذا الرابط صالح لمدة ساعة واحدة.",
      ignore: "إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.",
    }
    : {
      greeting: `Hello ${name},`,
      title: "Reset Your Password",
      message: "You requested to reset your password. Click the button below to create a new password.",
      button: "Reset Password",
      expiry: "This link is valid for 1 hour.",
      ignore: "If you didn't request a password reset, you can safely ignore this email.",
    };

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${content.title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: ${isArabic ? "right" : "left"};">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">${content.greeting}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">${content.message}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 14px;">${content.button}</a>
                  </div>
                  <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">${content.expiry}</p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">${content.ignore}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cozeal Vouchers. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getVoucherDeliveryEmailHtml(
  recipientName: string,
  voucherCode: string,
  certificateName: string,
  expiryDate: string,
  institutionName: string | null,
  locale: string = "en"
): string {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const content = isArabic
    ? {
      greeting: `مرحباً ${recipientName}،`,
      title: "قسيمة امتحان CompTIA الخاصة بك",
      fromInstitution: institutionName ? `من ${institutionName}` : "",
      certificate: "الشهادة",
      voucherCode: "رمز القسيمة",
      validUntil: "صالحة حتى",
      scheduleExam: "جدولة الامتحان الآن",
      instructions: "لاستخدام قسيمتك، قم بزيارة موقع CompTIA وأدخل الرمز أعلاه عند جدولة امتحانك.",
      support: "إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.",
    }
    : {
      greeting: `Hello ${recipientName},`,
      title: "Your CompTIA Exam Voucher",
      fromInstitution: institutionName ? `from ${institutionName}` : "",
      certificate: "Certificate",
      voucherCode: "Voucher Code",
      validUntil: "Valid Until",
      scheduleExam: "Schedule Your Exam",
      instructions: "To use your voucher, visit the CompTIA website and enter the code above when scheduling your exam.",
      support: "If you have any questions, feel free to contact us.",
    };

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${content.title}</h1>
                  ${content.fromInstitution ? `<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">${content.fromInstitution}</p>` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: ${isArabic ? "right" : "left"};">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 30px;">${content.greeting}</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 10px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase;">${content.certificate}</p>
                        <p style="color: #059669; font-size: 18px; font-weight: 600; margin: 5px 0 0;">${certificateName}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase;">${content.voucherCode}</p>
                        <p style="color: #111827; font-size: 24px; font-weight: 700; font-family: monospace; margin: 5px 0 0; letter-spacing: 2px;">${voucherCode}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase;">${content.validUntil}</p>
                        <p style="color: #374151; font-size: 16px; margin: 5px 0 0;">${expiryDate}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.comptia.org/testing/testing-options/schedule-your-exam" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 14px;">${content.scheduleExam}</a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">${content.instructions}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">${content.support}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cozeal Vouchers. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getOrderConfirmationEmailHtml(
  customerName: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  subtotal: number,
  discount: number,
  vat: number,
  total: number,
  locale: string = "en"
): string {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const content = isArabic
    ? {
      greeting: `مرحباً ${customerName}،`,
      title: "تأكيد الطلب",
      message: "شكراً لطلبك! تم استلام الدفع بنجاح.",
      orderNumber: "رقم الطلب",
      item: "المنتج",
      qty: "الكمية",
      price: "السعر",
      subtotal: "المجموع الفرعي",
      discount: "الخصم",
      vat: "ضريبة القيمة المضافة (15%)",
      total: "الإجمالي",
      nextSteps: "الخطوات التالية",
      nextStepsMessage: "سيتم إرسال رموز القسائم الخاصة بك إلى بريدك الإلكتروني قريباً.",
      sar: "ر.س",
    }
    : {
      greeting: `Hello ${customerName},`,
      title: "Order Confirmation",
      message: "Thank you for your order! Your payment has been received successfully.",
      orderNumber: "Order Number",
      item: "Item",
      qty: "Qty",
      price: "Price",
      subtotal: "Subtotal",
      discount: "Discount",
      vat: "VAT (15%)",
      total: "Total",
      nextSteps: "Next Steps",
      nextStepsMessage: "Your voucher codes will be sent to your email shortly.",
      sar: "SAR",
    };

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: ${isArabic ? "left" : "right"};">${item.price.toFixed(2)} ${content.sar}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${content.title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: ${isArabic ? "right" : "left"};">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 10px;">${content.greeting}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">${content.message}</p>
                  
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">${content.orderNumber}</p>
                    <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 5px 0 0;">${orderNumber}</p>
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; text-align: ${isArabic ? "right" : "left"}; font-size: 12px; color: #6b7280; text-transform: uppercase;">${content.item}</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">${content.qty}</th>
                        <th style="padding: 12px; text-align: ${isArabic ? "left" : "right"}; font-size: 12px; color: #6b7280; text-transform: uppercase;">${content.price}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">${content.subtotal}</td>
                      <td style="padding: 8px 0; text-align: ${isArabic ? "left" : "right"}; color: #374151;">${subtotal.toFixed(2)} ${content.sar}</td>
                    </tr>
                    ${discount > 0 ? `
                    <tr>
                      <td style="padding: 8px 0; color: #10b981;">${content.discount}</td>
                      <td style="padding: 8px 0; text-align: ${isArabic ? "left" : "right"}; color: #10b981;">-${discount.toFixed(2)} ${content.sar}</td>
                    </tr>
                    ` : ""}
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">${content.vat}</td>
                      <td style="padding: 8px 0; text-align: ${isArabic ? "left" : "right"}; color: #374151;">${vat.toFixed(2)} ${content.sar}</td>
                    </tr>
                    <tr style="border-top: 2px solid #e5e7eb;">
                      <td style="padding: 12px 0; color: #111827; font-weight: 700; font-size: 18px;">${content.total}</td>
                      <td style="padding: 12px 0; text-align: ${isArabic ? "left" : "right"}; color: #111827; font-weight: 700; font-size: 18px;">${total.toFixed(2)} ${content.sar}</td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 5px;">${content.nextSteps}</p>
                    <p style="color: #a16207; font-size: 14px; margin: 0;">${content.nextStepsMessage}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cozeal Vouchers. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getInstitutionApprovedEmailHtml(
  contactName: string,
  institutionName: string,
  loginUrl: string,
  locale: string = "en"
): string {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const content = isArabic
    ? {
      greeting: `مرحباً ${contactName}،`,
      title: "تمت الموافقة على حسابكم!",
      message: `يسعدنا إبلاغكم بأنه تمت الموافقة على حساب ${institutionName} في Cozeal Vouchers.`,
      benefits: "يمكنكم الآن الاستفادة من الأسعار الخاصة بالمؤسسات.",
      button: "تسجيل الدخول الآن",
    }
    : {
      greeting: `Hello ${contactName},`,
      title: "Your Account Has Been Approved!",
      message: `We're pleased to inform you that ${institutionName}'s account has been approved on Cozeal Vouchers.`,
      benefits: "You can now enjoy institutional pricing on all CompTIA exam vouchers.",
      button: "Login Now",
    };

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✓ ${content.title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: ${isArabic ? "right" : "left"};">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">${content.greeting}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 15px;">${content.message}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">${content.benefits}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 14px;">${content.button}</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cozeal Vouchers. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getInstitutionRejectedEmailHtml(
  contactName: string,
  institutionName: string,
  rejectionReason: string,
  locale: string = "en"
): string {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const content = isArabic
    ? {
      greeting: `مرحباً ${contactName}،`,
      title: "تحديث حالة الطلب",
      message: `نأسف لإبلاغكم بأنه تم رفض طلب تسجيل ${institutionName} في Cozeal Vouchers.`,
      reason: "السبب",
      contact: "إذا كنت تعتقد أن هذا خطأ أو لديك أي استفسارات، يرجى التواصل معنا.",
    }
    : {
      greeting: `Hello ${contactName},`,
      title: "Application Status Update",
      message: `We regret to inform you that ${institutionName}'s registration application to Cozeal Vouchers has been declined.`,
      reason: "Reason",
      contact: "If you believe this is an error or have any questions, please contact us.",
    };

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${content.title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: ${isArabic ? "right" : "left"};">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">${content.greeting}</p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">${content.message}</p>
                  
                  <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
                    <p style="color: #991b1b; font-size: 12px; margin: 0 0 5px; text-transform: uppercase;">${content.reason}</p>
                    <p style="color: #b91c1c; font-size: 14px; margin: 0;">${rejectionReason}</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">${content.contact}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cozeal Vouchers. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
