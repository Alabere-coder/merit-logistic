"use client";

import { useState, useTransition } from "react";
import { Send, User, Headphones } from "lucide-react";
import { createSupportMessage } from "@/lib/actions/support";
import { toast } from "sonner";

type SupportTicket = {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type Props = {
  ticket: SupportTicket;
  messages: SupportMessage[];
  currentUserId: string;
};

function formatStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

export function SupportTicketConversation({
  ticket,
  messages,
  currentUserId,
}: Props) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isClosed = ticket.status.toLowerCase() === "closed";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      toast.error("Please enter a message.");
      return;
    }

    if (cleanMessage.length > 5000) {
      toast.error("Message must be 5000 characters or less.");
      return;
    }

    startTransition(async () => {
      const result = await createSupportMessage({
        ticketId: ticket.id,
        message: cleanMessage,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMessage("");
      toast.success("Message sent.");
    });
  }

  return (
    <div className="space-y-6">
      {/* Ticket header */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {ticket.ticket_number}
            </p>

            <h1 className="mt-2 text-xl font-bold text-slate-900">
              {ticket.subject}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Created {formatDate(ticket.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                ticket.status,
              )}`}
            >
              {formatStatus(ticket.status)}
            </span>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyles(
                ticket.priority,
              )}`}
            >
              {formatStatus(ticket.priority)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span>
            <strong className="font-medium text-slate-700">Category:</strong>{" "}
            {formatStatus(ticket.category)}
          </span>

          <span>
            <strong className="font-medium text-slate-700">Status:</strong>{" "}
            {formatStatus(ticket.status)}
          </span>
        </div>
      </div>

      {/* Conversation */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Conversation</h2>

          <p className="mt-1 text-sm text-slate-500">
            Messages between you and support.
          </p>
        </div>

        <div className="space-y-5 p-6">
          {messages.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No messages yet.
            </div>
          ) : (
            messages.map((item) => {
              const isMine = item.sender_id === currentUserId;

              return (
                <div
                  key={item.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`mb-1 flex items-center gap-2 text-xs text-slate-500 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {isMine ? (
                        <>
                          You
                          <User className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <Headphones className="h-3.5 w-3.5" />
                          Support
                        </>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isMine
                          ? "rounded-br-md bg-slate-900 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{item.message}</p>
                    </div>

                    <p
                      className={`mt-1 text-[11px] text-slate-400 ${
                        isMine ? "text-right" : "text-left"
                      }`}
                    >
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reply */}

      {isClosed ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-700">
            This ticket is closed.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            You cannot send new messages to a closed ticket.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <label
            htmlFor="support-message"
            className="text-sm font-semibold text-slate-900"
          >
            Reply
          </label>

          <textarea
            id="support-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            rows={5}
            maxLength={5000}
            placeholder="Write your message..."
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">{message.length}/5000</p>

            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />

              {isPending ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
