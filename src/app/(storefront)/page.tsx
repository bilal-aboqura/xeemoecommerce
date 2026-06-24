import {
  HomeHero,
  CategoryGrid,
  ProblemSection,
  TrustGuaranteeSection,
  Testimonials,
  WhyXeemoSection,
  BundleOffersSection,
  FAQSection,
  FinalCTASection,
} from "@/components/storefront/home-hero";
import { ProductCard } from "@/components/storefront/product-card";
import { getFeaturedProducts, resolveBundles, getSocialStats, getHeroOverrides } from "@/lib/data/catalog";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const [products, bundles, stats, heroOverrides] = await Promise.all([
    getFeaturedProducts(4),
    resolveBundles(),
    getSocialStats(),
    getHeroOverrides(),
  ]);
  const connected = Boolean(supabase);
  const lang = await getLang();
  const ar = lang === "ar";

  return (
    <>
      {/* 1. Hero — texts editable from admin/customize */}
      <HomeHero overrides={heroOverrides} />

      {/* 2. Categories */}
      <CategoryGrid />

      {/* 3. Problem / Agitation */}
      <ProblemSection />

      {/* 3. Best Sellers (limited to top 4) */}
      <section id="bestsellers" className="mx-auto max-w-7xl px-5 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-fg sm:text-3xl">
              {ar ? "الأكثر مبيعاً" : "Best Sellers"}
            </h2>
            <p className="mt-1 text-sm text-fg-dim">
              {ar ? "المنتجات اللي عملاؤنا بيرجعوا يشتروها تاني" : "What our customers keep coming back for"}
            </p>
          </div>
          <Link
            href="/category/carcare"
            className="hidden items-center gap-1.5 text-sm font-medium text-brand transition hover:underline sm:flex"
          >
            {ar ? "عرض الكل" : "View all"}
            <ArrowRight size={14} />
          </Link>
        </div>
        {connected && products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="glass mt-8 p-12 text-center text-fg-dim">
            {connected
              ? (ar ? "لا توجد منتجات بعد." : "No products yet.")
              : (ar ? "اربط Supabase لعرض المنتجات." : "Connect Supabase to load products.")}
          </div>
        )}
      </section>

      {/* 4. Trust & Guarantee */}
      <TrustGuaranteeSection />

      {/* 5. Social Proof / Testimonials (stats loaded from DB settings) */}
      <Testimonials stats={stats} />

      {/* 6. Why Xeemo — differentiators */}
      <WhyXeemoSection />

      {/* 7. Bundle Offers (with real products from DB) */}
      <BundleOffersSection bundles={bundles} />

      {/* 8. FAQ / Objection Killer */}
      <FAQSection />

      {/* 9. Final CTA */}
      <FinalCTASection />
    </>
  );
}
