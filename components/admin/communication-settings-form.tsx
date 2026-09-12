"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Bell,
  CheckCircle2,
  Mail,
  MessageCircle,
  Save,
  Users,
} from "lucide-react";

import {
  updateCommunicationSettings,
  type CommunicationActionState,
} from "@/lib/actions/communication-settings";

/* =========================================================
   TYPES
========================================================= */

type CommunicationSettings = {
  id: string;

  email_enabled: boolean;
  sender_name: string;
  sender_email: string | null;
  reply_to_email: string | null;

  welcome_email_enabled: boolean;
  shipment_created_email_enabled: boolean;
  shipment_status_email_enabled: boolean;
  payment_email_enabled: boolean;
  password_reset_email_enabled: boolean;

  sms_enabled: boolean;
  whatsapp_enabled: boolean;

  customer_notifications_enabled: boolean;
  driver_notifications_enabled: boolean;
  admin_notifications_enabled: boolean;
};

type CommunicationSettingsFormProps = {
  settings: CommunicationSettings;
};

/* =========================================================
   SUBMIT BUTTON
========================================================= */

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save className="h-4 w-4" />

      {pending ? "Saving..." : "Save communication settings"}
    </button>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  name,
  defaultChecked,
  title,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
      />
    </label>
  );
}

/* =========================================================
   FORM
========================================================= */

export function CommunicationSettingsForm({
  settings,
}: CommunicationSettingsFormProps) {
  const [state, formAction] = useActionState<
    CommunicationActionState,
    FormData
  >(updateCommunicationSettings, {});

  return (
    <form action={formAction} className="space-y-8">
      {/* ===================================================
          EMAIL CONFIGURATION
      =================================================== */}

      <section>
        <div className="mt-5 space-y-5">
          <Toggle
            name="email_enabled"
            defaultChecked={settings.email_enabled}
            title="Enable email notifications"
            description="Allow the platform to send transactional emails."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="sender_name"
                className="text-sm font-semibold text-slate-700"
              >
                Sender name
              </label>

              <input
                id="sender_name"
                name="sender_name"
                type="text"
                defaultValue={settings.sender_name}
                maxLength={100}
                placeholder="Swiftway Shipping"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                The name recipients will see in their inbox.
              </p>
            </div>

            <div>
              <label
                htmlFor="sender_email"
                className="text-sm font-semibold text-slate-700"
              >
                Sender email
              </label>

              <input
                id="sender_email"
                name="sender_email"
                type="email"
                defaultValue={settings.sender_email ?? ""}
                placeholder="notifications@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                The address used for outgoing emails.
              </p>
            </div>

            <div>
              <label
                htmlFor="reply_to_email"
                className="text-sm font-semibold text-slate-700"
              >
                Reply-to email
              </label>

              <input
                id="reply_to_email"
                name="reply_to_email"
                type="email"
                defaultValue={settings.reply_to_email ?? ""}
                placeholder="support@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Where replies to platform emails should be sent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          TRANSACTIONAL EMAILS
      =================================================== */}

      <section className="border-t border-slate-200 pt-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transactional emails
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose which important platform events can trigger emails.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Toggle
            name="welcome_email_enabled"
            defaultChecked={settings.welcome_email_enabled}
            title="Welcome emails"
            description="Send a welcome email when a customer account is created."
          />

          <Toggle
            name="shipment_created_email_enabled"
            defaultChecked={settings.shipment_created_email_enabled}
            title="Shipment created"
            description="Notify customers when a new shipment is created."
          />

          <Toggle
            name="shipment_status_email_enabled"
            defaultChecked={settings.shipment_status_email_enabled}
            title="Shipment status updates"
            description="Send emails when shipment delivery status changes."
          />

          <Toggle
            name="payment_email_enabled"
            defaultChecked={settings.payment_email_enabled}
            title="Payment updates"
            description="Notify customers about successful or failed payments."
          />

          <Toggle
            name="password_reset_email_enabled"
            defaultChecked={settings.password_reset_email_enabled}
            title="Password reset emails"
            description="Allow password reset emails to be sent."
          />
        </div>
      </section>

      {/* ===================================================
          COMMUNICATION CHANNELS
      =================================================== */}

      <section className="border-t border-slate-200 pt-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Communication channels
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Control additional communication channels.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <Toggle
            name="sms_enabled"
            defaultChecked={settings.sms_enabled}
            title="SMS notifications"
            description="Enable SMS communication when an SMS provider is configured."
          />

          <Toggle
            name="whatsapp_enabled"
            defaultChecked={settings.whatsapp_enabled}
            title="WhatsApp notifications"
            description="Enable WhatsApp communication when a WhatsApp provider is configured."
          />
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Provider configuration required
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Enabling SMS or WhatsApp here does not send messages by itself. A
            communication provider must be configured before these channels can
            be used.
          </p>
        </div>
      </section>

      {/* ===================================================
          RECIPIENTS
      =================================================== */}

      <section className="border-t border-slate-200 pt-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recipient preferences
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Control which platform roles can receive communication
              notifications.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <Toggle
            name="customer_notifications_enabled"
            defaultChecked={settings.customer_notifications_enabled}
            title="Customer notifications"
            description="Allow customers to receive communication notifications."
          />

          <Toggle
            name="driver_notifications_enabled"
            defaultChecked={settings.driver_notifications_enabled}
            title="Driver notifications"
            description="Allow drivers to receive communication notifications."
          />

          <Toggle
            name="admin_notifications_enabled"
            defaultChecked={settings.admin_notifications_enabled}
            title="Admin notifications"
            description="Allow administrators to receive communication notifications."
          />
        </div>
      </section>

      {/* ===================================================
          RESULT MESSAGE
      =================================================== */}

      {state.error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-rose-900">
              Unable to save settings
            </p>

            <p className="mt-1 text-sm text-rose-700">{state.error}</p>
          </div>
        </div>
      )}

      {state.warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Warning</p>

          <p className="mt-1 text-sm text-amber-800">{state.warning}</p>
        </div>
      )}

      {state.success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

          <p className="text-sm font-semibold text-emerald-800">
            {state.success}
          </p>
        </div>
      )}

      {/* ===================================================
          SAVE
      =================================================== */}

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <SaveButton />
      </div>
    </form>
  );
}
