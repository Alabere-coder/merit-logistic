"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export type GlobalSearchResultType =
  | "shipment"
  | "customer"
  | "driver"
  | "payment"
  | "support";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
};

export type GlobalSearchResponse = {
  success?: boolean;
  error?: string;
  results: GlobalSearchResult[];
};

/* =========================================================
   GLOBAL ADMIN SEARCH
========================================================= */

export async function globalSearch(
  query: string,
): Promise<GlobalSearchResponse> {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const search = query.trim();

  if (!search) {
    return {
      success: true,
      results: [],
    };
  }

  if (search.length < 2) {
    return {
      error: "Please enter at least 2 characters.",
      results: [],
    };
  }

  /*
   * Prevent unnecessarily large searches.
   */
  const term = search.slice(0, 100);

  /*
   * Escape characters that have special meaning in
   * PostgREST filter expressions.
   */
  const escapedTerm = term
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, "\\,");

  const pattern = `%${escapedTerm}%`;

  const results: GlobalSearchResult[] = [];

  /* =======================================================
     SHIPMENTS
  ======================================================= */

  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select(
      `
          id,
          tracking_number,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          pickup_address,
          delivery_address,
          status,
          price
        `,
    )
    .or(
      [
        `tracking_number.ilike.${pattern}`,
        `sender_name.ilike.${pattern}`,
        `sender_phone.ilike.${pattern}`,
        `receiver_name.ilike.${pattern}`,
        `receiver_phone.ilike.${pattern}`,
        `pickup_address.ilike.${pattern}`,
        `delivery_address.ilike.${pattern}`,
      ].join(","),
    )
    .order("updated_at", {
      ascending: false,
    })
    .limit(8);

  if (shipmentsError) {
    console.error("GLOBAL SEARCH SHIPMENTS ERROR:", shipmentsError);
  }

  for (const shipment of shipments ?? []) {
    results.push({
      id: shipment.id,
      type: "shipment",
      title: shipment.tracking_number,
      subtitle: `${shipment.sender_name} → ${shipment.receiver_name}`,
      meta: shipment.status,
      href: `/admin/shipments/${shipment.id}`,
    });
  }

  /* =======================================================
     CUSTOMERS
  ======================================================= */

  const { data: customers, error: customersError } = await supabase
    .from("users")
    .select(
      `
          id,
          first_name,
          last_name,
          email,
          phone_number,
          is_active
        `,
    )
    .eq("role", "customer")
    .or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `phone_number.ilike.${pattern}`,
      ].join(","),
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  if (customersError) {
    console.error("GLOBAL SEARCH CUSTOMERS ERROR:", customersError);
  }

  for (const customer of customers ?? []) {
    const fullName = `${customer.first_name} ${customer.last_name}`.trim();

    results.push({
      id: customer.id,
      type: "customer",
      title: fullName,
      subtitle: customer.email,
      meta:
        customer.phone_number ?? (customer.is_active ? "Active" : "Inactive"),
      href: `/admin/customers/${customer.id}`,
    });
  }

  /* =======================================================
   DRIVERS
======================================================= */

  /*
   * Search driver-specific fields.
   *
   * No relationship embedding is used.
   */
  const { data: driversByDetails, error: driversByDetailsError } =
    await supabase
      .from("drivers")
      .select(
        `
      id,
      user_id,
      license_number,
      vehicle_plate,
      vehicle_type,
      status
    `,
      )
      .or(
        [
          `license_number.ilike.${pattern}`,
          `vehicle_plate.ilike.${pattern}`,
          `vehicle_type.ilike.${pattern}`,
        ].join(","),
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8);

  if (driversByDetailsError) {
    console.error("GLOBAL SEARCH DRIVERS ERROR:", driversByDetailsError);
  }

  /*
   * Search users who have the driver role.
   *
   * Again, no drivers relationship is embedded.
   */
  const { data: driverUsers, error: driverUsersError } = await supabase
    .from("users")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      phone_number
    `,
    )
    .eq("role", "driver")
    .or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `phone_number.ilike.${pattern}`,
      ].join(","),
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  if (driverUsersError) {
    console.error("GLOBAL SEARCH DRIVER USERS ERROR:", driverUsersError);
  }

  /*
   * Collect all driver user IDs that need their driver record.
   */
  const driverUserIds = [
    ...(driversByDetails ?? []).map((driver) => driver.user_id),
    ...(driverUsers ?? []).map((user) => user.id),
  ].filter(Boolean);

  /*
   * Fetch driver records separately.
   *
   * This query has no relationship embedding.
   */
  const { data: matchingDriverRecords, error: matchingDriversError } =
    driverUserIds.length > 0
      ? await supabase
          .from("drivers")
          .select(
            `
          id,
          user_id,
          license_number,
          vehicle_plate,
          vehicle_type,
          status
        `,
          )
          .in("user_id", driverUserIds)
      : { data: [], error: null };

  if (matchingDriversError) {
    console.error(
      "GLOBAL SEARCH MATCHING DRIVER RECORDS ERROR:",
      matchingDriversError,
    );
  }

  /*
   * Create a map:
   *
   * user_id -> driver record
   */
  const driverMap = new Map(
    (matchingDriverRecords ?? []).map((driver) => [driver.user_id, driver]),
  );

  /*
   * Create a map:
   *
   * user_id -> user
   */
  const userMap = new Map((driverUsers ?? []).map((user) => [user.id, user]));

  /*
   * Add drivers found by driver-specific fields.
   */
  for (const driver of driversByDetails ?? []) {
    let user = userMap.get(driver.user_id);

    /*
     * If this driver's user was not returned by the
     * driver-user search, fetch the user directly.
     */
    if (!user) {
      const { data: driverUser, error: driverUserError } = await supabase
        .from("users")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          phone_number
        `,
        )
        .eq("id", driver.user_id)
        .maybeSingle();

      if (driverUserError) {
        console.error(
          "GLOBAL SEARCH DRIVER USER LOOKUP ERROR:",
          driverUserError,
        );
        continue;
      }

      user = driverUser ?? undefined;
    }

    if (!user) {
      continue;
    }

    const fullName = `${user.first_name} ${user.last_name}`.trim();

    results.push({
      id: driver.id,
      type: "driver",
      title: fullName,
      subtitle: user.email,
      meta: driver.vehicle_plate ?? driver.license_number ?? driver.status,
      href: `/admin/drivers/${driver.id}`,
    });
  }

  /*
   * Add drivers found by user information.
   */
  for (const user of driverUsers ?? []) {
    const driver = driverMap.get(user.id);

    if (!driver) {
      continue;
    }

    /*
     * Avoid duplicates.
     */
    if (
      results.some(
        (result) => result.type === "driver" && result.id === driver.id,
      )
    ) {
      continue;
    }

    const fullName = `${user.first_name} ${user.last_name}`.trim();

    results.push({
      id: driver.id,
      type: "driver",
      title: fullName,
      subtitle: user.email,
      meta: driver.vehicle_plate ?? driver.license_number ?? driver.status,
      href: `/admin/drivers/${driver.id}`,
    });
  }

  /* =======================================================
     PAYMENTS
  ======================================================= */

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(
      `
          id,
          amount,
          payment_status,
          payment_method,
          transaction_reference,
          shipment_id
        `,
    )
    .or([`transaction_reference.ilike.${pattern}`].join(","))
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  if (paymentsError) {
    console.error("GLOBAL SEARCH PAYMENTS ERROR:", paymentsError);
  }

  for (const payment of payments ?? []) {
    results.push({
      id: payment.id,
      type: "payment",
      title:
        payment.transaction_reference ?? `Payment ${payment.id.slice(0, 8)}`,
      subtitle: `₦${Number(payment.amount).toLocaleString("en-NG")}`,
      meta: payment.payment_status,
      href: `/admin/payments/${payment.id}`,
    });
  }

  /* =======================================================
     SUPPORT TICKETS
  ======================================================= */

  const { data: tickets, error: ticketsError } = await supabase
    .from("support_tickets")
    .select(
      `
          id,
          ticket_number,
          subject,
          category,
          status,
          priority
        `,
    )
    .or(
      [
        `ticket_number.ilike.${pattern}`,
        `subject.ilike.${pattern}`,
        `category.ilike.${pattern}`,
      ].join(","),
    )
    .order("updated_at", {
      ascending: false,
    })
    .limit(8);

  if (ticketsError) {
    console.error("GLOBAL SEARCH SUPPORT ERROR:", ticketsError);
  }

  for (const ticket of tickets ?? []) {
    results.push({
      id: ticket.id,
      type: "support",
      title: ticket.ticket_number,
      subtitle: ticket.subject,
      meta: `${ticket.priority} · ${ticket.status}`,
      href: `/admin/support/${ticket.id}`,
    });
  }

  /* =======================================================
     FINAL RESULT
  ======================================================= */

  return {
    success: true,
    results: results.slice(0, 30),
  };
}
