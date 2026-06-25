"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  Wind,
  Plus,
  Check,
} from "lucide-react";
import { useLang } from "@/components/language/provider";
import { useCart, clearCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { GovernorateOption } from "@/lib/data/locations";


interface BumpProduct {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  originalPrice: number;
  bumpPrice: number;
  desc_en?: string;
  desc_ar?: string;
  image: string | null;
  stock: number;
}

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const items = useCart();
  const ar = lang === "ar";

  const [governorates, setGovernorates] = useState<GovernorateOption[]>([]);
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", alt_phone: "", governorate: "", city: "",
    address: "", notes: "", payment_method: "cod" as "cod" | "card", discount_code: "",
  });
  const [shipping, setShipping] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAltPhone, setShowAltPhone] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [bumpAdded, setBumpAdded] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [bumpProduct, setBumpProduct] = useState<BumpProduct | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(600);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const bumpTotal = bumpAdded && bumpProduct ? bumpProduct.bumpPrice : 0;
  const checkoutItemsTotal = subtotal + bumpTotal;
  const freeShipping = checkoutItemsTotal >= freeShippingThreshold;

  useEffect(() => {
    fetch("/api/checkout-data")
      .then((r) => r.json())
      .then((d) => {
        setGovernorates(d.governorates ?? []);
        if (d.bumpProduct) setBumpProduct(d.bumpProduct);
        const threshold = Number(d.freeShippingThreshold);
        if (Number.isFinite(threshold) && threshold > 0) {
          setFreeShippingThreshold(threshold);
        }
      })
      .catch(() => {});
  }, []);

  async function fetchShipping(gov: string, city: string) {
    if (!gov || !city) { setShipping(null); return; }
    setShippingLoading(true);
    try {
      const r = await fetch(`/api/shipping?governorate=${encodeURIComponent(gov)}&city=${encodeURIComponent(city)}`);
      const d = await r.json();
      setShipping(Number(d.cost ?? 0));
    } catch { setShipping(null); }
    finally { setShippingLoading(false); }
  }

  const hasLocation = Boolean(form.governorate && form.city);
  const effectiveShipping = freeShipping ? 0 : shipping ?? 0;
  const total = checkoutItemsTotal + (hasLocation ? effectiveShipping : 0);
  const bumpDesc = bumpProduct
    ? (ar ? bumpProduct.desc_ar : bumpProduct.desc_en) || t.checkout.bumpDesc
    : t.checkout.bumpDesc;

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) { setError(ar ? "السلة فارغة." : "Your cart is empty."); return; }
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({ product_id: i.id, name_en: i.name_en, name_ar: i.name_ar, price: i.price, quantity: i.quantity, image: i.image }));
      if (bumpAdded && bumpProduct) {
        orderItems.push({
          product_id: bumpProduct.id,
          name_en: `[Bump] ${bumpProduct.name_en}`,
          name_ar: `[عرض] ${bumpProduct.name_ar}`,
          price: bumpProduct.bumpPrice,
          quantity: 1,
          image: bumpProduct.image ?? "",
        });
      }
      const payload = { ...form, items: orderItems };
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      if (form.payment_method === "card" && data.redirect?.startsWith("http")) { clearCart(); window.location.href = data.redirect; return; }
      clearCart();
      router.push(data.redirect ?? `/checkout/success?order=${data.order_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "حدث خطأ" : "An error occurred");
    } finally { setSubmitting(false); }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-fg">{t.cart.empty}</h1>
        <Link href="/category/carcare" className="btn btn-primary mt-6">{t.cart.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="flex items-center gap-3 font-heading text-3xl font-bold text-fg">
        <Lock size={24} className="text-brand" />
        {t.checkout.title}
      </h1>

      {/* Mobile mini summary (collapsible) */}
      <div className="mt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((v) => !v)}
          className="glass flex w-full items-center justify-between p-4"
        >
          <span className="text-sm text-fg-muted">
            {items.length} {t.checkout.items} &mdash; <span className="font-semibold text-brand">{formatPrice(subtotal, lang)}</span>
          </span>
          {mobileSummaryOpen ? <ChevronUp size={16} className="text-fg-dim" /> : <ChevronDown size={16} className="text-fg-dim" />}
        </button>
        {mobileSummaryOpen && (
          <div className="glass mt-1 max-h-48 space-y-2 overflow-y-auto p-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image src={item.image} alt="" fill sizes="32px" className="object-contain p-0.5" />
                </div>
                <span className="min-w-0 flex-1 truncate text-fg-muted">{ar ? item.name_ar : item.name_en} x{item.quantity}</span>
                <span className="font-medium text-fg">{formatPrice(item.price * item.quantity, lang)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="space-y-6">
          <div className="glass p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">{t.checkout.contactInfo}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t.checkout.fullName}>
                <input required value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} className="input" placeholder={ar ? "محمد أحمد" : "Mohamed Ahmed"} />
              </Field>
              <Field label={t.checkout.phone}>
                <input required type="tel" dir="ltr" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} className="input" placeholder="01XXXXXXXXX" />
              </Field>

              {/* Collapsible alt phone */}
              {showAltPhone ? (
                <Field label={t.checkout.altPhone}>
                  <input type="tel" dir="ltr" value={form.alt_phone} onChange={(e) => set("alt_phone", e.target.value)} className="input" placeholder="01XXXXXXXXX" />
                </Field>
              ) : (
                <div className="flex items-end">
                  <button type="button" onClick={() => setShowAltPhone(true)} className="flex items-center gap-1.5 text-xs text-fg-dim transition hover:text-brand">
                    <Plus size={12} />
                    {t.checkout.addAltPhone}
                  </button>
                </div>
              )}

              <Field label={t.checkout.governorate}>
                <select required value={form.governorate} onChange={(e) => { set("governorate", e.target.value); set("city", ""); setShipping(null); }} className="input">
                  <option value="">{ar ? "اختر المحافظة" : "Select governorate"}</option>
                  {governorates.map((g) => <option key={g.ar} value={g.ar}>{ar ? g.ar : `${g.en} (${g.ar})`}</option>)}
                </select>
              </Field>
              <Field label={t.checkout.city}>
                <select required value={form.city} onChange={(e) => { set("city", e.target.value); void fetchShipping(form.governorate, e.target.value); }} className="input" disabled={!form.governorate}>
                  <option value="">{ar ? "اختر المدينة" : "Select city"}</option>
                  {governorates.find((g) => g.ar === form.governorate)?.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={t.checkout.address} className="sm:col-span-2">
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  rows={2}
                  className="input"
                  placeholder={t.checkout.addressPlaceholder}
                />
              </Field>
            </div>
          </div>

          {/* Payment */}
          <div className="glass p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">{t.checkout.paymentMethod}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PaymentOption checked={form.payment_method === "cod"} onChange={() => set("payment_method", "cod")} Icon={Banknote} title={t.checkout.cod} hint={ar ? "ادفع نقدا عند الاستلام" : "Pay cash on arrival"} />
              <PaymentOption checked={form.payment_method === "card"} onChange={() => set("payment_method", "card")} Icon={CreditCard} title={t.checkout.card} hint={ar ? "فيزا / ماستركارد عبر Kashier" : "Visa / Mastercard via Kashier"} />
            </div>
          </div>

          {/* Collapsible discount code */}
          <div className="glass p-4">
            {showDiscount ? (
              <div className="flex gap-2">
                <input
                  value={form.discount_code}
                  onChange={(e) => set("discount_code", e.target.value)}
                  className="input flex-1"
                  placeholder={t.checkout.discountPlaceholder}
                />
              </div>
            ) : (
              <button type="button" onClick={() => setShowDiscount(true)} className="flex items-center gap-1.5 text-sm text-fg-dim transition hover:text-brand">
                <Plus size={14} />
                {t.checkout.discountToggle}
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="glass-elevated hidden h-fit p-6 lg:block">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">{t.checkout.orderSummary}</h2>
          <div className="mt-5 max-h-60 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image src={item.image} alt="" fill sizes="44px" className="object-contain p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-medium text-fg">{ar ? item.name_ar : item.name_en}</p>
                  <p className="text-xs text-fg-dim">x{item.quantity}</p>
                </div>
                <span className="text-xs font-medium text-fg">{formatPrice(item.price * item.quantity, lang)}</span>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
            <Row label={t.cart.subtotal} value={formatPrice(subtotal, lang)} />
            {bumpTotal > 0 && <Row label={ar ? "عرض إضافي" : "Add-on offer"} value={formatPrice(bumpTotal, lang)} />}
            <Row
              label={t.cart.shipping}
              value={
                !hasLocation
                  ? (ar ? "اختر العنوان" : "Select address")
                  : shippingLoading
                    ? "..."
                    : freeShipping
                      ? (ar ? "مجاني" : "Free")
                      : formatPrice(effectiveShipping, lang)
              }
              dim={!hasLocation || shippingLoading}
            />
          </dl>
          <div className="mt-5 flex justify-between border-t border-border pt-5">
            <span className="font-semibold text-fg">{t.cart.total}</span>
            <span className="text-xl font-bold text-brand">{formatPrice(total, lang)}</span>
          </div>

          {/* Order bump — only show if bump product was resolved from DB */}
          {bumpProduct && (
            <div className={`mt-5 cursor-pointer p-4 ${bumpAdded ? "bump-card bump-card-active" : "bump-card"}`} onClick={() => setBumpAdded((v) => !v)}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${bumpAdded ? "border-gold bg-gold text-white" : "border-border"}`}>
                  {bumpAdded && <Check size={12} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-gold" />
                    <span className="text-sm font-semibold text-fg">
                      {ar ? `أضف ${bumpProduct.name_ar}` : `Add ${bumpProduct.name_en}`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-fg-dim">{bumpDesc}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gold">{formatPrice(bumpProduct.bumpPrice, lang)}</span>
                    <span className="text-xs text-fg-dim line-through">{formatPrice(bumpProduct.originalPrice, lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <p className="mt-4 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5 text-sm text-brand-soft">{error}</p>}

          <button type="submit" disabled={submitting || !hasLocation || shippingLoading} className="btn btn-primary mt-6 w-full gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> {ar ? "جارٍ المعالجة..." : "Processing..."}</> : <><ShieldCheck size={16} /> {t.checkout.placeOrder}</>}
          </button>

          {/* Security reassurance */}
          <div className="mt-4 space-y-1.5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-fg-dim">
              <Lock size={10} />
              {t.checkout.secureData}
            </p>
          </div>
        </aside>

        {/* Mobile sticky bottom bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ink/95 p-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {/* Order bump mobile */}
            {bumpProduct && (
              <div className={`cursor-pointer p-3 ${bumpAdded ? "bump-card bump-card-active" : "bump-card"}`} onClick={() => setBumpAdded((v) => !v)}>
                <div className="flex items-center gap-2">
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${bumpAdded ? "border-gold bg-gold text-white" : "border-border"}`}>
                    {bumpAdded && <Check size={10} />}
                  </div>
                  <Wind size={12} className="text-gold" />
                  <span className="text-xs font-semibold text-fg">{ar ? `أضف ${bumpProduct.name_ar}` : `Add ${bumpProduct.name_en}`}</span>
                  <span className="ml-auto text-xs font-bold text-gold">{formatPrice(bumpProduct.bumpPrice, lang)}</span>
                  <span className="text-[10px] text-fg-dim line-through">{formatPrice(bumpProduct.originalPrice, lang)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-xs text-fg-dim">{t.cart.total}</span>
                <span className="ml-2 text-lg font-bold text-brand">{formatPrice(total, lang)}</span>
              </div>
              <button type="submit" disabled={submitting || !hasLocation || shippingLoading} className="btn btn-primary gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {ar ? "أكد الطلب" : "Confirm"}
              </button>
            </div>

            {/* Security reassurance */}
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1 text-[10px] text-fg-dim">
                <Lock size={9} />
                {t.checkout.secureData}
              </p>
            </div>
          </div>
        </div>

        {/* Spacer for mobile sticky bar */}
        <div className="h-40 lg:hidden" />
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (<label className={`block ${className}`}><span className="mb-1.5 block text-xs font-medium text-fg-dim">{label}</span>{children}</label>);
}

function PaymentOption({ checked, onChange, Icon, title, hint }: { checked: boolean; onChange: () => void; Icon: React.ComponentType<{ size?: number }>; title: string; hint: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-brand bg-brand/5" : "border-border hover:border-border-hover"}`}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-1 accent-brand" />
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${checked ? "bg-brand/10 text-brand" : "bg-white/[0.03] text-fg-dim"}`}>
          <Icon size={18} />
        </div>
        <div><span className="block text-sm font-semibold text-fg">{title}</span><span className="block text-xs text-fg-dim">{hint}</span></div>
      </div>
    </label>
  );
}

function Row({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (<div className="flex justify-between"><dt className="text-fg-dim">{label}</dt><dd className={dim ? "text-fg-dim" : "font-medium text-fg"}>{value}</dd></div>);
}
