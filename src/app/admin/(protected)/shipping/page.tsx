import { adminListShippingRates } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { ShippingManager } from "@/components/admin/shipping-manager";

export default async function AdminShippingPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const rates = await adminListShippingRates();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">
        {ar ? "أسعار الشحن" : "Shipping Rates"}
      </h1>
      <p className="mt-1 text-sm text-fg-dim">
        {ar
          ? "المحافظة/المدينة = سعر محدد. * =wildcard."
          : "Governorate/City = exact rate. * = wildcard."}
      </p>

      <ShippingManager rates={rates} lang={lang} />
    </div>
  );
}
