"use client";

import { Suspense, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { logIn } from "@/lib/actions/auth";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

const inputClass =
  "mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
          Logging in...
        </>
      ) : (
        "Log in"
      )}
    </Button>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState(logIn, {});
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const deactivated = searchParams.get("error") === "account_deactivated";
  const resetSuccess = searchParams.get("reset") === "success";

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your shipments and deliveries."
    >
      {/* Account Deactivated Alert */}
      {deactivated && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-900 shadow-2xs backdrop-blur-xs">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div className="leading-relaxed">
            Your account has been deactivated. Contact support if this is a
            mistake.
          </div>
        </div>
      )}

      {/* Reset Success Alert */}
      {resetSuccess && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs font-medium text-emerald-900 shadow-2xs backdrop-blur-xs">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="leading-relaxed">
            Password updated. Log in with your new password.
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Server Validation Error */}
        {state.error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-900 shadow-2xs backdrop-blur-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span className="leading-relaxed">{state.error}</span>
          </div>
        )}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>

      {/* Footer Navigation & Hint */}
      <div className="mt-6 space-y-3.5 text-center">
        <p className="text-xs text-slate-500">
          New to IntegrityLogistics?{" "}
          <Link
            href="/signup"
            className="font-bold text-slate-900 underline underline-offset-4 transition-colors hover:text-blue-600"
          >
            Create an account
          </Link>
        </p>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/70 px-3.5 py-1.5 text-[11px] font-medium text-slate-500 shadow-2xs">
          <KeyRound className="h-3 w-3 text-slate-400" />
          <span>Drivers: use administrator-issued credentials</span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
