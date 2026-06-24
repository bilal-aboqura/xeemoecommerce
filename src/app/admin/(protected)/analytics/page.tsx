import { getAnalytics } from "@/lib/data/analytics";
import { getLang } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  MapPin,
  CreditCard,
  BarChart3,
} from "lucide-react";

export default async function AnalyticsPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const analytics = await getAnalytics();

  if (!analytics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass p-8 text-center">
          <BarChart3 size={40} className="mx-auto text-fg-dim" />
          <p className="mt-4 text-fg-dim">
            {ar
              ? "لا يمكن تحميل التحليلات. قاعدة البيانات غير متصلة."
              : "Unable to load analytics. Database not connected."}
          </p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1);
  const maxStatus = Math.max(...analytics.statusBreakdown.map((s) => s.count), 1);
  const maxPayment = Math.max(...analytics.paymentBreakdown.map((p) => p.count), 1);
  const repeatRate =
    analytics.totalCustomers > 0
      ? Math.round((analytics.repeatCustomers / analytics.totalCustomers) * 100)
      : 0;

  const kpis = [
    {
      Icon: DollarSign,
      label: ar ? "إيرادات الشهر" : "Monthly Revenue",
      value: formatPrice(analytics.revenueMonth, lang),
      hint: ar
        ? `اليوم: ${formatPrice(analytics.revenueToday, lang)}`
        : `Today: ${formatPrice(analytics.revenueToday, lang)}`,
      color: "text-emerald-400",
    },
    {
      Icon: ShoppingCart,
      label: ar ? "طلبات الشهر" : "Monthly Orders",
      value: String(analytics.ordersMonth),
      hint: ar
        ? `اليوم: ${analytics.ordersToday} · الأسبوع: ${analytics.ordersWeek}`
        : `Today: ${analytics.ordersToday} · Week: ${analytics.ordersWeek}`,
      color: "text-brand",
    },
    {
      Icon: TrendingUp,
      label: ar ? "متوسط قيمة الطلب" : "Avg Order Value",
      value: formatPrice(analytics.avgOrderValue, lang),
      hint: ar
        ? `إجمالي: ${formatPrice(analytics.revenueTotal, lang)}`
        : `Total: ${formatPrice(analytics.revenueTotal, lang)}`,
      color: "text-stargold",
    },
    {
      Icon: Users,
      label: ar ? "إجمالي العملاء" : "Total Customers",
      value: String(analytics.totalCustomers),
      hint: ar
        ? `عملاء متكررين: ${analytics.repeatCustomers}`
        : `Repeat: ${analytics.repeatCustomers}`,
      color: "text-violet-400",
    },
  ];

  const statusColors: Record<string, string> = {
    delivered: "bg-emerald-500",
    shipped: "bg-sky-500",
    processing: "bg-amber-500",
    pending: "bg-amber-400",
    cancelled: "bg-red-500",
    refunded: "bg-zinc-500",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-fg">
          {ar ? "التحليلات" : "Analytics"}
        </h1>
        <p className="mt-1 text-sm text-fg-dim">
          {ar
            ? "نظرة شاملة على أداء المتجر"
            : "Comprehensive overview of store performance"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-fg-dim">
                {kpi.label}
              </p>
              <kpi.Icon size={16} className={kpi.color} />
            </div>
            <p className="mt-3 font-heading text-3xl font-bold text-fg">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-fg-dim">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
            {ar ? "الإيرادات اليومية (آخر 30 يوم)" : "Daily Revenue (Last 30 Days)"}
          </h2>
          <p className="text-xs text-fg-dim">
            {ar ? "مرّر للتفاصيل" : "Hover for details"}
          </p>
        </div>
        <div className="flex items-end gap-1" style={{ height: "200px" }}>
          {analytics.dailyRevenue.map((d) => (
            <div
              key={d.date}
              className="flex-1 rounded-t bg-brand/80 transition hover:bg-brand"
              style={{
                height: `${(d.revenue / maxRevenue) * 100}%`,
                minHeight: d.revenue > 0 ? "2px" : "0",
              }}
              title={`${d.date}: ${formatPrice(d.revenue, lang)} (${d.orders} ${ar ? "طلب" : "orders"})`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-fg-dim">
          {analytics.dailyRevenue
            .filter((_, i) => i % 5 === 0)
            .map((d) => (
              <span key={d.date}>{d.date}</span>
            ))}
        </div>
      </div>

      {/* Top Products & Top Cities */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <Package size={16} className="text-brand" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {ar ? "أفضل المنتجات" : "Top Products"}
            </h2>
          </div>
          {analytics.topProducts.length === 0 ? (
            <p className="text-sm text-fg-dim">
              {ar ? "لا توجد بيانات بعد." : "No data yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-fg-dim">
                  <tr>
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">{ar ? "المنتج" : "Product"}</th>
                    <th className="py-2 pr-3 text-right">{ar ? "الكمية" : "Qty"}</th>
                    <th className="py-2 text-right">{ar ? "الإيرادات" : "Revenue"}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((p, i) => (
                    <tr key={p.name_en} className="border-t border-border">
                      <td className="py-2 pr-3 text-fg-dim">{i + 1}</td>
                      <td className="py-2 pr-3 text-fg">
                        <div>{ar ? p.name_ar : p.name_en}</div>
                        <div className="text-[10px] text-fg-dim">
                          {ar ? p.name_en : p.name_ar}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-fg-muted">
                        {p.quantity}
                      </td>
                      <td className="py-2 text-right font-semibold text-brand">
                        {formatPrice(p.revenue, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Cities */}
        <div className="glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-brand" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {ar ? "أفضل المدن" : "Top Cities"}
            </h2>
          </div>
          {analytics.topCities.length === 0 ? (
            <p className="text-sm text-fg-dim">
              {ar ? "لا توجد بيانات بعد." : "No data yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-fg-dim">
                  <tr>
                    <th className="py-2 pr-3">{ar ? "المدينة" : "City"}</th>
                    <th className="py-2 pr-3 text-right">
                      {ar ? "الطلبات" : "Orders"}
                    </th>
                    <th className="py-2 text-right">{ar ? "الإيرادات" : "Revenue"}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topCities.map((c) => (
                    <tr key={`${c.city}-${c.governorate}`} className="border-t border-border">
                      <td className="py-2 pr-3 text-fg">
                        <div>{c.city}</div>
                        <div className="text-[10px] text-fg-dim">{c.governorate}</div>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-fg-muted">
                        {c.orders}
                      </td>
                      <td className="py-2 text-right font-semibold text-brand">
                        {formatPrice(c.revenue, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status, Payment, Customer Metrics */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Order Status Breakdown */}
        <div className="glass p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
            {ar ? "حالة الطلبات" : "Order Status"}
          </h2>
          <div className="space-y-3">
            {analytics.statusBreakdown.map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="capitalize text-fg">{s.status}</span>
                  <span className="font-mono text-fg-dim">{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${statusColors[s.status] ?? "bg-zinc-500"}`}
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-brand" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {ar ? "طرق الدفع" : "Payment Methods"}
            </h2>
          </div>
          <div className="space-y-3">
            {analytics.paymentBreakdown.map((p) => {
              const pct =
                analytics.ordersTotal > 0
                  ? Math.round((p.count / analytics.ordersTotal) * 100)
                  : 0;
              return (
                <div key={p.method}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="uppercase text-fg">{p.method}</span>
                    <span className="text-fg-dim">
                      {pct}% · {formatPrice(p.revenue, lang)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(p.count / maxPayment) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users size={16} className="text-brand" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {ar ? "مقاييس العملاء" : "Customer Metrics"}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-dim">
                {ar ? "إجمالي العملاء" : "Total Customers"}
              </span>
              <span className="font-heading text-xl font-bold text-fg">
                {analytics.totalCustomers}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-dim">
                {ar ? "عملاء متكررين" : "Repeat Customers"}
              </span>
              <span className="font-heading text-xl font-bold text-fg">
                {analytics.repeatCustomers}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-dim">
                {ar ? "عملاء جدد هذا الشهر" : "New This Month"}
              </span>
              <span className="font-heading text-xl font-bold text-fg">
                {analytics.newCustomersThisMonth}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-dim">
                {ar ? "معدل التكرار" : "Repeat Rate"}
              </span>
              <span className="font-heading text-xl font-bold text-brand">
                {repeatRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
