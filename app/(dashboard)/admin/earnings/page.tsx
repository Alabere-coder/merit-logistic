import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet } from "lucide-react";

import { MarkEarningPaid } from "./mark-earning-paid";

export default async function AdminEarningsPage() {
  const { supabase } = await requireRole(["admin"]);

  /* -------------------------------------------------------
     1. Load driver earnings
  ------------------------------------------------------- */

  const { data: earnings, error } = await supabase
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
      created_at,
      drivers (
        user_id,
        users!drivers_user_id_fkey (
          first_name,
          last_name,
          email
        )
      ),
      shipments (
        tracking_number
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN DRIVER EARNINGS ERROR:", error);
  }

  const rows = earnings ?? [];

  /* -------------------------------------------------------
     2. Calculate summary
  ------------------------------------------------------- */

  const totalEarnings = rows.reduce(
    (sum, earning) => sum + Number(earning.amount),
    0,
  );

  const pendingEarnings = rows
    .filter((earning) => earning.status === "pending")
    .reduce((sum, earning) => sum + Number(earning.amount), 0);

  const paidEarnings = rows
    .filter((earning) => earning.status === "paid")
    .reduce((sum, earning) => sum + Number(earning.amount), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-700 text-navy-900">
          Driver Earnings
        </h1>

        <p className="text-sm text-navy-500">
          Manage driver earnings and payout records.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Wallet className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-navy-500">
                  Total earnings
                </p>

                <p className="mt-1 font-display text-xl font-600 text-navy-900">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div>
              <p className="text-xs font-medium text-navy-500">
                Pending payout
              </p>

              <p className="mt-1 font-display text-xl font-600 text-amber-600">
                {formatCurrency(pendingEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div>
              <p className="text-xs font-medium text-navy-500">Paid</p>

              <p className="mt-1 font-display text-xl font-600 text-green-600">
                {formatCurrency(paidEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings table */}
      <Card>
        <CardContent className="p-0">
          {error ? (
            <div className="p-10 text-center">
              <Wallet className="mx-auto h-8 w-8 text-red-300" />

              <p className="mt-3 text-sm font-medium text-red-600">
                Unable to load driver earnings.
              </p>

              <p className="mt-1 text-sm text-navy-400">
                Please try again later.
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <Wallet className="mx-auto h-8 w-8 text-navy-300" />

              <p className="mt-3 text-sm font-medium text-navy-600">
                No driver earnings yet.
              </p>

              <p className="mt-1 text-sm text-navy-400">
                Earnings will appear here when drivers complete deliveries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-sm">
                <thead>
                  <tr className="border-b border-navy-100 bg-slate-50 text-left">
                    <th className="px-5 py-3 font-medium text-navy-500">
                      Driver
                    </th>

                    <th className="px-5 py-3 font-medium text-navy-500">
                      Shipment
                    </th>

                    <th className="px-5 py-3 font-medium text-navy-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 font-medium text-navy-500">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium text-navy-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right font-medium text-navy-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-100">
                  {rows.map((earning) => {
                    const driver = Array.isArray(earning.drivers)
                      ? earning.drivers[0]
                      : earning.drivers;

                    const user = driver
                      ? Array.isArray(driver.users)
                        ? driver.users[0]
                        : driver.users
                      : null;

                    const shipment = Array.isArray(earning.shipments)
                      ? earning.shipments[0]
                      : earning.shipments;

                    const driverName = user
                      ? `${user.first_name ?? ""} ${
                          user.last_name ?? ""
                        }`.trim()
                      : "Unknown driver";

                    return (
                      <tr key={earning.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-navy-900">
                            {driverName}
                          </p>

                          {user?.email && (
                            <p className="mt-0.5 text-xs text-navy-400">
                              {user.email}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-medium text-navy-800">
                            {shipment?.tracking_number ?? "Unknown shipment"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-display font-600 text-navy-900">
                          {formatCurrency(Number(earning.amount))}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              earning.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {earning.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-navy-500">
                          {formatDate(earning.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {earning.status === "pending" ? (
                            <MarkEarningPaid earningId={earning.id} />
                          ) : (
                            <div className="text-right">
                              <p className="text-xs font-medium text-green-600">
                                Paid
                              </p>

                              {earning.paid_at && (
                                <p className="mt-0.5 text-xs text-navy-400">
                                  {formatDate(earning.paid_at)}
                                </p>
                              )}

                              {earning.payment_reference && (
                                <p className="mt-0.5 text-xs text-navy-400">
                                  Ref: {earning.payment_reference}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
