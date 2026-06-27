"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ExternalLink, MapPin, Phone } from "lucide-react";
import { useLang } from "@/components/language/provider";

export function Footer() {
  const { t, lang } = useLang();
  const year = new Date().getFullYear();
  const ar = lang === "ar";

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt={t.brand} 
                width={120} 
                height={32} 
                className="h-8 w-auto object-contain brightness-0"
              />
              <span className="text-lg font-bold tracking-tight text-fg">
                {t.brand}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fg-dim">
              {t.tagline}
            </p>
            <div className="mt-5 flex gap-2">
              <SocialLink
                href="https://wa.me/201150301033"
                label="WhatsApp"
                icon={<MessageCircle size={16} />}
              />
              <SocialLink
                href="https://www.facebook.com/officialxeemo"
                label="Facebook"
                icon={<ExternalLink size={16} />}
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {t.nav.products}
            </h4>
            <ul className="mt-4 space-y-2.5">
              <FooterLink href="/category/carcare">{t.nav.carcare}</FooterLink>
              <FooterLink href="/category/motocare">{t.nav.motocare}</FooterLink>
              <FooterLink href="/category/carpets">{t.nav.carpets}</FooterLink>
              <FooterLink href="/category/air-freshener">{t.nav.freshener}</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {t.brand}
            </h4>
            <ul className="mt-4 space-y-2.5">
              <FooterLink href="/about">{t.nav.about}</FooterLink>
              <FooterLink href="/contact">{t.nav.contact}</FooterLink>
              <FooterLink href="/cart">{t.nav.cart}</FooterLink>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
              {t.nav.contact}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-fg-dim">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-fg-dim" />
                <span dir="ltr">+20 115 030 1033</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-fg-dim" />
                <span>{ar ? "مصر" : "Egypt"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-fg-dim">
            &copy; {year} {t.brand}. {t.footer.rights}
          </p>
          <p className="text-xs text-fg-dim">
            {t.footer.developedBy}{" "}
            <span className="font-medium text-fg-muted">Bilal Aboqura</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-fg-dim transition hover:text-fg"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-dim transition hover:border-brand/40 hover:text-brand"
    >
      {icon}
    </a>
  );
}
