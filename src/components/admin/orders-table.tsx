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
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  failed: "border-red-500/30 bg-red-500/10 text-red-400",
  refunded: "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

const fulfillmentPillColor: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  processing: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  shipped: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

type StatusOverrides = Record<string, {
  payment_status?: string;
  fulfillment_status?: string;
}>;

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

      toast.success(
        ar ? "تم تحديث الحالة بنجاح" : "Status updated successfully",
      );
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
    <div className="glass mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-fg-dim">
          <tr>
            <th className="px-4 py-3">{ar ? "رقم الطلب" : "Order #"}</th>
            <th className="px-4 py-3">{ar ? "العميل" : "Customer"}</th>
            <th className="px-4 py-3">{ar ? "الإجمالي" : "Total"}</th>
            <th className="px-4 py-3">{ar ? "الدفع" : "Payment"}</th>
            <th className="px-4 py-3">{ar ? "الحالة" : "Fulfillment"}</th>
            <th className="px-4 py-3">{ar ? "التاريخ" : "Date"}</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-fg-dim">
                {ar ? "لا توجد طلبات بعد." : "No orders yet."}
              </td>
            </tr>
          ) : (
            orders.map((o) => {
              const currentPayment = getStatus(o, "payment_status");
              const currentFulfillment = getStatus(o, "fulfillment_status");
              const isUpdatingPayment = updatingField === `${o.id}:payment_status`;
              const isUpdatingFulfillment = updatingField === `${o.id}:fulfillment_status`;

              return (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-brand hover:text-brand-soft underline underline-offset-2 transition-colors"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-fg">{o.customer_name}</div>
                    <div className="text-xs text-fg-dim" dir="ltr">{o.customer_phone}</div>
                    <div className="text-xs text-fg-dim">{o.city}, {o.governorate}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand">
                    {formatPrice(Number(o.grand_total), lang)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center gap-1.5">
                      <select
                        value={currentPayment}
                        onChange={(e) => updateStatus(o.id, "payment_status", e.target.value)}
                        disabled={isUpdatingPayment}
                        className={cn(
                          "appearance-none rounded-full border px-3 py-1 pe-7 text-xs font-medium transition-colors",
                          "bg-transparent focus:outline-none focus:ring-1 focus:ring-white/20",
                          paymentPillColor[currentPayment] ?? "border-white/15 bg-white/5 text-fg",
                          isUpdatingPayment && "opacity-50",
                        )}
                      >
                        {PAYMENT_OPTIONS.map((v) => (
                          <option key={v} value={v} className="bg-neutral-900 text-white">
                            {paymentLabel[v]?.[lang] ?? v}
                          </option>
                        ))}
                      </select>
                      {isUpdatingPayment && (
                        <Loader2 size={14} className="absolute end-1.5 animate-spin text-fg-dim" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center gap-1.5">
                      <select
                        value={currentFulfillment}
                        onChange={(e) => updateStatus(o.id, "fulfillment_status", e.target.value)}
                        disabled={isUpdatingFulfillment}
                        className={cn(
                          "appearance-none rounded-full border px-3 py-1 pe-7 text-xs font-medium transition-colors",
                          "bg-transparent focus:outline-none focus:ring-1 focus:ring-white/20",
                          fulfillmentPillColor[currentFulfillment] ?? "border-white/15 bg-white/5 text-fg",
                          isUpdatingFulfillment && "opacity-50",
                        )}
                      >
                        {FULFILLMENT_OPTIONS.map((v) => (
                          <option key={v} value={v} className="bg-neutral-900 text-white">
                            {fulfillmentLabel[v]?.[lang] ?? v}
                          </option>
                        ))}
                      </select>
                      {isUpdatingFulfillment && (
                        <Loader2 size={14} className="absolute end-1.5 animate-spin text-fg-dim" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-dim">
                    {new Date(o.created_at).toLocaleDateString(ar ? "ar-EG" : "en-GB")}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
