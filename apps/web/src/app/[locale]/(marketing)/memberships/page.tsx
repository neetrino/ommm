export default function MembershipsMarketingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Memberships</h1>
      <p className="mt-4 text-zinc-600">
        Plans from `GET /v1/memberships/plans` — checkout via Stripe when configured.
      </p>
    </div>
  );
}
