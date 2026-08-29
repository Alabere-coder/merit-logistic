import { getReportData } from "@/lib/actions/reports";

import {
  RevenueChart,
  ShipmentVolumeChart,
  ShipmentStatusChart,
  PaymentStatusChart,
  PackageTypeChart,
} from "@/components/admin/reports-charts";

import {
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
} from "lucide-react";
import { DriverPerformanceTable } from "@/components/admin/driver-performance-table";
import { DeliveryPerformance } from "@/components/admin/delivery-performance";
import { ReportPeriodFilter } from "@/components/admin/report-period-filter";
import { ReportExport } from "@/components/admin/report-export";

const allowedPeriods = [
  "all",
  "today",
  "7days",
  "30days",
  "3months",
  "year",
] as const;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;

  const period = allowedPeriods.includes(
    params.period as (typeof allowedPeriods)[number],
  )
    ? (params.period as (typeof allowedPeriods)[number])
    : "all";

  const report = await getReportData(period);

  if ("error" in report) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="font-semibold text-rose-900">Unable to load reports</h2>

        <p className="mt-1 text-sm text-rose-700">{report.error}</p>
      </div>
    );
  }

  const { summary } = report;

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor shipments, revenue, payments, and delivery performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReportPeriodFilter currentPeriod={period} />

          <ReportExport report={report} period={period} />
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Shipments"
          value={summary.totalShipments.toLocaleString()}
          icon={Package}
        />

        <SummaryCard
          title="Delivered"
          value={summary.deliveredShipments.toLocaleString()}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Active Shipments"
          value={summary.activeShipments.toLocaleString()}
          icon={Truck}
        />

        <SummaryCard
          title="Cancelled"
          value={summary.cancelledShipments.toLocaleString()}
          icon={XCircle}
        />

        <SummaryCard
          title="Revenue"
          value={`₦${summary.totalRevenue.toLocaleString()}`}
          icon={CreditCard}
        />
      </div>

      {/* =================================================
          REVENUE + SHIPMENT VOLUME
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCard
          title="Revenue Overview"
          description="Paid revenue by month"
        >
          <RevenueChart data={report.revenue} />
        </ReportCard>

        <ReportCard
          title="Shipment Volume"
          description="Number of shipments created each month"
        >
          <ShipmentVolumeChart data={report.shipmentVolume} />
        </ReportCard>
      </div>

      {/* =================================================
          STATUS + PAYMENTS
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCard
          title="Shipment Status"
          description="Current distribution of shipment statuses"
        >
          <ShipmentStatusChart data={report.shipmentStatus} />
        </ReportCard>

        <ReportCard
          title="Payment Status"
          description="Payment transaction distribution"
        >
          <PaymentStatusChart data={report.paymentStatus} />
        </ReportCard>
      </div>

      {/* =================================================
          PACKAGE TYPES
      ================================================= */}

      <ReportCard
        title="Package Types"
        description="Shipment distribution by package type"
      >
        <PackageTypeChart data={report.packageTypes} />
      </ReportCard>
      <ReportCard
        title="Delivery Performance"
        description="Monitor delivery efficiency and shipment outcomes"
      >
        <DeliveryPerformance data={report.deliveryPerformance} />
      </ReportCard>

      <ReportCard
        title="Driver Performance"
        description="Compare driver shipment and delivery performance"
      >
        <DriverPerformanceTable data={report.driverPerformance} />
      </ReportCard>
    </div>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   REPORT CARD
===================================================== */

function ReportCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}
