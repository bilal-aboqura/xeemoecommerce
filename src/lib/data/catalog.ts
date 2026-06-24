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

/* ─── Bundle helpers (config stored in settings table as JSON) ─────────────── */

export interface BundleConfig {
  key: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  product_ids: string[];
  bundle_price: number;
  image: string;
  active: boolean;
  sort_order: number;
}

export interface ResolvedBundle {
  key: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  image: string;
  products: ProductCard[];
  bundlePrice: number;
  originalPrice: number;
}

const DEFAULT_BUNDLES: BundleConfig[] = [
  {
    key: "fullCare",
    title_en: "Full Care Package",
    title_ar: "باكدج العناية الكاملة",
    desc_en: "Dashboard Shiner + Snow Foam + Tire Shiner + Interior Cleaner (all 1L)",
    desc_ar: "داشبورد شاينر + سنو فوم + تاير شاينر + منظف داخلي (كلهم 1 لتر)",
    product_ids: [],
    bundle_price: 470,
    image: "/images/gold_1l.webp",
    active: true,
    sort_order: 0,
  },
  {
    key: "proPack",
    title_en: "Car Wash Pro Pack",
    title_ar: "باكدج المغسلة",
    desc_en: "Dashboard Shiner + Snow Foam + Tire Shiner (all 4kg)",
    desc_ar: "داشبورد شاينر + سنو فوم + تاير شاينر (كلهم 4 كجم)",
    product_ids: [],
    bundle_price: 950,
    image: "/images/foam4k.webp",
    active: true,
    sort_order: 1,
  },
  {
    key: "motoPack",
    title_en: "Moto Complete Pack",
    title_ar: "باكدج الموتوسيكل الكامل",
    desc_en: "Dashboard Shiner + Engine Shiner + Foam + Tire Shiner for motorcycles",
    desc_ar: "داشبورد شاينر + إنجين شاينر + فوم + تاير شاينر للموتوسيكلات",
    product_ids: [],
    bundle_price: 450,
    image: "/images/tire-1l.webp",
    active: true,
    sort_order: 2,
  },
];

export async function getBundleConfigs(): Promise<BundleConfig[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return DEFAULT_BUNDLES;

  const { data } = await supabase
    .from("settings")
    .select("value_en")
    .eq("key", "bundles")
    .maybeSingle();

  if (!data?.value_en) return DEFAULT_BUNDLES;

  try {
    const parsed = JSON.parse(data.value_en) as BundleConfig[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Invalid JSON — fall through to defaults
  }
  return DEFAULT_BUNDLES;
}

export async function resolveBundles(): Promise<ResolvedBundle[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const configs = await getBundleConfigs();
  const results: ResolvedBundle[] = [];

  for (const config of configs) {
    if (!config.active) continue;

    let products: ProductCard[] = [];

    if (config.product_ids.length > 0) {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
        .in("id", config.product_ids);
      products = (data ?? []) as ProductCard[];
    } else {
      // Auto-select fallback based on key
      if (config.key === "fullCare") {
        const cat = await getCategoryBySlug("carcare");
        if (cat) {
          const { data } = await supabase
            .from("products")
            .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
            .eq("is_active", true)
            .eq("category_id", cat.id)
            .order("price", { ascending: true })
            .limit(4);
          products = (data ?? []) as ProductCard[];
        }
      } else if (config.key === "proPack") {
        const cat = await getCategoryBySlug("carcare");
        if (cat) {
          const { data } = await supabase
            .from("products")
            .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
            .eq("is_active", true)
            .eq("category_id", cat.id)
            .gt("price", 300)
            .order("price", { ascending: true })
            .limit(3);
          products = (data ?? []) as ProductCard[];
        }
      } else if (config.key === "motoPack") {
        const cat = await getCategoryBySlug("motocare");
        if (cat) {
          const { data } = await supabase
            .from("products")
            .select("id, slug, name_en, name_ar, price, compare_at_price, images, is_featured, stock")
            .eq("is_active", true)
            .eq("category_id", cat.id)
            .order("price", { ascending: true });
          products = (data ?? []) as ProductCard[];
        }
      }
    }

    if (products.length === 0) continue;

    const originalPrice = products.reduce((s, p) => s + Number(p.price), 0);
    results.push({
      key: config.key,
      title_en: config.title_en,
      title_ar: config.title_ar,
      desc_en: config.desc_en,
      desc_ar: config.desc_ar,
      image: config.image,
      products,
      bundlePrice: config.bundle_price,
      originalPrice,
    });
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

/* ─── Hero overrides (editable from admin Customize page) ─────────────────── */

export interface HeroOverrides {
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  cta_en?: string;
  cta_ar?: string;
  pill_cod_en?: string;
  pill_cod_ar?: string;
  pill_returns_en?: string;
  pill_returns_ar?: string;
  pill_shipping_en?: string;
  pill_shipping_ar?: string;
}

export async function getHeroOverrides(): Promise<HeroOverrides> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return {};

  const keys = [
    "hero_title", "hero_subtitle", "hero_cta",
    "hero_pill_cod", "hero_pill_returns", "hero_pill_shipping",
  ];
  const { data } = await supabase
    .from("settings")
    .select("key, value_en, value_ar")
    .in("key", keys);

  if (!data || data.length === 0) return {};

  const map = new Map(data.map((d) => [d.key, { en: d.value_en, ar: d.value_ar }]));
  const g = (k: string) => map.get(k);

  return {
    title_en: g("hero_title")?.en || undefined,
    title_ar: g("hero_title")?.ar || undefined,
    subtitle_en: g("hero_subtitle")?.en || undefined,
    subtitle_ar: g("hero_subtitle")?.ar || undefined,
    cta_en: g("hero_cta")?.en || undefined,
    cta_ar: g("hero_cta")?.ar || undefined,
    pill_cod_en: g("hero_pill_cod")?.en || undefined,
    pill_cod_ar: g("hero_pill_cod")?.ar || undefined,
    pill_returns_en: g("hero_pill_returns")?.en || undefined,
    pill_returns_ar: g("hero_pill_returns")?.ar || undefined,
    pill_shipping_en: g("hero_pill_shipping")?.en || undefined,
    pill_shipping_ar: g("hero_pill_shipping")?.ar || undefined,
  };
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
