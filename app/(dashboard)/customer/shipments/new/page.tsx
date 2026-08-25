"use client";

import { useFormStatus } from "react-dom";
import { useState, useMemo, useActionState } from "react";
import { createShipment } from "@/lib/actions/shipments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PACKAGE_TYPES, estimateShippingCost } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
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
      className="w-full shadow-lg shadow-primary/20 transition-all bg-blue-500 text-gray-100 duration-200 hover:shadow-primary/30"
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

export default function NewShipmentPage() {
  const [state, formAction] = useActionState(createShipment, {});
  const [weight, setWeight] = useState(1);
  const [packageType, setPackageType] = useState<PackageType>("parcel");

  const estimate = useMemo(
    () => estimateShippingCost(weight || 0, packageType),
    [weight, packageType],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center space-x-3.5 border-b border-slate-200/80 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
          <Package className="h-5.5 w-5.5" />
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
              <div className="space-y-2">
                <Label
                  htmlFor="packageType"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Package type
                </Label>
                <select
                  id="packageType"
                  name="packageType"
                  value={packageType}
                  onChange={(value) =>
                    setPackageType(value.target.value as PackageType)
                  }
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/30 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:ring-offset-2 focus:bg-white focus:border-purple-500"
                >
                  {PACKAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="weightKg"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="border-slate-200 bg-slate-50/30 transition-colors focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {state.error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-xs">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div className="leading-relaxed font-medium">{state.error}</div>
            </div>
          )}
        </div>

        {/* Live Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="overflow-hidden border-slate-200/80 shadow-md">
              <CardHeader className="border-b border-slate-100 bg-linear-to-r from-amber-50/60 to-transparent pb-4">
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
                <div className="space-y-3.5 border-b border-dashed border-slate-200 pb-5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Package type</span>
                    <span className="font-semibold text-slate-800">
                      {
                        PACKAGE_TYPES.find((t) => t.value === packageType)
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
                </div>

                <div className="mt-6 flex flex-col space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    Estimated total
                  </span>
                  <span className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
                    {formatCurrency(estimate)}
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
