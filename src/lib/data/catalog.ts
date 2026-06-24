import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ProductCard {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  is_featured: boolean;
  stock: number;
}

export interface ProductDetail extends ProductCard {
  sku: string | null;
  short_desc_en: string;
  short_desc_ar: string;
  long_desc_en: string;
  long_desc_ar: string;
  weight: string | null;
  category_id: string | null;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  image: string | null;
}

/** Featured + recent active products for the homepage. */
export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock",
    )
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getFeaturedProducts:", error.message);
    return [];
  }
  return (data ?? []) as ProductCard[];
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryInfo | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_ar, image")
    .eq("slug", slug)
    .maybeSingle();
  return (data as CategoryInfo) ?? null;
}

export async function getAllCategories(): Promise<CategoryInfo[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_ar, image")
    .order("sort_order", { ascending: true });
  return (data as CategoryInfo[]) ?? [];
}

export async function getCategoryById(id: string): Promise<CategoryInfo | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_ar, image")
    .eq("id", id)
    .maybeSingle();
  return (data as CategoryInfo) ?? null;
}

/** Products for a category page (by category slug). */
export async function getProductsByCategory(
  categorySlug: string,
): Promise<ProductCard[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock",
    )
    .eq("is_active", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getProductsByCategory:", error.message);
    return [];
  }
  return (data ?? []) as ProductCard[];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, sku, name_en, name_ar, short_desc_en, short_desc_ar, long_desc_en, long_desc_ar, price, compare_at_price, images, is_featured, stock, weight, category_id",
    )
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();
  return (data as ProductDetail) ?? null;
}

/** Related products from the same category, excluding the current one. */
export async function getRelatedProducts(
  product: ProductDetail,
  limit = 4,
): Promise<ProductCard[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase || !product.category_id) return [];
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock",
    )
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(limit);
  return (data as ProductCard[]) ?? [];
}

/* ─── Bundle helpers ─────────────────────────────────────────────────────── */

export interface BundleConfig {
  key: string;
  categorySlug: string;
  /** Pick the N cheapest products from the category (sorted by price asc). */
  pickCount: number;
  bundlePrice: number;
}

export const BUNDLE_CONFIGS: BundleConfig[] = [
  { key: "fullCare", categorySlug: "carcare", pickCount: 4, bundlePrice: 470 },
  { key: "proPack", categorySlug: "carcare", pickCount: 3, bundlePrice: 950 },
  { key: "motoPack", categorySlug: "motocare", pickCount: 4, bundlePrice: 450 },
];

export interface ResolvedBundle {
  key: string;
  products: ProductCard[];
  bundlePrice: number;
  originalPrice: number;
}

/**
 * Resolve bundles by fetching real products from the database.
 * - fullCare: 4 cheapest car-care products (the 1L items)
 * - proPack: 3 cheapest car-care products priced > 300 (the 4kg items)
 * - motoPack: all moto-care products
 */
export async function resolveBundles(): Promise<ResolvedBundle[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const results: ResolvedBundle[] = [];

  // Full Care — 4 cheapest car care (1L items, roughly 120–145 EGP)
  const carCat = await getCategoryBySlug("carcare");
  if (carCat) {
    const { data: carProducts } = await supabase
      .from("products")
      .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
      .eq("is_active", true)
      .eq("category_id", carCat.id)
      .order("price", { ascending: true });

    const all = (carProducts ?? []) as ProductCard[];

    // Full Care: 4 cheapest (1L products)
    if (all.length >= 4) {
      const picked = all.slice(0, 4);
      results.push({
        key: "fullCare",
        products: picked,
        bundlePrice: 470,
        originalPrice: picked.reduce((s, p) => s + Number(p.price), 0),
      });
    }

    // Pro Pack: 3 cheapest of those priced > 300 (4kg products)
    const fourKg = all.filter((p) => Number(p.price) > 300);
    if (fourKg.length >= 3) {
      const picked = fourKg.slice(0, 3);
      results.push({
        key: "proPack",
        products: picked,
        bundlePrice: 950,
        originalPrice: picked.reduce((s, p) => s + Number(p.price), 0),
      });
    }
  }

  // Moto Pack — all moto care products
  const motoCat = await getCategoryBySlug("motocare");
  if (motoCat) {
    const { data: motoProducts } = await supabase
      .from("products")
      .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
      .eq("is_active", true)
      .eq("category_id", motoCat.id)
      .order("price", { ascending: true });

    const all = (motoProducts ?? []) as ProductCard[];
    if (all.length > 0) {
      results.push({
        key: "motoPack",
        products: all,
        bundlePrice: 450,
        originalPrice: all.reduce((s, p) => s + Number(p.price), 0),
      });
    }
  }

  return results;
}

/** Get the cheapest active product in a category (for order bump). */
export async function getCheapestInCategory(
  categorySlug: string,
): Promise<ProductCard | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;
  const { data } = await supabase
    .from("products")
    .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
    .eq("is_active", true)
    .eq("category_id", category.id)
    .gt("stock", 0)
    .order("price", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as ProductCard) ?? null;
}

/* ─── Social proof stats ─────────────────────────────────────────────────── */

export interface SocialStats {
  customers: string;
  carWashes: string;
  rating: string;
}

const DEFAULT_STATS: SocialStats = {
  customers: "+500",
  carWashes: "+50",
  rating: "4.8/5",
};

/**
 * Load social proof stats from the settings table.
 * Keys: stat_customers, stat_carwashes, stat_rating.
 * Falls back to hardcoded defaults if settings aren't found.
 */
export async function getSocialStats(): Promise<SocialStats> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return DEFAULT_STATS;

  const { data } = await supabase
    .from("settings")
    .select("key, value_en")
    .in("key", ["stat_customers", "stat_carwashes", "stat_rating"]);

  if (!data || data.length === 0) return DEFAULT_STATS;

  const map = new Map(data.map((d) => [d.key, d.value_en]));
  return {
    customers: map.get("stat_customers") || DEFAULT_STATS.customers,
    carWashes: map.get("stat_carwashes") || DEFAULT_STATS.carWashes,
    rating: map.get("stat_rating") || DEFAULT_STATS.rating,
  };
}

/** Lightweight search across the active catalog. */
export async function searchProducts(query: string): Promise<ProductCard[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase || !query.trim()) return [];
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock",
    )
    .eq("is_active", true)
    .or(
      `name_en.ilike.%${query}%,name_ar.ilike.%${query}%,long_desc_en.ilike.%${query}%`,
    )
    .limit(20);
  return (data as ProductCard[]) ?? [];
}
