"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resetPassword } from "@/lib/actions/auth";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      Update password
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(resetPassword, {});

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
          />
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        <SubmitButton />
      </form>
    </AuthLayout>
  );
}
