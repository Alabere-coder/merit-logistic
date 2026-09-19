"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

import type { LocalizationSettings } from "@/lib/localization/get-localization-settings";
import { formatLocalizedCurrency } from "@/lib/localization/format-localized";

type Earning = {
  id: string;
  amount: number | string;
  status: string;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  shipments:
    | {
        tracking_number: string | null;
      }
    | {
        tracking_number: string | null;
      }[]
    | null;
};

type DownloadPayoutPdfProps = {
  driverName: string;
  driverEmail: string | null;
  earnings: Earning[];
  localization: LocalizationSettings;
};

function formatDate(value: string | null, localization: LocalizationSettings) {
  if (!value) return "—";

  const locale =
    localization.language === "en" ? "en-NG" : localization.language;

  return new Intl.DateTimeFormat(locale, {
    timeZone: localization.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function DownloadPayoutPdf({
  driverName,
  driverEmail,
  earnings,
  localization,
}: DownloadPayoutPdfProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  function getTrackingNumber(earning: Earning) {
    if (Array.isArray(earning.shipments)) {
      return earning.shipments[0]?.tracking_number ?? "—";
    }

    return earning.shipments?.tracking_number ?? "—";
  }

  async function handleDownload() {
    try {
      setIsGenerating(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

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

      let y = 20;

      /*
       * Header
       */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Driver Payout Statement", 20, y);

      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Driver: ${driverName}`, 20, y);

      y += 6;

      if (driverEmail) {
        doc.text(`Email: ${driverEmail}`, 20, y);
        y += 6;
      }

      doc.text(
        `Generated: ${formatDate(new Date().toISOString(), localization)}`,
        20,
        y,
      );

      y += 12;

      /*
       * Summary
       */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Payout Summary", 20, y);

      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        `Total earnings: ${formatLocalizedCurrency(
          totalEarnings,
          localization,
        )}`,
        20,
        y,
      );

      y += 6;

      doc.text(
        `Pending payout: ${formatLocalizedCurrency(
          pendingEarnings,
          localization,
        )}`,
        20,
        y,
      );

      y += 6;

      doc.text(
        `Paid: ${formatLocalizedCurrency(paidEarnings, localization)}`,
        20,
        y,
      );

      y += 12;

      /*
       * Table
       */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Earning History", 20, y);

      y += 8;

      const columns = {
        shipment: 20,
        amount: 70,
        status: 110,
        earned: 140,
        paid: 175,
      };

      doc.setFontSize(8);

      doc.text("Shipment", columns.shipment, y);
      doc.text("Amount", columns.amount, y);
      doc.text("Status", columns.status, y);
      doc.text("Earned", columns.earned, y);
      doc.text("Paid", columns.paid, y);

      y += 3;

      doc.line(20, y, pageWidth - 20, y);

      y += 7;

      doc.setFont("helvetica", "normal");

      for (const earning of earnings) {
        /*
         * Add a new page when necessary.
         */
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text("Driver Payout Statement — Continued", 20, y);

          y += 10;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
        }

        const trackingNumber = getTrackingNumber(earning);

        doc.text(trackingNumber, columns.shipment, y, {
          maxWidth: 45,
        });

        doc.text(
          formatLocalizedCurrency(Number(earning.amount), localization),
          columns.amount,
          y,
          {
            maxWidth: 35,
          },
        );

        doc.text(
          earning.status === "paid" ? "Paid" : "Pending",
          columns.status,
          y,
        );

        doc.text(
          formatDate(earning.created_at, localization),
          columns.earned,
          y,
        );

        doc.text(formatDate(earning.paid_at, localization), columns.paid, y);

        y += 6;

        if (earning.payment_reference) {
          doc.setFontSize(7);

          doc.text(
            `Reference: ${earning.payment_reference}`,
            columns.shipment,
            y,
            {
              maxWidth: 150,
            },
          );

          doc.setFontSize(8);

          y += 6;
        }

        y += 3;
      }

      if (earnings.length === 0) {
        doc.setFontSize(10);
        doc.text("No earnings have been recorded for this driver.", 20, y);
      }

      /*
       * Footer
       */
      const pageCount = doc.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        doc.text(
          `Driver payout statement • Page ${page} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          {
            align: "center",
          },
        );
      }

      const safeName =
        driverName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "driver";

      doc.save(
        `${safeName}-payout-statement-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`,
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}

      {isGenerating ? "Generating..." : "Download PDF"}
    </button>
  );
}
