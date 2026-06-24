"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useToast } from "@/components/admin/toast";
import type { AdminSetting } from "@/lib/data/admin-crud";

const KEY_DESCRIPTIONS: Record<string, { en: string; ar: string }> = {
  stat_customers: { en: "Total customers count", ar: "عدد العملاء الإجمالي" },
  stat_carwashes: { en: "Total car washes count", ar: "عدد غسلات السيارات" },
  stat_rating: { en: "Average customer rating", ar: "متوسط تقييم العملاء" },
  hero_title: { en: "Hero section title", ar: "عنوان القسم الرئيسي" },
  hero_subtitle: { en: "Hero section subtitle", ar: "العنوان الفرعي للقسم الرئيسي" },
  about_text: { en: "About us text", ar: "نص من نحن" },
  footer_text: { en: "Footer text", ar: "نص التذييل" },
  contact_email: { en: "Contact email", ar: "البريد الإلكتروني للتواصل" },
  contact_phone: { en: "Contact phone number", ar: "رقم هاتف التواصل" },
};

const LABELS = {
  en: {
    save: "Save",
    saving: "Saving…",
    addSetting: "Add setting",
    addNew: "Add new setting",
    key: "Key",
    english: "English",
    arabic: "Arabic",
    cancel: "Cancel",
    create: "Create",
    creating: "Creating…",
    keyPlaceholder: "setting_key",
    valuePlaceholder: "Value",
  },
  ar: {
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    addSetting: "إضافة إعداد",
    addNew: "إضافة إعداد جديد",
    key: "المفتاح",
    english: "English",
    arabic: "Arabic",
    cancel: "إلغاء",
    create: "إنشاء",
    creating: "جارٍ الإنشاء…",
    keyPlaceholder: "setting_key",
    valuePlaceholder: "القيمة",
  },
};

function ValueField({
  value,
  onChange,
  dir,
}: {
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl";
}) {
  const isLong = value.length > 80;

  if (isLong) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        dir={dir}
        className={textareaCls}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={dir}
      className={inputCls}
    />
  );
}

export function SettingsEditor({
  settings,
  lang,
}: {
  settings: AdminSetting[];
  lang: "en" | "ar";
}) {
  const [items, setItems] = useState(settings);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValueEn, setNewValueEn] = useState("");
  const [newValueAr, setNewValueAr] = useState("");
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const t = LABELS[lang];

  async function save(key: string) {
    setSaving(key);
    const item = items.find((i) => i.key === key);
    if (!item) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  function update(key: string, field: "value_en" | "value_ar", value: string) {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)),
    );
  }

  async function createSetting() {
    const trimmedKey = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmedKey) return;
    if (items.some((i) => i.key === trimmedKey)) {
      toast.error(lang === "ar" ? "المفتاح موجود بالفعل" : "Key already exists");
      return;
    }

    setCreating(true);
    const newItem: AdminSetting = {
      key: trimmedKey,
      value_en: newValueEn,
      value_ar: newValueAr,
    };
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => [...prev, newItem]);
      setNewKey("");
      setNewValueEn("");
      setNewValueAr("");
      setShowAdd(false);
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {items.map((s) => {
        const desc = KEY_DESCRIPTIONS[s.key];
        return (
          <div key={s.key} className="glass p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <code className="rounded bg-white/10 px-2 py-0.5 text-xs text-fg-muted">
                  {s.key}
                </code>
                {desc && (
                  <span className="text-xs text-fg-dim">
                    {lang === "ar" ? desc.ar : desc.en}
                  </span>
                )}
              </div>
              <button
                onClick={() => save(s.key)}
                disabled={saving === s.key}
                className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                <Check size={12} />
                {saving === s.key ? t.saving : t.save}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-fg-dim">{t.english}</span>
                <ValueField
                  value={s.value_en}
                  onChange={(v) => update(s.key, "value_en", v)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-fg-dim">{t.arabic}</span>
                <ValueField
                  value={s.value_ar}
                  onChange={(v) => update(s.key, "value_ar", v)}
                  dir="rtl"
                />
              </label>
            </div>
          </div>
        );
      })}

      {showAdd ? (
        <div className="glass p-4">
          <h3 className="mb-3 text-sm font-semibold text-fg">{t.addNew}</h3>
          <div className="mb-3">
            <label className="block">
              <span className="mb-1 block text-xs text-fg-dim">{t.key}</span>
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={t.keyPlaceholder}
                className={inputCls}
              />
            </label>
          </div>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-fg-dim">{t.english}</span>
              <ValueField
                value={newValueEn}
                onChange={setNewValueEn}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-fg-dim">{t.arabic}</span>
              <ValueField
                value={newValueAr}
                onChange={setNewValueAr}
                dir="rtl"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createSetting}
              disabled={creating || !newKey.trim()}
              className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              <Check size={12} />
              {creating ? t.creating : t.create}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setNewKey("");
                setNewValueEn("");
                setNewValueAr("");
              }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-fg-muted hover:bg-white/5"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-4 py-2 text-xs font-semibold text-fg-muted hover:border-brand hover:text-brand"
        >
          <Plus size={14} />
          {t.addSetting}
        </button>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-brand";

const textareaCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-brand resize-y";
