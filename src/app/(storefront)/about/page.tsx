import Link from "next/link";
import { getLang } from "@/lib/i18n/server";
import { Award, Factory, Wallet, ArrowRight } from "lucide-react";

export default async function AboutPage() {
  const lang = await getLang();
  const ar = lang === "ar";

  const values = [
    { Icon: Award, t: ar ? "جودة احترافية" : "Professional quality", d: ar ? "تركيبات مركّزة وفعّالة تقدم نتائج ملموسة." : "Concentrated, effective formulas with visible results." },
    { Icon: Factory, t: ar ? "صناعة مصرية" : "Made in Egypt", d: ar ? "منتجات مصنوعة محليا لدعم الصناعة الوطنية." : "Locally manufactured to support local industry." },
    { Icon: Wallet, t: ar ? "أسعار عادلة" : "Fair pricing", d: ar ? "قيمة حقيقية مقابل السعر بكميات متعددة." : "Real value for money across multiple sizes." },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="font-heading text-4xl font-bold text-fg">{ar ? "عن اكسيمو" : "About Xeemo"}</h1>
      <p className="mt-2 text-sm text-fg-dim">{ar ? "كيماويات العناية بالسيارات — صناعة مصرية" : "Car care chemicals — made in Egypt"}</p>

      <div className="glass mt-10 space-y-5 p-8 text-sm leading-relaxed text-fg-muted">
        <p>{ar ? "اكسيمو علامة مصرية متخصصة في تصنيع وتطوير كيماويات العناية بالسيارات والموتوسيكلات والسجاد والأثاث. نجمع بين الخبرة العملية وأحدث التركيبات لنقدّم منتجات احترافية تلبي احتياجات مراكز التجميل والعملاء على حد سواء." : "Xeemo is an Egyptian brand specialized in formulating car, motorcycle, carpet, and furniture care chemicals. We combine field experience with modern formulations to deliver professional-grade products for detailing centers and individual customers alike."}</p>
        <p>{ar ? "نبدأ من تنظيف السيارة بالرغوة الغنية بالشمع، مرورا بتلميع التابلوه والإطارات، وصولا إلى تنظيف المحرك والتنظيف الداخلي الشامل — مع معطرات جو تدوم طويلا لإضافة لمسة فاخرة لكل رحلة." : "From snow foam rich in wax, to dashboard and tire shining, engine cleaning and full interior detailing — finished with long-lasting air fresheners that add a premium touch to every ride."}</p>
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-fg">{ar ? "قيمنا" : "Our values"}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.t} className="glass p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <v.Icon size={20} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-fg">{v.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-dim">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-12 flex flex-col items-center gap-5 p-10 text-center">
        <p className="text-fg-muted">{ar ? "اكتشف مجموعتنا الكاملة من منتجات العناية." : "Explore our full range of care products."}</p>
        <Link href="/category/carcare" className="btn btn-primary gap-2">
          {ar ? "تسوق الآن" : "Shop now"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
