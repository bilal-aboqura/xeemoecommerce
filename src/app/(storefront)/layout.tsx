import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";

/** Shared layout for all storefront routes (navbar + footer). */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
