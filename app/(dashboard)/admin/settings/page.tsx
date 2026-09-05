import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { CompanySettingsForm } from "@/components/shared/company-settings-form";
import { ProfileForm } from "@/components/shared/profile-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";

import { NotificationSettingsForm } from "@/components/admin/notification-settings-form";
import { AdminSecuritySettings } from "@/components/admin/security-settings";

import { OperationsSettingsForm } from "@/components/admin/operations-settings-form";
import { BrandingSettingsForm } from "@/components/admin/branding-settings-form";
import { LocalizationSettingsForm } from "@/components/admin/localization-settings-form";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";

import {
  Building2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  User,
  Bell,
  Truck,
  Palette,
  Globe2,
} from "lucide-react";

export default async function AdminSettingsPage() {
  const { profile } = await requireRole(["admin"]);

  const localization = await getLocalizationSettings();

  const supabase = await createClient();

  ///////////////////////////////////////////
  //   NOTIFICATION
  ////////////////////////////////////////////////

  const { data: notificationSettings, error: notificationSettingsError } =
    await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

  if (notificationSettingsError) {
    console.error(
      "GET NOTIFICATION SETTINGS ERROR:",
      notificationSettingsError,
    );
  }

  const adminNotificationSettings = notificationSettings ?? {
    shipment_created: true,
    shipment_assigned: true,
    shipment_picked_up: true,
    shipment_in_transit: true,
    shipment_out_for_delivery: true,
    shipment_delivered: true,
    shipment_cancelled: true,

    payment_success: true,
    payment_confirmed: true,
    payment_failed: true,

    support_ticket: true,
    support_message: true,
    support_reply: true,
    support_assignment: true,
    support_priority: true,
    support_status: true,
  };

  const { data: operationsSettings, error: operationsSettingsError } =
    await supabase
      .from("operations_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

  if (operationsSettingsError) {
    console.error("GET OPERATIONS SETTINGS ERROR:", operationsSettingsError);
  }

  const adminOperationsSettings = operationsSettings ?? {
    id: "",
    default_delivery_days: 3,
    max_delivery_days: 7,
    shipment_expiry_days: 30,
    support_response_hours: 24,
    delivery_instructions: null,
  };

  ///////////////////////////////////////////
  //   COMPANY SETTINGS
  ///////////////////////////////////////////

  const { data: settings, error } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET COMPANY SETTINGS ERROR:", error);
  }

  const companySettings = settings ?? {
    id: "",
    company_name: "",
    company_email: null,
    company_phone: null,
    company_address: null,
    company_website: null,
    company_logo_url: null,
  };

  ///////////////////////////////////////////
  //   BRANDING SETTINGS
  ///////////////////////////////////////////

  const { data: brandingSettings, error: brandingSettingsError } =
    await supabase.from("branding_settings").select("*").limit(1).maybeSingle();

  if (brandingSettingsError) {
    console.error("GET BRANDING SETTINGS ERROR:", brandingSettingsError);
  }

  const adminBrandingSettings = brandingSettings ?? {
    id: "",
    tagline: null,
    primary_color: "#2563EB",
    secondary_color: "#4F46E5",
    favicon_url: null,
  };

  ///////////////////////////////////////////
  //   Localization SETTINGS
  ///////////////////////////////////////////

  const { data: localizationSettings, error: localizationSettingsError } =
    await supabase
      .from("localization_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

  if (localizationSettingsError) {
    console.error(
      "GET LOCALIZATION SETTINGS ERROR:",
      localizationSettingsError,
    );
  }

  const adminLocalizationSettings = localizationSettings ?? {
    id: "",
    default_country: "Nigeria",
    default_currency: "NGN",
    timezone: "Africa/Lagos",
    date_format: "DD/MM/YYYY",
    time_format: "12-hour",
    language: "en",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <Settings className="h-5 w-5" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>

            <p className="text-sm text-slate-500">
              Manage your account and logistics platform configuration.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          COMPANY INFORMATION
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Company information
              </h2>

              <p className="text-xs text-slate-500">
                Manage the company information used throughout the platform.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <CompanySettingsForm settings={companySettings} />
        </CardContent>
      </Card>

      {/* =====================================================
    BRANDING
====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-indigo-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
              <Palette className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Branding
              </h2>

              <p className="text-xs text-slate-500">
                Customize the visual identity of your logistics platform.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <BrandingSettingsForm settings={adminBrandingSettings} />
        </CardContent>
      </Card>

      {/* =====================================================
    LOCALIZATION
====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-cyan-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-600">
              <Globe2 className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Localization
              </h2>

              <p className="text-xs text-slate-500">
                Configure the regional defaults used across the platform.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <LocalizationSettingsForm settings={adminLocalizationSettings} />
        </CardContent>
      </Card>

      {/* =====================================================
          ADMIN PROFILE
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-indigo-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
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

        <CardContent className="pt-6">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      {/* =====================================================
          ADMIN EMAIL
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-amber-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
              <Mail className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Email address
              </h2>

              <p className="text-xs text-slate-500">
                Your account email address is managed through authentication.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Current email
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile.email}
              </p>
            </div>

            <div className="flex w-fit items-center gap-1.5 rounded-xl border border-amber-200/80 bg-white/80 px-3.5 py-2 text-xs font-medium text-amber-800">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span>Contact support to update</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          CHANGE PASSWORD
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-emerald-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm ring-2 ring-blue-200/50">
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
    NOTIFICATION SETTINGS
====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-violet-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <Bell className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="text-xs text-slate-500">
                Choose which platform events you want to be notified about.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <NotificationSettingsForm settings={adminNotificationSettings} />
        </CardContent>
      </Card>

      {/* =====================================================
          OPERATIONS SETTINGS
      ====================================================== */}

      {/* =====================================================
    OPERATIONS & DEFAULTS
====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-cyan-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-600">
              <Truck className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Operations & defaults
              </h2>

              <p className="text-xs text-slate-500">
                Configure default delivery and support operating rules.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <OperationsSettingsForm settings={adminOperationsSettings} />
        </CardContent>
      </Card>

      {/* =====================================================
          ADMIN SECURITY NOTICE
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 bg-slate-50/50 shadow-sm">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Administrator account
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your administrator account has access to platform configuration,
              users, shipments, payments, support, and other administrative
              features. Keep your password secure and never share your
              credentials.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          ACCOUNT SECURITY
      ====================================================== */}
      <AdminSecuritySettings />
    </div>
  );
}

// import { requireRole } from "@/lib/auth/require-role";
// import { createClient } from "@/lib/supabase/server";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { CompanySettingsForm } from "@/components/shared/company-settings-form";
// import { Building2, Globe, Mail, MapPin, Phone, Settings } from "lucide-react";

// export default async function AdminSettingsPage() {
//   await requireRole(["admin"]);

//   const supabase = await createClient();

//   const { data: settings, error } = await supabase
//     .from("company_settings")
//     .select("*")
//     .limit(1)
//     .maybeSingle();

//   if (error) {
//     console.error("GET COMPANY SETTINGS ERROR:", error);
//   }

//   const companySettings = settings ?? {
//     id: "",
//     company_name: "",
//     company_email: null,
//     company_phone: null,
//     company_address: null,
//     company_website: null,
//     company_logo_url: null,
//   };

//   return (
//     <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
//       {/* Page Header */}
//       <div className="border-b border-slate-200/80 pb-5">
//         <div className="flex items-center gap-3.5">
//           <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
//             <Settings className="h-5 w-5" />
//           </div>

//           <div>
//             <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
//               Settings
//             </h1>

//             <p className="text-sm text-slate-500">
//               Manage your logistics platform and company configuration.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Company Settings */}
//       <Card className="overflow-hidden border-slate-200/80 shadow-sm">
//         <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent">
//           <div className="flex items-center gap-3">
//             <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
//               <Building2 className="h-4 w-4" />
//             </div>

//             <div>
//               <h2 className="font-display text-base font-semibold text-slate-900">
//                 Company information
//               </h2>

//               <p className="text-xs text-slate-500">
//                 Configure the company information displayed throughout the
//                 platform.
//               </p>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="pt-6">
//           <CompanySettingsForm settings={companySettings} />
//         </CardContent>
//       </Card>

//       {/* Information Preview */}
//       <Card className="overflow-hidden border-slate-200/80 shadow-sm">
//         <CardHeader className="border-b border-slate-100">
//           <div className="flex items-center gap-3">
//             <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
//               <Globe className="h-4 w-4" />
//             </div>

//             <div>
//               <h2 className="font-display text-base font-semibold text-slate-900">
//                 Contact information
//               </h2>

//               <p className="text-xs text-slate-500">
//                 This information can be used across customer-facing areas.
//               </p>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
//           <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
//             <Mail className="mt-0.5 h-4 w-4 text-slate-400" />

//             <div>
//               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//                 Email
//               </p>

//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 {companySettings.company_email || "Not configured"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
//             <Phone className="mt-0.5 h-4 w-4 text-slate-400" />

//             <div>
//               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//                 Phone
//               </p>

//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 {companySettings.company_phone || "Not configured"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:col-span-2">
//             <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />

//             <div>
//               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//                 Address
//               </p>

//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 {companySettings.company_address || "Not configured"}
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
