import { requireRole } from "@/lib/auth/require-role";
import { getMySupportTickets } from "@/lib/actions/support";
import { SupportTicketForm } from "@/components/support/support-ticket-form";
import { SupportTicketList } from "@/components/support/support-ticket-list";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

export default async function CustomerSupportPage() {
  await requireRole(["customer"]);

  const result = await getMySupportTickets();

  return (
    <div className="space-y-8">
      {" "}
      <div>
        {" "}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Support{" "}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Get help with your shipments, payments, account, or other issues.
        </p>
      </div>
      <div className="max-w-3xl">
        <SupportTicketForm />
      </div>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            My Support Tickets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View your previous support requests and continue your conversations.
          </p>
        </div>

        {result.error ? (
          <div className="w-full max-w-xs">
            <div>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="mt-4">
              <Skeleton className="aspect-video w-full" />
            </div>
          </div>
        ) : (
          <SupportTicketList
            tickets={result.tickets}
            basePath="/customer/support"
          />
        )}
      </section>
    </div>
  );
}
