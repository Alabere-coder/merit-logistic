import { requireRole } from "@/lib/auth/require-role";

import {
  DashboardShell,
  type NavItem,
} from "@/components/dashboard/dashboard-shell";

const navItems: NavItem[] = [
  {
    href: "/customer",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  {
    href: "/customer/shipments/new",
    label: "New Shipment",
    icon: "PackagePlus",
  },
  {
    href: "/customer/history",
    label: "Delivery History",
    icon: "History",
  },
  {
    href: "/customer/track",
    label: "Track Shipment",
    icon: "MapPin",
  },
  {
    href: "/customer/payments",
    label: "Payments",
    icon: "CreditCard",
  },
  {
    href: "/customer/support",
    label: "Support",
    icon: "LifeBuoy",
  },
  {
    href: "/customer/settings",
    label: "Settings",
    icon: "Settings",
  },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["customer"]);

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="Customer"
      user={{
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
      }}
    >
      {children}
    </DashboardShell>
  );
}
