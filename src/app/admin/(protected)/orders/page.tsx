import { adminListOrders } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { OrdersTable } from "@/components/admin/orders-table";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function AdminOrdersPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const orders = await adminListOrders();

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
      <OrdersTable orders={orders} lang={lang} />
    </div>
  );
}
