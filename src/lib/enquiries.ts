import type { Enquiry } from "@/types/content";

export type EnquiryResult = { ok: true; delivered: boolean } | { ok: false; error: string };

/**
 * Sends an appointment enquiry.
 *
 * When NEXT_PUBLIC_ENQUIRY_ENDPOINT is set (Phase 2: Lead Management + SMTP),
 * the enquiry is posted there as JSON. Until then nothing leaves the browser:
 * the call resolves with `delivered: false` and the form tells the visitor to
 * phone instead, so no one is left believing a message was received.
 */
export async function submitEnquiry(enquiry: Enquiry): Promise<EnquiryResult> {
  const endpoint = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT;

  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { ok: true, delivered: false };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) return { ok: false, error: "We could not send your enquiry. Please try again or call us." };
    return { ok: true, delivered: true };
  } catch {
    return { ok: false, error: "We could not reach the server. Please check your connection or call us." };
  }
}
