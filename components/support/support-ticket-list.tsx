"use client";

import Link from "next/link";
import { ArrowRight, CircleDot, Clock3, MessageCircle } from "lucide-react";

type SupportTicket = {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

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

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "in_progress":
    case "in-progress":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getPriorityStyles(priority: string) {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

type SupportTicketListProps = {
  tickets: SupportTicket[];
  basePath: "/customer/support" | "/driver/support";
};

export function SupportTicketList({
  tickets,
  basePath,
}: SupportTicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        {" "}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          {" "}
          <CircleDot className="h-6 w-6 text-slate-500" />{" "}
        </div>
        ```
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No support tickets
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          You have not created any support tickets yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`${basePath}/${ticket.id}`}
          className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          {" "}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {" "}
            <div className="min-w-0 flex-1">
              {" "}
              <div className="flex flex-wrap items-center gap-2">
                {" "}
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {ticket.ticket_number}{" "}
                </span>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                    ticket.status,
                  )}`}
                >
                  {formatStatus(ticket.status)}
                </span>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(
                    ticket.priority,
                  )}`}
                >
                  {formatStatus(ticket.priority)}
                </span>
              </div>
              <h3 className="mt-2 truncate text-base font-semibold text-slate-900">
                {ticket.subject}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CircleDot className="h-3.5 w-3.5" />
                  {formatStatus(ticket.category)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  Updated {formatDate(ticket.updated_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 group-hover:text-slate-900">
              <MessageCircle className="h-4 w-4" />
              View
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
