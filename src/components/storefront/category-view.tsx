"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpDown, ChevronRight } from "lucide-react";
import { useLang } from "@/components/language/provider";
import { ProductCard } from "@/components/storefront/product-card";
import { formatPrice } from "@/lib/utils";
import type { CategoryInfo, ProductCard as ProductData } from "@/lib/data/catalog";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

export function CategoryView({
  category,
  products,
}: {
  category: CategoryInfo;
  products: ProductData[];
}) {
  const { lang } = useLang();
  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const ar = lang === "ar";

  const name = ar ? category.name_ar : category.name_en;

  const priceCeiling = useMemo(
    () => products.reduce((m, p) => Math.max(m, Number(p.price)), 0),
    [products],
  );

  const visible = useMemo(() => {
    let list = [...products];
    if (maxPrice !== "") list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    switch (sort) {
      case "price-asc": list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "name": list.sort((a, b) => (ar ? a.name_ar : a.name_en).localeCompare(ar ? b.name_ar : b.name_en)); break;
      default: list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || Number(a.price) - Number(b.price));
    }
    return list;
  }, [products, sort, maxPrice, ar]);

  return (
    <>
      {/* Category hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-fg-dim">
            <Link href="/" className="transition hover:text-fg">
              {ar ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight size={12} />
            <span className="text-fg-muted">{name}</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-fg sm:text-4xl">
                {name}
              </h1>
              <p className="mt-1.5 text-sm text-fg-dim">
                {products.length} {ar ? "منتج" : "products"}
              </p>
            </div>
            {category.image && (
              <div className="relative hidden h-20 w-32 overflow-hidden rounded-xl sm:block">
                <Image src={category.image} alt={name} fill sizes="128px" className="object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-5 pt-8">
        <div className="glass flex flex-wrap items-center gap-5 p-4">
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <ArrowUpDown size={14} className="text-fg-dim" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="input max-w-[200px]"
            >
              <option value="featured">{ar ? "المميزة" : "Featured"}</option>
              <option value="price-asc">{ar ? "السعر: الأقل" : "Price: Low to High"}</option>
              <option value="price-desc">{ar ? "السعر: الأعلى" : "Price: High to Low"}</option>
              <option value="name">{ar ? "الاسم" : "Name"}</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <SlidersHorizontal size={14} className="text-fg-dim" />
            <span>{ar ? "أقصى سعر" : "Max price"}</span>
            <input
              type="range"
              min={0}
              max={priceCeiling || 1}
              step={10}
              value={maxPrice === "" ? priceCeiling || 0 : maxPrice}
              onChange={(e) =>
                setMaxPrice(Number(e.target.value) >= (priceCeiling || 0) ? "" : Number(e.target.value))
              }
              className="w-28 accent-brand"
            />
            <span className="w-20 text-xs text-fg-dim">
              {maxPrice === "" ? (ar ? "الكل" : "All") : formatPrice(Number(maxPrice), lang)}
            </span>
          </label>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        {visible.length === 0 ? (
          <div className="glass p-12 text-center text-fg-dim">
            {ar ? "لا توجد منتجات مطابقة." : "No matching products."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
