import { NextResponse } from "next/server";
import { getGovernoratesForCheckout } from "@/lib/data/locations";
import { getCheapestInCategory } from "@/lib/data/catalog";

/** GET /api/checkout-data → { governorates, bumpProduct } for the checkout form. */
export async function GET() {
  const [governorates, bumpProduct] = await Promise.all([
    getGovernoratesForCheckout(),
    getCheapestInCategory("air-freshener"),
  ]);

  return NextResponse.json({
    governorates,
    bumpProduct: bumpProduct
      ? {
          id: bumpProduct.id,
          slug: bumpProduct.slug,
          name_en: bumpProduct.name_en,
          name_ar: bumpProduct.name_ar,
          originalPrice: Number(bumpProduct.price),
          bumpPrice: 280,
          image: bumpProduct.images?.[0] ?? null,
          stock: bumpProduct.stock,
        }
      : null,
  });
}
