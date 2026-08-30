import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  Package,
  CalendarDays,
  CircleDot,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { SupportReplyForm } from "@/components/admin/support-reply-form";
import { SupportTicketActions } from "@/components/admin/support-ticket-actions";
import { getSupportAdmins } from "@/lib/actions/support";

type PageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
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
    case "high":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default async function AdminSupportTicketPage({ params }: PageProps) {
  const { ticketId } = await params;

  const { supabase, user } = await requireRole(["admin"]);

  const adminsResult = await getSupportAdmins();

  if ("error" in adminsResult) {
    console.error("SUPPORT ADMINS ERROR:", adminsResult.error);
  }

  const admins = "success" in adminsResult ? adminsResult.admins : [];

  // --------------------------------------------------
  // 1. Get ticket
  // --------------------------------------------------

  const { data: ticket, error: ticketError } = await supabase
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
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    console.error("SUPPORT TICKET ERROR:", ticketError);
    notFound();
  }

  // --------------------------------------------------
  // Support admins
  // --------------------------------------------------

  if ("error" in adminsResult) {
    console.error("SUPPORT ADMINS ERROR:", adminsResult.error);
  }

  // --------------------------------------------------
  // 2. Get ticket owner
  // --------------------------------------------------

  const { data: ticketOwner } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone_number, role")
    .eq("id", ticket.user_id)
    .maybeSingle();

  // --------------------------------------------------
  // 3. Get related shipment
  // --------------------------------------------------

  let shipment = null;

  if (ticket.shipment_id) {
    const { data: shipmentData } = await supabase
      .from("shipments")
      .select("id, tracking_number, status, pickup_address, delivery_address")
      .eq("id", ticket.shipment_id)
      .maybeSingle();

    shipment = shipmentData;
  }

  // --------------------------------------------------
  // 4. Get messages
  // --------------------------------------------------

  const { data: messages, error: messagesError } = await supabase
    .from("support_messages")
    .select(
      `
      id,
      ticket_id,
      sender_id,
      message,
      created_at
    `,
    )
    .eq("ticket_id", ticket.id)
    .order("created_at", {
      ascending: true,
    });

  if (messagesError) {
    console.error("SUPPORT MESSAGES ERROR:", messagesError);
  }

  // --------------------------------------------------
  // 5. Get message senders
  // --------------------------------------------------

  const senderIds = [
    ...new Set(
      (messages ?? []).map((message) => message.sender_id).filter(Boolean),
    ),
  ];

  let senders: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    role: string | null;
  }> = [];

  if (senderIds.length > 0) {
    const { data: senderData } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role")
      .in("id", senderIds);

    senders = senderData ?? [];
  }

  const messagesWithSenders = (messages ?? []).map((message) => ({
    ...message,
    sender: senders.find((sender) => sender.id === message.sender_id) ?? null,
  }));

  const ownerName =
    `${ticketOwner?.first_name ?? ""} ${ticketOwner?.last_name ?? ""}`.trim() ||
    ticketOwner?.email ||
    "Unknown User";

  // ... keep the rest of your existing JSX below

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/support"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to support
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {ticket.ticket_number}
            </h1>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                ticket.status,
              )}`}
            >
              {formatStatus(ticket.status)}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(
                ticket.priority,
              )}`}
            >
              {formatStatus(ticket.priority)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">{ticket.subject}</p>
        </div>

        <SupportTicketActions
          ticketId={ticket.id}
          currentStatus={ticket.status}
          currentPriority={ticket.priority}
          currentAssignee={ticket.assigned_to}
          admins={admins}
        />
      </div>

      {/* ------------------------------------------------ */}
      {/* Ticket information */}
      {/* ------------------------------------------------ */}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Conversation */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">Conversation</h2>

            <p className="mt-1 text-sm text-slate-500">
              Messages between the user and support team.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {messagesWithSenders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No messages yet.
                </p>
              </div>
            ) : (
              messagesWithSenders.map((message) => {
                const isAdmin = message.sender?.role === "admin";

                const senderName =
                  `${message.sender?.first_name ?? ""} ${
                    message.sender?.last_name ?? ""
                  }`.trim() ||
                  message.sender?.email ||
                  "Unknown User";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isAdmin
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isAdmin ? "text-blue-100" : "text-slate-600"
                          }`}
                        >
                          {isAdmin ? "Support" : senderName}
                        </span>

                        <span
                          className={`text-[11px] ${
                            isAdmin ? "text-blue-200" : "text-slate-400"
                          }`}
                        >
                          {formatDate(message.created_at)}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply */}
          <div className="border-t border-slate-200 p-5">
            <SupportReplyForm
              ticketId={ticket.id}
              currentUserId={user.id}
              disabled={ticket.status === "closed"}
            />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* User */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Requester</h3>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <User className="h-5 w-5 text-slate-600" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{ownerName}</p>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {ticketOwner?.email ?? "No email"}
                </p>

                {ticketOwner?.phone_number && (
                  <p className="mt-1 text-xs text-slate-500">
                    {ticketOwner.phone_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ticket details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Ticket Details</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <CircleDot className="mt-0.5 h-4 w-4 text-slate-400" />

                <div>
                  <p className="text-xs text-slate-500">Category</p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatStatus(ticket.category)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

                <div>
                  <p className="text-xs text-slate-500">Created</p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />

                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatDate(ticket.updated_at)}
                  </p>
                </div>
              </div>

              {ticket.resolved_at && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />

                  <div>
                    <p className="text-xs text-slate-500">Resolved</p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {formatDate(ticket.resolved_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipment */}
          {shipment && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                Related Shipment
              </h3>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0">
                  <Link
                    href={`/admin/shipments/${shipment.tracking_number}`}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {shipment.tracking_number}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500">
                    Status: {formatStatus(shipment.status)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
