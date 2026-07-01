import { CategoryGrid } from "@/components/storefront/category-grid";
import {
  BundleOffersSection,
  FAQSection,
  Testimonials,
  TrustGuaranteeSection,
  WhyXeemoSection,
} from "@/components/storefront/home-hero";
import { HomeHero } from "@/components/storefront/home-hero-carousel";
import { ProductCard } from "@/components/storefront/product-card";
import {
  getAllCategories,
  getFeaturedProducts,
  getHeroOverrides,
  getSocialStats,
  resolveBundles,
} from "@/lib/data/catalog";
import { getLang } from "@/lib/i18n/server";

export default async function Home() {
  const [lang, categories, featuredProducts, heroOverrides, bundles, stats] =
    await Promise.all([
      getLang(),
      getAllCategories(),
      getFeaturedProducts(8),
      getHeroOverrides(),
      resolveBundles(),
      getSocialStats(),
    ]);

  const ar = lang === "ar";

  return (
    <>
      <HomeHero overrides={heroOverrides} />
      <CategoryGrid categories={categories} />

      <section id="bestsellers" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-fg sm:text-3xl">
            {ar ? "الاكثر مبيعا" : "Best Sellers"}
          </h2>
          <p className="mt-1 text-sm text-fg-dim">
            {ar
              ? "المنتجات اللي عملاؤنا بيرجعوا يطلبوها مرة بعد مرة"
              : "The products customers keep coming back for."}
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass mt-8 rounded-3xl p-8 text-center text-sm text-fg-dim">
            {ar
              ? "المنتجات ستظهر هنا بمجرد إضافة الكتالوج."
              : "Featured products will appear here once the catalog is available."}
          </div>
        )}
      </section>
      <TrustGuaranteeSection />
      <WhyXeemoSection />
      <BundleOffersSection bundles={bundles} />
      <Testimonials stats={stats} />
      <FAQSection />
    </>
  );
}
