"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  ChevronRight,
  CreditCard,
  Loader2,
  MessageCircle,
  Package,
  UserPlus,
  X,
} from "lucide-react";

import {
  getNotifications,
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
  support_ticket_id: string | null;
  is_read: boolean;
  created_at: string;
  shipments?: {
    tracking_number: string;
  } | null;
};

function formatNotificationTime(date: string) {
  const notificationDate = new Date(date);
  const now = new Date();

  const diff = now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return notificationDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNotificationIcon(type: string) {
  // Check specific notification types first.
  if (type === "shipment_assigned") {
    return UserPlus;
  }

  if (type.startsWith("shipment_")) {
    return Package;
  }

  if (type.startsWith("payment_")) {
    return CreditCard;
  }

  if (type.startsWith("support_")) {
    return MessageCircle;
  }

  return Bell;
}

function getNotificationHref(notification: Notification, role?: string) {
  if (!role) {
    return "/notifications";
  }

  // Support notifications
  if (
    notification.type.startsWith("support_") &&
    notification.support_ticket_id
  ) {
    return `/${role}/support/${notification.support_ticket_id}`;
  }

  // Shipment notifications
  if (
    notification.type.startsWith("shipment_") &&
    notification.shipments?.tracking_number
  ) {
    return `/${role}/shipments/${notification.shipments.tracking_number}`;
  }

  // Payment notifications
  if (notification.type.startsWith("payment_") && notification.payment_id) {
    return `/${role}/payments/${notification.payment_id}`;
  }

  return "/notifications";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [role, setRole] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);

  /*

* Load notifications when the dashboard mounts.
  */
  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      setLoading(true);
      setError("");

      try {
        const result = await getNotifications();

        if (!mounted) {
          return;
        }

        setNotifications((result.notifications ?? []) as Notification[]);

        if ("role" in result && result.role) {
          setRole(result.role);
        }

        if ("error" in result && result.error) {
          setError(result.error);
        }
      } catch (error) {
        console.error("NOTIFICATION BELL LOAD ERROR:", error);

        if (mounted) {
          setError("Unable to load notifications.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  /*

* Close dropdown when clicking outside.
  */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /*

* Close dropdown with Escape.
  */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const visibleNotifications = notifications.slice(0, 8);

  function handleMarkAsRead(notification: Notification) {
    if (notification.is_read) {
      return;
    }

    /*
     * Optimistically update the UI.
     */
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              is_read: true,
            }
          : item,
      ),
    );

    startTransition(async () => {
      const result = await markNotificationAsRead(notification.id);

      if (result.error) {
        console.error("MARK NOTIFICATION READ ERROR:", result.error);

        /*
         * Restore unread state if the server update failed.
         */
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: false,
                }
              : item,
          ),
        );
      }
    });
  }

  function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    const previousNotifications = notifications;

    /*
     * Optimistic update.
     */
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      })),
    );

    startTransition(async () => {
      const result = await markAllNotificationsAsRead();

      if (result.error) {
        console.error("MARK ALL NOTIFICATIONS READ ERROR:", result.error);

        setNotifications(previousNotifications);
      }
    });
  }

  function handleNotificationClick(notification: Notification) {
    console.log("CLICKED NOTIFICATION:", notification);
    console.log("TYPE:", notification.type);
    console.log("SUPPORT TICKET ID:", notification.support_ticket_id);

    handleMarkAsRead(notification);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {" "}
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-x-3 top-18 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-105 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading notifications...
                </p>
              </div>
            ) : error ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Unable to load notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">{error}</p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No notifications
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  You're all caught up. New updates will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const href = getNotificationHref(notification, role);

                  return (
                    <Link
                      key={notification.id}
                      href={href}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group block px-4 py-3.5 transition hover:bg-slate-50 ${
                        !notification.is_read ? "bg-blue-50/40" : "bg-white"
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            notification.is_read
                              ? "bg-slate-100 text-slate-500"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm leading-5 ${
                                notification.is_read
                                  ? "font-medium text-slate-700"
                                  : "font-bold text-slate-900"
                              }`}
                            >
                              {notification.title}
                            </p>

                            {!notification.is_read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                            {notification.message}
                          </p>

                          <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </div>

                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50/70 p-2">
            <Link
              // href={role ? `/${role}/notifications` : "/notifications"}
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900"
            >
              View all notifications
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
