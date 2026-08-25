import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RevenueChart, StatusPieChart } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { STATUS_LABEL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Package, Truck, Star, AlertCircle } from "lucide-react";
import type { ShipmentStatus } from "@/types/app";

export default async function AdminReportsPage() {
  const { supabase } = await requireRole(["admin"]);

  const [
    { data: shipments, error: shipmentsError },
    { data: drivers, error: driversError },
  ] = await Promise.all([
    supabase.from("shipments").select("status, price, created_at"),

    supabase.from("drivers").select("status"),
  ]);

  if (shipmentsError) {
    console.error("REPORTS SHIPMENTS ERROR:", shipmentsError);
  }

  if (driversError) {
    console.error("REPORTS DRIVERS ERROR:", driversError);
  }

  /*
   * ---------------------------------------------------------
   * REVENUE BY MONTH
   * ---------------------------------------------------------
   */

  const monthly = new Map<string, number>();

  (shipments ?? []).forEach((shipment) => {
    const date = new Date(shipment.created_at);

    // YYYY-MM gives us a unique month even across different years.
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    monthly.set(
      monthKey,
      (monthly.get(monthKey) ?? 0) + Number(shipment.price ?? 0),
    );
  });

  const revenueData = Array.from(monthly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => {
      const [year, monthNumber] = month.split("-");

      const label = new Date(
        Number(year),
        Number(monthNumber) - 1,
      ).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      return {
        month: label,
        revenue,
      };
    });

  /*
   * ---------------------------------------------------------
   * SHIPMENT STATUS
   * ---------------------------------------------------------
   */

  const statusCounts = new Map<ShipmentStatus, number>();

  (shipments ?? []).forEach((shipment) => {
    const status = shipment.status as ShipmentStatus;

    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  });

  const statusData = Array.from(statusCounts.entries()).map(
    ([status, value]) => ({
      name: STATUS_LABEL[status] ?? status,
      value,
    }),
  );

  /*
   * ---------------------------------------------------------
   * SUMMARY STATISTICS
   * ---------------------------------------------------------
   */

  const totalRevenue = (shipments ?? []).reduce(
    (total, shipment) => total + Number(shipment.price ?? 0),
    0,
  );

  const avgOrderValue =
    shipments && shipments.length > 0 ? totalRevenue / shipments.length : 0;

  const activeDrivers = (drivers ?? []).filter(
    (driver) => driver.status === "active",
  ).length;

  const deliveredCount = (shipments ?? []).filter(
    (shipment) => shipment.status === "delivered",
  ).length;

  const completionRate =
    shipments && shipments.length > 0
      ? Math.round((deliveredCount / shipments.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
          Reports &amp; analytics
        </h1>
        <p className="mt-0.5 text-sm font-medium text-navy-500">
          Revenue trends, delivery performance, and fleet utilization.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
        />

        <StatCard
          label="Avg. order value"
          value={formatCurrency(avgOrderValue)}
          icon={Package}
        />

        <StatCard
          label="Active drivers"
          value={String(activeDrivers)}
          icon={Truck}
        />

        <StatCard
          label="Completion rate"
          value={`${completionRate}%`}
          icon={Star}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 overflow-hidden border border-navy-100/80 bg-white shadow-xs rounded-xl">
          <CardHeader className="border-b border-navy-100/60 px-6 py-4 bg-white">
            <h2 className="font-display text-base font-bold text-navy-900">
              Revenue by month
            </h2>
          </CardHeader>

          <CardContent className="p-6">
            {revenueData.length > 0 ? (
              <RevenueChart data={revenueData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-navy-50 p-3 text-navy-400 ring-1 ring-inset ring-navy-100">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-navy-900">
                  No revenue data yet
                </p>
                <p className="mt-1 text-xs text-navy-500 max-w-sm">
                  Revenue information will appear here once shipments are
                  created.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card className="overflow-hidden border border-navy-100/80 bg-white shadow-xs rounded-xl">
          <CardHeader className="border-b border-navy-100/60 px-6 py-4 bg-white">
            <h2 className="font-display text-base font-bold text-navy-900">
              Shipments by status
            </h2>
          </CardHeader>

          <CardContent className="p-6">
            {statusData.length > 0 ? (
              <StatusPieChart data={statusData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-navy-50 p-3 text-navy-400 ring-1 ring-inset ring-navy-100">
                  <Package className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-navy-900">
                  No shipments yet
                </p>
                <p className="mt-1 text-xs text-navy-500 max-w-sm">
                  Shipment statistics will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Information */}
      {(shipmentsError || driversError) && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/80 p-4 text-xs font-medium text-rose-900 shadow-2xs">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-950">
              Some report data could not be loaded.
            </p>

            {shipmentsError && (
              <p className="text-rose-800">
                Shipments: {shipmentsError.message}
              </p>
            )}

            {driversError && (
              <p className="text-rose-800">Drivers: {driversError.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
