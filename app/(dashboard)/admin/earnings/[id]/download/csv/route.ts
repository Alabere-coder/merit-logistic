import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import { formatLocalizedCurrency } from "@/lib/localization/format-localized";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(_request: Request, { params }: RouteContext) {
  await requireRole(["admin"]);

  const { id } = await params;

  if (!id?.trim()) {
    return new NextResponse("Invalid driver ID.", {
      status: 400,
    });
  }

  const supabase = createAdminClient();

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select(
      `
      id,
      users!drivers_user_id_fkey (
        first_name,
        last_name,
        email
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (driverError || !driver) {
    console.error("CSV DRIVER LOOKUP ERROR:", driverError);

    return new NextResponse("Driver not found.", {
      status: 404,
    });
  }

  const { data: earnings, error: earningsError } = await supabase
    .from("driver_earnings")
    .select(
      `
      id,
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
    console.error("CSV DRIVER EARNINGS ERROR:", earningsError);

    return new NextResponse("Unable to load driver earnings.", {
      status: 500,
    });
  }

  const localization = await getLocalizationSettings();

  const user = Array.isArray(driver.users) ? driver.users[0] : driver.users;

  const driverName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "Unnamed driver";

  const rows = [
    [
      "Driver",
      "Email",
      "Shipment",
      "Amount",
      "Status",
      "Earned Date",
      "Paid Date",
      "Payment Reference",
    ],
    ...(earnings ?? []).map((earning) => {
      const shipment = Array.isArray(earning.shipments)
        ? earning.shipments[0]
        : earning.shipments;

      return [
        driverName,
        user?.email ?? "",
        shipment?.tracking_number ?? "",
        formatLocalizedCurrency(Number(earning.amount), localization),
        earning.status,
        earning.created_at
          ? new Intl.DateTimeFormat(
              localization.language === "en" ? "en-NG" : localization.language,
              {
                timeZone: localization.timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              },
            ).format(new Date(earning.created_at))
          : "",
        earning.paid_at
          ? new Intl.DateTimeFormat(
              localization.language === "en" ? "en-NG" : localization.language,
              {
                timeZone: localization.timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              },
            ).format(new Date(earning.paid_at))
          : "",
        earning.payment_reference ?? "",
      ];
    }),
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

  const safeDriverName = driverName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const filename = `${safeDriverName || "driver"}-payouts-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
