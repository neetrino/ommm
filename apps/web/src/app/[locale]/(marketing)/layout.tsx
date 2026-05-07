import { MarketingSiteFooter } from "@/components/marketing/marketing-site-footer";
import { MarketingSiteHeader } from "@/components/marketing/marketing-site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <MarketingSiteHeader />
      <main className="flex-1">{children}</main>
      <MarketingSiteFooter />
    </div>
  );
}
