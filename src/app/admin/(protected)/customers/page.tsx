import { adminListCustomers } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/utils";
import { Users, MapPin, Phone, ShoppingBag, TrendingUp } from "lucide-react";

export default async function AdminCustomersPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const customers = await adminListCustomers();

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.total_spent, 0);
  const repeatCustomers = customers.filter((c) => c.order_count > 1).length;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">
        {ar ? "العملاء" : "Customers"}
      </h1>
      <p className="mt-1 text-sm text-fg-dim">
        {ar ? "كل العملاء اللي طلبوا من الموقع (بما فيهم الدفع عند الاستلام)" : "All customers who ordered (including COD guests)"}
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Users size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-fg">{totalCustomers}</p>
            <p className="text-xs text-fg-dim">{ar ? "إجمالي العملاء" : "Total customers"}</p>
          </div>
        </div>
        <div className="glass flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-fg">{formatPrice(totalRevenue, lang)}</p>
            <p className="text-xs text-fg-dim">{ar ? "إجمالي الإيرادات" : "Total revenue"}</p>
          </div>
        </div>
        <div className="glass flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-fg">{repeatCustomers}</p>
            <p className="text-xs text-fg-dim">{ar ? "عملاء متكررين" : "Repeat customers"}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-fg-dim">
            <tr>
              <th className="px-4 py-3">{ar ? "العميل" : "Customer"}</th>
              <th className="px-4 py-3">{ar ? "الهاتف" : "Phone"}</th>
              <th className="px-4 py-3">{ar ? "الموقع" : "Location"}</th>
              <th className="px-4 py-3">{ar ? "الطلبات" : "Orders"}</th>
              <th className="px-4 py-3">{ar ? "الإنفاق" : "Total spent"}</th>
              <th className="px-4 py-3">{ar ? "آخر طلب" : "Last order"}</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-dim">
                  {ar ? "لا يوجد عملاء بعد." : "No customers yet."}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.phone} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-fg">{c.full_name}</div>
                    {c.order_count > 1 && (
                      <span className="pill pill-warning mt-0.5 text-[10px]">
                        {ar ? "عميل متكرر" : "Repeat"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-fg-muted" dir="ltr">{c.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-fg-muted">
                      <MapPin size={12} className="shrink-0 text-fg-dim" />
                      <span className="text-xs">{c.city}, {c.governorate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-fg">{c.order_count}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand">
                    {formatPrice(c.total_spent, lang)}
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-dim">
                    {new Date(c.last_order_at).toLocaleDateString(ar ? "ar-EG" : "en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
