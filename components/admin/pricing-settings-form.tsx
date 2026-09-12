"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Loader2,
  Save,
} from "lucide-react";

import { updatePricingSettings } from "@/lib/actions/pricing-settings";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PricingSettings = {
  id: string;
  currency: string;
  base_delivery_fee: number;
  price_per_kg: number;
  fragile_surcharge: number;
  express_delivery_fee: number;
  additional_service_fee: number;
  min_delivery_fee: number;
  max_delivery_fee: number | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-cyan-600 font-semibold text-white shadow-md transition-all hover:bg-cyan-700 hover:shadow-lg disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving changes...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save pricing
        </>
      )}
    </Button>
  );
}

export function PricingSettingsForm({
  settings,
}: {
  settings: PricingSettings;
}) {
  const [state, formAction] = useActionState(updatePricingSettings, {});

  return (
    <form action={formAction} className="space-y-6">
      {/* Currency */}
      <div className="space-y-2">
        <Label
          htmlFor="currency"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Currency
        </Label>

        <Input
          id="currency"
          name="currency"
          defaultValue={settings.currency}
          placeholder="NGN"
          maxLength={10}
          required
        />

        <p className="text-xs text-slate-400">
          Currency used when displaying shipment charges.
        </p>
      </div>

      {/* Base pricing */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="baseDeliveryFee"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Base delivery fee
          </Label>

          <Input
            id="baseDeliveryFee"
            name="baseDeliveryFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.base_delivery_fee}
            required
          />

          <p className="text-xs text-slate-400">
            Starting price for every shipment.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="pricePerKg"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Price per kg
          </Label>

          <Input
            id="pricePerKg"
            name="pricePerKg"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.price_per_kg}
            required
          />

          <p className="text-xs text-slate-400">
            Additional charge based on shipment weight.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="fragileSurcharge"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Fragile surcharge
          </Label>

          <Input
            id="fragileSurcharge"
            name="fragileSurcharge"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.fragile_surcharge}
            required
          />

          <p className="text-xs text-slate-400">
            Additional charge for fragile packages.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="expressDeliveryFee"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Express delivery fee
          </Label>

          <Input
            id="expressDeliveryFee"
            name="expressDeliveryFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.express_delivery_fee}
            required
          />

          <p className="text-xs text-slate-400">
            Additional charge for express delivery.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="additionalServiceFee"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Additional service fee
          </Label>

          <Input
            id="additionalServiceFee"
            name="additionalServiceFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.additional_service_fee}
            required
          />

          <p className="text-xs text-slate-400">
            General additional charge applied when required.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="minDeliveryFee"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Minimum delivery fee
          </Label>

          <Input
            id="minDeliveryFee"
            name="minDeliveryFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.min_delivery_fee}
            required
          />

          <p className="text-xs text-slate-400">
            Lowest amount a shipment can be charged.
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="maxDeliveryFee"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Maximum delivery fee
          </Label>

          <Input
            id="maxDeliveryFee"
            name="maxDeliveryFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.max_delivery_fee ?? ""}
            placeholder="Leave empty for no maximum"
          />

          <p className="text-xs text-slate-400">
            Optional upper limit for automatically calculated delivery fees.
          </p>
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div className="font-medium">{state.error}</div>
        </div>
      )}

      {state.success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div className="font-medium">{state.success}</div>
        </div>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
