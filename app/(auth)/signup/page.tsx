"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
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
      className="h-10 w-full rounded-xl bg-linear-to-r from-cyan-600 to-cyan-600 font-semibold text-white shadow-md transition-all hover:from-cyan-700 hover:to-cyan-800 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
          Creating account...
        </>
      ) : (
        "Create account"
      )}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Ship your first package in minutes."
    >
      {state.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-900 shadow-2xs backdrop-blur-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="space-y-3">
              <p className="text-sm font-semibold leading-snug text-emerald-950">
                {state.success}
              </p>
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 underline underline-offset-4 transition-colors hover:text-emerald-900"
                >
                  <span>Go to login</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {/* Name Fields Row */}
          <div className="grid grid-cols-2 gap-3">
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
                placeholder="Jane"
                className={inputClass}
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
                placeholder="Doe"
                className={inputClass}
              />
            </div>
          </div>

          {/* Contact Details */}
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
              placeholder="+234 700 000 0000"
              className={inputClass}
            />
          </div>

          {/* Passwords */}
          <div>
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 8 characters"
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

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" color="cyan" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {state.error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-900 shadow-2xs backdrop-blur-xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span className="leading-relaxed">{state.error}</span>
            </div>
          )}

          {/* Terms & Account Type Note */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-100/70 p-3 text-[11px] leading-relaxed text-slate-500 shadow-2xs">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
              <span>
                By continuing, you agree to AMANAH PLUS&apos;s Terms of Service
                and Privacy Policy. This form is for{" "}
                <strong>customer accounts</strong> only — driver credentials are
                managed by administrators.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      )}

      {/* Footer Link */}
      {!state.success && (
        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-slate-900 underline underline-offset-4 transition-colors hover:text-blue-600"
          >
            Log in
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
