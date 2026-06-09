import { redirect } from "next/navigation";

type GiftPaymentResultPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    reference?: string;
  }>;
};

/** Legacy route — redirects to unified payment success/fail pages. */
export default async function GiftPaymentResultPage({
  params,
  searchParams,
}: GiftPaymentResultPageProps) {
  const { locale } = await params;
  const { status, reference } = await searchParams;
  const query = new URLSearchParams({ source: "gift" });
  if (reference) {
    query.set("reference", reference);
  }
  const path = status === "success" ? "success" : "fail";
  redirect(`/${locale}/user/payments/${path}?${query.toString()}`);
}
