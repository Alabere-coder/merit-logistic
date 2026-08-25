import { requireRole } from "@/lib/auth/require-role";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, TrendingUp, Package } from "lucide-react";

const PAYOUT_RATE = 0.75;

export default async function DriverEarningsPage() {
  const { user, supabase } = await requireRole(["driver"]);

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Driver account not found.
      </div>
    );
  }

  const { data: completed, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, tracking_number, price, updated_at")
    .eq("driver_id", driver.id)
    .eq("status", "delivered")
    .order("updated_at", { ascending: false });

  if (shipmentError) {
    console.error("DRIVER EARNINGS ERROR:", shipmentError);
  }

  const jobs = completed ?? [];

  // Total driver earnings
  const total = jobs.reduce(
    (sum, job) => sum + Number(job.price) * PAYOUT_RATE,
    0,
  );

  // Current month earnings
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonth = jobs
    .filter((job) => {
      const date = new Date(job.updated_at);

      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce((sum, job) => sum + Number(job.price) * PAYOUT_RATE, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-700 text-navy-900">
          Earnings
        </h1>

        <p className="text-sm text-navy-500">
          Your payout for every completed delivery (
          {Math.round(PAYOUT_RATE * 100)}% of shipment price).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total earnings"
          value={formatCurrency(total)}
          icon={Wallet}
        />

        <StatCard
          label="This month"
          value={formatCurrency(thisMonth)}
          icon={TrendingUp}
        />

        <StatCard
          label="Completed jobs"
          value={String(jobs.length)}
          icon={Package}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="p-10 text-center">
              <Wallet className="mx-auto h-8 w-8 text-navy-300" />

              <p className="mt-3 text-sm font-medium text-navy-600">
                No completed jobs yet.
              </p>

              <p className="mt-1 text-sm text-navy-400">
                Your earnings will appear here after you complete a delivery.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100">
              {jobs.map((job) => {
                const payout = Number(job.price) * PAYOUT_RATE;

                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-medium text-navy-900">
                        {job.tracking_number}
                      </p>

                      <p className="text-xs text-navy-500">
                        Completed {formatDate(job.updated_at)}
                      </p>
                    </div>

                    <span className="shrink-0 font-display font-600 text-navy-900">
                      {formatCurrency(payout)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
