"use client";

import { useState, useTransition } from "react";
import { createSupportTicket } from "@/lib/actions/support";
import { Loader2, Send } from "lucide-react";

type SupportTicketFormProps = {
  shipmentId?: string | null;
};

const categories = [
  { value: "delivery", label: "Delivery Issue" },
  { value: "shipment", label: "Shipment Issue" },
  { value: "payment", label: "Payment Issue" },
  { value: "account", label: "Account Issue" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function SupportTicketForm({
  shipmentId = null,
}: SupportTicketFormProps) {
  const [isPending, startTransition] = useTransition();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await createSupportTicket({
        subject,
        category,
        priority,
        shipmentId,
        message,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        result.ticket
          ? `Ticket ${result.ticket.ticket_number} was created successfully.`
          : "Support ticket created successfully.",
      );

      setSubject("");
      setCategory("");
      setPriority("medium");
      setMessage("");
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {" "}
      <div className="mb-6">
        {" "}
        <h2 className="text-lg font-bold text-slate-900">Contact Support </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tell us what you need help with and our support team will get back to
          you.
        </p>
      </div>
      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="support-subject"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Subject
          </label>

          <input
            id="support-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What do you need help with?"
            maxLength={150}
            disabled={isPending}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="support-category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <select
              id="support-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={isPending}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
            >
              <option value="">Select category</option>

              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="support-priority"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Priority
            </label>

            <select
              id="support-priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as "low" | "medium" | "high" | "urgent",
                )
              }
              disabled={isPending}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
            >
              {priorities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="support-message"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Message
          </label>

          <textarea
            id="support-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe your issue..."
            maxLength={5000}
            rows={6}
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {message.length}/5000
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
