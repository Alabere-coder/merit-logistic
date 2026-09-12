"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAdmin } from "@/lib/actions/admins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";

export default function CreateAdminPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await createAdmin({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/users/admins");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <Link
          href="/admin/users/admins"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Administrators
        </Link>

        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-cyan-600 shadow-sm">
            <UserPlus className="h-5 w-5" />
          </div>

          <div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Create Administrator
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a new administrator account with access to the management
              dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm ring-1 ring-slate-200">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Administrator Information
              </CardTitle>

              <p className="mt-0.5 text-xs text-slate-500">
                Enter the details for the new administrator.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Personal information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Basic information for the administrator account.
              </p>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">
                    First Name
                  </Label>

                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                    className="border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">
                    Last Name
                  </Label>

                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    required
                    className="border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Contact information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                These details will be associated with the admin account.
              </p>

              <div className="mt-4 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email Address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-700">
                    Phone Number
                  </Label>

                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 08012345678"
                    required
                    className="border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Account security
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Set a temporary password for the new administrator.
              </p>

              <div className="mt-4 space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Temporary Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    value={password}
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a temporary password"
                    minLength={8}
                    required
                    className="border-slate-200 bg-white pr-11 focus:border-blue-500 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  The password must be at least 8 characters.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
                className="border border-slate-200 bg-white px-5 text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-cyan-600 px-6 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-cyan-700 hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Administrator"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
