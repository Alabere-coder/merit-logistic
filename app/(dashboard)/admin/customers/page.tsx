import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initials, formatDate } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Users } from "lucide-react";

export default async function AdminCustomersPage() {
  const { supabase } = await requireRole(["admin"]);

  console.log("=== ADMIN CUSTOMERS PAGE ===");

  const { data: customers, error: customersError } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name, email, phone_number, is_active, created_at, role",
    )
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  console.log("CUSTOMERS:", customers);
  console.log("CUSTOMERS ERROR:", customersError);

  const { data: shipmentCounts, error: shipmentError } = await supabase
    .from("shipments")
    .select("customer_id");

  console.log("SHIPMENT COUNTS:", shipmentCounts);
  console.log("SHIPMENT ERROR:", shipmentError);

  const countByCustomer = new Map<string, number>();

  (shipmentCounts ?? []).forEach((shipment) => {
    countByCustomer.set(
      shipment.customer_id,
      (countByCustomer.get(shipment.customer_id) ?? 0) + 1,
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Meta */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Customers
          </h1>
          <p className="text-sm font-medium text-navy-500">
            <span className="font-semibold text-navy-800">
              {customers?.length ?? 0}
            </span>{" "}
            total registered customers.
          </p>
        </div>
      </div>

      {/* Alert Notices */}
      {customersError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/50 p-4 text-sm text-red-900 shadow-2xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Unable to load customers</p>
            <p className="mt-0.5 text-red-700/90">{customersError.message}</p>
          </div>
        </div>
      )}

      {shipmentError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-sm text-amber-900 shadow-2xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Unable to load shipment counts</p>
            <p className="mt-0.5 text-amber-700/90">{shipmentError.message}</p>
          </div>
        </div>
      )}

      {/* Main Data Table Card */}
      <Card className="overflow-hidden border border-navy-100/80 bg-white shadow-xs rounded-xl">
        <CardContent className="p-0">
          {!customersError && (customers ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-navy-50 p-3 text-navy-400 ring-1 ring-inset ring-navy-100">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-navy-900">
                No customers found
              </p>
              <p className="mt-1 text-xs text-navy-500 max-w-sm">
                No customer records were returned from the database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-700">
                <thead>
                  <tr className="border-b border-navy-100/80 bg-navy-50/40 text-[11px] font-bold uppercase tracking-wider text-navy-500">
                    <th scope="col" className="px-6 py-3.5">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Shipments
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-100/60">
                  {(customers ?? []).map((customer) => (
                    <tr
                      key={customer.id}
                      className="group transition-colors hover:bg-navy-50/50"
                    >
                      {/* Avatar + Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100/80 text-xs font-bold text-navy-800 ring-1 ring-inset ring-navy-200/50 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                            {initials(customer.first_name, customer.last_name)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-navy-900 group-hover:text-brand-600 transition-colors">
                              {customer.first_name} {customer.last_name}
                            </span>
                            <span className="text-xs text-navy-400 font-normal">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-navy-600">
                        {customer.phone_number ?? (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>

                      {/* Shipments Count */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-navy-50 px-2 py-1 font-mono text-xs font-semibold text-navy-700 ring-1 ring-inset ring-navy-200/50">
                          {countByCustomer.get(customer.id) ?? 0}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-navy-500">
                        {formatDate(customer.created_at)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Badge
                          variant={customer.is_active ? "default" : "secondary"}
                          className={
                            customer.is_active
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
                              : "bg-navy-100/80 text-navy-600 ring-1 ring-inset ring-navy-200 hover:bg-navy-200/60"
                          }
                        >
                          {customer.is_active ? "Active" : "Deactivated"}
                        </Badge>
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
