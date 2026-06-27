"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/admin/toast";
import type { AdminOrder } from "@/lib/data/admin-crud";

const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded"] as const;
const FULFILLMENT_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const paymentLabel: Record<string, Record<"en" | "ar", string>> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  paid: { en: "Paid", ar: "مدفوع" },
  failed: { en: "Failed", ar: "فشل" },
  refunded: { en: "Refunded", ar: "مسترد" },
};

const fulfillmentLabel: Record<string, Record<"en" | "ar", string>> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  processing: { en: "Processing", ar: "قيد التجهيز" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  delivered: { en: "Delivered", ar: "تم التوصيل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
};

const paymentPillColor: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  failed: "border-red-500/30 bg-red-500/10 text-red-700",
  refunded: "border-violet-500/30 bg-violet-500/10 text-violet-700",
};

const fulfillmentPillColor: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
  processing: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  shipped: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-700",
};

type StatusOverrides = Record<
  string,
  {
    payment_status?: string;
    fulfillment_status?: string;
  }
>;

export function OrdersTable({
  orders,
  lang,
}: {
  orders: AdminOrder[];
  lang: "en" | "ar";
}) {
  const ar = lang === "ar";
  const toast = useToast();
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<StatusOverrides>({});

  function getStatus(order: AdminOrder, field: "payment_status" | "fulfillment_status") {
    return overrides[order.id]?.[field] ?? order[field];
  }

  async function updateStatus(
    id: string,
    field: "payment_status" | "fulfillment_status",
    value: string,
  ) {
    const key = `${id}:${field}`;
    setUpdatingField(key);
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? res.statusText;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      toast.success(ar ? "تم تحديث الحالة بنجاح" : "Status updated successfully");
    } catch (err) {
      setOverrides((prev) => {
        const copy = { ...prev };
        if (copy[id]) {
          delete copy[id][field];
          if (Object.keys(copy[id]).length === 0) delete copy[id];
        }
        return copy;
      });
      toast.error(
        ar
          ? `فشل التحديث: ${err instanceof Error ? err.message : "خطأ غير معروف"}`
          : `Update failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setUpdatingField(null);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-fg">
            {ar ? "قائمة الطلبات" : "Order list"}
          </h2>
          <p className="mt-1 text-sm text-fg-dim">
            {ar ? "عدد الطلبات المعروضة" : "Visible orders"}: {orders.length}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-fg-dim">
            <tr>
              <th className="px-5 py-4 sm:px-6">{ar ? "رقم الطلب" : "Order #"}</th>
              <th className="px-5 py-4 sm:px-6">{ar ? "العميل" : "Customer"}</th>
              <th className="px-5 py-4 sm:px-6">{ar ? "الإجمالي" : "Total"}</th>
              <th className="px-5 py-4 sm:px-6">{ar ? "الدفع" : "Payment"}</th>
              <th className="px-5 py-4 sm:px-6">{ar ? "الحالة" : "Fulfillment"}</th>
              <th className="px-5 py-4 sm:px-6">{ar ? "التاريخ" : "Date"}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-fg-dim sm:px-6">
                  {ar ? "لا توجد طلبات بعد." : "No orders yet."}
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const currentPayment = getStatus(order, "payment_status");
                const currentFulfillment = getStatus(order, "fulfillment_status");
                const isUpdatingPayment = updatingField === `${order.id}:payment_status`;
                const isUpdatingFulfillment = updatingField === `${order.id}:fulfillment_status`;

                return (
                  <tr key={order.id} className="border-b border-border/80 transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono sm:px-6">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-brand underline underline-offset-2 transition-colors hover:text-brand-soft"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="font-medium text-fg">{order.customer_name}</div>
                      <div className="text-xs text-fg-dim" dir="ltr">
                        {order.customer_phone}
                      </div>
                      <div className="text-xs text-fg-dim">
                        {order.city}, {order.governorate}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-brand sm:px-6">
                      {formatPrice(Number(order.grand_total), lang)}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="relative inline-flex items-center gap-1.5">
                        <select
                          value={currentPayment}
                          onChange={(e) => updateStatus(order.id, "payment_status", e.target.value)}
                          disabled={isUpdatingPayment}
                          className={cn(
                            "appearance-none rounded-full border px-3 py-1 pe-7 text-xs font-medium transition-colors",
                            "bg-transparent focus:outline-none focus:ring-1 focus:ring-white/20",
                            paymentPillColor[currentPayment] ?? "border-white/15 bg-white/5 text-fg",
                            isUpdatingPayment && "opacity-50",
                          )}
                        >
                          {PAYMENT_OPTIONS.map((value) => (
                            <option key={value} value={value} className="bg-neutral-900 text-white">
                              {paymentLabel[value]?.[lang] ?? value}
                            </option>
                          ))}
                        </select>
                        {isUpdatingPayment ? (
                          <Loader2 size={14} className="absolute end-1.5 animate-spin text-fg-dim" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="relative inline-flex items-center gap-1.5">
                        <select
                          value={currentFulfillment}
                          onChange={(e) => updateStatus(order.id, "fulfillment_status", e.target.value)}
                          disabled={isUpdatingFulfillment}
                          className={cn(
                            "appearance-none rounded-full border px-3 py-1 pe-7 text-xs font-medium transition-colors",
                            "bg-transparent focus:outline-none focus:ring-1 focus:ring-white/20",
                            fulfillmentPillColor[currentFulfillment] ?? "border-white/15 bg-white/5 text-fg",
                            isUpdatingFulfillment && "opacity-50",
                          )}
                        >
                          {FULFILLMENT_OPTIONS.map((value) => (
                            <option key={value} value={value} className="bg-neutral-900 text-white">
                              {fulfillmentLabel[value]?.[lang] ?? value}
                            </option>
                          ))}
                        </select>
                        {isUpdatingFulfillment ? (
                          <Loader2 size={14} className="absolute end-1.5 animate-spin text-fg-dim" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-fg-dim sm:px-6">
                      {new Date(order.created_at).toLocaleDateString(ar ? "ar-EG" : "en-GB")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
