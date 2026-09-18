import { requireRole } from "@/lib/auth/require-role";

import {
  DashboardShell,
  type NavItem,
} from "@/components/dashboard/dashboard-shell";
import { FloatingSupportButton } from "@/components/dashboard/floating-support-button";
import { getCompanySettings } from "@/lib/company/get-company-settings";

const navItems: NavItem[] = [
  {
    href: "/driver",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  {
    href: "/driver/deliveries",
    label: "Deliveries",
    icon: "Truck",
  },
  {
    href: "/driver/earnings",
    label: "Earnings",
    icon: "Wallet",
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "Bell",
  },
  {
    href: "/driver/support",
    label: "Support",
    icon: "LifeBuoy",
  },
  {
    href: "/driver/settings",
    label: "Settings",
    icon: "Settings",
  },
];

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["driver"]);

  const companySettings = await getCompanySettings();

  return (
    <>
      <DashboardShell
        navItems={navItems}
        roleLabel="driver"
        user={{
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
        }}
      >
        {children}
      </DashboardShell>
      <FloatingSupportButton
        href="/driver/support"
        whatsappNumber={companySettings.whatsapp_number}
        helpCenterUrl={companySettings.help_center_url}
      />
    </>
  );
}
