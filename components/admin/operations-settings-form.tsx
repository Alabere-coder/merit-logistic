"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Save,
  Truck,
} from "lucide-react";

import { updateOperationsSettings } from "@/lib/actions/operations-settings";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type OperationsSettings = {
  id: string;
  default_delivery_days: number;
  max_delivery_days: number;
  shipment_expiry_days: number;
  support_response_hours: number;
  delivery_instructions: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-cyan-500 font-semibold text-white shadow-md transition-all hover:bg-cyan-600 hover:shadow-lg disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving changes...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save changes
        </>
      )}
    </Button>
  );
}

export function OperationsSettingsForm({
  settings,
}: {
  settings: OperationsSettings;
}) {
  const [state, formAction] = useActionState(updateOperationsSettings, {});

  return (
    <form action={formAction} className="space-y-6">
      {/* Delivery Defaults */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="defaultDeliveryDays"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Clock className="h-3.5 w-3.5" />
            Default delivery days
          </Label>

          <Input
            id="defaultDeliveryDays"
            name="defaultDeliveryDays"
            type="number"
            min="1"
            max="30"
            defaultValue={settings.default_delivery_days}
            required
          />

          <p className="text-xs text-slate-400">
            Expected delivery time shown to customers.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="maxDeliveryDays"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Truck className="h-3.5 w-3.5" />
            Maximum delivery days
          </Label>

          <Input
            id="maxDeliveryDays"
            name="maxDeliveryDays"
            type="number"
            min="1"
            max="60"
            defaultValue={settings.max_delivery_days}
            required
          />

          <p className="text-xs text-slate-400">
            Maximum expected delivery period.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="shipmentExpiryDays"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Package className="h-3.5 w-3.5" />
            Shipment expiry
          </Label>

          <Input
            id="shipmentExpiryDays"
            name="shipmentExpiryDays"
            type="number"
            min="1"
            max="365"
            defaultValue={settings.shipment_expiry_days}
            required
          />

          <p className="text-xs text-slate-400">
            Days before an inactive shipment is considered expired.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="supportResponseHours"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Clock className="h-3.5 w-3.5" />
            Support response time
          </Label>

          <Input
            id="supportResponseHours"
            name="supportResponseHours"
            type="number"
            min="1"
            max="168"
            defaultValue={settings.support_response_hours}
            required
          />

          <p className="text-xs text-slate-400">
            Target response time for support tickets.
          </p>
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="space-y-2">
        <Label
          htmlFor="deliveryInstructions"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Default delivery instructions
        </Label>

        <Textarea
          id="deliveryInstructions"
          name="deliveryInstructions"
          rows={4}
          defaultValue={settings.delivery_instructions ?? ""}
          placeholder="Enter default instructions for drivers and delivery staff..."
          className="resize-none"
        />

        <p className="text-xs text-slate-400">
          These instructions can be displayed to drivers during delivery.
        </p>
      </div>

      {/* Messages */}
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
