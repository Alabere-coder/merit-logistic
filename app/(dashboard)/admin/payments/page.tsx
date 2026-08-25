import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, CheckCircle2, Clock, XCircle, CreditCard } from "lucide-react";
import { MarkPaymentPaidButton } from "@/components/admin/mark-payment-paid-button";

const statusStyles = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs",
  pending: "border-amber-200 bg-amber-50 text-amber-700 shadow-2xs",
  failed: "border-rose-200 bg-rose-50 text-rose-700 shadow-2xs",
  refunded: "border-slate-200 bg-slate-50 text-slate-700 shadow-2xs",
} as const;

export default async function AdminPaymentsPage() {
  const { supabase } = await requireRole(["admin"]);

  const { data: payments, error } = await supabase
    .from("payments")
    .select(
      "id, amount, payment_status, payment_method, transaction_reference, created_at, customer:customer_id(first_name, last_name), shipment:shipment_id(tracking_number)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("ADMIN PAYMENTS ERROR:", error);
  }

  const totalRevenue = (payments ?? [])
    .filter((p) => p.payment_status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingTotal = (payments ?? [])
    .filter((p) => p.payment_status === "pending")
    .reduce((s, p) => s + Number(p.amount), 0);
  const failedCount = (payments ?? []).filter(
    (p) => p.payment_status === "failed",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white">
              Payments Overview
            </h1>
            <p className="text-xs text-slate-300">
              Track revenue performance and status across all platform
              transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={formatCurrency(totalRevenue)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Pending payments"
          value={formatCurrency(pendingTotal)}
          icon={Clock}
        />
        <StatCard
          label="Failed transactions"
          value={String(failedCount)}
          icon={XCircle}
        />
      </div>

      {/* Transactions Table Card */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xl backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {(payments ?? []).length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-bold text-slate-900">
                No payments recorded yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-slate-500">
                Transactions will be logged here in real-time as payments are
                processed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Shipment</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(payments ?? []).map((p: any) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        {p.shipment?.tracking_number ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-900">
                        {p.customer?.first_name || p.customer?.last_name
                          ? `${p.customer?.first_name ?? ""} ${p.customer?.last_name ?? ""}`.trim()
                          : "Customer"}
                      </td>
                      <td className="px-6 py-4 font-display font-bold text-slate-900">
                        {formatCurrency(Number(p.amount))}
                      </td>
                      <td className="px-6 py-4 text-xs capitalize text-slate-600">
                        {p.payment_method
                          ? p.payment_method.replaceAll("_", " ")
                          : "Not selected"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize tracking-wide ${
                            statusStyles[
                              p.payment_status as keyof typeof statusStyles
                            ] ?? "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {p.payment_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.payment_status === "pending" ? (
                          <MarkPaymentPaidButton paymentId={p.id} />
                        ) : p.payment_status === "paid" ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
