import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/utils";
import { Truck } from "lucide-react";
import { ShipmentStatus } from "@/types/app";
import { TrackingMap } from "@/components/tracking/tracking-map";

export default async function DriverDeliveriesPage() {
  const { user, supabase } = await requireRole(["driver"]);

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("driver_id", driver?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-navy-900">
          All deliveries
        </h1>
        <p className="text-sm text-navy-500">
          Full history of shipments assigned to you.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {!shipments || shipments.length === 0 ? (
            <div className="p-10 text-center">
              <Truck className="mx-auto h-8 w-8 text-navy-300" />
              <p className="mt-3 text-sm font-medium text-navy-600">
                No deliveries yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100">
              {shipments.map((s) => (
                <Link
                  key={s.id}
                  href={`/driver/deliveries/${s.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-navy-50/50"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-navy-900">
                      {s.tracking_number}
                    </p>
                    <p className="mt-0.5 text-xs text-navy-500">
                      {s.pickup_address.split(",")[0]} →{" "}
                      {s.delivery_address.split(",")[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-navy-400">
                      {formatDate(s.created_at)}
                    </span>
                    <StatusBadge status={s.status as ShipmentStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
