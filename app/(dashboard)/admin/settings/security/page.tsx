import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";

import { ProfileForm } from "@/components/shared/profile-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { AdminSecuritySettings } from "@/components/admin/security-settings";

import { ArrowLeft, KeyRound, User } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function SecuritySettingsPage() {
  const { profile } = await requireRole(["admin"]);

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings
        </Link>

        <div className="mt-4">
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Security settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your admin profile, password, authentication, and account
            security settings.
          </p>
        </div>
      </div>

      {/* =====================================================
          ADMIN PROFILE
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-indigo-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2.5 text-cyan-500">
              <User className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Admin profile
              </h2>

              <p className="text-xs text-slate-500">
                Manage your personal information and contact details.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 border-none">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      {/* =====================================================
          CHANGE PASSWORD
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-sm ring-2 ring-blue-200/50">
              <KeyRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Change password
              </h2>

              <p className="text-xs font-medium text-slate-500">
                Update the password you use to sign in.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* =====================================================
          ACCOUNT SECURITY
      ====================================================== */}

      <AdminSecuritySettings />
    </div>
  );
}
