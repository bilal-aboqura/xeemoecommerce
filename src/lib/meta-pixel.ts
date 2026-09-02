"use client";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1052393730508570";

type MetaPixelParams = Record<
  string,
  string | number | boolean | undefined | string[] | MetaPixelContent[]
>;

export interface MetaPixelContent {
  id: string;
  quantity?: number;
  item_price?: number;
}

declare global {
  interface Window {
    fbq?: (action: "track", event: string, params?: MetaPixelParams) => void;
  }
}

export function trackMetaEvent(event: string, params?: MetaPixelParams) {
  if (window.fbq) {
    window.fbq("track", event, params);
    return;
  }

  window.addEventListener(
    "meta-pixel-ready",
    () => window.fbq?.("track", event, params),
    { once: true },
  );
}

export function productMetaParams(product: {
  id: string;
  price: number;
  quantity?: number;
}) {
  return {
    content_ids: [product.id],
    content_type: "product",
    contents: [
      {
        id: product.id,
        quantity: product.quantity ?? 1,
        item_price: Number(product.price),
      },
    ],
    value: Number(product.price) * (product.quantity ?? 1),
    currency: "EGP",
  };
}
