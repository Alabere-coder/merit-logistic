import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  ArrowRight,
  History,
  Calendar,
  MapPin,
  Receipt,
  ExternalLink,
} from "lucide-react";

export default async function CustomerHistoryPage() {
  const { user, supabase } = await requireRole(["customer"]);

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header with Colored Gradient Icon Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <History className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Delivery history
            </h1>
            <p className="text-sm text-slate-500">
              Every shipment you've sent, past and present.
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-0">
          {!shipments || shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No shipments yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                You haven't placed any orders yet. Start creating your first
                shipment to track its progress here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span>Tracking #</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>Route</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Receipt className="h-3.5 w-3.5 text-slate-400" />
                        <span>Price</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {shipments.map((s) => (
                    <tr
                      key={s.id}
                      className="group transition-colors hover:bg-blue-50/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/customer/shipments/${s.tracking_number}`}
                          className="inline-flex items-center space-x-1.5 font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>{s.tracking_number}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900">
                            {s.pickup_address.split(",")[0]}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="font-medium text-slate-900">
                            {s.delivery_address.split(",")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(Number(s.price))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge
                          status={
                            s.status as Parameters<
                              typeof StatusBadge
                            >[0]["status"]
                          }
                        />
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
