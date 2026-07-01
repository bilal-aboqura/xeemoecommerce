import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";

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
