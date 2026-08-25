"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 pr-10 text-sm text-slate-900 shadow-2xs outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

function PasswordInput({
  id,
  name,
  placeholder,
  minLength,
  required = true,
}: {
  id: string;
  name: string;
  placeholder: string;
  minLength?: number;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        minLength={minLength}
        required={required}
        className={fieldClass}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result?.success ?? "Password changed successfully.");
      formRef.current?.reset();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <CardContent className="p-6">
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="currentPassword"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Current password
            </Label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <Label
              htmlFor="newPassword"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              New password
            </Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              minLength={8}
            />
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Must be at least 8 characters long.
            </p>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Confirm new password
            </Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              minLength={8}
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200/60 bg-blue-50/50 p-3 text-xs text-blue-900 shadow-2xs">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="leading-relaxed">
              After updating your password, you may need to re-authenticate on
              other devices.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full sm:w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Changing password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
