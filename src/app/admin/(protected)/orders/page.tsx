import { adminListOrders } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { OrdersTable } from "@/components/admin/orders-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BostaOperations } from "@/components/admin/bosta-operations";
import { getBostaConfiguration } from "@/lib/bosta";
import { getLatestBostaPickups } from "@/lib/bosta-pickups";

export default async function AdminOrdersPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const [orders, pickups] = await Promise.all([
    adminListOrders(),
    getLatestBostaPickups(),
  ]);
  const bostaConfigured = getBostaConfiguration().ready;

  return (
    <div>
      <AdminPageHeader
        eyebrow={ar ? "تنفيذ الطلبات" : "Fulfillment"}
        title={ar ? "الطلبات" : "Orders"}
        description={
          ar
            ? "حدّث حالات الدفع والتجهيز بسرعة من الجدول نفسه."
            : "Update payment and fulfillment status quickly from the table itself."
        }
      />
      <BostaOperations configured={bostaConfigured} pickups={pickups} lang={lang} />
      <OrdersTable orders={orders} lang={lang} />
    </div>
  );
}
