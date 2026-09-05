import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, ExternalLink, Receipt, ArrowUpRight } from "lucide-react";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import { formatLocalizedCurrency } from "@/lib/localization/format-localized";

const STATUS_VARIANT = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
} as const;

export default async function CustomerPaymentsPage() {
  const { user, supabase } = await requireRole(["customer"]);

  const localization = await getLocalizationSettings();

  const { data: payments, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      shipment_id,
      amount,
      payment_status,
      payment_method,
      transaction_reference,
      created_at,
      shipments!payments_shipment_id_fkey (
        tracking_number
      )
    `,
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Payments error:", error);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">
                Payment History
              </h1>
              <p className="text-xs text-slate-300">
                Track all transactions and payment receipts tied to your
                shipments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xl backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {!payments || payments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CreditCard className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-bold text-slate-900">
                No payments recorded yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-slate-500">
                Your completed transactions and billing receipts will appear
                here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((payment) => {
                const variant =
                  STATUS_VARIANT[
                    payment.payment_status as keyof typeof STATUS_VARIANT
                  ] ?? "secondary";

                const paymentMethod = payment.payment_method
                  ? payment.payment_method
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())
                  : "Not selected";

                const trackingNumber =
                  payment.shipments?.tracking_number ?? "Unknown shipment";

                return (
                  <div
                    key={payment.id}
                    className="group flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {trackingNumber}
                        </span>

                        {payment.shipment_id && (
                          <Link
                            href={`/customer/shipments/${trackingNumber}`}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View shipment details"
                          >
                            <span>Shipment</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      <p className="text-xs font-medium text-slate-500">
                        {formatDate(payment.created_at)} ·{" "}
                        <span className="text-slate-700">{paymentMethod}</span>
                      </p>

                      {payment.transaction_reference && (
                        <p className="truncate font-mono text-[11px] text-slate-400">
                          Ref: {payment.transaction_reference}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="font-display text-base font-bold text-slate-900">
                        {/* {formatCurrency(Number(payment.amount))} */}
                        {formatLocalizedCurrency(
                          Number(payment.amount),
                          localization,
                        )}
                        {/* {formatLocalizedCurrency(payment.amount, localization)} */}
                      </span>

                      <Badge
                        variant={variant}
                        className="rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize tracking-wide shadow-2xs"
                      >
                        {payment.payment_status}
                      </Badge>
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
