import "server-only";

import { createHash } from "node:crypto";

interface MetaOrderItem {
  product_id: string | null;
  price: number;
  quantity: number;
}

interface CancelledOrder {
  id: string;
  order_number: string;
  customer_phone: string;
  grand_total: number;
  order_items: MetaOrderItem[] | null;
}

const pixelId =
  process.env.META_PIXEL_ID ??
  process.env.NEXT_PUBLIC_META_PIXEL_ID ??
  "1531675262043662";
const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
const graphVersion = process.env.META_GRAPH_API_VERSION ?? "v23.0";

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendCancelledOrderToMeta(order: CancelledOrder) {
  if (!accessToken) return;

  const contents = (order.order_items ?? [])
    .filter((item) => item.product_id)
    .map((item) => ({
      id: item.product_id as string,
      quantity: item.quantity,
      item_price: Number(item.price),
    }));

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${pixelId}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "OrderCancelled",
            event_time: Math.floor(Date.now() / 1000),
            event_id: `${order.id}:cancelled`,
            action_source: "website",
            event_source_url: process.env.NEXT_PUBLIC_SITE_URL,
            user_data: { ph: [sha256(order.customer_phone.replace(/\D/g, ""))] },
            custom_data: {
              currency: "EGP",
              value: Number(order.grand_total),
              order_id: order.order_number,
              content_type: "product",
              content_ids: contents.map((item) => item.id),
              contents,
            },
          },
        ],
        access_token: accessToken,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("Meta CAPI cancelled-order event failed:", response.status);
  }
}
