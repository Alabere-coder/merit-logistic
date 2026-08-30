import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";

export type SupportTicket = {
  id: string;
  ticket_number: string;
  user_id: string;
  shipment_id: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;

  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;

  assigned_admin?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "in_progress":
    case "in-progress":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "closed":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getPriorityStyles(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
    case "urgent":
      return "bg-rose-50 text-rose-700 border-rose-200";

    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getUserName(user: SupportTicket["user"]) {
  if (!user) {
    return "Unknown User";
  }

  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

  return name || user.email || "Unknown User";
}

function getAdminName(admin: SupportTicket["assigned_admin"]) {
  if (!admin) {
    return "Unassigned";
  }

  const name = `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim();

  return name || admin.email || "Admin";
}

export function SupportTicketTable({ tickets }: { tickets: SupportTicket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <CircleDot className="h-6 w-6 text-slate-500" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No support tickets
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          There are currently no support tickets to display.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-275 text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ticket
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Customer
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Priority
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assigned Admin
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Created
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="transition hover:bg-slate-50">
                {/* Ticket */}
                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {ticket.ticket_number}
                    </p>

                    <p className="mt-1 max-w-60 truncate text-sm text-slate-500">
                      {ticket.subject}
                    </p>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    {getUserName(ticket.user)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {ticket.user?.email ?? "No email"}
                  </p>
                </td>

                {/* Category */}
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-700">
                    {formatStatus(ticket.category)}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(
                      ticket.priority,
                    )}`}
                  >
                    {formatStatus(ticket.priority)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                      ticket.status,
                    )}`}
                  >
                    {formatStatus(ticket.status)}
                  </span>
                </td>

                {/* Assigned Admin */}
                <td className="px-5 py-4">
                  {ticket.assigned_admin ? (
                    <>
                      <p className="text-sm font-medium text-slate-900">
                        {getAdminName(ticket.assigned_admin)}
                      </p>

                      {ticket.assigned_admin.email && (
                        <p className="mt-1 text-xs text-slate-500">
                          {ticket.assigned_admin.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                      Unassigned
                    </span>
                  )}
                </td>

                {/* Created */}
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatDate(ticket.created_at)}
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/support/${ticket.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
