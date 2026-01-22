import "server-only";

const TAP_API_URL = "https://api.tap.company/v2";

export interface TapChargeRequest {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  orderId: string;
  metadata?: Record<string, string>;
  redirectUrl: string;
}

export interface TapChargeResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  transaction?: {
    url: string;
  };
  redirect?: {
    url: string;
  };
  response?: {
    code: string;
    message: string;
  };
}

export async function createTapCharge(request: TapChargeRequest): Promise<TapChargeResponse> {
  const secretKey = process.env.TAP_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("TAP_SECRET_KEY is not configured");
  }

  const nameParts = request.customerName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const response = await fetch(`${TAP_API_URL}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: request.description,
      metadata: {
        order_id: request.orderId,
        ...request.metadata,
      },
      receipt: {
        email: true,
        sms: false,
      },
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: request.customerEmail,
        phone: {
          country_code: "966",
          number: request.customerPhone.replace(/^0/, "").replace(/^\+966/, ""),
        },
      },
      source: {
        id: "src_all",
      },
      redirect: {
        url: request.redirectUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Tap API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

export async function getTapCharge(chargeId: string): Promise<TapChargeResponse> {
  const secretKey = process.env.TAP_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("TAP_SECRET_KEY is not configured");
  }

  const response = await fetch(`${TAP_API_URL}/charges/${chargeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Tap API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

export function verifyTapWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // Tap uses a simple hash verification
  // In production, implement proper HMAC verification based on Tap's documentation
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");
  
  return signature === expectedSignature;
}

export type TapChargeStatus = "INITIATED" | "AUTHORIZED" | "CAPTURED" | "DECLINED" | "CANCELLED" | "FAILED";

export function isPaymentSuccessful(status: string): boolean {
  return status === "CAPTURED";
}
