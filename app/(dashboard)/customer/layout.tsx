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
    label: "New shipment",
    icon: "PackagePlus",
  },
  {
    href: "/customer/history",
    label: "Delivery history",
    icon: "History",
  },
  {
    href: "/customer/payments",
    label: "Payments",
    icon: "CreditCard",
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
