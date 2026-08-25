"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"checking" | "verified" | "pending">("checking");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "verified" : "pending");
    });
  }, []);

  return (
    <AuthLayout title="Verify your email" subtitle="Confirming your account status.">
      {status === "checking" && (
        <div className="flex items-center gap-2 text-sm text-navy-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking verification status...
        </div>
      )}

      {status === "verified" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            Your email is verified. You're all set.
          </div>
          <Link href="/customer">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </div>
      )}

      {status === "pending" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            We haven't confirmed your email yet. Check your inbox for the verification link, or log in once
            you've clicked it.
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full">Back to login</Button>
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
