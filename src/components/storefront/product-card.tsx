"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star, Banknote } from "lucide-react";
import { useLang } from "@/components/language/provider";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import type { ProductCard as ProductCardData } from "@/lib/data/catalog";

export function ProductCard({ product }: { product: ProductCardData }) {
  const { t, lang } = useLang();
  const name = lang === "ar" ? product.name_ar : product.name_en;
  const image = product.images?.[0] ?? "/images/placeholder.webp";
  const outOfStock = product.stock <= 0;
  const ar = lang === "ar";

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart({
      id: product.id,
      slug: product.slug,
      name_en: product.name_en,
      name_ar: product.name_ar,
      price: Number(product.price),
      image,
      stock: product.stock,
    });
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:shadow-xl hover:shadow-black/20"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="pill pill-danger gap-1">
              <Star size={10} />
              {ar ? "مميز" : "Featured"}
            </span>
          )}
        </div>

        {/* Quick add */}
        {!outOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white opacity-0 shadow-lg shadow-brand/30 transition-all duration-300 hover:bg-brand-dark group-hover:opacity-100"
            aria-label="Quick add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white/80">
              {ar ? "غير متوفر" : "Out of stock"}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-fg">
          {name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-bold text-brand">
            {formatPrice(Number(product.price), lang)}
          </span>
          {product.compare_at_price &&
            Number(product.compare_at_price) > Number(product.price) && (
              <span className="text-xs text-fg-dim line-through">
                {formatPrice(Number(product.compare_at_price), lang)}
              </span>
            )}
        </div>
        {/* COD trust badge */}
        <span className="flex items-center gap-1 text-[11px] text-fg-dim">
          <Banknote size={10} className="text-emerald" />
          {t.product.cod}
        </span>
      </div>
    </Link>
  );
}
