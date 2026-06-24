import { adminListSettings } from "@/lib/data/admin-crud";
import { getLang } from "@/lib/i18n/server";
import { SettingsEditor } from "@/components/admin/settings-editor";

export default async function AdminContentPage() {
  const lang = await getLang();
  const ar = lang === "ar";
  const settings = await adminListSettings();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-fg">
        {ar ? "المحتوى" : "Content"}
      </h1>
      <p className="mt-1 text-sm text-fg-dim">
        {ar
          ? "حرر النصوص والمعلومات التي تظهر في الموقع."
          : "Edit the text and info shown across the storefront."}
      </p>
      <SettingsEditor settings={settings} lang={lang} />
    </div>
  );
}
