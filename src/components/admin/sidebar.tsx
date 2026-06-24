"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Truck,
  FileText,
  Palette,
  Settings,
  BarChart3,
} from "lucide-react";
import { useLang } from "@/components/language/provider";
import { cn } from "@/lib/utils";

type NavKey = "dashboard" | "analytics" | "products" | "orders" | "customers" | "discounts" | "shipping" | "content" | "customize" | "settings";

interface NavItem {
  href: string;
  key: NavKey;
  Icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: { en: string; ar: string };
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: { en: "Overview", ar: "نظرة عامة" },
    items: [
      { href: "/admin", key: "dashboard", Icon: LayoutDashboard },
      { href: "/admin/analytics", key: "analytics", Icon: BarChart3 },
    ],
  },
  {
    label: { en: "Commerce", ar: "التجارة" },
    items: [
      { href: "/admin/products", key: "products", Icon: Package },
      { href: "/admin/orders", key: "orders", Icon: ShoppingCart },
      { href: "/admin/customers", key: "customers", Icon: Users },
    ],
  },
  {
    label: { en: "Configuration", ar: "الإعدادات" },
    items: [
      { href: "/admin/discounts", key: "discounts", Icon: Tag },
      { href: "/admin/shipping", key: "shipping", Icon: Truck },
      { href: "/admin/content", key: "content", Icon: FileText },
      { href: "/admin/customize", key: "customize", Icon: Palette },
      { href: "/admin/settings", key: "settings", Icon: Settings },
    ],
  },
];

function getNavLabel(key: NavKey, t: Record<string, string>, ar: boolean): string {
  if (key === "analytics") return ar ? "التحليلات" : "Analytics";
  if (key === "customize") return ar ? "التخصيص" : "Customize";
  return t[key];
}

export function AdminSidebar() {
  const { t, lang } = useLang();
  const pathname = usePathname();
  const ar = lang === "ar";

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-ink-2/30 p-3 lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] lg:w-56 lg:border-b-0 lg:border-r">
      {/* Desktop: vertical grouped nav */}
      <nav className="hidden lg:flex lg:flex-col lg:gap-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="my-2 border-t border-border" />}
            <p className="mb-1 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fg-muted/50">
              {ar ? group.label.ar : group.label.en}
            </p>
            {group.items.map(({ href, key, Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-brand text-white shadow-sm shadow-brand/20"
                      : "text-fg-dim hover:bg-white/[0.04] hover:text-fg",
                  )}
                >
                  <Icon size={16} />
                  <span>{getNavLabel(key, t.admin, ar)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Mobile: horizontal scroll with edge shadows */}
      <div className="relative lg:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-ink-2/30 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-ink-2/30 to-transparent" />
        <nav className="flex gap-1 overflow-x-auto px-1 scrollbar-none">
          {NAV_GROUPS.flatMap((group) => group.items).map(({ href, key, Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand text-white shadow-sm shadow-brand/20"
                    : "text-fg-dim hover:bg-white/[0.04] hover:text-fg",
                )}
              >
                <Icon size={16} />
                <span>{getNavLabel(key, t.admin, ar)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
