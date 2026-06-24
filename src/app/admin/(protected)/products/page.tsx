import Link from "next/link";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import { adminListProducts } from "@/lib/data/admin-crud";
import { getAllCategories } from "@/lib/data/catalog";
import { getLang } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const [products, categories] = await Promise.all([
    adminListProducts(),
    getAllCategories(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-fg">
          {ar ? "المنتجات" : "Products"}
        </h1>
        <Link href="/admin/products/new" className="btn btn-primary gap-2">
          <Plus size={16} />
          {ar ? "منتج جديد" : "New product"}
        </Link>
      </div>

      <div className="glass mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-fg-dim">
            <tr>
              <th className="px-4 py-3">{ar ? "المنتج" : "Product"}</th>
              <th className="px-4 py-3">{ar ? "الفئة" : "Category"}</th>
              <th className="px-4 py-3">{ar ? "السعر" : "Price"}</th>
              <th className="px-4 py-3">{ar ? "المخزون" : "Stock"}</th>
              <th className="px-4 py-3">{ar ? "الحالة" : "Status"}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-dim">
                  {ar ? "لا توجد منتجات." : "No products yet."}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <div className="relative h-10 w-10 overflow-hidden rounded bg-white">
                            <Image src={p.images[0]} alt="" fill sizes="40px" className="object-contain p-0.5" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-fg">{ar ? p.name_ar : p.name_en}</div>
                          <div className="text-xs text-fg-dim">{p.sku ?? p.legacy_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">
                      {cat ? (ar ? cat.name_ar : cat.name_en) : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand">
                      {formatPrice(Number(p.price), lang)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 10 ? "text-red-300" : "text-fg"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                          {ar ? "نشط" : "Active"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-fg-dim">
                          {ar ? "مخفي" : "Hidden"}
                        </span>
                      )}
                      {p.is_featured && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                          <Star size={10} className="mr-0.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-sm text-brand hover:underline"
                      >
                        {ar ? "تعديل" : "Edit"}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
