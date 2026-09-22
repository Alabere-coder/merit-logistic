import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";

export const instant = false;

export default async function DriverEarningsPage() {
  const { user, supabase } = await requireRole(["driver"]);

  // Get the driver record belonging to the logged-in user
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER LOOKUP ERROR:", driverError);

    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">
              Unable to load your driver account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get persistent earnings
  const { data: earnings, error: earningsError } = await supabase
    .from("driver_earnings")
    .select(
      `
      id,
      driver_id,
      shipment_id,
      amount,
      status,
      payment_reference,
      paid_at,
      notes,
      created_at,
      shipments (
        tracking_number
      )
    `,
    )
    .eq("driver_id", driver.id)
    .order("created_at", { ascending: false });

  if (earningsError) {
    console.error("DRIVER EARNINGS ERROR:", earningsError);

    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">Unable to load earnings.</p>
            <p className="mt-1 text-xs text-slate-500">
              {earningsError.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const earningsList = earnings ?? [];

  console.log("DRIVER EARNINGS DEBUG:", {
    userId: user.id,
    driverId: driver.id,
    earnings,
    earningsCount: earningsList.length,
    amounts: earningsList.map((earning) => ({
      id: earning.id,
      driverId: earning.driver_id,
      amount: earning.amount,
      status: earning.status,
    })),
  });

  // Convert database numeric values safely to numbers
  const totalEarnings = earningsList.reduce(
    (total, earning) => total + Number(earning.amount || 0),
    0,
  );

  const pendingEarnings = earningsList
    .filter((earning) => earning.status === "pending")
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  const paidEarnings = earningsList
    .filter((earning) => earning.status === "paid")
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  // Current month earnings
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyEarnings = earningsList
    .filter((earning) => {
      const date = new Date(earning.created_at);

      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Earnings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your delivery earnings and payout history.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Earnings</p>
                <p className="mt-2 text-2xl font-semibold text-navy-900">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-3">
                <Wallet className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">This Month</p>
                <p className="mt-2 text-2xl font-semibold text-navy-900">
                  {formatCurrency(monthlyEarnings)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-3">
                <ArrowUpRight className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="mt-2 text-2xl font-semibold text-amber-600">
                  {formatCurrency(pendingEarnings)}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 p-3">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Paid</p>
                <p className="mt-2 text-2xl font-semibold text-green-600">
                  {formatCurrency(paidEarnings)}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings history */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-navy-900">Earnings History</h2>
            <p className="mt-1 text-xs text-slate-500">
              Your earnings from completed deliveries.
            </p>
          </div>

          {earningsList.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No earnings yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Earnings will appear here after you complete deliveries.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {earningsList.map((earning) => {
                const shipment = Array.isArray(earning.shipments)
                  ? earning.shipments[0]
                  : earning.shipments;

                return (
                  <div
                    key={earning.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900">
                        {shipment?.tracking_number ?? "Shipment"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Completed {formatDate(earning.created_at)}
                      </p>

                      {earning.payment_reference && (
                        <p className="mt-1 text-xs text-slate-500">
                          Reference: {earning.payment_reference}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-navy-900">
                          {formatCurrency(Number(earning.amount || 0))}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                            earning.status === "paid"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {earning.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </div>

                      <Link
                        href={`/customer/shipments/${shipment?.tracking_number ?? ""}`}
                        className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
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
