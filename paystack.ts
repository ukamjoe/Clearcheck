// src/lib/paystack.ts
//
// Thin wrapper around the Paystack REST API. No SDK needed — Paystack's API
// is plain REST/JSON, same pattern used for ReceiptFlow AI and CyberStore.

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export interface InitializeTransactionParams {
  email: string;
  amountNaira: number; // human-readable Naira amount; converted to kobo internally
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100), // Naira -> kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack initialize failed (${res.status}): ${text}`);
  }

  return res.json();
}

export interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // in kobo
    paid_at: string | null;
    metadata: Record<string, unknown>;
  };
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyTransactionResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack verify failed (${res.status}): ${text}`);
  }

  return res.json();
}

// Pricing — kept in one place so it's easy to tune.
// Matches the build plan: one-time doc pack vs. ongoing annual compliance tracking.
export const PRICING = {
  ONE_TIME_PACK: 25000, // ₦25,000 — all 5 documents, one business
  ANNUAL_SUBSCRIPTION: 96000, // ₦8,000/mo billed annually — documents + deadline tracking
} as const;
