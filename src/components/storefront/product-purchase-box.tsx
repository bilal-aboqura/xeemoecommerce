"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Zap, Package, CheckCircle, Banknote, Tag } from "lucide-react";
import { useLang } from "@/components/language/provider";
import { QuantityStepper } from "./quantity-stepper";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import type { ProductDetail } from "@/lib/data/catalog";

export function ProductPurchaseBox({ product }: { product: ProductDetail }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;
  const ar = lang === "ar";

  const name = ar ? product.name_ar : product.name_en;
  const desc = ar ? product.long_desc_ar : product.long_desc_en;
  const image = product.images?.[0] ?? "/images/placeholder.webp";
  const price = Number(product.price);

  function handleAdd() {
    if (out) return;
    addToCart({ id: product.id, slug: product.slug, name_en: product.name_en, name_ar: product.name_ar, price, image, stock: product.stock }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function buyNow() {
    if (out) return;
    addToCart({ id: product.id, slug: product.slug, name_en: product.name_en, name_ar: product.name_ar, price, image, stock: product.stock }, qty);
    router.push("/cart");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-white">
        <Image src={image} alt={name} fill sizes="(max-width:1024px) 100vw, 50vw" priority className="object-contain p-6" />
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h1 className="font-heading text-2xl font-bold leading-tight text-fg sm:text-3xl lg:text-4xl">
          {name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-brand">
            {formatPrice(price, lang)}
          </span>
          {product.compare_at_price && Number(product.compare_at_price) > price && (
            <span className="text-lg text-fg-dim line-through">
              {formatPrice(Number(product.compare_at_price), lang)}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {out ? (
            <span className="pill pill-danger">{t.product.outOfStock}</span>
          ) : (
            <span className="pill pill-success">
              <CheckCircle size={12} />
              {ar ? "متوفر" : "In stock"} &middot; {product.stock} {ar ? "قطعة" : "units"}
            </span>
          )}
          <span className="pill pill-info gap-1">
            <Banknote size={11} />
            {t.product.cod}
          </span>
        </div>

        {product.weight && (
          <div className="mt-4 flex items-center gap-2 text-sm text-fg-dim">
            <Package size={14} />
            <span>{product.weight}</span>
          </div>
        )}

        {/* Volume discount display */}
        <div className="mt-6 glass p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-fg-muted">
            <Tag size={12} className="text-brand" />
            {t.product.qtyDiscount}
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-dim">{t.product.qty2}</span>
              <span className="font-medium text-emerald">{formatPrice(Math.round(price * 2 * 0.9), lang)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-dim">{t.product.qty3}</span>
              <span className="font-medium text-emerald">{formatPrice(Math.round(price * 3 * 0.85), lang)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
          <button onClick={handleAdd} disabled={out} className="btn btn-primary gap-2">
            {added ? <><CheckCircle size={16} /> {ar ? "تمت الإضافة" : "Added"}</> : <><ShoppingBag size={16} /> {t.product.addToCart}</>}
          </button>
          <button onClick={buyNow} disabled={out} className="btn btn-secondary gap-2">
            <Zap size={16} />
            {t.product.buyNow}
          </button>
        </div>

        {/* Description */}
        {desc && (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-dim">
              {ar ? "الوصف" : "Description"}
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-fg-muted">
              {desc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
