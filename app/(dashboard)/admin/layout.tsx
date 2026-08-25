import { requireRole } from "@/lib/auth/require-role";
import {
  DashboardShell,
  type NavItem,
} from "@/components/dashboard/dashboard-shell";

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: "Users",
  },
  {
    href: "/admin/drivers",
    label: "Drivers",
    icon: "Truck",
  },
  {
    href: "/admin/shipments",
    label: "Shipments",
    icon: "Package",
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: "CreditCard",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: "BarChart3",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["admin"]);

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="Administrator"
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
