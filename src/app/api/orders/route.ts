import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/data/orders";
import { createCheckoutUrl } from "@/lib/kashier";

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  name_en: z.string().min(1),
  name_ar: z.string().optional(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
});

const BodySchema = z.object({
  customer_name: z.string().min(2).max(120),
  customer_phone: z.string().min(6).max(20),
  alt_phone: z.string().max(20).optional(),
  governorate: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(3).max(500),
  notes: z.string().max(1000).optional(),
  payment_method: z.enum(["card", "cod"]),
  discount_code: z.string().optional().nullable(),
  items: z.array(ItemSchema).min(1),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const order = await createOrder({
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    alt_phone: input.alt_phone,
    governorate: input.governorate,
    city: input.city,
    address: input.address,
    notes: input.notes,
    payment_method: input.payment_method,
    discount_code: input.discount_code ?? null,
    items: input.items,
  });

  if (!order) {
    return NextResponse.json(
      { error: "Could not create order. Please try again." },
      { status: 500 },
    );
  }

  // COD: order is complete; redirect to the confirmation page.
  if (input.payment_method === "cod") {
    return NextResponse.json({
      order_number: order.order_number,
      redirect: `/checkout/success?order=${order.order_number}`,
    });
  }

  // Card: build the Kashier hosted-checkout URL.
  try {
    const checkoutUrl = createCheckoutUrl({
      orderId: order.order_number,
      amount: Number(order.grand_total),
      metaData: {
        orderId: order.id,
        orderNumber: order.order_number,
      },
      customerName: input.customer_name,
    });
    return NextResponse.json({
      order_number: order.order_number,
      redirect: checkoutUrl,
    });
  } catch (e) {
    console.error("Kashier checkout URL failed:", e);
    return NextResponse.json(
      {
        error: "Payment gateway is not configured. Try Cash on Delivery instead.",
        order_number: order.order_number,
      },
      { status: 502 },
    );
  }
}
