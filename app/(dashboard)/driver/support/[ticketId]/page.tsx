import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { getSupportTicket } from "@/lib/actions/support";
import { SupportTicketConversation } from "@/components/support/support-ticket-conversation";

type Props = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function DriverSupportTicketPage({ params }: Props) {
  const { user } = await requireRole(["driver"]);

  const { ticketId } = await params;

  if (!ticketId) {
    return (
      <div className="space-y-5">
        {" "}
        <Link
          href="/driver/support"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {" "}
          <ArrowLeft className="h-4 w-4" />
          Back to Support{" "}
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-rose-900">
            Invalid support ticket
          </h2>

          <p className="mt-1 text-sm text-rose-700">
            No support ticket ID was provided.
          </p>
        </div>
      </div>
    );
  }

  const result = await getSupportTicket(ticketId);

  if (result.error || !result.ticket) {
    return (
      <div className="space-y-5">
        {" "}
        <Link
          href="/driver/support"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {" "}
          <ArrowLeft className="h-4 w-4" />
          Back to Support{" "}
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-rose-900">
            Unable to load support ticket
          </h2>

          <p className="mt-1 text-sm text-rose-700">
            {result.error ?? "Support ticket not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {" "}
      <Link
        href="/driver/support"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {" "}
        <ArrowLeft className="h-4 w-4" />
        Back to Support{" "}
      </Link>
      <SupportTicketConversation
        ticket={result.ticket}
        messages={result.messages ?? []}
        currentUserId={user.id}
      />
    </div>
  );
}
