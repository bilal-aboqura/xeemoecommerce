import type { Metadata } from "next";
import { Cairo, Oswald, Bebas_Neue, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Script from "next/script";
import { getLang } from "@/lib/i18n/server";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  ),
  title: {
    default: "اكسيمو — كيماويات العناية بالسيارات | Xeemo Egypt",
    template: "%s | Xeemo اكسيمو",
  },
  description:
    "منتجات تلميع وعناية بالسيارات والموتوسيكلات والسجاد — صناعة مصرية. الدفع عند الاستلام. شحن مجاني فوق 600 ج.م. اطلب اونلاين دلوقتي.",
  keywords: [
    "اكسيمو",
    "Xeemo",
    "عناية بالسيارات",
    "تلميع سيارات",
    "كيماويات سيارات",
    "داشبورد شاينر",
    "سنو فوم",
    "تاير شاينر",
    "منظف محرك",
    "معطر جو",
    "منظف سجاد",
    "car care Egypt",
    "car chemicals",
    "dashboard shiner",
    "snow foam",
    "صناعة مصرية",
    "الدفع عند الاستلام",
  ],
  authors: [{ name: "Xeemo" }],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: "Xeemo اكسيمو",
    title: "اكسيمو — كيماويات العناية بالسيارات | Xeemo Egypt",
    description:
      "منتجات تلميع وعناية بالسيارات — صناعة مصرية. الدفع عند الاستلام. شحن مجاني فوق 600 ج.م.",
  },
  twitter: {
    card: "summary_large_image",
    title: "اكسيمو — كيماويات العناية بالسيارات | Xeemo",
    description:
      "منتجات العناية بالسيارات صناعة مصرية. الدفع عند الاستلام متاح.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cairo.variable} ${oswald.variable} ${bebas.variable} ${roboto.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '69514874679290');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=69514874679290&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Providers initialLang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
