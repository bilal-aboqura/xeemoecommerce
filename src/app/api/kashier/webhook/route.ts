import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature, extractWebhookResult } from "@/lib/kashier";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getOrderByNumber } from "@/lib/data/orders";
import { mirrorOrderToSheets, buildOwnerWhatsAppUrl } from "@/lib/notifications";

/**
 * Kashier webhook — the authoritative source of payment status.
 * Verifies the HMAC signature, marks the order paid, then mirrors to
 * Google Sheets + builds the owner WhatsApp alert link (logged).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!verifyWebhookSignature(body as never)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = extractWebhookResult(body as never);
  if (!result.orderId) {
    return NextResponse.json({ ok: true }); // acknowledge unknown events
  }

  const sb = getSupabaseServiceClient();
  if (!sb) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }

  // Only mark paid on success events. Kashier events include "pay" (success)
  // and "refund"/"chargeback" (failure). We treat any non-success as failure.
  const isSuccess =
    result.event === "pay" ||
    /^success$/i.test(result.status) ||
    /^paid$/i.test(result.status);

  const { error } = await sb
    .from("orders")
    .update({
      payment_status: isSuccess ? "paid" : "failed",
      kashier_payment_id: result.kashierPaymentId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", result.orderId)
    .eq("payment_method", "card");

  if (error) {
    console.error("webhook order update failed:", error.message);
  }

  // Best-effort notifications (don't block the webhook response).
  if (isSuccess) {
    const order = await getOrderByNumber(result.orderId);
    if (order) {
      void mirrorOrderToSheets(order).catch(() => {});
      // The WhatsApp link is for the owner to open manually; log it so an
      // admin tool can surface it later. (True server-side WhatsApp Business
      // API sending is a paid add-on — out of scope for now.)
      console.log(
        `[order ${order.order_number}] owner WhatsApp alert: ${buildOwnerWhatsAppUrl(order)}`,
      );
    }
  }

  return NextResponse.json({ ok: true });
}
