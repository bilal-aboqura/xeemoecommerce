"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useLang } from "@/components/language/provider";
import { useToast } from "@/components/admin/toast";

interface SettingValue {
  value_en: string;
  value_ar: string;
}

type Fields = Record<string, SettingValue>;

const DEFAULTS: Fields = {
  store_name: { value_en: "Xeemo", value_ar: "اكسيمو" },
  store_tagline: { value_en: "Car Care Chemicals", value_ar: "كيماويات العناية بالسيارات" },
  store_phone: { value_en: "+201150301033", value_ar: "+201150301033" },
  store_email: { value_en: "", value_ar: "" },
  store_facebook: { value_en: "https://www.facebook.com/officialxeemo", value_ar: "https://www.facebook.com/officialxeemo" },
  hero_title: { value_en: "Your car will look showroom-fresh", value_ar: "عربيتك هتبان كأنها لسه نازلة من المعرض" },
  hero_subtitle: { value_en: "The detailing products that car wash pros use — now in your hands.", value_ar: "منتجات التلميع والعناية اللي بيستخدمها أصحاب المغاسل — دلوقتي في إيدك." },
  hero_cta: { value_en: "See the Best Sellers", value_ar: "شوف الأكثر مبيعاً" },
  hero_pill_cod: { value_en: "Cash on Delivery", value_ar: "الدفع عند الاستلام" },
  hero_pill_returns: { value_en: "7-day returns", value_ar: "استرجاع 7 أيام" },
  hero_pill_shipping: { value_en: "Free shipping 600+ EGP", value_ar: "شحن مجاني فوق 600 ج.م" },
  free_shipping_threshold: { value_en: "600", value_ar: "600" },
  stat_customers: { value_en: "+500", value_ar: "+500" },
  stat_carwashes: { value_en: "+50", value_ar: "+50" },
  stat_rating: { value_en: "4.8/5", value_ar: "4.8/5" },
};

interface SectionDef {
  title: { en: string; ar: string };
  keys: {
    key: string;
    label: { en: string; ar: string };
    bilingual?: boolean;
    type?: "number";
  }[];
}

const SECTIONS: SectionDef[] = [
  {
    title: { en: "Branding", ar: "العلامة التجارية" },
    keys: [
      { key: "store_name", label: { en: "Store Name", ar: "اسم المتجر" }, bilingual: true },
      { key: "store_tagline", label: { en: "Tagline", ar: "الشعار" }, bilingual: true },
    ],
  },
  {
    title: { en: "Contact Info", ar: "معلومات التواصل" },
    keys: [
      { key: "store_phone", label: { en: "WhatsApp / Phone", ar: "واتساب / هاتف" } },
      { key: "store_email", label: { en: "Contact Email", ar: "البريد الإلكتروني" } },
      { key: "store_facebook", label: { en: "Facebook URL", ar: "رابط فيسبوك" } },
    ],
  },
  {
    title: { en: "Homepage Hero", ar: "القسم الرئيسي" },
    keys: [
      { key: "hero_title", label: { en: "Hero Title", ar: "العنوان الرئيسي" }, bilingual: true },
      { key: "hero_subtitle", label: { en: "Hero Subtitle", ar: "العنوان الفرعي" }, bilingual: true },
      { key: "hero_cta", label: { en: "CTA Button Text", ar: "نص زر الإجراء" }, bilingual: true },
      { key: "hero_pill_cod", label: { en: "COD Badge Text", ar: "نص شارة الدفع عند الاستلام" }, bilingual: true },
      { key: "hero_pill_returns", label: { en: "Returns Badge Text", ar: "نص شارة الاسترجاع" }, bilingual: true },
      { key: "hero_pill_shipping", label: { en: "Shipping Badge Text", ar: "نص شارة الشحن" }, bilingual: true },
    ],
  },
  {
    title: { en: "Offers & Social Proof", ar: "العروض والإثبات الاجتماعي" },
    keys: [
      { key: "free_shipping_threshold", label: { en: "Free Shipping Threshold (EGP)", ar: "حد الشحن المجاني (ج.م)" }, type: "number" },
      { key: "stat_customers", label: { en: "Customer Count", ar: "عدد العملاء" }, type: "number" },
      { key: "stat_carwashes", label: { en: "Car Wash Count", ar: "عدد الغسلات" }, type: "number" },
      { key: "stat_rating", label: { en: "Rating", ar: "التقييم" }, type: "number" },
    ],
  },
];

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-brand";

export default function CustomizePage() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const toast = useToast();

  const [fields, setFields] = useState<Fields>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { key: string; value_en: string; value_ar: string }[]) => {
        setFields((prev) => {
          const next = { ...prev };
          for (const row of data) {
            if (row.key in next) {
              next[row.key] = { value_en: row.value_en, value_ar: row.value_ar };
            }
          }
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function update(key: string, field: "value_en" | "value_ar", value: string) {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  async function saveSection(sectionIndex: number) {
    const section = SECTIONS[sectionIndex];
    setSavingSection(sectionIndex);
    try {
      for (const { key } of section.keys) {
        const { value_en, value_ar } = fields[key];
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value_en, value_ar }),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      toast.success(ar ? "تم الحفظ" : "Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : ar ? "فشل الحفظ" : "Save failed");
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-fg-dim" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">
        {ar ? "التخصيص" : "Customize"}
      </h1>
      <p className="mt-1 text-sm text-fg-dim">
        {ar
          ? "خصّص مظهر المتجر والعلامة التجارية والمحتوى."
          : "Customize your store appearance, branding, and content."}
      </p>

      <div className="mt-6 space-y-6">
        {SECTIONS.map((section, si) => (
          <div key={si} className="glass p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-fg-muted">
                {ar ? section.title.ar : section.title.en}
              </h2>
              <button
                onClick={() => saveSection(si)}
                disabled={savingSection === si}
                className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {savingSection === si ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                {savingSection === si
                  ? ar ? "جارٍ الحفظ…" : "Saving…"
                  : ar ? "حفظ" : "Save"}
              </button>
            </div>

            <div className="space-y-4">
              {section.keys.map(({ key, label, bilingual, type }) => (
                <div key={key}>
                  <span className="mb-1.5 block text-xs font-medium text-fg-dim">
                    {ar ? label.ar : label.en}
                  </span>
                  {bilingual ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] text-fg-dim/60">English</span>
                        <input
                          value={fields[key].value_en}
                          onChange={(e) => update(key, "value_en", e.target.value)}
                          className={inputCls}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] text-fg-dim/60">العربية</span>
                        <input
                          value={fields[key].value_ar}
                          onChange={(e) => update(key, "value_ar", e.target.value)}
                          dir="rtl"
                          className={inputCls}
                        />
                      </label>
                    </div>
                  ) : (
                    <input
                      value={fields[key].value_en}
                      onChange={(e) => update(key, "value_en", e.target.value)}
                      type={type === "number" ? "number" : "text"}
                      className={inputCls}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
