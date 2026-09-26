"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import CompanyLogo from "../../public/emirate2.jpeg";

const points: [LucideIcon, string][] = [
  [ShieldCheck, "Secure shipment handling from pickup to delivery"],
  [MapPin, "Real-time shipment visibility throughout the journey"],
  [Clock, "Reliable delivery services built around your schedule"],
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* =========================================================
          LEFT — BRAND / LOGISTICS EXPERIENCE
      ========================================================== */}
      <div className="relative hidden min-h-screen overflow-hidden lg:flex">
        {/* Background image */}
        <Image
          src="/hero-logistics.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 0vw"
          className="object-cover"
        />

        {/* Image overlays */}
        <div className="absolute inset-0 bg-slate-950/75" />

        <div className="absolute inset-0 bg-linear-to-br from-slate-950/95 via-slate-950/70 to-slate-900/80" />

        {/* Subtle cyan accent */}
        <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Content */}
        <div className="relative z-10 flex min-h-screen w-full flex-col p-10 xl:p-14">
          {/* Brand */}
          <Link href="/" className="group flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-white/20">
              <Image
                src={CompanyLogo}
                alt="Emirate Global"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </span>

            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Emirate
              <span className="ml-1 text-cyan-400">Global</span>
            </span>
          </Link>

          {/* Main content */}
          <div className="my-auto max-w-xl py-16">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full  px-3.5 py-2 text-xs font-medium text-slate-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Reliable logistics and delivery
            </div>

            <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
              Moving your world,
              <span className="mt-2 block text-cyan-400">
                one delivery at a time.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
              Emirate Global gives individuals and businesses a simple, secure
              way to create shipments, track deliveries, and stay informed from
              pickup through final delivery.
            </p>

            {/* Features */}
            <div className="mt-9 space-y-3">
              {points.map(([Icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3.5 backdrop-blur-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-400/20">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>

                  <span className="text-sm font-medium leading-6 text-slate-200">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Operational status */}
            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <span>Platform operational</span>
              </div>

              <span className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Secure account access</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500">
              © {currentYear ?? 2026} Emirate Global
            </p>

            <Link
              href="/"
              className="group flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
            >
              Back to website
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT — AUTH FORM
      ========================================================== */}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 sm:px-10 lg:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <Link
            href="/"
            className="mb-10 flex w-fit items-center gap-3 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
              <Image
                src="/emirate2.jpeg"
                alt="Emirate Global"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </span>

            <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Emirate
              <span className="ml-1 text-cyan-600">Global</span>
            </span>
          </Link>

          {/* Form heading */}
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>

          {/* Form */}
          <div className="mt-8">{children}</div>

          {/* Security note */}
          <div className="mt-8 border-t border-slate-100 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50">
                <ShieldCheck className="h-4 w-4 text-cyan-700" />
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Your account information is protected through our secure
                authentication system. Never share your password or verification
                codes with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
