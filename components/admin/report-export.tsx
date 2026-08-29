"use client";

import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { ReportData, ReportPeriod } from "@/lib/actions/reports";

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  all: "All Time",
  today: "Today",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "3months": "Last 3 Months",
  year: "This Year",
};

function formatCurrency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function escapeCsv(value: unknown) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function ReportExport({
  report,
  period,
}: {
  report: ReportData;
  period: ReportPeriod;
}) {
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const periodLabel = PERIOD_LABELS[period];

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  async function exportCsv() {
    try {
      setExporting("csv");

      const rows: string[][] = [];

      // ------------------------------------------------------
      // REPORT HEADER
      // ------------------------------------------------------

      rows.push(["SWIFTWAY SHIPPING"]);
      rows.push(["Admin Report"]);
      rows.push(["Period", periodLabel]);
      rows.push(["Generated", new Date().toLocaleString("en-NG")]);
      rows.push([]);

      // ------------------------------------------------------
      // SUMMARY
      // ------------------------------------------------------

      rows.push(["SUMMARY"]);
      rows.push(["Metric", "Value"]);

      rows.push(["Total Shipments", String(report.summary.totalShipments)]);

      rows.push([
        "Delivered Shipments",
        String(report.summary.deliveredShipments),
      ]);

      rows.push(["Active Shipments", String(report.summary.activeShipments)]);

      rows.push([
        "Cancelled Shipments",
        String(report.summary.cancelledShipments),
      ]);

      rows.push(["Total Revenue", String(report.summary.totalRevenue)]);

      rows.push([]);

      // ------------------------------------------------------
      // REVENUE
      // ------------------------------------------------------

      rows.push(["REVENUE BY MONTH"]);
      rows.push(["Month", "Revenue"]);

      for (const item of report.revenue) {
        rows.push([item.month, String(item.revenue)]);
      }

      rows.push([]);

      // ------------------------------------------------------
      // SHIPMENT VOLUME
      // ------------------------------------------------------

      rows.push(["SHIPMENT VOLUME"]);
      rows.push(["Month", "Shipments"]);

      for (const item of report.shipmentVolume) {
        rows.push([item.month, String(item.shipments)]);
      }

      rows.push([]);

      // ------------------------------------------------------
      // SHIPMENT STATUS
      // ------------------------------------------------------

      rows.push(["SHIPMENT STATUS"]);
      rows.push(["Status", "Count"]);

      for (const item of report.shipmentStatus) {
        rows.push([item.name, String(item.value)]);
      }

      rows.push([]);

      // ------------------------------------------------------
      // PAYMENT STATUS
      // ------------------------------------------------------

      rows.push(["PAYMENT STATUS"]);
      rows.push(["Status", "Count"]);

      for (const item of report.paymentStatus) {
        rows.push([item.name, String(item.value)]);
      }

      rows.push([]);

      // ------------------------------------------------------
      // PACKAGE TYPES
      // ------------------------------------------------------

      rows.push(["PACKAGE TYPES"]);
      rows.push(["Package Type", "Shipments"]);

      for (const item of report.packageTypes) {
        rows.push([item.name, String(item.value)]);
      }

      rows.push([]);

      // ------------------------------------------------------
      // DELIVERY PERFORMANCE
      // ------------------------------------------------------

      rows.push(["DELIVERY PERFORMANCE"]);
      rows.push(["Metric", "Value"]);

      rows.push([
        "Total Delivery Shipments",
        String(report.deliveryPerformance.total),
      ]);

      rows.push(["Delivered", String(report.deliveryPerformance.delivered)]);

      rows.push(["Active", String(report.deliveryPerformance.active)]);

      rows.push(["Cancelled", String(report.deliveryPerformance.cancelled)]);

      rows.push([
        "Delivery Rate",
        `${report.deliveryPerformance.deliveryRate}%`,
      ]);

      rows.push([
        "Average Delivery Time",
        `${report.deliveryPerformance.averageDeliveryTimeHours} hours`,
      ]);

      rows.push([]);

      // ------------------------------------------------------
      // DRIVER PERFORMANCE
      // ------------------------------------------------------

      rows.push(["DRIVER PERFORMANCE"]);

      rows.push([
        "Driver",
        "Vehicle Type",
        "Vehicle Plate",
        "Status",
        "Assigned",
        "Delivered",
        "Active",
        "Cancelled",
        "Delivery Rate",
      ]);

      for (const driver of report.driverPerformance) {
        rows.push([
          driver.driverName,
          driver.vehicleType,
          driver.vehiclePlate,
          driver.status,
          String(driver.totalShipments),
          String(driver.deliveredShipments),
          String(driver.activeShipments),
          String(driver.failedShipments),
          `${driver.successRate}%`,
        ]);
      }

      // ------------------------------------------------------
      // DOWNLOAD
      // ------------------------------------------------------

      const filename = `swiftway-report-${period}.csv`;

      downloadCsv(filename, rows);

      toast.success("CSV report exported successfully.");
    } catch (error) {
      console.error("CSV EXPORT ERROR:", error);

      toast.error("Failed to export CSV report.");
    } finally {
      setExporting(null);
    }
  }

  // ==========================================================
  // PDF EXPORT
  // ==========================================================

  async function exportPdf() {
    try {
      setExporting("pdf");

      const doc = new jsPDF();

      const generatedAt = new Date().toLocaleString("en-NG");

      // ------------------------------------------------------
      // HEADER
      // ------------------------------------------------------

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SWIFTWAY SHIPPING", 14, 20);

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Admin Report", 14, 29);

      doc.setFontSize(10);

      doc.text(`Period: ${periodLabel}`, 14, 37);

      doc.text(`Generated: ${generatedAt}`, 14, 43);

      // ------------------------------------------------------
      // SUMMARY
      // ------------------------------------------------------

      autoTable(doc, {
        startY: 51,

        head: [["Summary Metric", "Value"]],

        body: [
          ["Total Shipments", report.summary.totalShipments.toLocaleString()],
          [
            "Delivered Shipments",
            report.summary.deliveredShipments.toLocaleString(),
          ],
          ["Active Shipments", report.summary.activeShipments.toLocaleString()],
          [
            "Cancelled Shipments",
            report.summary.cancelledShipments.toLocaleString(),
          ],
          ["Total Revenue", formatCurrency(report.summary.totalRevenue)],
        ],

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // REVENUE
      // ------------------------------------------------------

      let y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text("Revenue Overview", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [["Month", "Revenue"]],

        body: report.revenue.map((item) => [
          item.month,
          formatCurrency(item.revenue),
        ]),

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // SHIPMENT VOLUME
      // ------------------------------------------------------

      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Shipment Volume", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [["Month", "Shipments"]],

        body: report.shipmentVolume.map((item) => [
          item.month,
          item.shipments.toLocaleString(),
        ]),

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // SHIPMENT STATUS
      // ------------------------------------------------------

      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Shipment Status", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [["Status", "Count"]],

        body: report.shipmentStatus.map((item) => [
          item.name,
          item.value.toLocaleString(),
        ]),

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // PAYMENT STATUS
      // ------------------------------------------------------

      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Payment Status", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [["Status", "Count"]],

        body: report.paymentStatus.map((item) => [
          item.name,
          item.value.toLocaleString(),
        ]),

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // PACKAGE TYPES
      // ------------------------------------------------------

      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Package Types", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [["Package Type", "Shipments"]],

        body: report.packageTypes.map((item) => [
          item.name,
          item.value.toLocaleString(),
        ]),

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // DELIVERY PERFORMANCE
      // ------------------------------------------------------

      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Delivery Performance", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [["Metric", "Value"]],

        body: [
          ["Total", report.deliveryPerformance.total.toLocaleString()],
          ["Delivered", report.deliveryPerformance.delivered.toLocaleString()],
          ["Active", report.deliveryPerformance.active.toLocaleString()],
          ["Cancelled", report.deliveryPerformance.cancelled.toLocaleString()],
          ["Delivery Rate", `${report.deliveryPerformance.deliveryRate}%`],
          [
            "Average Delivery Time",
            `${report.deliveryPerformance.averageDeliveryTimeHours} hours`,
          ],
        ],

        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // DRIVER PERFORMANCE
      // ------------------------------------------------------

      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Driver Performance", 14, y);

      autoTable(doc, {
        startY: y + 4,

        head: [
          [
            "Driver",
            "Vehicle",
            "Plate",
            "Assigned",
            "Delivered",
            "Active",
            "Cancelled",
            "Rate",
          ],
        ],

        body: report.driverPerformance.map((driver) => [
          driver.driverName,
          driver.vehicleType,
          driver.vehiclePlate,
          driver.totalShipments.toLocaleString(),
          driver.deliveredShipments.toLocaleString(),
          driver.activeShipments.toLocaleString(),
          driver.failedShipments.toLocaleString(),
          `${driver.successRate}%`,
        ]),

        theme: "grid",

        styles: {
          fontSize: 8,
        },

        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      // ------------------------------------------------------
      // FOOTER ON EVERY PAGE
      // ------------------------------------------------------

      const pageCount = doc.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          `Swiftway Shipping • ${periodLabel} • Page ${page} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10,
        );
      }

      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      doc.save(`swiftway-report-${period}.pdf`);

      toast.success("PDF report exported successfully.");
    } catch (error) {
      console.error("PDF EXPORT ERROR:", error);

      toast.error("Failed to export PDF report.");
    } finally {
      setExporting(null);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={exportCsv}
        disabled={exporting !== null}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting === "csv" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}

        {exporting === "csv" ? "Exporting..." : "CSV"}
      </button>

      <button
        type="button"
        onClick={exportPdf}
        disabled={exporting !== null}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}

        {exporting === "pdf" ? "Exporting..." : "PDF"}
      </button>
    </div>
  );
}
