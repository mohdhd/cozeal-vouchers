/**
 * ZATCA-Compliant QR Code Generator for Saudi Arabia E-Invoicing
 * 
 * This generates QR codes that comply with ZATCA (Zakat, Tax and Customs Authority)
 * requirements for electronic invoicing in Saudi Arabia.
 * 
 * The QR code contains TLV (Tag-Length-Value) encoded data:
 * - Tag 1: Seller's name
 * - Tag 2: VAT registration number
 * - Tag 3: Invoice timestamp (ISO 8601 format)
 * - Tag 4: Invoice total (with VAT)
 * - Tag 5: Total VAT amount
 * 
 * The TLV data is then Base64 encoded for the QR code.
 */

/**
 * Creates a TLV (Tag-Length-Value) encoded byte array for a single field
 */
function createTLV(tag: number, value: string): Uint8Array {
  const valueBytes = new TextEncoder().encode(value);
  const tlv = new Uint8Array(2 + valueBytes.length);
  tlv[0] = tag;
  tlv[1] = valueBytes.length;
  tlv.set(valueBytes, 2);
  return tlv;
}

/**
 * Concatenates multiple Uint8Arrays into one
 */
function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Converts a Uint8Array to Base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface ZATCAQRData {
  sellerName: string;
  vatNumber: string;
  timestamp: Date;
  totalAmount: number;
  vatAmount: number;
}

/**
 * Generates ZATCA-compliant QR code data (Base64 encoded TLV)
 * 
 * @param data - The invoice data required for ZATCA QR code
 * @returns Base64 encoded TLV string for QR code generation
 */
export function generateZATCAQRData(data: ZATCAQRData): string {
  // Format timestamp as ISO 8601 (ZATCA requires: yyyy-MM-ddTHH:mm:ssZ)
  const timestamp = data.timestamp.toISOString().split('.')[0] + 'Z';
  
  // Format amounts with 2 decimal places
  const totalAmount = data.totalAmount.toFixed(2);
  const vatAmount = data.vatAmount.toFixed(2);
  
  // Create TLV for each required field
  const tlv1 = createTLV(1, data.sellerName);      // Seller's name
  const tlv2 = createTLV(2, data.vatNumber);       // VAT registration number
  const tlv3 = createTLV(3, timestamp);            // Invoice timestamp
  const tlv4 = createTLV(4, totalAmount);          // Invoice total (with VAT)
  const tlv5 = createTLV(5, vatAmount);            // Total VAT amount
  
  // Concatenate all TLV fields
  const allTLV = concatUint8Arrays(tlv1, tlv2, tlv3, tlv4, tlv5);
  
  // Convert to Base64
  return uint8ArrayToBase64(allTLV);
}

/**
 * Validates if the provided data is sufficient for ZATCA QR code generation
 */
export function validateZATCAData(data: Partial<ZATCAQRData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.sellerName || data.sellerName.trim().length === 0) {
    errors.push('Seller name is required');
  }
  
  if (!data.vatNumber || data.vatNumber.trim().length === 0) {
    errors.push('VAT number is required');
  }
  
  if (!data.timestamp || !(data.timestamp instanceof Date)) {
    errors.push('Valid timestamp is required');
  }
  
  if (typeof data.totalAmount !== 'number' || data.totalAmount < 0) {
    errors.push('Valid total amount is required');
  }
  
  if (typeof data.vatAmount !== 'number' || data.vatAmount < 0) {
    errors.push('Valid VAT amount is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
