import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PricingSettingsForm } from "@/components/admin/pricing-settings-form";

import { Calculator, DollarSign, Info, ShieldCheck } from "lucide-react";

export default async function AdminPricingPage() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("pricing_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET PRICING SETTINGS ERROR:", error);
  }

  const pricingSettings = settings ?? {
    id: "",
    currency: "NGN",
    base_delivery_fee: 2500,
    price_per_kg: 500,
    fragile_surcharge: 1000,
    express_delivery_fee: 3000,
    additional_service_fee: 0,
    min_delivery_fee: 2500,
    max_delivery_fee: null,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
            <Calculator className="h-5 w-5" />
          </div>

          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              Pricing
            </h1>

            <p className="text-xs text-slate-300">
              Configure the default charges used to calculate shipment delivery
              prices.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing settings */}
      <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Delivery pricing
              </h2>

              <p className="text-xs text-slate-500">
                Manage the standard charges applied to shipments.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <PricingSettingsForm settings={pricingSettings} />
        </CardContent>
      </Card>

      {/* Calculation information */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Info className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold text-slate-900">
                How delivery pricing works
              </h2>

              <p className="text-sm leading-6 text-slate-500">
                A shipment's delivery charge can be calculated from the base
                delivery fee, package weight, and applicable service surcharges.
              </p>

              <div className="rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
                Base fee + (weight × price per kg) + applicable surcharges
              </div>

              <p className="text-xs text-slate-400">
                The minimum and maximum delivery fee settings can be used to
                keep automatically calculated charges within an acceptable
                range.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security notice */}
      <Card className="rounded-2xl border-emerald-200/70 bg-emerald-50/40 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-emerald-900">
                Pricing is administrator controlled
              </h2>

              <p className="mt-1 text-sm leading-6 text-emerald-800/80">
                Only active administrators can modify these pricing settings.
                Customers cannot directly change delivery charges.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
