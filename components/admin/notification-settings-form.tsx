"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AlertCircle, Bell, CheckCircle2, Loader2, Save } from "lucide-react";

import { updateNotificationSettings } from "@/lib/actions/notification-settings";

import { Button } from "@/components/ui/button";

type NotificationSettings = {
  shipment_created: boolean;
  shipment_assigned: boolean;
  shipment_picked_up: boolean;
  shipment_in_transit: boolean;
  shipment_out_for_delivery: boolean;
  shipment_arrived_at_delivery_destination: boolean;
  shipment_delivered: boolean;
  shipment_cancelled: boolean;

  payment_success: boolean;
  payment_confirmed: boolean;
  payment_failed: boolean;

  support_ticket: boolean;
  support_message: boolean;
  support_reply: boolean;
  support_assignment: boolean;
  support_priority: boolean;
  support_status: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving changes...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save preferences
        </>
      )}
    </Button>
  );
}

const notificationGroups = [
  {
    title: "Shipments & delivery",
    description:
      "Receive notifications about shipment activity and delivery progress.",
    items: [
      {
        name: "shipment_created",
        label: "Shipment created",
        description: "A new shipment has been created.",
      },
      {
        name: "shipment_assigned",
        label: "Shipment assigned",
        description: "A shipment has been assigned to a driver.",
      },
      {
        name: "shipment_picked_up",
        label: "Shipment picked up",
        description: "A driver has picked up a shipment.",
      },
      {
        name: "shipment_in_transit",
        label: "Shipment in transit",
        description: "A shipment is currently in transit.",
      },
      {
        name: "shipment_out_for_delivery",
        label: "Out for delivery",
        description: "A shipment is out for delivery.",
      },
      {
        name: "shipment_arrived_at_delivery_destination",
        label: "Out for delivery",
        description: "A shipment has arrived at delivery destination.",
      },

      {
        name: "shipment_delivered",
        label: "Shipment delivered",
        description: "A shipment has been successfully delivered.",
      },
      {
        name: "shipment_cancelled",
        label: "Shipment cancelled",
        description: "A shipment has been cancelled.",
      },
    ],
  },

  {
    title: "Payments",
    description: "Receive notifications about payment activity.",
    items: [
      {
        name: "payment_success",
        label: "Payment successful",
        description: "A payment has been successfully completed.",
      },
      {
        name: "payment_confirmed",
        label: "Payment confirmed",
        description: "A payment has been confirmed.",
      },
      {
        name: "payment_failed",
        label: "Payment failed",
        description: "A payment attempt has failed.",
      },
    ],
  },

  {
    title: "Support",
    description:
      "Receive notifications about customer and driver support activity.",
    items: [
      {
        name: "support_ticket",
        label: "New support ticket",
        description: "A customer or driver creates a support ticket.",
      },
      {
        name: "support_message",
        label: "New support message",
        description: "A customer or driver sends a support message.",
      },
      {
        name: "support_reply",
        label: "Support reply",
        description: "A support ticket receives a reply.",
      },
      {
        name: "support_assignment",
        label: "Ticket assignment",
        description: "A support ticket is assigned to an administrator.",
      },
      {
        name: "support_priority",
        label: "Priority changed",
        description: "The priority of a support ticket changes.",
      },
      {
        name: "support_status",
        label: "Status changed",
        description: "The status of a support ticket changes.",
      },
    ],
  },
];

export function NotificationSettingsForm({
  settings,
}: {
  settings: NotificationSettings;
}) {
  const [state, formAction] = useActionState(updateNotificationSettings, {});

  return (
    <form action={formAction} className="space-y-6">
      {notificationGroups.map((group) => (
        <div
          key={group.title}
          className="overflow-hidden rounded-2xl border border-slate-200/80"
        >
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>

            <p className="mt-1 text-xs text-slate-500">{group.description}</p>
          </div>

          <div className="divide-y divide-slate-100">
            {group.items.map((item) => (
              <label
                key={item.name}
                className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.label}
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  name={item.name}
                  defaultChecked={
                    settings[item.name as keyof NotificationSettings]
                  }
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      {state.error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

          <div className="font-medium">{state.error}</div>
        </div>
      )}

      {state.success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

          <div className="font-medium">{state.success}</div>
        </div>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
