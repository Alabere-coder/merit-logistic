import { requireRole } from "@/lib/auth/require-role";

import { SupportStats } from "@/components/admin/support-stats";

import {
  SupportTicketTable,
  type SupportTicket,
} from "@/components/admin/support-ticket-table";

export default async function AdminSupportPage() {
  const { supabase } = await requireRole(["admin"]);

  /* =========================================================
     GET SUPPORT TICKETS
  ========================================================= */

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        ticket_number,
        user_id,
        shipment_id,
        subject,
        category,
        priority,
        status,
        assigned_to,
        created_at,
        updated_at,
        resolved_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("ADMIN SUPPORT TICKETS ERROR:", error);

    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="font-semibold text-rose-900">
          Unable to load support tickets
        </h2>

        <p className="mt-1 text-sm text-rose-700">{error.message}</p>
      </div>
    );
  }

  const ticketRows = (tickets ?? []) as SupportTicket[];

  /* =========================================================
     GET REQUESTER IDS
  ========================================================= */

  const userIds = [
    ...new Set(
      ticketRows
        .map((ticket) => ticket.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  /* =========================================================
     GET ASSIGNED ADMIN IDS
  ========================================================= */

  const assignedAdminIds = [
    ...new Set(
      ticketRows
        .map((ticket) => ticket.assigned_to)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  /* =========================================================
     GET REQUESTERS
  ========================================================= */

  let users: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }> = [];

  if (userIds.length > 0) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", userIds);

    if (userError) {
      console.error("SUPPORT USERS LOOKUP ERROR:", userError);
    } else {
      users = userData ?? [];
    }
  }

  /* =========================================================
     GET ASSIGNED ADMINS
  ========================================================= */

  let assignedAdmins: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }> = [];

  if (assignedAdminIds.length > 0) {
    const { data: assignedAdminData, error: assignedAdminError } =
      await supabase
        .from("users")
        .select("id, first_name, last_name, email")
        .in("id", assignedAdminIds)
        .eq("role", "admin");

    if (assignedAdminError) {
      console.error(
        "SUPPORT ASSIGNED ADMINS LOOKUP ERROR:",
        assignedAdminError,
      );
    } else {
      assignedAdmins = assignedAdminData ?? [];
    }
  }

  /* =========================================================
     COMBINE TICKETS + REQUESTERS + ASSIGNED ADMINS
  ========================================================= */

  const enrichedTickets = ticketRows.map((ticket) => ({
    ...ticket,

    user: users.find((user) => user.id === ticket.user_id) ?? null,

    assigned_admin:
      assignedAdmins.find((admin) => admin.id === ticket.assigned_to) ?? null,
  }));

  /* =========================================================
     SUPPORT STATISTICS
  ========================================================= */

  const total = enrichedTickets.length;

  const open = enrichedTickets.filter(
    (ticket) => ticket.status.toLowerCase() === "open",
  ).length;

  const inProgress = enrichedTickets.filter((ticket) => {
    const status = ticket.status.toLowerCase();

    return status === "in_progress" || status === "in-progress";
  }).length;

  const resolved = enrichedTickets.filter(
    (ticket) => ticket.status.toLowerCase() === "resolved",
  ).length;

  const highPriority = enrichedTickets.filter((ticket) => {
    const priority = ticket.priority.toLowerCase();

    return priority === "high" || priority === "urgent";
  }).length;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Support
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage customer and driver support requests.
        </p>
      </div>

      {/* Statistics */}

      <SupportStats
        total={total}
        open={open}
        inProgress={inProgress}
        resolved={resolved}
        highPriority={highPriority}
      />

      {/* Tickets */}

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Support Tickets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all customer and driver support requests.
          </p>
        </div>

        <SupportTicketTable tickets={enrichedTickets} />
      </section>
    </div>
  );
}
