import { NextResponse, type NextRequest } from "next/server";
import { getShippingCost } from "@/lib/data/orders";

/** GET /api/shipping?governorate=...&city=... → { cost, matched } */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const governorate = searchParams.get("governorate") ?? "";
  const city = searchParams.get("city") ?? "";
  if (!governorate || !city) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  const quote = await getShippingCost(governorate, city);
  return NextResponse.json(quote);
}
