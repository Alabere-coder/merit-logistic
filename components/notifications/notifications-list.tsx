"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Package,
  CreditCard,
} from "lucide-react";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/actions/notifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  shipment_id: string | null;
  payment_id: string | null;
  is_read: boolean;
  created_at: string;
  shipments?: {
    tracking_number: string;
  } | null;
};

type Props = {
  initialNotifications: Notification[];
  role: "admin" | "driver" | "customer";
};

function formatNotificationDate(date: string) {
  const value = new Date(date);
  const now = new Date();

  const diff = now.getTime() - value.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return value.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  if (type.startsWith("payment")) {
    return <CreditCard className="h-4 w-4" />;
  }

  if (type.startsWith("shipment")) {
    return <Package className="h-4 w-4" />;
  }

  return <Bell className="h-4 w-4" />;
}

function getNotificationHref(
  notification: Notification,
  role: "admin" | "driver" | "customer",
) {
  if (notification.shipment_id) {
    if (role === "customer") {
      const trackingNumber = notification.shipments?.tracking_number;

      console.log("NOTIFICATION LINK DEBUG:", {
        shipmentId: notification.shipment_id,
        trackingNumber,
        role,
      });

      if (trackingNumber) {
        return `/customer/shipments/${trackingNumber}`;
      }

      return null;
    }

    if (role === "driver") {
      return `/driver/deliveries/${notification.shipment_id}`;
    }

    if (role === "admin") {
      return `/admin/shipments/${notification.shipment_id}`;
    }
  }

  if (notification.payment_id) {
    if (role === "customer") {
      return "/customer/payments";
    }

    if (role === "admin") {
      return "/admin/payments";
    }
  }

  return null;
}

export function NotificationsList({ initialNotifications, role }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const [pending, startTransition] = useTransition();

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  function handleMarkAsRead(id: string) {
    startTransition(async () => {
      const result = await markNotificationAsRead(id);

      if (!result.error) {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification,
          ),
        );
      }
    });
  }

  function handleMarkAllAsRead() {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();

      if (!result.error) {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            is_read: true,
          })),
        );
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            All notifications
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {notifications.length === 0
              ? "No notifications"
              : unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Bell className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-900">
            No notifications yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
            When there are updates about your account, shipments, payments, or
            deliveries, they will appear here.
          </p>
        </div>
      )}

      {/* Notification list */}
      {notifications.length > 0 && (
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => {
            const href = getNotificationHref(notification, role);

            const content = (
              <div
                className={`px-5 py-4 transition-colors ${
                  notification.is_read
                    ? "bg-white hover:bg-slate-50"
                    : "bg-blue-50/40 hover:bg-blue-50/70"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      notification.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        )}

                        <h3 className="text-sm font-bold text-slate-900">
                          {notification.title}
                        </h3>
                      </div>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatNotificationDate(notification.created_at)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      {href && (
                        <span className="text-xs font-semibold text-blue-600">
                          View details →
                        </span>
                      )}

                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={pending}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );

            return href ? (
              <Link key={notification.id} href={href}>
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
