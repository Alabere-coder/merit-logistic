import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { ArrowLeft, Building2, Palette, Globe2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { CompanySettingsForm } from "@/components/shared/company-settings-form";
import { BrandingSettingsForm } from "@/components/admin/branding-settings-form";
import { LocalizationSettingsForm } from "@/components/admin/localization-settings-form";

export default async function GeneralSettingsPage() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  /* =====================================================
     COMPANY SETTINGS
  ====================================================== */

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

  /* =====================================================
     BRANDING SETTINGS
  ====================================================== */

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

  /* =====================================================
     LOCALIZATION SETTINGS
  ====================================================== */

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
            General settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your company information, branding, and regional preferences
            used throughout the platform.
          </p>
        </div>
      </div>

      {/* =====================================================
          COMPANY INFORMATION
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-cyan-500">
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
            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
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
    </div>
  );
}
