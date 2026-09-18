import { requireRole } from "@/lib/auth/require-role";

import {
  DashboardShell,
  type NavItem,
} from "@/components/dashboard/dashboard-shell";
import { FloatingSupportButton } from "@/components/dashboard/floating-support-button";
import { getCompanySettings } from "@/lib/company/get-company-settings";

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
    href: "/notifications",
    label: "Notifications",
    icon: "InfoIcon",
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

  const companySettings = await getCompanySettings();

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="customer"
      user={{
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
      }}
    >
      {children}

      <FloatingSupportButton
        href="/customer/support"
        whatsappNumber={companySettings.whatsapp_number}
        helpCenterUrl={companySettings.help_center_url}
      />
    </DashboardShell>
  );
}
