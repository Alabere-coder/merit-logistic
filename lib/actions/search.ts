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

  const { data: drivers, error: driversError } = await supabase
    .from("drivers")
    .select(
      `
          id,
          user_id,
          license_number,
          vehicle_plate,
          vehicle_type,
          status,
          users:user_id (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
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

  if (driversError) {
    console.error("GLOBAL SEARCH DRIVERS ERROR:", driversError);
  }

  for (const driver of drivers ?? []) {
    const user = Array.isArray(driver.users) ? driver.users[0] : driver.users;

    if (!user) {
      continue;
    }

    const fullName = `${user.first_name} ${user.last_name}`.trim();

    /*
     * The drivers query above searches driver-specific
     * fields. We also need to match the driver's user
     * information.
     */
    const userSearchable = [
      user.first_name,
      user.last_name,
      user.email,
      user.phone_number,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesUser = userSearchable.includes(term.toLowerCase());

    if (
      !matchesUser &&
      !driver.license_number.toLowerCase().includes(term.toLowerCase()) &&
      !(driver.vehicle_plate ?? "")
        .toLowerCase()
        .includes(term.toLowerCase()) &&
      !driver.vehicle_type.toLowerCase().includes(term.toLowerCase())
    ) {
      continue;
    }

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
   * Search drivers again by user information.
   *
   * This is separate because the PostgREST relation
   * filter above only searches fields directly on
   * the drivers table.
   */
  const { data: driverUsers, error: driverUsersError } = await supabase
    .from("users")
    .select(
      `
          id,
          first_name,
          last_name,
          email,
          phone_number,
          drivers (
            id,
            license_number,
            vehicle_plate,
            vehicle_type,
            status
          )
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
    .limit(8);

  if (driverUsersError) {
    console.error("GLOBAL SEARCH DRIVER USERS ERROR:", driverUsersError);
  }

  for (const user of driverUsers ?? []) {
    const driver = Array.isArray(user.drivers) ? user.drivers[0] : user.drivers;

    if (!driver) {
      continue;
    }

    /*
     * Avoid adding the same driver twice.
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
