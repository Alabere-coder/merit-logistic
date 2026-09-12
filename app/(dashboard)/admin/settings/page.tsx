import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";

import {
  ArrowRight,
  Bell,
  Building2,
  LockKeyhole,
  Mail,
  Settings,
  Settings2,
  ShieldCheck,
  Truck,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const settingsCategories = [
  {
    title: "General",
    description:
      "Manage company information, branding, contact details, and regional preferences.",
    href: "/admin/settings/general",
    icon: Building2,
  },
  {
    title: "Operations",
    description:
      "Configure shipping, pricing, delivery rules, tracking, and operational defaults.",
    href: "/admin/settings/operations",
    icon: Truck,
  },
  {
    title: "Notifications",
    description:
      "Manage in-app notifications and email communication preferences.",
    href: "/admin/settings/notifications",
    icon: Bell,
  },

  {
    title: "Security",
    description:
      "Manage your admin profile, password, authentication, and account security.",
    href: "/admin/settings/security",
    icon: LockKeyhole,
  },
  // {
  //   title: "System",
  //   description:
  //     "Configure system-wide preferences and administrative options.",
  //   href: "/admin/settings/system",
  //   icon: Settings2,
  // },
];

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);
  const { profile } = await requireRole(["admin"]);

  return (
    <div className="space-y-8">
      {/* Header */}

      {/* =====================================================
           PAGE HEADER
       ====================================================== */}

      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-md shadow-blue-500/20">
            <Settings className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Manage your company, notifications, security.
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-none bg-slate-50/50 shadow-sm">
        <CardContent className="flex items-start gap-4 p-5 border-none">
          <div className="rounded-xl bg-blue-100 p-2.5 text-cyan-500">
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

      {/* Settings Categories */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-cyan-600">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Arrow */}
                <ArrowRight className="h-5 w-5 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-600" />
              </div>

              {/* Content */}
              <div className="mt-5">
                <h2 className="text-base font-semibold text-slate-900">
                  {category.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {category.description}
                </p>
              </div>

              {/* Action */}
              <div className="mt-5 text-sm font-medium text-cyan-500">
                Manage {category.title}
              </div>
            </Link>
          );
        })}
      </div>
      {/* =====================================================
           ADMIN EMAIL
       ====================================================== */}

      <Card className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
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
