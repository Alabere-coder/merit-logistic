import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditAdminPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAdminPage({ params }: EditAdminPageProps) {
  const { id } = await params;

  const { supabase, user } = await requireRole(["admin"]);

  // Check that current user is Top Admin
  const { data: currentAdmin, error: currentAdminError } = await supabase
    .from("users")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (currentAdminError || !currentAdmin?.is_super_admin) {
    redirect("/admin/users/admins");
  }

  // Get the admin being edited
  const { data: admin, error } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name, email, phone_number, role, is_active, is_super_admin",
    )
    .eq("id", id)
    .eq("role", "admin")
    .single();

  if (error || !admin) {
    notFound();
  }

  // Protect the Top Admin
  if (admin.is_super_admin) {
    redirect("/admin/users/admins");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/users/admins"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors gap-1.5"
        >
          <span>←</span> Back to Administrators
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Edit Administrator
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update personal information and account details for this
          administrator.
        </p>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Administrator Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form action={updateAdminAction} className="space-y-6">
            <input type="hidden" name="adminId" value={admin.id} />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  First Name <span className="text-rose-500">*</span>
                </Label>

                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={admin.first_name ?? ""}
                  required
                  className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Last Name <span className="text-rose-500">*</span>
                </Label>

                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={admin.last_name ?? ""}
                  required
                  className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Email Address
              </Label>

              <Input
                id="email"
                value={admin.email}
                disabled
                className="bg-slate-50 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed font-mono text-xs"
              />

              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <span className="inline-block h-1 w-1 rounded-full bg-amber-500" />
                Email addresses are tied to authentication and cannot be edited.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Phone Number
              </Label>

              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1 (555) 000-0000"
                defaultValue={admin.phone_number ?? ""}
                className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="text-xs h-9 px-4 shadow-sm transition-all hover:shadow bg-black text-white dark:bg-white/2 hover:bg-black/40 dark:hover:bg-white/10"
              >
                <Link href="/admin/users/admins">Cancel</Link>
              </Button>

              <Button
                type="submit"
                className="text-xs h-9 px-4 shadow-sm transition-all hover:shadow"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

async function updateAdminAction(formData: FormData) {
  "use server";

  const adminId = formData.get("adminId");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const phoneNumber = formData.get("phoneNumber");

  if (
    typeof adminId !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string"
  ) {
    return;
  }

  const { updateAdmin } = await import("@/lib/actions/admins");

  await updateAdmin(adminId, {
    firstName,
    lastName,
    phoneNumber: typeof phoneNumber === "string" ? phoneNumber : "",
  });

  redirect("/admin/users/admins");
}
