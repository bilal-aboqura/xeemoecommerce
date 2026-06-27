import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCheckoutSettings } from "@/lib/data/catalog";
import { calcItemsSubtotal, calcVolumeDiscount } from "@/lib/pricing";

export interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  alt_phone?: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
  payment_method: "card" | "cod";
  discount_code?: string | null;
  user_id?: string | null;
  items: {
    product_id: string;
    name_en: string;
    name_ar?: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
}

export interface CreatedOrder {
  id: string;
  order_number: string;
  grand_total: number;
  payment_method: string;
}

/** Generate a short, human-friendly order number like XE-1A2B3C-240624 */
export function generateOrderNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `XE-${rand}-${yy}${mm}${dd}`;
}

export interface ShippingQuote {
  cost: number;
  matched: "exact" | "governorate" | "default";
}

/** Resolve shipping cost: exact (gov,city) → (gov,'*') → ('*','*'). */
export async function getShippingCost(
  governorate: string,
  city: string,
): Promise<ShippingQuote> {
  const sb = getSupabaseServiceClient();
  if (!sb) return { cost: 120, matched: "default" };

  // 1) exact
  let { data } = await sb
    .from("shipping_rates")
    .select("cost")
    .eq("governorate", governorate)
    .eq("city", city)
    .maybeSingle();
  if (data) return { cost: Number(data.cost), matched: "exact" };

  // 2) governorate wildcard
  ({ data } = await sb
    .from("shipping_rates")
    .select("cost")
    .eq("governorate", governorate)
    .eq("city", "*")
    .maybeSingle());
  if (data) return { cost: Number(data.cost), matched: "governorate" };

  // 3) global default
  ({ data } = await sb
    .from("shipping_rates")
    .select("cost")
    .eq("governorate", "*")
    .eq("city", "*")
    .maybeSingle());
  return { cost: Number(data?.cost ?? 120), matched: "default" };
}

/** Look up + validate a discount code; returns the discount amount for a subtotal. */
export async function resolveDiscount(
  code: string | null | undefined,
  subtotal: number,
): Promise<{ amount: number; code: string } | null> {
  if (!code) return null;
  const sb = getSupabaseServiceClient();
  if (!sb) return null;
  const { data } = await sb
    .from("discounts")
    .select("id, code, type, value, min_subtotal, expires_at, usage_limit, used_count, active")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.usage_limit && data.used_count >= data.usage_limit) return null;
  if (subtotal < Number(data.min_subtotal ?? 0)) return null;

  let amount = 0;
  if (data.type === "percent") {
    amount = Math.round(subtotal * (Number(data.value) / 100) * 100) / 100;
  } else {
    amount = Math.min(Number(data.value), subtotal);
  }
  return { amount, code: data.code };
}

/**
 * Volume discount: 2 of the same product → 10% off the first 2 units,
 * 3+ → 15% off the first 3 units. Returns total discount amount across all qualifying items.
 */
export function calcLegacyVolumeDiscount(
  items: CreateOrderInput["items"],
): number {
  return calcVolumeDiscount(items);
}

/**
 * Create an order (with line items + snapshot). Uses the service role.
 * For COD the order is immediately "pending payment / pending fulfillment".
 * For card it stays pending until the Kashier webhook marks it paid.
 *
 * Applies volume discounts automatically (2 → 10%, 3+ → 15% per line item).
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreatedOrder | null> {
  const sb = getSupabaseServiceClient();
  if (!sb || input.items.length === 0) return null;

  const itemsTotal = calcItemsSubtotal(input.items);
  const volumeDiscount = calcVolumeDiscount(input.items);
  const [shipping, checkoutSettings] = await Promise.all([
    getShippingCost(input.governorate, input.city),
    getCheckoutSettings(),
  ]);
  const shippingCost =
    itemsTotal >= checkoutSettings.freeShippingThreshold ? 0 : shipping.cost;
  const codeDiscount = await resolveDiscount(input.discount_code, itemsTotal);
  const totalDiscount = volumeDiscount + (codeDiscount?.amount ?? 0);
  const grandTotal = Math.max(
    0,
    itemsTotal + shippingCost - totalDiscount,
  );

  // ensure a unique order number (retry on rare collision)
  let order_number = generateOrderNumber();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: exists } = await sb
      .from("orders")
      .select("id")
      .eq("order_number", order_number)
      .maybeSingle();
    if (!exists) break;
    order_number = generateOrderNumber();
  }

  const { data: order, error } = await sb
    .from("orders")
    .insert({
      order_number,
      user_id: input.user_id ?? null,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      alt_phone: input.alt_phone ?? null,
      governorate: input.governorate,
      city: input.city,
      address: input.address,
      notes: input.notes ?? null,
      items_total: itemsTotal,
      shipping_cost: shippingCost,
      discount: totalDiscount,
      discount_code: codeDiscount?.code ?? null,
      grand_total: grandTotal,
      payment_method: input.payment_method,
      payment_status: "pending",
      fulfillment_status: "pending",
    })
    .select("id, order_number, grand_total, payment_method")
    .single();
  if (error || !order) {
    console.error("createOrder insert failed:", error?.message);
    return null;
  }

  const orderItems = input.items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    name_en: i.name_en,
    name_ar: i.name_ar ?? null,
    price: Number(i.price),
    quantity: i.quantity,
    image: i.image ?? null,
  }));
  const { error: itemsErr } = await sb.from("order_items").insert(orderItems);
  if (itemsErr) console.error("order_items insert failed:", itemsErr.message);

  return order;
}

export interface OrderForConfirmation {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  governorate: string;
  city: string;
  address: string;
  items_total: number;
  shipping_cost: number;
  discount: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  order_items: {
    id: string;
    name_en: string;
    name_ar: string | null;
    price: number;
    quantity: number;
    image: string | null;
  }[];
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderForConfirmation | null> {
  const sb = getSupabaseServiceClient();
  if (!sb) return null;
  const { data } = await sb
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, governorate, city, address, items_total, shipping_cost, discount, grand_total, payment_method, payment_status, fulfillment_status, created_at, order_items(id, name_en, name_ar, price, quantity, image)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();
  return (data as OrderForConfirmation) ?? null;
}
