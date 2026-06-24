import { getT, getLang } from "@/lib/i18n/server";
import { getAdminStats } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, DollarSign, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const t = await getT();
  const lang = await getLang();
  const stats = await getAdminStats();
  const ar = lang === "ar";

  const cards = [
    { Icon: ShoppingCart, label: ar ? "طلبات اليوم" : "Orders today", value: stats ? String(stats.ordersToday) : "—", hint: ar ? "كل الطلبات" : "all orders", color: "text-brand", href: "/admin/orders" },
    { Icon: DollarSign, label: ar ? "إيرادات الشهر" : "Revenue", value: stats ? formatPrice(stats.revenueMonth, lang) : "—", hint: ar ? "المدفوع فقط" : "paid only", color: "text-emerald", href: null },
    { Icon: Package, label: ar ? "منتجات نشطة" : "Active products", value: stats ? String(stats.activeProducts) : "—", hint: ar ? "في الكتالوج" : "in catalog", color: "text-stargold", href: "/admin/products" },
    { Icon: AlertTriangle, label: ar ? "مخزون منخفض" : "Low stock", value: stats ? String(stats.lowStock) : "—", hint: ar ? "10 قطع او اقل" : "10 units or less", color: "text-gold", href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">{t.admin.dashboard}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => {
          const content = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-fg-dim">{s.label}</p>
                <s.Icon size={16} className={s.color} />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold text-fg">{s.value}</p>
              <p className="mt-1 text-xs text-fg-dim">{s.hint}</p>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="glass p-5 transition hover:ring-1 hover:ring-brand/30">
              {content}
            </Link>
          ) : (
            <div key={s.label} className="glass p-5">
              {content}
            </div>
          );
        })}
      </div>

      <div className="glass mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
            {ar ? "أحدث الطلبات" : "Recent orders"}
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-brand transition hover:text-brand/80"
          >
            {ar ? "عرض الكل" : "View all"}
          </Link>
        </div>
        {!stats || stats.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-fg-dim">{ar ? "لا توجد طلبات بعد." : "No orders yet."}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-dim">
                <tr><th className="py-2.5 pr-4">#</th><th className="py-2.5 pr-4">{ar ? "العميل" : "Customer"}</th><th className="py-2.5 pr-4">{ar ? "الإجمالي" : "Total"}</th><th className="py-2.5 pr-4">{ar ? "الدفع" : "Payment"}</th><th className="py-2.5 pr-4">{ar ? "الحالة" : "Status"}</th></tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-2.5 pr-4 font-mono text-fg-muted">
                      <Link href={`/admin/orders/${o.id}`} className="text-brand underline-offset-2 hover:underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-fg">{o.customer_name}</td>
                    <td className="py-2.5 pr-4 font-semibold text-brand">{formatPrice(Number(o.grand_total), lang)}</td>
                    <td className="py-2.5 pr-4"><StatusPill value={o.payment_status} /></td>
                    <td className="py-2.5 pr-4"><StatusPill value={o.fulfillment_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const cls: Record<string, string> = {
    paid: "pill-success", pending: "pill-warning", failed: "pill-danger",
    delivered: "pill-success", shipped: "pill-info", processing: "pill-warning",
    cancelled: "pill-danger", refunded: "pill-neutral",
  };
  return <span className={`pill ${cls[value] ?? "pill-neutral"}`}>{value}</span>;
}
