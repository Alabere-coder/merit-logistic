import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TrackingTimeline } from "@/components/shared/tracking-timeline";
import { StatusBadge } from "@/components/dashboard/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { formatDate } from "@/lib/utils";
import { PackageSearch, MapPin, SearchX } from "lucide-react";

export default async function PublicTrackPage({ params }: { params: { trackingNumber: string } }) {
  const supabase = createClient();
  const trackingNumber = decodeURIComponent(params.trackingNumber);

  // Public tracking intentionally exposes only status + city + timeline —
  // never sender/receiver phone numbers, price, or full addresses. Both
  // calls hit SECURITY DEFINER Postgres functions (see supabase/schema.sql)
  // rather than the shipments table directly, because RLS alone is
  // row-level and can't hide individual sensitive columns from anon.
  const { data: rows } = await supabase.rpc("get_public_tracking", {
    p_tracking_number: trackingNumber,
  });
  const shipment = rows?.[0] ?? null;

  const { data: events } = shipment
    ? await supabase.rpc("get_public_tracking_events", { p_tracking_number: trackingNumber })
    : { data: [] };

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />

      <div className="container-lg py-14">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-brand-500">
              <PackageSearch className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-700 text-navy-900">Shipment tracking</h1>
            <p className="mt-1 font-mono text-sm text-navy-400">
              {decodeURIComponent(params.trackingNumber)}
            </p>
          </div>

          {!shipment ? (
            <Card className="mt-8">
              <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
                <SearchX className="h-8 w-8 text-navy-300" />
                <p className="font-medium text-navy-700">No shipment found for that tracking number</p>
                <p className="text-sm text-navy-500">Double-check the number and try again.</p>
                <Link href="/#track" className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                  Try another tracking number
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="mt-8 space-y-6">
              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-navy-600">
                    <MapPin className="h-4 w-4 text-navy-400" />
                    {shipment.pickup_city} → {shipment.delivery_city}
                  </div>
                  <StatusBadge status={shipment.status} />
                </CardBody>
              </Card>

              {shipment.estimated_delivery && shipment.status !== "delivered" && shipment.status !== "cancelled" && (
                <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
                  Estimated delivery: <span className="font-semibold">{formatDate(shipment.estimated_delivery)}</span>
                </div>
              )}

              <Card>
                <CardHeader>
                  <h2 className="font-display text-base font-600 text-navy-900">Delivery history</h2>
                </CardHeader>
                <CardBody>
                  <TrackingTimeline status={shipment.status} events={events ?? []} />
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
