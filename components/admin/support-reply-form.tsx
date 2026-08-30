"use client";

import { useRef, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { replyToSupportTicket } from "@/lib/actions/support";

export function SupportReplyForm({
  ticketId,
  currentUserId,
  disabled = false,
}: {
  ticketId: string;
  currentUserId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const message = String(formData.get("message") ?? "").trim();

    if (!message) {
      toast.error("Please enter a message.");
      return;
    }

    formData.set("ticketId", ticketId);
    formData.set("senderId", currentUserId);
    formData.set("message", message);

    startTransition(async () => {
      const result = await replyToSupportTicket(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Reply sent successfully.");

      formRef.current?.reset();

      window.location.reload();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="message"
          className="text-sm font-semibold text-slate-900"
        >
          Reply
        </label>

        <textarea
          id="message"
          name="message"
          rows={4}
          disabled={disabled || pending}
          placeholder={
            disabled
              ? "This ticket is closed."
              : "Write a response to the customer or driver..."
          }
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Reply
            </>
          )}
        </button>
      </div>
    </form>
  );
}
