"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLang } from "@/components/language/provider";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useLang();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fg-dim transition hover:bg-white/[0.04] hover:text-brand"
    >
      <LogOut size={14} />
      <span className="hidden sm:inline">{t.admin.logout}</span>
    </button>
  );
}
