import Link from "next/link";
import { getLang } from "@/lib/i18n/server";

export default async function Home() {
  const lang = await getLang();
  const ar = lang === "ar";

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_60%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-4xl items-center px-5 py-24">
        <div className="glass relative w-full rounded-[2rem] border border-white/10 p-8 text-center sm:p-12">
          <span className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            {ar ? "قريباً" : "Coming Soon"}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold text-fg sm:text-5xl">
            {ar ? "الموقع حالياً تحت الإنشاء" : "The storefront is currently under construction"}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-fg-muted sm:text-lg">
            {ar
              ? "نعمل الآن على تجهيز تجربة تسوق أفضل. لوحة الإدارة ما زالت تعمل بشكل طبيعي، وسنعود قريباً بالواجهة الجديدة."
              : "We are preparing a better shopping experience. The admin panel is still working normally, and the new storefront will be back soon."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/admin" className="btn btn-primary px-6 py-3">
              {ar ? "فتح لوحة الإدارة" : "Open Admin Panel"}
            </Link>
            <Link href="/contact" className="btn btn-secondary px-6 py-3">
              {ar ? "تواصل معنا" : "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
