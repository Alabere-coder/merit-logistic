"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const links = [
  { href: "#services", label: "Services" },
  { href: "#track", label: "Track" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useCurrentUser();

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "driver"
        ? "/driver"
        : "/customer";

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-surface/80 backdrop-blur-md">
      <div className="container-lg flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-700 tracking-tight text-navy-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-brand-500">
            <PackageSearch className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          Integrity<span className="text-brand-500">Logistics</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-navy-600 transition-colors hover:text-navy-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <Link href={dashboardHref}>
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>

              <Link href="/signup">
                <Button size="sm">Ship now</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-6 w-6 text-navy-800" />
          ) : (
            <Menu className="h-6 w-6 text-navy-800" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white md:hidden">
          <div className="container-lg flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-navy-100 pt-3">
              {loading ? null : user ? (
                <Link href={dashboardHref} onClick={() => setOpen(false)}>
                  <Button className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>

                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full">Ship now</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
