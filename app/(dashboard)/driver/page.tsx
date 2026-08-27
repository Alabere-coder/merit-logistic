import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { StatCard, StatusBadge } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Truck, CheckCircle2, Wallet, PackageX } from "lucide-react";
import { ShipmentStatus } from "@/types/app";

export default async function DriverOverviewPage() {
  const { user, supabase } = await requireRole(["driver"]);

  // Get the driver's database record
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER PROFILE ERROR:", driverError);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-700 text-navy-900">
            Your deliveries
          </h1>

          <p className="text-sm text-navy-500">
            Everything currently assigned to you.
          </p>
        </div>

        <Card>
          <CardContent className="p-10 text-center">
            <PackageX className="mx-auto h-8 w-8 text-red-400" />

            <p className="mt-3 text-sm font-medium text-red-600">
              Driver profile not found
            </p>

            <p className="mt-1 text-sm text-navy-400">
              Your driver account has not been properly configured. Please
              contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Now driver.id is guaranteed to be a string
  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select("*")
    .eq("driver_id", driver.id)
    .order("created_at", { ascending: false });

  if (shipmentsError) {
    console.error("DRIVER SHIPMENTS ERROR:", shipmentsError);
  }

  const assigned = (shipments ?? []).filter(
    (s) => !["delivered", "cancelled"].includes(s.status),
  );

  const completed = (shipments ?? []).filter((s) => s.status === "delivered");

  const earnings = completed.reduce(
    (sum, s) => sum + Number(s.price) * 0.75,
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-700 text-navy-900">
          Your deliveries
        </h1>

        <p className="text-sm text-navy-500">
          Everything currently assigned to you.
        </p>
      </div>

      {driver.status !== "active" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <PackageX className="h-4 w-4 shrink-0" />
          Your account is currently {driver.status}. Contact your administrator
          if this is unexpected.
        </div>
      )}

      {shipmentsError && (
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-red-600">
              Unable to load your deliveries
            </p>

            <p className="mt-1 text-sm text-red-500">
              {shipmentsError.message}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Assigned now"
          value={String(assigned.length)}
          icon={Truck}
        />

        <StatCard
          label="Completed jobs"
          value={String(completed.length)}
          icon={CheckCircle2}
        />

        <StatCard
          label="Total earnings"
          value={formatCurrency(earnings)}
          icon={Wallet}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-600 text-navy-900">
            Assigned shipments
          </h2>
        </CardHeader>

        <CardContent className="p-0">
          {assigned.length === 0 ? (
            <div className="p-10 text-center">
              <Truck className="mx-auto h-8 w-8 text-navy-300" />

              <p className="mt-3 text-sm font-medium text-navy-600">
                Nothing assigned right now
              </p>

              <p className="mt-1 text-sm text-navy-400">
                New deliveries from dispatch will show up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100">
              {assigned.map((s) => (
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
