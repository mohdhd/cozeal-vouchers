import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Arabic font from jsDelivr CDN (raw TTF files)
// Using Noto Sans Arabic which has excellent Arabic support
Font.register({
  family: "NotoSansArabic",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansArabic/NotoSansArabic-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// Disable hyphenation to avoid issues
Font.registerHyphenationCallback((word) => [word]);

const primaryColor = "#0891b2";
const darkColor = "#0f172a";
const grayColor = "#64748b";
const lightGray = "#f1f5f9";
const successColor = "#059669";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Arabic text style
  arabicText: {
    fontFamily: "NotoSansArabic",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  logoSection: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 22,
    fontWeight: 700,
    color: primaryColor,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 9,
    color: grayColor,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: darkColor,
    textAlign: "right",
  },
  invoiceMeta: {
    textAlign: "right",
    marginTop: 8,
  },
  metaLabel: {
    fontSize: 9,
    color: grayColor,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 700,
    color: darkColor,
  },
  // Status Badge
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: 700,
  },
  statusTextPaid: {
    color: "#166534",
  },
  statusTextPending: {
    color: "#92400e",
  },
  // Divider
  divider: {
    height: 2,
    backgroundColor: primaryColor,
    marginBottom: 30,
  },
  // Info Section
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  infoBox: {
    width: "48%",
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: primaryColor,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoName: {
    fontSize: 11,
    fontWeight: 700,
    color: darkColor,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  infoText: {
    fontSize: 10,
    color: grayColor,
    marginBottom: 3,
    flexWrap: "wrap",
  },
  // Table
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: darkColor,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: {
    backgroundColor: lightGray,
  },
  col1: { width: "50%" },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "17.5%", textAlign: "right" },
  col4: { width: "17.5%", textAlign: "right" },
  cellText: {
    fontSize: 10,
    color: darkColor,
  },
  cellTextBold: {
    fontWeight: 700,
  },
  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: 280,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  totalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 10,
    color: grayColor,
  },
  totalValue: {
    fontSize: 10,
    color: darkColor,
    fontWeight: 700,
  },
  discountLabel: {
    color: successColor,
  },
  discountValue: {
    color: successColor,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 5,
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: 700,
  },
  grandTotalValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: 700,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 9,
    color: grayColor,
    textAlign: "center",
    marginBottom: 3,
  },
  footerThankYou: {
    fontSize: 10,
    color: darkColor,
    textAlign: "center",
    marginTop: 10,
    fontWeight: 700,
  },
});

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string;
    date: Date;
  };
  order: {
    orderNumber: string;
    universityName: string;
    customerVatNumber?: string;
    contactName: string;
    email: string;
    phone: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
    status: string;
  };
  company: {
    nameEn: string;
    nameAr: string;
    vatNumber: string;
    crNumber: string;
  };
}

// Helper to detect if text contains Arabic characters
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

// Component to render text with proper font based on content
function SmartText({ children, style, ...props }: { children: string; style?: any; [key: string]: any }) {
  const isArabic = containsArabic(children);
  return (
    <Text 
      style={[
        style, 
        isArabic && styles.arabicText,
        { maxWidth: "100%" }
      ]} 
      wrap={true}
      {...props}
    >
      {children}
    </Text>
  );
}

export function InvoicePDF({ invoice, order, company }: InvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const isPaid = order.status === "PAID";
  const originalSubtotal = order.subtotal + order.discountAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.companyName}>Cozeal Vouchers</Text>
            <Text style={styles.tagline}>Official CompTIA Partner</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceMeta}>
              <Text style={styles.metaLabel}>Invoice Number</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
              <Text style={[styles.metaLabel, { marginTop: 8 }]}>Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.date)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isPaid ? styles.statusPaid : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isPaid ? styles.statusTextPaid : styles.statusTextPending,
                ]}
              >
                {isPaid ? "PAID" : "PENDING"}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bill To / From Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <View style={{ marginBottom: 6 }}>
              <SmartText style={styles.infoName}>{order.universityName}</SmartText>
            </View>
            {order.customerVatNumber ? (
              <Text style={[styles.infoText, { fontWeight: 700, marginBottom: 3 }]}>
                VAT: {order.customerVatNumber}
              </Text>
            ) : null}
            <View style={{ marginBottom: 3 }}>
              <SmartText style={styles.infoText}>{order.contactName}</SmartText>
            </View>
            <Text style={styles.infoText}>{order.email}</Text>
            <Text style={styles.infoText}>{order.phone}</Text>
          </View>
          <View style={[styles.infoBox, { textAlign: "right" }]}>
            <Text style={styles.infoTitle}>From</Text>
            <Text style={styles.infoName}>{company.nameEn}</Text>
            <Text style={styles.infoText}>info@cozeal.ai</Text>
            <Text style={styles.infoText}>7290 Muhammad Nur Jakhdar, Alsafa</Text>
            <Text style={styles.infoText}>Jeddah 23453 3592, Saudi Arabia</Text>
            {company.vatNumber && (
              <Text style={styles.infoText}>VAT: {company.vatNumber}</Text>
            )}
            <Text style={styles.infoText}>CR: 7051993926</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={[styles.cellText, styles.cellTextBold]}>
                CompTIA Security+ Exam Voucher
              </Text>
              <Text style={[styles.cellText, { fontSize: 9, color: grayColor, marginTop: 3 }]}>
                SY0-701 Certification Exam
              </Text>
            </View>
            <Text style={[styles.cellText, styles.col2]}>{order.quantity}</Text>
            <Text style={[styles.cellText, styles.col3]}>
              {formatCurrency(order.unitPrice)} SAR
            </Text>
            <Text style={[styles.cellText, styles.cellTextBold, styles.col4]}>
              {formatCurrency(originalSubtotal)} SAR
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(originalSubtotal)} SAR
              </Text>
            </View>
            {order.discountAmount > 0 && (
              <View style={[styles.totalRow, styles.totalRowBorder]}>
                <Text style={[styles.totalLabel, styles.discountLabel]}>
                  Discount
                </Text>
                <Text style={[styles.totalValue, styles.discountValue]}>
                  -{formatCurrency(order.discountAmount)} SAR
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalLabel}>VAT (15%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(order.vatAmount)} SAR
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(order.totalAmount)} SAR
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {company.nameEn} • Official CompTIA Authorized Partner
          </Text>
          <Text style={styles.footerText}>
            7290 Muhammad Nur Jakhdar, Alsafa, Jeddah 23453 3592, Saudi Arabia
          </Text>
          <Text style={styles.footerText}>
            Email: info@cozeal.ai • CR: 7051993926
            {company.vatNumber ? ` • VAT: ${company.vatNumber}` : ""}
          </Text>
          <Text style={styles.footerThankYou}>
            Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
}
