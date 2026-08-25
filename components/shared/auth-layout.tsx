import Link from "next/link";
import { PackageSearch, ShieldCheck, MapPin, Clock, type LucideIcon } from "lucide-react";

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
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 lg:flex">
        <div className="route-dot-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2 font-display text-lg font-700 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-brand-500">
            <PackageSearch className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          Swift<span className="text-brand-500">Ship</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-sm font-display text-3xl font-700 leading-tight text-white text-balance">
            Logistics that moves as fast as your business.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map(([Icon, text]) => (
              <li key={text as string} className="flex items-center gap-3 text-sm text-navy-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-500">
                  {typeof Icon !== "string" && <Icon className="h-4 w-4" />}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-navy-400">© {new Date().getFullYear()} SwiftShip Logistics</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-display text-lg font-700 text-navy-900 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-brand-500">
              <PackageSearch className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            Swift<span className="text-brand-500">Ship</span>
          </Link>
          <h1 className="font-display text-2xl font-700 text-navy-900">{title}</h1>
          <p className="mt-1.5 text-sm text-navy-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
