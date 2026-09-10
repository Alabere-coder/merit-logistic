import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileForm } from "@/components/shared/profile-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Settings,
  KeyRound,
} from "lucide-react";
import { NotificationSettings } from "@/components/notifications/notification-settings";

export default async function CustomerSettingsPage() {
  const { profile } = await requireRole(["customer"]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Page Header with Accent Gradient Icon */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <Settings className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Account settings
            </h1>
            <p className="text-sm text-slate-500">
              Manage your profile preferences and security parameters.
            </p>
          </div>
        </div>
      </div>

      <NotificationSettings />

      <div className="space-y-6">
        {/* Profile Card - Blue Theme */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent pb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 shadow-2xs">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Profile Information
                </h2>
                <p className="text-xs text-slate-500">
                  Update your public details and personal settings.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        {/* Email Card - Amber Theme */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-amber-50/60 to-transparent pb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600 shadow-2xs">
                <Mail className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Email Address
              </h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 rounded-2xl bg-amber-50/50 p-4 border border-amber-200/60">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Current Email
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {profile.email}
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-medium text-amber-800 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-200/80 shadow-2xs w-fit">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>Contact support to update</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Card - Emerald Theme */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-emerald-50/60 to-transparent pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm ring-2 ring-blue-200/50">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Change Password
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Update your account security credentials
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
