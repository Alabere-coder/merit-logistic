import Link from "next/link";
import type { ComponentProps } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { StatCard, StatusBadge } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Truck,
  PackageSearch,
  Wallet,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const { supabase } = await requireRole(["admin"]);

  const [
    { count: customerCount },
    { count: driverCount },
    { count: activeCount },
    { count: pendingCount },
    { data: recentShipments },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "driver"),
    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(delivered,cancelled)"),
    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("shipments")
      .select("id, tracking_number, status, price, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("payments").select("amount, payment_status"),
  ]);

  const revenue = (payments ?? [])
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="relative space-y-8">
      {/* Soft Ambient Background Mesh Blends */}

      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight bg-slate-900 bg-clip-text text-transparent">
            System Overview
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Real-time metric monitoring across customers, drivers, and active
            deliveries.
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total customers"
          value={String(customerCount ?? 0)}
          icon={Users}
        />
        <StatCard
          label="Total drivers"
          value={String(driverCount ?? 0)}
          icon={Truck}
        />
        <StatCard
          label="Active deliveries"
          value={String(activeCount ?? 0)}
          icon={PackageSearch}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          icon={Wallet}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Shipments Card */}
        <Card className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/70 bg-linear-to-b from-white via-slate-50/30 to-white shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/80 bg-linear-to-r from-slate-50/90 via-blue-50/30 to-indigo-50/20 px-6 py-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Recently Created Shipments
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Latest transactions submitted to the portal
              </p>
            </div>
            <Link
              href="/admin/shipments"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all hover:bg-blue-600 hover:text-white hover:shadow-sm"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {(recentShipments ?? []).map((s) => (
                <Link
                  key={s.id}
                  href="/admin/shipments"
                  className="group flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-all duration-150 hover:bg-linear-to-r hover:from-blue-50/40 hover:via-indigo-50/20 hover:to-transparent"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                      {s.tracking_number}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(Number(s.price))}
                    </span>
                    <StatusBadge
                      status={
                        s.status as ComponentProps<typeof StatusBadge>["status"]
                      }
                    />
                  </div>
                </Link>
              ))}

              {(recentShipments ?? []).length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-slate-400">
                    No recent shipments found.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Needed Card */}
        <Card className="h-fit rounded-2xl border border-amber-200/50 bg-linear-to-b from-white via-amber-50/20 to-white shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-amber-100/60 bg-linear-to-r from-amber-50/60 via-orange-50/30 to-transparent px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm ring-2 ring-amber-200/50">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Needs Attention
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Pending operational tasks
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {/* Metric Alert Block with Rich linear Blend */}
            <div className="relative overflow-hidden rounded-xl border border-amber-300/60 bg-amber-500 p-4 text-white shadow-md">
              <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-200" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-100">
                    Pending Approval
                  </span>
                </div>
                <span className="font-mono text-2xl font-black text-white drop-shadow-xs">
                  {pendingCount ?? 0}
                </span>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2.5 pt-1">
              <Link href="/admin/shipments" className="group block">
                <span className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-linear-to-r from-slate-50/80 to-blue-50/30 px-4 py-3 text-xs font-bold text-slate-700 transition-all group-hover:border-blue-300 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-900 group-hover:shadow-xs">
                  Assign drivers to approved shipments
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </span>
              </Link>

              <Link href="/admin/drivers" className="group block">
                <span className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-linear-to-r from-slate-50/80 to-indigo-50/30 px-4 py-3 text-xs font-bold text-slate-700 transition-all group-hover:border-indigo-300 group-hover:from-indigo-50 group-hover:to-purple-50 group-hover:text-indigo-900 group-hover:shadow-xs">
                  Review driver activation requests
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
