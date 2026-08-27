import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminActions } from "@/components/admin/admin-actions";

export default async function AdminsPage() {
  const { supabase, user } = await requireRole(["admin"]);

  const { data: currentAdmin } = await supabase
    .from("users")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const { data: admins, error } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name, email, phone_number, role, is_active, is_super_admin, created_at",
    )
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("LOAD ADMINS ERROR:", error);
  }

  const isSuperAdmin = currentAdmin?.is_super_admin === true;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Administrators
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage platform access, roles, and administrative permissions.
          </p>
        </div>

        {isSuperAdmin && (
          <Button className="shadow-sm transition-all hover:shadow bg-black text-white dark:bg-white/10 hover:bg-black/60 dark:hover:bg-white/5">
            <Link href="/admin/users/admins/create">
              <span className="mr-1.5">+</span> Create Admin
            </Link>
          </Button>
        )}
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">User</th>
                  <th className="py-3.5 px-6 font-semibold">Email</th>
                  <th className="py-3.5 px-6 font-semibold">Role</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  {isSuperAdmin && (
                    <th className="py-3.5 px-6 font-semibold text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {admins?.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {admin.first_name} {admin.last_name}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {admin.email}
                    </td>

                    <td className="py-4 px-6">
                      {admin.is_super_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                          Top Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Admin
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${admin.is_active ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {isSuperAdmin && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!admin.is_super_admin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 shadow-xs transition-colors duration-150"
                              >
                                <Link
                                  href={`/admin/users/admins/${admin.id}/edit`}
                                  className="inline-flex items-center gap-1.5"
                                >
                                  {/* Optional: Clean SVG Edit Pencil Icon */}
                                  <svg
                                    className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                    />
                                  </svg>
                                  <span>Edit</span>
                                </Link>
                              </Button>

                              <AdminActions
                                adminId={admin.id}
                                isActive={admin.is_active}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {!admins?.length && (
                  <tr>
                    <td
                      colSpan={isSuperAdmin ? 5 : 4}
                      className="py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No administrators found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
