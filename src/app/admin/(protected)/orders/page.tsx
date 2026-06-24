import { adminListOrders } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const orders = await adminListOrders();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">
        {ar ? "الطلبات" : "Orders"}
      </h1>
      <OrdersTable orders={orders} lang={lang} />
    </div>
  );
}
