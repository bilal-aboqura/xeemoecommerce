import { adminGetOrder } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Clock,
} from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lang = await getLang();
  const ar = lang === "ar";

  const order = await adminGetOrder(id);
  if (!order) notFound();

  const items = (order.order_items ?? []) as {
    id: string;
    name_en: string;
    name_ar: string;
    price: number;
    quantity: number;
    image: string | null;
  }[];

  const createdAt = new Date(order.created_at);
  const dateStr = createdAt.toLocaleDateString(ar ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-dim transition hover:text-brand"
      >
        <ArrowLeft size={14} />
        <span>{ar ? "كل الطلبات" : "All Orders"}</span>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-fg">
          {ar ? "طلب" : "Order"} #{order.order_number}
        </h1>
        <StatusPill value={order.payment_status} />
        <StatusPill value={order.fulfillment_status} />
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-xs text-fg-dim">
        <Clock size={12} />
        <span>{dateStr}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ── Left column: items + totals ────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items table */}
          <div className="glass-elevated p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              <Package size={14} />
              <span>{ar ? "العناصر" : "Items"}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-dim">
                  <tr>
                    <th className="py-2.5 pr-4">{ar ? "المنتج" : "Product"}</th>
                    <th className="py-2.5 pr-4 text-center">{ar ? "الكمية" : "Qty"}</th>
                    <th className="py-2.5 pr-4 text-right">{ar ? "السعر" : "Price"}</th>
                    <th className="py-2.5 text-right">{ar ? "المجموع" : "Total"}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={ar ? item.name_ar : item.name_en}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
                              <Package size={16} className="text-fg-dim" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-fg">
                              {ar ? item.name_ar : item.name_en}
                            </p>
                            <p className="text-xs text-fg-dim">
                              {ar ? item.name_en : item.name_ar}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center text-fg">{item.quantity}</td>
                      <td className="py-3 pr-4 text-right text-fg-dim">
                        {formatPrice(Number(item.price), lang)}
                      </td>
                      <td className="py-3 text-right font-semibold text-fg">
                        {formatPrice(Number(item.price) * item.quantity, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="glass-elevated p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-fg-dim">
                <span>{ar ? "مجموع العناصر" : "Items total"}</span>
                <span>{formatPrice(Number(order.items_total), lang)}</span>
              </div>
              <div className="flex justify-between text-fg-dim">
                <span>{ar ? "الشحن" : "Shipping"}</span>
                <span>{formatPrice(Number(order.shipping_cost), lang)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald">
                  <span>
                    {ar ? "الخصم" : "Discount"}
                    {order.discount_code ? ` (${order.discount_code})` : ""}
                  </span>
                  <span>-{formatPrice(Number(order.discount), lang)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-heading text-lg font-bold text-fg">
                <span>{ar ? "الإجمالي" : "Grand total"}</span>
                <span className="text-brand">
                  {formatPrice(Number(order.grand_total), lang)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: customer + payment info ──────────────────── */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="glass-elevated p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              <User size={14} />
              <span>{ar ? "العميل" : "Customer"}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User size={14} className="mt-0.5 shrink-0 text-fg-dim" />
                <span className="text-fg">{order.customer_name}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0 text-fg-dim" />
                <div>
                  <p className="text-fg" dir="ltr">{order.customer_phone}</p>
                  {order.alt_phone && (
                    <p className="text-fg-dim" dir="ltr">{order.alt_phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-fg-dim" />
                <div className="text-fg">
                  <p>{order.governorate} — {order.city}</p>
                  <p className="text-fg-dim">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="glass-elevated p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              <CreditCard size={14} />
              <span>{ar ? "الدفع" : "Payment"}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-fg-dim">{ar ? "الطريقة" : "Method"}</span>
                <span className="text-fg">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-dim">{ar ? "الحالة" : "Status"}</span>
                <StatusPill value={order.payment_status} />
              </div>
              <div className="flex justify-between">
                <span className="text-fg-dim">{ar ? "التنفيذ" : "Fulfillment"}</span>
                <StatusPill value={order.fulfillment_status} />
              </div>
              {order.kashier_payment_id && (
                <div className="flex justify-between">
                  <span className="text-fg-dim">Kashier ID</span>
                  <span className="font-mono text-xs text-fg-dim">
                    {order.kashier_payment_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="glass-elevated p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
                {ar ? "ملاحظات" : "Notes"}
              </p>
              <p className="text-sm text-fg">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const cls: Record<string, string> = {
    paid: "pill-success",
    pending: "pill-warning",
    failed: "pill-danger",
    delivered: "pill-success",
    shipped: "pill-info",
    processing: "pill-warning",
    cancelled: "pill-danger",
    refunded: "pill-neutral",
  };
  return <span className={`pill ${cls[value] ?? "pill-neutral"}`}>{value}</span>;
}
