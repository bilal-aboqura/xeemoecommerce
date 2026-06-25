import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { SetupNotice } from "@/components/admin/setup-notice";
import { ToastProvider } from "@/components/admin/toast";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return <SetupNotice />;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login?error=notadmin");

  return (
    <ToastProvider>
      <div className="admin-light min-h-[calc(100dvh-72px)] bg-ink text-fg">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-border bg-ink/70 px-5 backdrop-blur-xl lg:px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Xeemo" 
              width={120} 
              height={32} 
              className="h-8 w-auto object-contain"
            />
            <span className="text-base font-bold text-fg">Xeemo</span>
            <span className="pill pill-info text-[10px]">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fg-dim transition hover:bg-white/[0.04] hover:text-fg">
              <Store size={14} />
              <span className="hidden sm:inline">View store</span>
            </Link>
            <LogoutButton />
          </div>
        </header>
        <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
          <AdminSidebar />
          <div className="min-w-0 flex-1 px-5 py-6 lg:px-8">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
