import { requireRole } from "@/lib/auth/require-role";
import {
  DashboardShell,
  type NavItem,
} from "@/components/dashboard/dashboard-shell";

const navItems: NavItem[] = [
  // Dashboard
  {
    href: "/admin",
    label: "Overview",
    icon: "LayoutDashboard",
  },

  // Operations
  {
    href: "/admin/shipments",
    label: "Shipments",
    icon: "Package",
  },
  {
    href: "/admin/drivers",
    label: "Drivers",
    icon: "Truck",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: "Users",
  },
  // {
  //   href: "/admin/tracking",
  //   label: "Tracking",
  //   icon: "MapPin",
  // },

  // Finance
  {
    href: "/admin/payments",
    label: "Payments",
    icon: "CreditCard",
  },
  // {
  //   href: "/admin/pricing",
  //   label: "Pricing",
  //   icon: "DollarSign",
  // },

  // Business
  // {
  //   href: "/admin/branches",
  //   label: "Branches",
  //   icon: "Building2",
  // },

  // Analytics
  {
    href: "/admin/reports",
    label: "Reports",
    icon: "BarChart3",
  },

  // Communication
  // {
  //   href: "/admin/notifications",
  //   label: "Notifications",
  //   icon: "Bell",
  // },
  // {
  //   href: "/admin/support",
  //   label: "Support",
  //   icon: "Headphones",
  // },

  // Administration
  {
    href: "/admin/users/admins",
    label: "Administrators",
    icon: "ShieldCheck",
  },

  // Configuration
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "Settings",
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
