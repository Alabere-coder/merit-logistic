import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { ArrowLeft, Bell, Mail } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { NotificationSettings } from "@/components/notifications/notification-settings";
import { NotificationSettingsForm } from "@/components/admin/notification-settings-form";
import { CommunicationSettingsForm } from "@/components/admin/communication-settings-form";

export default async function NotificationSettingsPage() {
  const { profile } = await requireRole(["admin"]);

  const supabase = await createClient();

  /* =====================================================
     COMMUNICATION SETTINGS
  ====================================================== */

  const { data: communicationSettings, error: communicationError } =
    await supabase
      .from("communication_settings")
      .select(
        `
          id,
          email_enabled,
          sender_name,
          sender_email,
          reply_to_email,
          welcome_email_enabled,
          shipment_created_email_enabled,
          shipment_status_email_enabled,
          payment_email_enabled,
          password_reset_email_enabled,
          sms_enabled,
          whatsapp_enabled,
          customer_notifications_enabled,
          driver_notifications_enabled,
          admin_notifications_enabled
        `,
      )
      .limit(1)
      .maybeSingle();

  if (communicationError) {
    console.error("GET COMMUNICATION SETTINGS ERROR:", communicationError);
  }

  const adminCommunicationSettings = communicationSettings ?? {
    id: "",
    email_enabled: true,
    sender_name: "Swiftway Shipping",
    sender_email: null,
    reply_to_email: null,
    welcome_email_enabled: true,
    shipment_created_email_enabled: true,
    shipment_status_email_enabled: true,
    payment_email_enabled: true,
    password_reset_email_enabled: true,
    sms_enabled: false,
    whatsapp_enabled: false,
    customer_notifications_enabled: true,
    driver_notifications_enabled: true,
    admin_notifications_enabled: true,
  };

  /* =====================================================
     NOTIFICATION SETTINGS
  ====================================================== */

  const { data: notificationSettings, error: notificationSettingsError } =
    await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

  if (notificationSettingsError) {
    console.error(
      "GET NOTIFICATION SETTINGS ERROR:",
      notificationSettingsError,
    );
  }

  const adminNotificationSettings = notificationSettings ?? {
    shipment_created: true,
    shipment_assigned: true,
    shipment_picked_up: true,
    shipment_in_transit: true,
    shipment_out_for_delivery: true,
    shipment_arrived_at_delivery_destination: true,
    shipment_delivered: true,
    shipment_cancelled: true,
    payment_success: true,
    payment_confirmed: true,
    payment_failed: true,
    support_ticket: true,
    support_message: true,
    support_reply: true,
    support_assignment: true,
    support_priority: true,
    support_status: true,
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings
        </Link>

        <div className="mt-4">
          <p className="text-sm font-medium text-blue-600">
            Notification settings
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage in-app notifications, browser alerts, email communication,
            and notification preferences.
          </p>
        </div>
      </div>

      {/* =====================================================
          BROWSER / PUSH NOTIFICATIONS
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-emerald-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <Bell className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Browser notifications
              </h2>

              <p className="text-xs text-slate-500">
                Enable browser notifications so you can receive important
                platform alerts in real time.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <NotificationSettings />
        </CardContent>
      </Card>

      {/* =====================================================
          NOTIFICATION PREFERENCES
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-violet-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <Bell className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Notification preferences
              </h2>

              <p className="text-xs text-slate-500">
                Choose which platform events you want to be notified about.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <NotificationSettingsForm settings={adminNotificationSettings} />
        </CardContent>
      </Card>

      {/* =====================================================
          EMAIL & COMMUNICATION
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <Mail className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Email & communication
              </h2>

              <p className="text-xs text-slate-500">
                Configure how the platform communicates with customers, drivers,
                and administrators.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <CommunicationSettingsForm settings={adminCommunicationSettings} />
        </CardContent>
      </Card>
    </div>
  );
}
