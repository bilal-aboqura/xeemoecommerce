<div align="center">
  <img src="public/images/logo.webp" alt="Xeemo Logo" width="150" />

  # Xeemo E-Commerce Platform 🚗✨
  **Premium Car Care Chemicals — Direct to Consumer**
  
  [![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js)](https://nextjs.org/)
  [![React 19](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
  [![Tailwind v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB_%26_Auth-3ECF8E?logo=supabase)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
</div>

<br />

Welcome to the **Xeemo** official storefront and admin dashboard. This is a full-stack, high-performance E-Commerce platform built from the ground up for a premium automotive care brand based in Egypt.

It features a cutting-edge technical stack, an integrated CMS/Admin panel, buttery-smooth animations, and a flawlessly localized (English/Arabic RTL) user experience.

---

## 🌟 Key Features

- **🛍️ Sleek Storefront:** Dynamic hero carousels, responsive product grids, and a seamless checkout flow.
- **🌍 Native Dual Language:** Zero-flicker English and Arabic support. Full RTL (Right-to-Left) CSS grid layout built natively.
- **🛡️ Integrated Admin Dashboard:** Protected routes (`/admin/*`) to manage orders, products, customers, and analytics in real time.
- **📈 Advanced Analytics:** Integrated with Meta Pixel for firing robust tracking events (`PageView`, `Purchase`, etc.) to calculate precise ROAS.
- **⚡ Next-Gen Performance:** Powered by Next.js 16 App Router, React 19, and Turbopack. Server Components used aggressively to minimize client bundles.
- **💎 Premium UI/UX:** Built with TailwindCSS v4. Includes glassmorphism effects, custom scroll-snapping testimonials, and micro-interactions powered by Lucide icons and pure CSS transitions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2.9 (App Router)
- **UI Library:** React 19.2.4
- **Styling:** Tailwind CSS v4 (Using modern `@theme` CSS variables)
- **Icons:** `lucide-react`
- **Typography:** Custom Google Fonts (Cairo, Oswald, Bebas Neue, Roboto)

### Backend & Database
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (Service Roles & Client matching)
- **Data Fetching:** React Server Components (RSC) & Server Actions

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/xeemo-ecom.git
cd xeemo-ecom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials.
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Direct Connection (Used for Migrations)
DIRECT_URL=your_postgres_direct_url
```

### 4. Database Setup & Seeding
Ensure your `.env.local` is fully populated. Then run the database scripts to prepare the schema and seed the initial catalog.
```bash
# Apply schema and seed catalog, locations, and shipping
node --env-file=.env.local scripts/migrate.mjs

# Create the primary admin account
node --env-file=.env.local scripts/seed-admin.mjs
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The Admin Panel is located at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 📁 Project Structure

```text
xeemo-ecom/
├── public/                 # Static assets (images, logos, webp)
├── scripts/                # Database migration and seeding scripts
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   │   ├── (storefront)/   # Public-facing e-commerce pages
│   │   ├── admin/          # Secure admin dashboard routes
│   │   └── api/            # API Route handlers (webhooks, checkouts)
│   ├── components/         # Shared React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── storefront/     # Storefront-specific components
│   │   └── language/       # i18n Language context & toggles
│   └── lib/                # Utilities, translations, database clients
└── supabase/               # Supabase configuration and raw SQL schema
```

---

## 🧠 Architectural Decisions

- **Middleware Routing:** Centralized in `src/proxy.ts` to manage auth redirects optimistically before rendering protected `/admin/*` layouts.
- **Translation State:** Avoided standard `useState` or deeply nested React Contexts for translations. Instead, we use `useSyncExternalStore` combined with `getServerSnapshot` to hydrate components safely from server-side cookies, preventing hydration mismatches.
- **RTL Scrolling:** Avoided heavy JS libraries for carousels. We use native CSS `scroll-snap-type` combined with physical `scrollBy` calculations that universally respect LTR/RTL browser behaviors.

---

## 🔒 Verification & Building

To verify code quality and build for production:

```bash
# Lint code
npm run lint

# Typecheck and create production build
npm run build

# Start production server
npm run start
```

---

<div align="center">
  <sub>Built with passion for <strong>Xeemo Egypt</strong>. All rights reserved &copy; 2026.</sub>
</div>
