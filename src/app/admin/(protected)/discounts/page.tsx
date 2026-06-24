import { adminListDiscounts } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { DiscountManager } from "@/components/admin/discount-manager";

export default async function AdminDiscountsPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const discounts = await adminListDiscounts();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">
        {ar ? "الكوبونات" : "Discounts"}
      </h1>

      <DiscountManager discounts={discounts} lang={lang} />
    </div>
  );
}
