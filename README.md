# Xeemo Ecommerce

Next.js 16 + Supabase + Kashier ecommerce rebuild of the original Xeemo Car Care
static site. Bilingual (English / Arabic, RTL), dark/red glassmorphism brand,
guest checkout + optional accounts, card payments via Kashier and Cash on
Delivery, and a full owner admin panel.

> **Status — Phase 1 complete (scaffold).** The app runs in "scaffold mode"
> until Supabase + Kashier keys are added. See [Roadmap](#roadmap).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in keys (see below)
npm run dev                  # http://localhost:3000
```

Verify before committing:

```bash
npm run lint
npm run build
```

## Environment variables

All secrets live in `.env.local` (git-ignored). See `.env.example` for the full
list and inline docs. Highlights:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project (DB, Auth, Storage) |
| `KASHIER_MERCHANT_ID`, `KASHIER_API_KEY`, `KASHIER_TESTMODE`, `KASHIER_WEBHOOK_SECRET` | Kashier payment gateway (TEST first) |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (builds Kashier redirect/webhook URLs) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Mirror orders into Google Sheets (Apps Script) |
| `WHATSAPP_ALERT_NUMBER` | E.164 number (no `+`) that receives new-order alerts |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed credentials for the first owner account |

> Until the Supabase vars are set, the storefront runs without real data and the
> admin panel shows a setup notice instead of the login.

## Tech notes

- **Next.js 16 (App Router)** on `src/app`. Note: middleware is now **`proxy.ts`**
  (same functionality, new name). `params` / `searchParams` are Promises —
  always `await` them.
- **Tailwind v4** via `@tailwindcss/postcss`; brand tokens live in
  `src/app/globals.css` under `@theme` (utilities like `bg-brand`, `text-gold`,
  `font-display`).
- **Bilingual**: `src/components/language/provider.tsx` uses
  `useSyncExternalStore` over `localStorage('lang')`. Strings live in
  `src/lib/i18n/translations.ts`; product/catalog text comes from DB columns.
- **Supabase**: clients in `src/lib/supabase/`. All gracefully return `null`
  when env is missing so the app keeps running in scaffold mode. The service
  client bypasses RLS — server-only.
- **Fonts**: Cairo (Arabic + Latin), Oswald, Bebas Neue, Roboto via `next/font`.

## Project structure

```
src/
  app/
    (storefront)/        # public storefront (navbar + footer)
      page.tsx           # home
      layout.tsx
    admin/
      (protected)/        # auth-gated panel (dashboard, products, ...)
        layout.tsx
        page.tsx
      login/             # standalone login (no auth layout)
  components/
    language/            # i18n provider + EN/AR toggle
    storefront/          # navbar, footer, cart counter
    admin/               # sidebar, setup notice
  lib/
    i18n/translations.ts
    supabase/            # client, server, service, middleware/session
    utils.ts             # cn(), formatPrice()
  proxy.ts               # session refresh + optimistic /admin guard
```

## Roadmap

1. ✅ **Phase 1** — Scaffold: Next.js app, brand theme, bilingual i18n, proxy,
   auth guard, storefront + admin skeletons.
2. ⬜ **Phase 2** — Supabase schema + RLS + migrate the 38 products, governorates,
   and shipping rates; wire email/password auth and the owner admin flag.
3. ⬜ **Phase 3** — Storefront category pages, product detail, search/sort/filters.
4. ⬜ **Phase 4** — Cart, checkout, Kashier hosted-redirect + webhook (TEST),
   COD, order confirmation, WhatsApp + Google Sheets hooks.
5. ⬜ **Phase 5** — Admin CRUD: products/inventory, orders, customers, discounts,
   shipping-rate editor, content editor, dashboard analytics.
6. ⬜ **Phase 6** — Polish, SEO, image optimization, then deploy (Docker/PM2 +
   Nginx + SSL) and flip Kashier to LIVE.

## Origin

Rebuilt from the original static site at `D:\XemoMainWebSite` (38 products across
Car Care / Moto / Carpets / Air Freshener, Egypt-only shipping, WhatsApp + Google
Sheets order pipeline). That site is preserved as-is; this app lives in
`xeemo-ecom/`.
