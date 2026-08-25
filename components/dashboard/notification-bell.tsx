"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  is_read: boolean;
  created_at: string;
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

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function loadNotifications() {
    setLoading(true);

    try {
      const result = await getNotifications();

      if (!result.error) {
        setNotifications((result.notifications ?? []) as Notification[]);
      }
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  function handleOpen() {
    setOpen((current) => !current);

    if (!open) {
      loadNotifications();
    }
  }

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
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative h-10 w-10 rounded-full text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 h-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Click-away overlay */}
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          {/* Notification panel */}
          <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Notifications
                </h3>

                <p className="text-[11px] text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={pending}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="max-h-95 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Bell className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    New updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`group border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 ${
                      notification.is_read ? "bg-white" : "bg-blue-50/50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          notification.is_read ? "bg-slate-200" : "bg-blue-600"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900">
                            {notification.title}
                          </p>

                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatNotificationDate(notification.created_at)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={pending}
                            className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/70 p-2">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-blue-600"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
