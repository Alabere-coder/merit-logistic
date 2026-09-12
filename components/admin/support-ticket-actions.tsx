"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  updateSupportTicket,
  type SupportTicketStatus,
  type SupportTicketPriority,
} from "@/lib/actions/support";

type SupportAdmin = {
  id: string;
  name: string;
};

export type SupportTicketActionsProps = {
  ticketId: string;
  currentStatus: string;
  currentPriority: string;
  currentAssignee: string | null;
  admins: SupportAdmin[];
};

const STATUSES: SupportTicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

const PRIORITIES: SupportTicketPriority[] = ["low", "medium", "high", "urgent"];

export function SupportTicketActions({
  ticketId,
  currentStatus,
  currentPriority,
  currentAssignee,
  admins,
}: SupportTicketActionsProps) {
  const [status, setStatus] = useState<SupportTicketStatus>(
    currentStatus as SupportTicketStatus,
  );

  const [priority, setPriority] = useState<SupportTicketPriority>(
    currentPriority as SupportTicketPriority,
  );

  const [assignedTo, setAssignedTo] = useState<string>(currentAssignee ?? "");

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      const result = await updateSupportTicket({
        ticketId,
        status,
        priority,
        assignedTo: assignedTo || null,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Support ticket updated successfully.");
    } catch (error) {
      console.error("UPDATE SUPPORT TICKET ERROR:", error);

      toast.error("Failed to update support ticket.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
        {/* Status */}
        <div className="flex-1">
          <label
            htmlFor="ticket-status"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Status
          </label>

          <select
            id="ticket-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SupportTicketStatus)
            }
            disabled={saving}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="flex-1">
          <label
            htmlFor="ticket-priority"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Priority
          </label>

          <select
            id="ticket-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as SupportTicketPriority)
            }
            disabled={saving}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div className="flex-1">
          <label
            htmlFor="ticket-assignee"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Assigned Admin
          </label>

          <select
            id="ticket-assignee"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            disabled={saving}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Unassigned</option>

            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// "use client";

// import { useTransition } from "react";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";

// import {
//   updateSupportTicketStatus,
//   updateSupportTicketPriority,
//   assignSupportTicket,
// } from "@/lib/actions/support";

// import { Button } from "@/components/ui/button";

// type Admin = {
//   id: string;
//   name: string;
// };

// type SupportTicketActionsProps = {
//   ticketId: string;
//   currentStatus: string;
//   currentPriority: string;
//   currentAssignee: string | null;
//   admins: Admin[];
// };

// export function SupportTicketActions({
//   ticketId,
//   currentStatus,
//   currentPriority,
//   currentAssignee,
//   admins,
// }: SupportTicketActionsProps) {
//   const [pending, startTransition] = useTransition();

//   function handleStatusChange(status: string) {
//     startTransition(async () => {
//       const result = await updateSupportTicketStatus(ticketId, status);

//       if (result?.error) {
//         toast.error(result.error);
//         return;
//       }

//       toast.success("Ticket status updated.");
//     });
//   }

//   function handlePriorityChange(priority: string) {
//     startTransition(async () => {
//       const result = await updateSupportTicketPriority(ticketId, priority);

//       if (result?.error) {
//         toast.error(result.error);
//         return;
//       }

//       toast.success("Ticket priority updated.");
//     });
//   }

//   function handleAssignmentChange(adminId: string) {
//     startTransition(async () => {
//       const result = await assignSupportTicket(ticketId, adminId || null);

//       if (result?.error) {
//         toast.error(result.error);
//         return;
//       }

//       toast.success(
//         adminId ? "Ticket assigned successfully." : "Ticket unassigned.",
//       );
//     });
//   }

//   return (
//     <div className="flex flex-wrap items-center gap-3">
//       {/* Status */}
//       <div className="flex items-center gap-2">
//         <label
//           htmlFor="ticket-status"
//           className="text-sm font-medium text-slate-600"
//         >
//           Status
//         </label>

//         <select
//           id="ticket-status"
//           value={currentStatus}
//           disabled={pending}
//           onChange={(event) => handleStatusChange(event.target.value)}
//           className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <option value="open">Open</option>
//           <option value="in_progress">In Progress</option>
//           <option value="resolved">Resolved</option>
//           <option value="closed">Closed</option>
//         </select>
//       </div>

//       {/* Priority */}
//       <div className="flex items-center gap-2">
//         <label
//           htmlFor="ticket-priority"
//           className="text-sm font-medium text-slate-600"
//         >
//           Priority
//         </label>

//         <select
//           id="ticket-priority"
//           value={currentPriority}
//           disabled={pending}
//           onChange={(event) => handlePriorityChange(event.target.value)}
//           className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <option value="low">Low</option>
//           <option value="medium">Medium</option>
//           <option value="high">High</option>
//           <option value="urgent">Urgent</option>
//         </select>
//       </div>

//       {/* Assignment */}
//       <div className="flex items-center gap-2">
//         <label
//           htmlFor="ticket-assignee"
//           className="text-sm font-medium text-slate-600"
//         >
//           Assign
//         </label>

//         <select
//           id="ticket-assignee"
//           value={currentAssignee ?? ""}
//           disabled={pending}
//           onChange={(event) => handleAssignmentChange(event.target.value)}
//           className="h-9 min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <option value="">Unassigned</option>

//           {admins.map((admin) => (
//             <option key={admin.id} value={admin.id}>
//               {admin.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {pending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
//     </div>
//   );
// }
