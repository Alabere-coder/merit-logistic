import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";

import { Card, CardContent } from "@/components/ui/card";

import { StatusBadge } from "@/components/dashboard/stat-card";

import { AssignDriverSelect } from "@/components/dashboard/assign-driver-select";

import { formatCurrency } from "@/lib/utils";

import { Eye, PackageSearch } from "lucide-react";

export default async function AdminShipmentsPage() {
  const { supabase } = await requireRole(["admin"]);

  const [{ data: shipments }, { data: activeDrivers }] = await Promise.all([
    supabase
      .from("shipments")
      .select(
        `
          id,
          tracking_number,
          status,
          price,
          driver_id,
          pickup_address,
          delivery_address,
          created_at,
          customer:customer_id(
            first_name,
            last_name
          )
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(50),

    supabase
      .from("drivers")
      .select(
        `
          id,
          users:user_id(
            first_name,
            last_name
          )
        `,
      )
      .eq("status", "active"),
  ]);

  const driverOptions = (activeDrivers ?? []).map((d: any) => ({
    id: d.id,
    name:
      `${d.users?.first_name ?? ""} ${d.users?.last_name ?? ""}`.trim() ||
      "Unnamed driver",
  }));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
          Shipments
        </h1>

        <p className="mt-0.5 text-sm font-medium text-navy-500">
          Approve, assign, and monitor every shipment in the system.
        </p>
      </div>

      {/* Main Table Container */}
      <Card className="overflow-hidden rounded-xl border border-navy-100/80 bg-white shadow-xs">
        <CardContent className="p-0">
          {(shipments ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-navy-50 p-3 text-navy-400 ring-1 ring-inset ring-navy-100">
                <PackageSearch className="h-6 w-6" />
              </div>

              <p className="mt-3 text-sm font-semibold text-navy-900">
                No shipments yet
              </p>

              <p className="mt-1 max-w-sm text-xs text-navy-500">
                When customers place orders, they will appear here for review
                and driver assignment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-700">
                <thead>
                  <tr className="border-b border-navy-100/80 bg-navy-50/40 text-[11px] font-bold uppercase tracking-wider text-navy-500">
                    <th scope="col" className="px-6 py-3.5">
                      Tracking #
                    </th>

                    <th scope="col" className="px-6 py-3.5">
                      Customer
                    </th>

                    <th scope="col" className="px-6 py-3.5">
                      Route
                    </th>

                    <th scope="col" className="px-6 py-3.5">
                      Price
                    </th>

                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>

                    <th scope="col" className="px-6 py-3.5">
                      Driver
                    </th>

                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-100/60">
                  {(shipments ?? []).map((s: any) => (
                    <tr
                      key={s.id}
                      className="group transition-colors hover:bg-navy-50/50"
                    >
                      {/* Tracking Number */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/admin/shipments/${s.id}`}
                          className="font-mono text-xs font-semibold text-navy-900 transition-colors hover:text-brand-600"
                        >
                          {s.tracking_number}
                        </Link>
                      </td>

                      {/* Customer Info */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-100/80 text-[11px] font-bold text-navy-800">
                            {s.customer?.first_name?.[0]}
                            {s.customer?.last_name?.[0]}
                          </span>

                          <span className="font-semibold text-navy-900">
                            {s.customer?.first_name} {s.customer?.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-navy-700">
                          <span
                            className="max-w-30 truncate"
                            title={s.pickup_address}
                          >
                            {s.pickup_address?.split(",")[0]}
                          </span>

                          <span className="font-normal text-navy-300">→</span>

                          <span
                            className="max-w-30 truncate"
                            title={s.delivery_address}
                          >
                            {s.delivery_address?.split(",")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-navy-900">
                        {formatCurrency(Number(s.price))}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* Driver Assignment */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {["pending", "approved"].includes(s.status) ? (
                          <AssignDriverSelect
                            shipmentId={s.id}
                            currentDriverId={s.driver_id}
                            drivers={driverOptions}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-500">
                            {s.driver_id ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Assigned
                              </>
                            ) : (
                              <span className="text-navy-300">—</span>
                            )}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/admin/shipments/${s.id}`}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy-900"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// import { requireRole } from "@/lib/auth/require-role";
// import { Card, CardContent } from "@/components/ui/card";
// import { StatusBadge } from "@/components/dashboard/stat-card";
// import { AssignDriverSelect } from "@/components/dashboard/assign-driver-select";
// import { formatCurrency } from "@/lib/utils";
// import { PackageSearch } from "lucide-react";

// export default async function AdminShipmentsPage() {
//   const { supabase } = await requireRole(["admin"]);

//   const [{ data: shipments }, { data: activeDrivers }] = await Promise.all([
//     supabase
//       .from("shipments")
//       .select(
//         "id, tracking_number, status, price, driver_id, pickup_address, delivery_address, created_at, customer:customer_id(first_name, last_name)",
//       )
//       .order("created_at", { ascending: false })
//       .limit(50),
//     supabase
//       .from("drivers")
//       .select("id, users:user_id(first_name, last_name)")
//       .eq("status", "active"),
//   ]);

//   const driverOptions = (activeDrivers ?? []).map((d: any) => ({
//     id: d.id,
//     name:
//       `${d.users?.first_name ?? ""} ${d.users?.last_name ?? ""}`.trim() ||
//       "Unnamed driver",
//   }));

//   return (
//     <div className="space-y-6">
//       {/* Header Section */}
//       <div>
//         <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
//           Shipments
//         </h1>
//         <p className="mt-0.5 text-sm font-medium text-navy-500">
//           Approve, assign, and monitor every shipment in the system.
//         </p>
//       </div>

//       {/* Main Table Container */}
//       <Card className="overflow-hidden border border-navy-100/80 bg-white shadow-xs rounded-xl">
//         <CardContent className="p-0">
//           {(shipments ?? []).length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-12 text-center">
//               <div className="rounded-full bg-navy-50 p-3 text-navy-400 ring-1 ring-inset ring-navy-100">
//                 <PackageSearch className="h-6 w-6" />
//               </div>
//               <p className="mt-3 text-sm font-semibold text-navy-900">
//                 No shipments yet
//               </p>
//               <p className="mt-1 text-xs text-navy-500 max-w-sm">
//                 When customers place orders, they will appear here for review
//                 and driver assignment.
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm text-navy-700">
//                 <thead>
//                   <tr className="border-b border-navy-100/80 bg-navy-50/40 text-[11px] font-bold uppercase tracking-wider text-navy-500">
//                     <th scope="col" className="px-6 py-3.5">
//                       Tracking #
//                     </th>
//                     <th scope="col" className="px-6 py-3.5">
//                       Customer
//                     </th>
//                     <th scope="col" className="px-6 py-3.5">
//                       Route
//                     </th>
//                     <th scope="col" className="px-6 py-3.5">
//                       Price
//                     </th>
//                     <th scope="col" className="px-6 py-3.5">
//                       Status
//                     </th>
//                     <th scope="col" className="px-6 py-3.5">
//                       Driver
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-navy-100/60">
//                   {(shipments ?? []).map((s: any) => (
//                     <tr
//                       key={s.id}
//                       className="group transition-colors hover:bg-navy-50/50"
//                     >
//                       {/* Tracking Number */}
//                       <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-navy-900 group-hover:text-brand-600 transition-colors">
//                         {s.tracking_number}
//                       </td>

//                       {/* Customer Info */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2.5">
//                           <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-100/80 text-[11px] font-bold text-navy-800">
//                             {s.customer?.first_name?.[0]}
//                             {s.customer?.last_name?.[0]}
//                           </span>
//                           <span className="font-semibold text-navy-900">
//                             {s.customer?.first_name} {s.customer?.last_name}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Route */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-1.5 text-xs font-medium text-navy-700">
//                           <span
//                             className="truncate max-w-30"
//                             title={s.pickup_address}
//                           >
//                             {s.pickup_address?.split(",")[0]}
//                           </span>
//                           <span className="text-navy-300 font-normal">→</span>
//                           <span
//                             className="truncate max-w-30"
//                             title={s.delivery_address}
//                           >
//                             {s.delivery_address?.split(",")[0]}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Price */}
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-navy-900">
//                         {formatCurrency(Number(s.price))}
//                       </td>

//                       {/* Status Badge */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <StatusBadge status={s.status} />
//                       </td>

//                       {/* Driver Assignment */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {["pending", "approved"].includes(s.status) ? (
//                           <AssignDriverSelect
//                             shipmentId={s.id}
//                             currentDriverId={s.driver_id}
//                             drivers={driverOptions}
//                           />
//                         ) : (
//                           <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-500">
//                             {s.driver_id ? (
//                               <>
//                                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                                 Assigned
//                               </>
//                             ) : (
//                               <span className="text-navy-300">—</span>
//                             )}
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
