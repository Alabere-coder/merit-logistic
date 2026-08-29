"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// TYPES
// ============================================================

export type ReportPeriod =
  | "all"
  | "today"
  | "7days"
  | "30days"
  | "3months"
  | "year";

type RevenueData = {
  month: string;
  revenue: number;
};

type ShipmentVolumeData = {
  month: string;
  shipments: number;
};

type StatusData = {
  name: string;
  value: number;
};

export type DeliveryPerformanceData = {
  total: number;
  delivered: number;
  active: number;
  cancelled: number;
  deliveryRate: number;
  averageDeliveryTimeHours: number;
};

export type DriverPerformanceData = {
  driverId: string;
  driverName: string;
  vehicleType: string;
  vehiclePlate: string;
  status: string;

  totalShipments: number;
  deliveredShipments: number;
  failedShipments: number;
  successRate: number;
  activeShipments: number;
};

type ReportSummary = {
  totalShipments: number;
  deliveredShipments: number;
  activeShipments: number;
  cancelledShipments: number;
  totalRevenue: number;
};

export type ReportData = {
  summary: {
    totalShipments: number;
    deliveredShipments: number;
    activeShipments: number;
    cancelledShipments: number;
    totalRevenue: number;
  };

  revenue: {
    month: string;
    revenue: number;
  }[];

  shipmentVolume: {
    month: string;
    shipments: number;
  }[];

  shipmentStatus: {
    name: string;
    value: number;
  }[];

  paymentStatus: {
    name: string;
    value: number;
  }[];

  packageTypes: {
    name: string;
    value: number;
  }[];

  deliveryPerformance: DeliveryPerformanceData;

  driverPerformance: DriverPerformanceData[];
};

type ReportResult = ReportData | { error: string };

// ============================================================
// DATE HELPERS
// ============================================================

function getPeriodStart(period: ReportPeriod): Date | null {
  const now = new Date();

  switch (period) {
    case "today": {
      const start = new Date(now);

      start.setHours(0, 0, 0, 0);

      return start;
    }

    case "7days": {
      const start = new Date(now);

      start.setDate(start.getDate() - 7);

      return start;
    }

    case "30days": {
      const start = new Date(now);

      start.setDate(start.getDate() - 30);

      return start;
    }

    case "3months": {
      const start = new Date(now);

      start.setMonth(start.getMonth() - 3);

      return start;
    }

    case "year": {
      const start = new Date(now);

      start.setFullYear(start.getFullYear() - 1);

      return start;
    }

    case "all":
    default:
      return null;
  }
}

function isWithinPeriod(
  dateString: string | null,
  period: ReportPeriod,
): boolean {
  if (period === "all") {
    return true;
  }

  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);
  const start = getPeriodStart(period);

  if (!start) {
    return true;
  }

  return date >= start;
}

// ============================================================
// MONTH HELPERS
// ============================================================

function getLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1,
    );

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    months.push(`${year}-${month}`);
  }

  return months;
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(year, monthNumber - 1, 1);

  return date.toLocaleString("en-US", {
    month: "short",
  });
}

// ============================================================
// FORMAT HELPERS
// ============================================================

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

// ============================================================
// REPORT DATA
// ============================================================

export async function getReportData(
  period: ReportPeriod = "all",
): Promise<ReportResult> {
  // Only administrators can access reports.
  await requireRole(["admin"]);

  const supabase = createAdminClient();

  // ==========================================================
  // FETCH MAIN REPORT DATA
  // ==========================================================

  const [
    shipmentsResult,
    paymentsResult,
    shipmentEventsResult,
    driversResult,
    usersResult,
  ] = await Promise.all([
    // --------------------------------------------------------
    // SHIPMENTS
    // --------------------------------------------------------

    supabase
      .from("shipments")
      .select(
        `
          id,
          customer_id,
          driver_id,
          package_type,
          status,
          price,
          estimated_delivery,
          created_at,
          updated_at
        `,
      ),

    // --------------------------------------------------------
    // PAYMENTS
    // --------------------------------------------------------

    supabase
      .from("payments")
      .select(
        `
          id,
          shipment_id,
          customer_id,
          amount,
          payment_status,
          payment_method,
          transaction_reference,
          created_at
        `,
      ),

    // --------------------------------------------------------
    // SHIPMENT EVENTS
    // --------------------------------------------------------

    supabase
      .from("shipment_events")
      .select(
        `
          id,
          shipment_id,
          status,
          created_by,
          created_at
        `,
      ),

    // --------------------------------------------------------
    // DRIVERS
    // --------------------------------------------------------

    supabase
      .from("drivers")
      .select(
        `
          id,
          user_id,
          vehicle_type,
          vehicle_plate,
          status
        `,
      ),

    // --------------------------------------------------------
    // USERS
    // --------------------------------------------------------

    supabase
      .from("users")
      .select(
        `
          id,
          first_name,
          last_name,
          email
        `,
      ),
  ]);

  // ==========================================================
  // ERROR HANDLING
  // ==========================================================

  if (shipmentsResult.error) {
    console.error(
      "REPORT SHIPMENTS ERROR:",
      shipmentsResult.error,
    );

    return {
      error: `Unable to load shipment reports: ${shipmentsResult.error.message}`,
    };
  }

  if (paymentsResult.error) {
    console.error(
      "REPORT PAYMENTS ERROR:",
      paymentsResult.error,
    );

    return {
      error: `Unable to load payment reports: ${paymentsResult.error.message}`,
    };
  }

  if (shipmentEventsResult.error) {
    console.error(
      "REPORT SHIPMENT EVENTS ERROR:",
      shipmentEventsResult.error,
    );

    return {
      error: `Unable to load shipment event reports: ${shipmentEventsResult.error.message}`,
    };
  }

  if (driversResult.error) {
    console.error(
      "REPORT DRIVERS ERROR:",
      driversResult.error,
    );

    return {
      error: `Unable to load driver reports: ${driversResult.error.message}`,
    };
  }

  if (usersResult.error) {
    console.error(
      "REPORT USERS ERROR:",
      usersResult.error,
    );

    return {
      error: `Unable to load user information: ${usersResult.error.message}`,
    };
  }

  const allShipments = shipmentsResult.data ?? [];
  const allPayments = paymentsResult.data ?? [];
  const allShipmentEvents = shipmentEventsResult.data ?? [];
  const drivers = driversResult.data ?? [];
  const users = usersResult.data ?? [];

  // ==========================================================
  // FILTER BY SELECTED PERIOD
  // ==========================================================

  const shipments = allShipments.filter((shipment) =>
    isWithinPeriod(shipment.created_at, period),
  );

  const payments = allPayments.filter((payment) =>
    isWithinPeriod(payment.created_at, period),
  );

  const shipmentEvents = allShipmentEvents.filter((event) =>
    isWithinPeriod(event.created_at, period),
  );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalShipments = shipments.length;

  const deliveredShipments = shipments.filter(
    (shipment) => shipment.status === "delivered",
  ).length;

  const cancelledShipments = shipments.filter(
    (shipment) => shipment.status === "cancelled",
  ).length;

  const activeShipments = shipments.filter(
    (shipment) =>
      !["delivered", "cancelled"].includes(
        shipment.status,
      ),
  ).length;

  // Only PAID payments count as revenue.
  const totalRevenue = payments
    .filter(
      (payment) => payment.payment_status === "paid",
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount ?? 0),
      0,
    );

  const summary: ReportSummary = {
    totalShipments,
    deliveredShipments,
    activeShipments,
    cancelledShipments,
    totalRevenue,
  };

  // ==========================================================
  // REVENUE BY MONTH
  // ==========================================================

  const months = getLast12Months();

  const revenue: RevenueData[] = months.map((month) => {
    const monthlyRevenue = payments
      .filter((payment) => {
        if (payment.payment_status !== "paid") {
          return false;
        }

        if (!payment.created_at) {
          return false;
        }

        return payment.created_at.startsWith(month);
      })
      .reduce(
        (total, payment) =>
          total + Number(payment.amount ?? 0),
        0,
      );

    return {
      month: formatMonthLabel(month),
      revenue: monthlyRevenue,
    };
  });

  // ==========================================================
  // SHIPMENT VOLUME BY MONTH
  // ==========================================================

  const shipmentVolume: ShipmentVolumeData[] =
    months.map((month) => {
      const monthlyShipments = shipments.filter(
        (shipment) => {
          if (!shipment.created_at) {
            return false;
          }

          return shipment.created_at.startsWith(month);
        },
      ).length;

      return {
        month: formatMonthLabel(month),
        shipments: monthlyShipments,
      };
    });

  // ==========================================================
  // SHIPMENT STATUS
  // ==========================================================

  const shipmentStatusMap = new Map<
    string,
    number
  >();

  shipments.forEach((shipment) => {
    const status = shipment.status ?? "unknown";

    shipmentStatusMap.set(
      status,
      (shipmentStatusMap.get(status) ?? 0) + 1,
    );
  });

  const shipmentStatus: StatusData[] = Array.from(
    shipmentStatusMap.entries(),
  ).map(([name, value]) => ({
    name: formatStatus(name),
    value,
  }));

  // ==========================================================
  // PAYMENT STATUS
  // ==========================================================

  const paymentStatusMap = new Map<
    string,
    number
  >();

  payments.forEach((payment) => {
    const status =
      payment.payment_status ?? "unknown";

    paymentStatusMap.set(
      status,
      (paymentStatusMap.get(status) ?? 0) + 1,
    );
  });

  const paymentStatus: StatusData[] = Array.from(
    paymentStatusMap.entries(),
  ).map(([name, value]) => ({
    name: formatStatus(name),
    value,
  }));

  // ==========================================================
  // PACKAGE TYPES
  // ==========================================================

  const packageTypeMap = new Map<
    string,
    number
  >();

  shipments.forEach((shipment) => {
    const packageType =
      shipment.package_type ?? "other";

    packageTypeMap.set(
      packageType,
      (packageTypeMap.get(packageType) ?? 0) + 1,
    );
  });

  const packageTypes: StatusData[] = Array.from(
    packageTypeMap.entries(),
  ).map(([name, value]) => ({
    name: formatStatus(name),
    value,
  }));

  // ==========================================================
  // DELIVERY PERFORMANCE
  // ==========================================================

  const totalDeliveryShipments = shipments.length;

  const deliveredDeliveryShipments =
    shipments.filter(
      (shipment) =>
        shipment.status === "delivered",
    ).length;

  const cancelledDeliveryShipments =
    shipments.filter(
      (shipment) =>
        shipment.status === "cancelled",
    ).length;

  const activeDeliveryShipments =
    shipments.filter(
      (shipment) =>
        !["delivered", "cancelled"].includes(
          shipment.status,
        ),
    ).length;

  const deliveryRate =
    totalDeliveryShipments > 0
      ? Number(
          (
            (deliveredDeliveryShipments /
              totalDeliveryShipments) *
            100
          ).toFixed(1),
        )
      : 0;

  // ----------------------------------------------------------
  // Calculate average delivery time.
  //
  // We compare:
  //
  // shipment.created_at
  //
  // against the shipment_events.created_at
  // where status = "delivered".
  // ----------------------------------------------------------

  const deliveryDurations: number[] = [];

  shipments
    .filter(
      (shipment) =>
        shipment.status === "delivered",
    )
    .forEach((shipment) => {
      const deliveredEvent =
        allShipmentEvents
          .filter(
            (event) =>
              event.shipment_id ===
                shipment.id &&
              event.status === "delivered",
          )
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          )[0];

      if (
        deliveredEvent &&
        shipment.created_at
      ) {
        const createdTime = new Date(
          shipment.created_at,
        ).getTime();

        const deliveredTime = new Date(
          deliveredEvent.created_at,
        ).getTime();

        const difference =
          deliveredTime - createdTime;

        if (difference >= 0) {
          const hours =
            difference /
            (1000 * 60 * 60);

          deliveryDurations.push(hours);
        }
      }
    });

 const averageDeliveryTimeHours =
  deliveryDurations.length > 0
    ? Number(
        (
          deliveryDurations.reduce(
            (sum, hours) => sum + hours,
            0,
          ) / deliveryDurations.length
        ).toFixed(1),
      )
    : 0;

const averageDeliveryDays =
  Number((averageDeliveryTimeHours / 24).toFixed(1));

const onTimeDeliveries = shipments.filter((shipment) => {
  if (
    shipment.status !== "delivered" ||
    !shipment.estimated_delivery
  ) {
    return false;
  }

  const deliveryDate = new Date(shipment.updated_at);
  const estimatedDate = new Date(shipment.estimated_delivery);

  return deliveryDate <= estimatedDate;
}).length;

const onTimeRate =
  deliveredDeliveryShipments > 0
    ? Number(
        (
          (onTimeDeliveries / deliveredDeliveryShipments) *
          100
        ).toFixed(1),
      )
    : 0;

const failedDeliveries = 0;

const cancellationRate =
  totalDeliveryShipments > 0
    ? Number(
        (
          (cancelledDeliveryShipments /
            totalDeliveryShipments) *
          100
        ).toFixed(1),
      )
    : 0;

const deliveryPerformance: DeliveryPerformanceData = {
  total: totalDeliveryShipments,
  delivered: deliveredDeliveryShipments,
  active: activeDeliveryShipments,
  cancelled: cancelledDeliveryShipments,
  deliveryRate,
  averageDeliveryTimeHours,
};

  // ==========================================================
  // DRIVER PERFORMANCE
  // ==========================================================

  const driverPerformance: DriverPerformanceData[] = drivers.map((driver) => {
  const user = users.find((item) => item.id === driver.user_id);

  const firstName = user?.first_name?.trim() ?? "";
  const lastName = user?.last_name?.trim() ?? "";

  const driverName =
    `${firstName} ${lastName}`.trim() ||
    user?.email ||
    "Unknown Driver";

  const driverShipments = shipments.filter(
    (shipment) => shipment.driver_id === driver.id,
  );

  const totalShipments = driverShipments.length;

  const deliveredShipments = driverShipments.filter(
    (shipment) => shipment.status === "delivered",
  ).length;

  const failedShipments = driverShipments.filter(
    (shipment) =>
      shipment.status === "cancelled" ||
      shipment.status === "failed",
  ).length;

  const activeShipments = driverShipments.filter(
    (shipment) =>
      !["delivered", "cancelled", "failed"].includes(
        shipment.status,
      ),
  ).length;

  const successRate =
    totalShipments > 0
      ? Number(
          ((deliveredShipments / totalShipments) * 100).toFixed(1),
        )
      : 0;

  return {
    driverId: driver.id,
    driverName,
    vehicleType: driver.vehicle_type ?? "Not assigned",
    vehiclePlate: driver.vehicle_plate ?? "Not assigned",
    status: driver.status ?? "inactive",

    totalShipments,
    deliveredShipments,
    failedShipments,
    successRate,
    activeShipments,
  };
});

// ==========================================================
// SORT DRIVER PERFORMANCE
// ==========================================================

driverPerformance.sort((a, b) => {
  if (b.successRate !== a.successRate) {
    return b.successRate - a.successRate;
  }

  return b.deliveredShipments - a.deliveredShipments;
});

  // ==========================================================
  // RETURN REPORT
  // ==========================================================

  return {
    summary,

    revenue,

    shipmentVolume,

    shipmentStatus,

    paymentStatus,

    packageTypes,

    deliveryPerformance,

    driverPerformance,
  };
}
