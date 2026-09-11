import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { ArrowLeft, Truck } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { OperationsSettingsForm } from "@/components/admin/operations-settings-form";

export default async function OperationsSettingsPage() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  /* =====================================================
     OPERATIONS SETTINGS
  ====================================================== */

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
          <p className="text-sm font-medium text-blue-600">
            Operations settings
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Operations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Configure delivery rules, shipment defaults, expiry periods, and
            support operating preferences.
          </p>
        </div>
      </div>

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
    </div>
  );
}
