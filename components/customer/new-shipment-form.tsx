"use client";

import { useFormStatus } from "react-dom";
import { useState, useMemo, useActionState } from "react";

import { createShipment } from "@/lib/actions/shipments";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { PACKAGE_TYPES } from "@/lib/constants";

import { calculateShipmentPriceFromSettings } from "@/lib/pricing/calculate-shipment-price";

import type { PricingSettings } from "@/lib/pricing/pricing-types";

// import { formatCurrency } from "@/lib/utils";
import type { LocalizationSettings } from "@/lib/localization/get-localization-settings";
import { formatLocalizedCurrency } from "@/lib/localization/format-localized";

import {
  AlertCircle,
  Package,
  MapPin,
  User,
  Loader2,
  ArrowRight,
  Wallet,
} from "lucide-react";

import type { PackageType } from "@/types/app";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full bg-blue-500 text-gray-100 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Confirming shipment...
        </>
      ) : (
        <>
          Confirm shipment
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  );
}

type NewShipmentFormProps = {
  pricing: PricingSettings;
  localization: LocalizationSettings;
};

export default function NewShipmentForm({
  pricing,
  localization,
}: NewShipmentFormProps) {
  const [state, formAction] = useActionState(createShipment, {});

  const [weight, setWeight] = useState(1);
  const [packageType, setPackageType] = useState<PackageType>("parcel");

  const [isExpress, setIsExpress] = useState(false);

  const pricingResult = useMemo(() => {
    return calculateShipmentPriceFromSettings(pricing, {
      weightKg: weight || 0,
      isFragile: packageType === "fragile",
      isExpress,
    });
  }, [pricing, weight, packageType, isExpress]);

  const estimate = pricingResult.deliveryFee;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center space-x-3.5 border-b border-slate-200/80 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600 px-2 text-white shadow-md shadow-blue-500/20">
          <Package className="h-8 w-8" />
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Create a shipment
          </h1>

          <p className="text-sm text-slate-500">
            Fill in sender, receiver, and package details to get an instant
            price estimation.
          </p>
        </div>
      </div>

      <form action={formAction} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Sender Details */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600 shadow-2xs">
                <User className="h-4 w-4" />
              </div>

              <h2 className="font-display text-base font-semibold text-slate-900">
                Sender details
              </h2>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="senderName"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Sender name
                </Label>

                <Input
                  id="senderName"
                  name="senderName"
                  required
                  placeholder="Full name"
                  className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="senderPhone"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Sender phone
                </Label>

                <Input
                  id="senderPhone"
                  name="senderPhone"
                  required
                  placeholder="+234 700 000 0000"
                  className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Receiver Details */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600 shadow-2xs">
                <User className="h-4 w-4" />
              </div>

              <h2 className="font-display text-base font-semibold text-slate-900">
                Receiver details
              </h2>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="receiverName"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Receiver name
                </Label>

                <Input
                  id="receiverName"
                  name="receiverName"
                  required
                  placeholder="Full name"
                  className="border-slate-200 bg-slate-50/30 transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="receiverPhone"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Receiver phone
                </Label>

                <Input
                  id="receiverPhone"
                  name="receiverPhone"
                  required
                  placeholder="+234 700 000 0000"
                  className="border-slate-200 bg-slate-50/30 transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pickup & Delivery */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 shadow-2xs">
                <MapPin className="h-4 w-4" />
              </div>

              <h2 className="font-display text-base font-semibold text-slate-900">
                Pickup &amp; delivery
              </h2>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="pickupAddress"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Pickup location
                </Label>

                <Textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  required
                  rows={2}
                  placeholder="Street, city, state"
                  className="resize-none border-slate-200 bg-slate-50/30 transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="deliveryAddress"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Delivery destination
                </Label>

                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  required
                  rows={2}
                  placeholder="Street, city, state"
                  className="resize-none border-slate-200 bg-slate-50/30 transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="rounded-xl bg-purple-100 p-2 text-purple-600 shadow-2xs">
                <Package className="h-4 w-4" />
              </div>

              <h2 className="font-display text-base font-semibold text-slate-900">
                Package specifications
              </h2>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              {/* Package Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="packageType"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Package type
                </Label>

                <select
                  id="packageType"
                  name="packageType"
                  value={packageType}
                  onChange={(event) =>
                    setPackageType(event.target.value as PackageType)
                  }
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/30 px-3 py-2 text-sm ring-offset-white focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-2"
                >
                  {PACKAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label
                  htmlFor="weightKg"
                  className="text-xs font-bold capitalize tracking-wider text-slate-500"
                >
                  Weight (kg)
                </Label>

                <Input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(event) =>
                    setWeight(parseFloat(event.target.value) || 0)
                  }
                  className="border-slate-200 bg-slate-50/30 transition-colors focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Delivery Speed */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold capitalize tracking-wider text-slate-500">
                  Delivery speed
                </Label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Standard */}
                  <button
                    type="button"
                    onClick={() => setIsExpress(false)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      !isExpress
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Standard Delivery
                      </span>

                      {!isExpress && (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          SELECTED
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Regular delivery service
                    </p>
                  </button>

                  {/* Express */}
                  <button
                    type="button"
                    onClick={() => setIsExpress(true)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      isExpress
                        ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Express Delivery
                      </span>

                      {isExpress && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          SELECTED
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Faster delivery for an additional fee
                    </p>
                  </button>
                </div>

                {/* Submitted with the form */}
                <input
                  type="hidden"
                  name="isExpress"
                  value={isExpress ? "true" : "false"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Error */}
          {state.error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-xs">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

              <div className="font-medium leading-relaxed">{state.error}</div>
            </div>
          )}
        </div>

        {/* Live Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="overflow-hidden border-slate-200/80 shadow-md">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-600 shadow-2xs">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <h2 className="font-display text-base font-semibold text-slate-900">
                    Shipping cost
                  </h2>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Shipment Summary */}
                <div className="space-y-3.5 border-b border-dashed border-slate-200 pb-5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Package type</span>

                    <span className="font-semibold text-slate-800">
                      {
                        PACKAGE_TYPES.find((type) => type.value === packageType)
                          ?.label
                      }
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Total weight</span>

                    <span className="font-semibold text-slate-800">
                      {weight || 0} kg
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Delivery speed</span>

                    <span className="font-semibold text-slate-800">
                      {isExpress ? "Express" : "Standard"}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Base fee</span>

                    <span className="font-medium text-slate-700">
                      {formatLocalizedCurrency(
                        pricingResult.baseFee,
                        localization,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Weight fee</span>

                    <span className="font-medium text-slate-700">
                      {formatLocalizedCurrency(
                        pricingResult.weightFee,
                        localization,
                      )}
                    </span>
                  </div>

                  {pricingResult.fragileFee > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Fragile handling</span>

                      <span className="font-medium text-slate-700">
                        {formatLocalizedCurrency(
                          pricingResult.fragileFee,
                          localization,
                        )}
                      </span>
                    </div>
                  )}

                  {pricingResult.expressFee > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Express delivery</span>

                      <span className="font-medium text-slate-700">
                        {formatLocalizedCurrency(
                          pricingResult.expressFee,
                          localization,
                        )}
                      </span>
                    </div>
                  )}

                  {pricingResult.additionalServiceFee > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Additional services</span>

                      <span className="font-medium text-slate-700">
                        {formatLocalizedCurrency(
                          pricingResult.additionalServiceFee,
                          localization,
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Estimated Total */}
                <div className="mt-6 flex flex-col space-y-1 border-t border-slate-200 pt-5">
                  <span className="text-xs font-semibold capitalize tracking-wider text-amber-700">
                    Estimated total
                  </span>

                  <span className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
                    {formatLocalizedCurrency(estimate, localization)}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Final price is calculated securely at checkout based on exact
                  physical dimensions and weight validation.
                </p>

                <div className="mt-6 pt-2">
                  <SubmitButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
