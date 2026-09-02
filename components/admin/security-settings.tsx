"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminSecuritySettings() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSignOut() {
    setMessage(null);

    startTransition(async () => {
      try {
        /*
         * We use the browser Supabase client here because this
         * action signs the current administrator out.
         */
        const { createClient } = await import("@/lib/supabase/client");

        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
          setMessage(error.message);
          return;
        }

        window.location.href = "/login";
      } catch (error) {
        console.error("ADMIN SIGN OUT ERROR:", error);

        setMessage("Unable to sign out. Please try again.");
      }
    });
  }

  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <CardHeader className="border-b border-slate-100 bg-linear-to-r from-rose-50/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-100 p-2.5 text-rose-600">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Account security
            </h2>

            <p className="text-xs text-slate-500">
              Manage security-related actions for your administrator account.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {/* ===================================================
            PASSWORD
        ==================================================== */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
              <KeyRound className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Password</p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Change your password regularly and use a strong, unique
                password.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Protected
          </span>
        </div>

        {/* ===================================================
            CURRENT SESSION
        ==================================================== */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Current session
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                You are currently signed in to this administrator account.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Active
          </span>
        </div>

        {/* ===================================================
            SIGN OUT
        ==================================================== */}

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Sign out of this account
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Sign out from the current administrator session. You will need
                to authenticate again to access the admin dashboard.
              </p>

              {message && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleSignOut}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ===================================================
            SECURITY STATUS
        ==================================================== */}

        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Security recommendations
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              Keep your password private, avoid sharing administrator
              credentials, and sign out when using a shared computer.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
