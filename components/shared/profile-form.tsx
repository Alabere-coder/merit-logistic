"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfile } from "@/lib/actions/profile";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-cyan-500 font-semibold text-white shadow-md transition-all hover:bg-cyan-600 hover:shadow-lg disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving changes...
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );
}

export function ProfileForm({
  profile,
}: {
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string | null;
  };
}) {
  const [state, formAction] = useActionState(updateProfile, {});

  return (
    <div>
      <form action={formAction} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              First name
            </Label>

            <Input
              id="firstName"
              name="firstName"
              defaultValue={profile.first_name}
              required
              className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Last name
            </Label>

            <Input
              id="lastName"
              name="lastName"
              defaultValue={profile.last_name}
              required
              className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
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
            placeholder="e.g. 08012345678"
            defaultValue={profile.phone_number ?? ""}
            required
            className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {state.error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-2xs backdrop-blur-xs">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

            <div className="font-medium leading-relaxed">{state.error}</div>
          </div>
        )}

        {state.success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-2xs backdrop-blur-xs">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

            <div className="font-medium leading-relaxed">{state.success}</div>
          </div>
        )}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
