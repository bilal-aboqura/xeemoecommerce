import { getLang } from "@/lib/i18n/server";
import { CheckCircle, XCircle } from "lucide-react";

export default async function AdminSettingsPage() {
  const lang = await getLang();
  const ar = lang === "ar";

  const config = [
    { label: ar ? "حالة Supabase" : "Supabase status", ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Connected" : "Not configured" },
    { label: ar ? "حالة Kashier" : "Kashier status", ok: Boolean(process.env.KASHIER_MERCHANT_ID), value: process.env.KASHIER_MERCHANT_ID ? `${process.env.KASHIER_MERCHANT_ID} (${process.env.KASHIER_TESTMODE !== "false" ? "TEST" : "LIVE"})` : "Not configured" },
    { label: ar ? "رقم WhatsApp" : "WhatsApp number", ok: Boolean(process.env.WHATSAPP_ALERT_NUMBER), value: process.env.WHATSAPP_ALERT_NUMBER || "Not set" },
    { label: ar ? "Google Sheets" : "Google Sheets", ok: Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL), value: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? "Configured" : "Not set" },
    { label: ar ? "رابط الموقع" : "Site URL", ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL), value: process.env.NEXT_PUBLIC_SITE_URL || "Not set" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">{ar ? "الإعدادات" : "Settings"}</h1>
      <p className="mt-1 text-sm text-fg-dim">{ar ? "هذه الإعدادات تُعدّل من ملف .env.local على الخادم." : "These settings are configured via .env.local on the server."}</p>

      <div className="glass mt-6 divide-y divide-border">
        {config.map((c) => (
          <div key={c.label} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-fg-muted">{c.label}</span>
            <span className="flex items-center gap-2 text-sm font-medium text-fg">
              {c.ok ? <CheckCircle size={14} className="text-emerald" /> : <XCircle size={14} className="text-brand" />}
              {c.value}
            </span>
          </div>
        ))}
      </div>

      <div className="glass mt-6 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">{ar ? "معلومات المالك" : "Owner account"}</h2>
        <p className="mt-3 text-sm text-fg-muted">{ar ? "البريد:" : "Email:"} <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs">{process.env.ADMIN_EMAIL}</code></p>
        <p className="mt-1 text-xs text-fg-dim">{ar ? "لتغيير كلمة المرور: استخدم Supabase Studio" : "To change password: use Supabase Studio or re-run scripts/seed-admin.mjs"}</p>
      </div>
    </div>
  );
}
