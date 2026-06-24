import type { OrderForConfirmation } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";

const WHATSAPP_NUMBER = process.env.WHATSAPP_ALERT_NUMBER;
const SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

/** Build a wa.me link the owner can tap to send themselves / their team the order. */
export function buildOwnerWhatsAppUrl(order: OrderForConfirmation): string {
  if (!WHATSAPP_NUMBER) return "";
  const lines = [
    `🛒 *New Xeemo Order ${order.order_number}*`,
    `Customer: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.city}, ${order.governorate} — ${order.address}`,
    `Payment: ${order.payment_method.toUpperCase()} (${order.payment_status})`,
    `Total: ${formatPrice(Number(order.grand_total), "en")}`,
    "",
    "Items:",
    ...order.order_items.map(
      (i) => `• ${i.name_en} ×${i.quantity} = ${formatPrice(Number(i.price) * i.quantity, "en")}`,
    ),
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/** Best-effort POST of the order to the Google Apps Script webhook. */
export async function mirrorOrderToSheets(order: OrderForConfirmation) {
  if (!SHEETS_WEBHOOK) return;
  const body = {
    name: order.customer_name,
    phone: order.customer_phone,
    secondPhone: "",
    gov: order.governorate,
    city: order.city,
    address: order.address,
    paymentMethod: order.payment_method,
    customerType: "New",
    orderSummary: order.order_items
      .map((i) => `${i.name_en} ×${i.quantity}`)
      .join("\n"),
    total: String(order.grand_total),
    orderNumber: order.order_number,
  };
  try {
    await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
      // Apps Script can be slow; don't block checkout long.
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    // Non-fatal — order is already saved in DB.
    console.error("Sheets mirror failed:", e);
  }
}
