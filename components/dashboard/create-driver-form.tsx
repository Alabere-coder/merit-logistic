"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createDriverAccount } from "@/lib/actions/admin-drivers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertCircle,
  Copy,
  Check,
  UserPlus,
  X,
  Loader2,
  Key,
  Info,
} from "lucide-react";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 text-sm text-slate-900 shadow-2xs outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 w-full sm:w-auto rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
          Creating account...
        </>
      ) : (
        "Create driver account"
      )}
    </Button>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2">
        <code className="flex-1 truncate rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs font-semibold text-slate-900 shadow-2xs">
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="h-9 w-9 shrink-0 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all shadow-2xs"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4 text-slate-600" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function CreateDriverForm() {
  const [state, formAction] = useActionState(createDriverAccount, {});
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99]"
      >
        <UserPlus className="h-4 w-4 text-white" />
        Add driver
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Dialog Container */}
          <Card className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl flex flex-col backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-linear-to-r from-slate-50/90 via-blue-50/30 to-indigo-50/20 px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm ring-2 ring-blue-200/50">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Add New Driver
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500">
                    Issue credentials for system access
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close modal"
                className="h-8 w-8 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="overflow-y-auto p-6">
              {state.credentials ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-medium text-emerald-900 shadow-2xs">
                    <Key className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-950">
                        Driver account created!
                      </p>
                      <p className="text-emerald-800 leading-relaxed">
                        Share these credentials securely with the driver. This
                        password will not be displayed again.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-linear-to-br from-slate-50/60 to-blue-50/30 p-4 shadow-2xs">
                    <CopyField
                      label="Login email"
                      value={state.credentials.username}
                    />
                    <CopyField
                      label="Temporary password"
                      value={state.credentials.tempPassword}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="h-10 w-full rounded-xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                    onClick={() => setOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form ref={formRef} action={formAction} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        placeholder="Michael"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="lastName"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        placeholder="Adeyemi"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Email address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={fieldClass}
                      placeholder="driver@swiftship.example"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Phone number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className={fieldClass}
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="vehicleType"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Vehicle type
                      </Label>
                      <Input
                        id="vehicleType"
                        name="vehicleType"
                        required
                        className={fieldClass}
                        placeholder="Motorcycle"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="vehiclePlate"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Plate number
                      </Label>
                      <Input
                        id="vehiclePlate"
                        name="vehiclePlate"
                        className={fieldClass}
                        placeholder="LND-234-XY"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="licenseNumber"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Driver license number
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      required
                      className={fieldClass}
                      placeholder="DL-0092841"
                    />
                  </div>

                  {state.error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-900 shadow-2xs">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                      <span className="leading-relaxed">{state.error}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-200/60 bg-blue-50/50 p-3 text-xs text-blue-900 shadow-2xs">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="leading-relaxed">
                      AMANAH PLUS auto-generates temporary passwords for
                      administrative security.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <SubmitButton />
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
