"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  PackageSearch,
  Menu,
  LogOut,
  Bell,
  LayoutDashboard,
  Users,
  Truck,
  Package,
  CreditCard,
  BarChart3,
  Wallet,
  Settings,
  History,
  PackagePlus,
  X,
  AlertTriangle,
  Shield,
  ShieldCheck,
  Headphones,
  Building2,
  DollarSign,
  MapPin,
  LifeBuoy,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { logOut } from "@/lib/actions/auth";
import { Button } from "../ui/button";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { useFormStatus } from "react-dom";
import { UserAccountProfile } from "./user-account";

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof icons;
};

const icons = {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  CreditCard,
  BarChart3,
  Wallet,
  Settings,
  History,
  PackagePlus,
  Shield,
  ShieldCheck,
  Bell,
  Headphones,
  Building2,
  DollarSign,
  MapPin,
  LifeBuoy,
};

export function DashboardShell({
  children,
  navItems,
  roleLabel,
  user,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  roleLabel: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { pending } = useFormStatus();

  const SidebarContent = (
    <div className="flex min-h-0 flex-1 flex-col justify-between">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="flex items-center gap-3 font-display text-lg font-bold text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20">
            <PackageSearch className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="tracking-tight">
            AMANAH<span className="text-blue-400">PLUS</span>
          </span>
        </Link>
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="text-slate-200 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Links */}

      <div className="min-h-0 flex-1 overflow-hidden">
        <nav className="h-full overflow-y-auto space-y-1.5 px-3 py-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = icons[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-blue-500 font-semibold text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-200",
                  )}
                />

                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      {/* <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-800/40 p-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white shadow-2xs">
            {initials(user.firstName, user.lastName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/30 px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div> */}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative flex h-full w-72 flex-col rounded-r-xl bg-slate-800 shadow-2xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      {/* <div className="flex min-h-screen flex-1 flex-col bg-slate-50/60"> */}
      <div className="flex min-h-screen flex-1 flex-col bg-slate-50/60 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md transition-all sm:px-6 lg:px-8">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-slate-700 transition-all hover:bg-slate-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Role Badge Indicator */}
            <div className="flex items-center justify-start">
              {/* <span>
              {user.firstName} {user.lastName}
            </span> */}
              <h1 className="inline-flex px-3 py-1 font-mono text-md sm:text-xl font-bold uppercase tracking-wider text-blue-700">
                {roleLabel}
              </h1>
            </div>
          </div>

          {/* Profile Action */}
          <div className="flex items-center gap-4">
            {/* Notifications Action */}
            <div className="flex items-center justify-end gap-2">
              <NotificationBell />
            </div>
            <div className="flex items-center justify-end gap-2">
              <UserAccountProfile
                firstName={user.firstName}
                lastName={user.lastName}
                email={user.email}
                settingsHref={`/${roleLabel}/settings`}
                onLogout={() => setShowLogoutModal(true)}
              />
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Logout
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Are you sure you want to log out of your session?
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
                className="h-10 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>

              <form action={logOut}>
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-10 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pending ? "Logging out..." : "Yes, Log out"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
