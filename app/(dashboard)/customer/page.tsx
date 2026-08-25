import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { StatCard, StatusBadge } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle2,
  Wallet,
  PackagePlus,
  ArrowRight,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

export default async function CustomerOverviewPage() {
  const { user, supabase } = await requireRole(["customer"]);

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const active = (shipments ?? []).filter(
    (s) => !["delivered", "cancelled"].includes(s.status),
  );
  const delivered = (shipments ?? []).filter((s) => s.status === "delivered");
  const totalSpent = (shipments ?? []).reduce(
    (sum, s) => sum + Number(s.price),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <LayoutDashboard className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Your shipments
            </h1>
            <p className="text-sm text-slate-500">
              Track and manage everything you're sending in real time.
            </p>
          </div>
        </div>

        <Link href="/customer/shipments/new">
          <Button className="group gap-2 bg-blue-600 shadow-md shadow-blue-500/20 transition-all text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30">
            <PackagePlus className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>New shipment</span>
          </Button>
        </Link>
      </div>

      {/* Modern Colorful Stat Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active shipments"
          value={String(active.length)}
          icon={Truck}
        />
        <StatCard
          label="Delivered"
          value={String(delivered.length)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Total shipments"
          value={String(shipments?.length ?? 0)}
          icon={Package}
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent)}
          icon={Wallet}
        />
      </div>

      {/* Active Shipments Section */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Truck className="h-4 w-4" />
            </div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Active shipments
            </h2>
          </div>
          <Link
            href="/customer/history"
            className="group flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-blue-600 transition-colors hover:text-blue-700"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 ring-8 ring-blue-50/50">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No active shipments
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Create a shipment to see it tracked live here.
              </p>
              <Link href="/customer/shipments/new" className="mt-5">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-300"
                >
                  <PackagePlus className="h-3.5 w-3.5 text-blue-600" />
                  <span>Create a shipment</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {active.map((s) => (
                <Link
                  key={s.id}
                  href={`/customer/shipments/${s.tracking_number}`}
                  className="group flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-blue-50/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">
                        {s.tracking_number}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">
                      {s.pickup_address.split(",")[0]}
                      <span className="mx-1.5 text-slate-400">→</span>
                      {s.delivery_address.split(",")[0]}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(s.created_at)}
                    </span>
                    <StatusBadge
                      status={
                        s.status as Parameters<typeof StatusBadge>[0]["status"]
                      }
                    />
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
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
