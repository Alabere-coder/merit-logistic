import { requireRole } from "@/lib/auth/require-role";
import { getMySupportTickets } from "@/lib/actions/support";
import { SupportTicketForm } from "@/components/support/support-ticket-form";
import { SupportTicketList } from "@/components/support/support-ticket-list";

export default async function DriverSupportPage() {
  await requireRole(["driver"]);

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
          Get help with deliveries, shipments, payments, your account, or other
          issues.
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
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            Unable to load your support tickets.
          </div>
        ) : (
          <SupportTicketList
            tickets={result.tickets}
            basePath="/driver/support"
          />
        )}
      </section>
    </div>
  );
}

// import { requireRole } from "@/lib/auth/require-role";
// import { SupportTicketForm } from "@/components/support/support-ticket-form";

// export default async function DriverSupportPage() {
//   await requireRole(["driver"]);

//   return (
//     <div className="space-y-6">
//       {" "}
//       <div>
//         {" "}
//         <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//           Support{" "}
//         </h1>
//         <p className="mt-1 text-sm text-slate-500">
//           Get help with deliveries, shipments, payments, your account, or other
//           issues.
//         </p>
//       </div>
//       <div className="max-w-3xl">
//         <SupportTicketForm />
//       </div>
//     </div>
//   );
// }
