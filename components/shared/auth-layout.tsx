import Link from "next/link";
import {
  PackageSearch,
  ShieldCheck,
  MapPin,
  Clock,
  type LucideIcon,
} from "lucide-react";

const points: [LucideIcon, string][] = [
  [ShieldCheck, "Every shipment insured and tracked door to door"],
  [MapPin, "Live driver location on every active delivery"],
  [Clock, "Same-day pickup available in 120+ cities"],
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
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 border-r border-slate-800/60 shadow-2xl select-none">
        {/* Layered Decorative Background Elements */}
        <div className="route-dot-grid pointer-events-none absolute inset-0 opacity-20 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-125 w-125 rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />

        {/* Brand Header */}
        <Link
          href="/"
          className="group relative inline-flex items-center gap-3 font-display text-xl font-bold tracking-tight text-white w-fit transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-white/20 transition-all duration-300 group-hover:shadow-amber-500/40 group-hover:scale-105">
            <PackageSearch
              className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6"
              strokeWidth={2.2}
            />
          </div>
          <span className="tracking-tight">
            AMANAH
            <span className="bg-linear-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              PLUS
            </span>
          </span>
        </Link>

        {/* Main Content Area */}
        <div className="relative my-auto py-12 space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Enterprise PLUS Platform
            </span>
            <h2 className="max-w-md font-display text-4xl font-extrabold leading-[1.15] text-white tracking-tight text-balance">
              PLUS that moves as fast as your{" "}
              <span className="bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                business.
              </span>
            </h2>
          </div>

          {/* Feature List */}
          <ul className="space-y-3.5">
            {points.map(([Icon, text]) => (
              <li
                key={text as string}
                className="group flex items-center gap-3.5 rounded-xl border border-white/5 bg-white/5 p-3.5 text-sm text-slate-300 backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] hover:translate-x-1"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900/80 border border-white/10 text-amber-400 shadow-inner transition-colors group-hover:border-amber-500/40 group-hover:text-amber-300">
                  {typeof Icon !== "string" && <Icon className="h-4.5 w-4.5" />}
                </span>
                <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between border-t border-slate-800/80 pt-6">
          <p className="font-mono text-xs text-slate-500">
            © {new Date().getFullYear()} AMANAH PLUS Inc.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Systems Operational
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 font-display text-lg font-700 text-navy-900 lg:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-brand-500">
              <PackageSearch className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            AMANAH<span className="text-brand-500">PLUS</span>
          </Link>
          <h1 className="font-display text-2xl font-700 text-navy-900">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-navy-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
