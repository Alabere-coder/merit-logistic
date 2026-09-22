"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const { user, loading } = useCurrentUser();

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "driver"
        ? "/driver"
        : "/customer";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-navy-400 bg-surface/80 backdrop-blur-md">
      <div className="container-lg flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-700 tracking-tight text-navy-900"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg">
            <Image
              src="/emirate2.jpeg"
              alt="Company Logo"
              width={40}
              height={40}
              priority
            />
          </span>

          <p className="text-xl">
            Emirate
            <span className="pl-1 text-cyan-500">Global</span>
          </p>
        </Link>

        {/* Mobile Dashboard / Auth */}
        <div className="md:hidden">
          {loading ? null : user ? (
            <Link href={dashboardHref}>
              <Button
                size="sm"
                className="text-sm font-medium text-cyan-600 transition-colors duration-200 hover:text-cyan-900 max-sm:-mr-8"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center self-end gap-2 max-sm:-mr-12">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-cyan-600"
                >
                  Log in
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative py-1 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-cyan-900" : "text-cyan-600 hover:text-cyan-900"
                }`}
              >
                <span>{link.label}</span>

                {/* Active / Hover underline */}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-cyan-500 transition-transform duration-300 ease-out ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />

                {/* Soft hover background */}
                <span
                  className={`absolute -inset-x-2.5 -inset-y-1 -z-10 rounded-lg transition-colors duration-200 ${
                    active
                      ? "bg-none"
                      : "bg-transparent group-hover:bg-white/40"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth / Dashboard */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <Link href={dashboardHref}>
              <Button
                size="sm"
                className="text-sm font-medium text-cyan-600 transition-colors duration-200 hover:text-cyan-900"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-cyan-600"
                >
                  Log in
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="ml-2 flex items-center justify-center md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <X className="h-6 w-6 text-cyan-500" />
          ) : (
            <Menu className="h-6 w-6 text-cyan-500" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-navy-100 bg-white md:hidden">
          <div className="container-lg flex flex-col gap-1 py-4">
            {links.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={` px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? " text-cyan-700"
                      : "text-cyan-500 hover:bg-navy-500"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {link.label}

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    )}
                  </span>
                </Link>
              );
            })}

            {/* Mobile Auth */}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-300 pt-6">
              {loading ? null : user ? (
                <Link href={dashboardHref} onClick={() => setOpen(false)}>
                  <Button
                    variant="secondary"
                    className="w-full bg-cyan-700 text-gray-200 transition-colors duration-200 hover:bg-cyan-600 hover:text-white"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full bg-cyan-700 text-gray-200 transition-colors duration-200 hover:bg-cyan-600 hover:text-white"
                    >
                      Log in
                    </Button>
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
