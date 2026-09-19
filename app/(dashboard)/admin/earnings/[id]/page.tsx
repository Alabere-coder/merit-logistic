import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  Wallet,
  FileSpreadsheet,
} from "lucide-react";
import { DownloadPayoutPdf } from "./download/pdf/download-payout-pdf";

import { requireRole } from "@/lib/auth/require-role";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import {
  formatLocalizedCurrency,
  formatLocalizedDateTime,
} from "@/lib/localization/format-localized";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { MarkEarningPaid } from "../mark-earning-paid";

type DriverEarningsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DriverEarningsPage({
  params,
}: DriverEarningsPageProps) {
  const { id } = await params;

  const { supabase } = await requireRole(["admin"]);

  const localization = await getLocalizationSettings();

  /*
   * Get driver profile
   */
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select(
      `
      id,
      status,
      user_id,
      users!drivers_user_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone_number
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (driverError) {
    console.error("DRIVER EARNINGS DRIVER ERROR:", driverError);
  }

  if (!driver) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/earnings"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 transition hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to earnings
        </Link>

        <Card className="border border-red-100 bg-red-50/50 shadow-xs">
          <CardContent className="p-6">
            <h1 className="text-lg font-bold text-red-800">Driver not found</h1>

            <p className="mt-1 text-sm text-red-600">
              The driver you are looking for does not exist or could not be
              loaded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /*
   * Get all earnings belonging to this driver.
   */
  const { data: driverEarnings, error: earningsError } = await supabase
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
        shipments (
          tracking_number
        )
      `,
    )
    .eq("driver_id", id)
    .order("created_at", { ascending: false });

  if (earningsError) {
    console.error("DRIVER EARNINGS HISTORY ERROR:", earningsError);
  }

  const earnings = driverEarnings ?? [];

  /*
   * Summary
   */
  const totalEarnings = earnings.reduce(
    (total, earning) => total + Number(earning.amount || 0),
    0,
  );

  const pendingEarnings = earnings
    .filter((earning) => earning.status === "pending")
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  const paidEarnings = earnings
    .filter((earning) => earning.status === "paid")
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  const driverUser = Array.isArray(driver.users)
    ? driver.users[0]
    : driver.users;

  const driverName =
    `${driverUser?.first_name ?? ""} ${driverUser?.last_name ?? ""}`.trim() ||
    "Unnamed driver";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={`/admin/drivers/${id}`}
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy-200 bg-white text-navy-600 transition hover:bg-navy-50 hover:text-navy-900"
            aria-label="Back to driver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">
              Driver Earnings
            </h1>

            <p className="mt-1 text-base font-semibold text-navy-700">
              {driverName}
            </p>

            {driverUser?.email && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
                <Mail className="h-3.5 w-3.5" />
                {driverUser.email}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              driver.status === "active"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : driver.status === "suspended"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-navy-200 bg-navy-50 text-navy-600"
            }
          >
            {driver.status}
          </Badge>

          <a
            href={`/admin/earnings/${id}/download/csv`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-navy-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Download CSV
          </a>

          <DownloadPayoutPdf
            driverName={driverName}
            driverEmail={driverUser?.email ?? null}
            earnings={earnings}
            localization={localization}
          />

          <Link
            href="/admin/earnings"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-navy-50"
          >
            All earnings
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-300 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
                  Total earnings
                </p>

                <p className="mt-2 text-2xl font-bold text-navy-900">
                  {formatLocalizedCurrency(totalEarnings, localization)}
                </p>

                <p className="mt-1 text-xs text-navy-500">
                  {earnings.length}{" "}
                  {earnings.length === 1 ? "earning" : "earnings"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-300 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
                  Pending payout
                </p>

                <p className="mt-2 text-2xl font-bold text-navy-900">
                  {formatLocalizedCurrency(pendingEarnings, localization)}
                </p>

                <p className="mt-1 text-xs text-navy-500">Awaiting payment</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-300 bg-white shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
                  Paid
                </p>

                <p className="mt-2 text-2xl font-bold text-navy-900">
                  {formatLocalizedCurrency(paidEarnings, localization)}
                </p>

                <p className="mt-1 text-xs text-navy-500">Completed payouts</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings history */}
      <Card className="overflow-hidden border border-slate-300 bg-white shadow-xs">
        <CardContent className="p-0">
          <div className="border-b border-slate-300 px-5 py-4 ">
            <h2 className="text-sm font-bold text-navy-900">Earning history</h2>

            <p className="mt-1 text-xs text-navy-500">
              Complete earning and payout history for {driverName}.
            </p>
          </div>

          {earnings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Wallet className="mx-auto h-8 w-8 text-navy-300" />

              <p className="mt-3 text-sm font-medium text-navy-700">
                No earnings yet
              </p>

              <p className="mt-1 text-xs text-navy-500">
                Earnings will appear here when this driver completes deliveries.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-300 bg-navy-50/50">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
                        Shipment
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
                        Earned
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-navy-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-300">
                    {earnings.map((earning) => {
                      const shipment = Array.isArray(earning.shipments)
                        ? earning.shipments[0]
                        : earning.shipments;

                      return (
                        <tr
                          key={earning.id}
                          className="transition hover:bg-navy-50/40"
                        >
                          <td className="px-5 py-4">
                            <p className="font-mono text-xs font-semibold text-navy-700">
                              {shipment?.tracking_number ?? "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-navy-900">
                              {formatLocalizedCurrency(
                                Number(earning.amount),
                                localization,
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {earning.status === "paid" ? (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                Paid
                              </Badge>
                            ) : (
                              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                                Pending
                              </Badge>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs text-navy-600">
                              {formatLocalizedDateTime(
                                earning.created_at,
                                localization,
                              )}
                            </p>

                            {earning.status === "paid" && earning.paid_at && (
                              <p className="mt-1 text-[11px] text-emerald-600">
                                Paid{" "}
                                {formatLocalizedDateTime(
                                  earning.paid_at,
                                  localization,
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {earning.status === "pending" ? (
                              <MarkEarningPaid earningId={earning.id} />
                            ) : (
                              <div>
                                <p className="text-xs font-medium text-emerald-600">
                                  Paid
                                </p>

                                {earning.payment_reference && (
                                  <p className="mt-1 max-w-32 truncate text-[11px] text-navy-500">
                                    {earning.payment_reference}
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

              {/* Mobile */}
              <div className="divide-y divide-navy-100 md:hidden">
                {earnings.map((earning) => {
                  const shipment = Array.isArray(earning.shipments)
                    ? earning.shipments[0]
                    : earning.shipments;

                  return (
                    <div key={earning.id} className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
                            Shipment
                          </p>

                          <p className="mt-1 font-mono text-xs font-semibold text-navy-700">
                            {shipment?.tracking_number ?? "—"}
                          </p>
                        </div>

                        {earning.status === "paid" ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-bold text-navy-900">
                            {formatLocalizedCurrency(
                              Number(earning.amount),
                              localization,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
                            Earned
                          </p>

                          <p className="mt-1 text-xs text-navy-600">
                            {formatLocalizedDateTime(
                              earning.created_at,
                              localization,
                            )}
                          </p>
                        </div>
                      </div>

                      {earning.status === "paid" && earning.paid_at && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
                            Paid
                          </p>

                          <p className="mt-1 text-xs text-emerald-600">
                            {formatLocalizedDateTime(
                              earning.paid_at,
                              localization,
                            )}
                          </p>
                        </div>
                      )}

                      {earning.payment_reference && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
                            Payment reference
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-navy-600">
                            {earning.payment_reference}
                          </p>
                        </div>
                      )}

                      {earning.status === "pending" && (
                        <div className="pt-1">
                          <MarkEarningPaid earningId={earning.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
