import { Bell } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { getNotifications } from "@/lib/actions/notifications";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const { profile } = await requireRole(["admin", "driver", "customer"]);

  const result = await getNotifications();

  if (result.error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Bell className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">
            Stay up to date with your account and shipments.
          </p>
        </div>
      </div>

      <NotificationsList
        initialNotifications={(result.notifications ?? []) as any}
        role={profile.role as "admin" | "driver" | "customer"}
      />
    </div>
  );
}

// import { requireRole } from "@/lib/auth/require-role";
// import { getNotifications } from "@/lib/actions/notifications";
// import { NotificationsList } from "@/components/notifications/notifications-list";

// export default async function NotificationsPage() {
//   const { profile } = await requireRole(["admin", "driver", "customer"]);

//   const result = await getNotifications();

//   return (
//     <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-4xl">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//             Notifications
//           </h1>

//           <p className="mt-1 text-sm text-slate-500">
//             Stay up to date with the latest activity on your account.
//           </p>
//         </div>

//         <NotificationsList
//           notifications={(result.notifications ?? []) as any[]}
//           role={profile.role}
//         />
//       </div>
//     </main>
//   );
// }
