import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileForm } from "@/components/shared/profile-form";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordForm } from "@/components/shared/change-password-form";

export default async function DriverSettingsPage() {
  const { profile, user, supabase } = await requireRole(["driver"]);
  const { data: driver } = await supabase
    .from("drivers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-navy-900">
          Account settings
        </h1>
        <p className="text-sm text-navy-500">
          Update your contact information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-600 text-navy-900">
            Profile
          </h2>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-600 text-navy-900">
            Vehicle &amp; license
          </h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-navy-500">Vehicle type</span>
            <span className="font-medium text-navy-800">
              {driver?.vehicle_type}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500">Plate number</span>
            <span className="font-medium text-navy-800">
              {driver?.vehicle_plate ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500">License number</span>
            <span className="font-medium text-navy-800">
              {driver?.license_number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-navy-500">Status</span>
            <Badge
              variant="outline"
              className={
                driver?.status === "active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }
            >
              {driver?.status ?? "Unknown"}
            </Badge>
          </div>
          <p className="pt-2 text-xs text-navy-400">
            Vehicle and license details can only be changed by an administrator.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-600 text-navy-900">
            Change password
          </h2>

          <p className="text-sm text-navy-500">
            Update the password you use to sign in to your account.
          </p>
        </CardHeader>

        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
