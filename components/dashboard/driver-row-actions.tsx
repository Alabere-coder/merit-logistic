"use client";

import { useState, useTransition } from "react";
import {
  setDriverStatus,
  deleteDriverAccount,
} from "@/lib/actions/admin-drivers";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserCheck, UserX, Trash2, Loader2 } from "lucide-react";
import type { DriverStatus } from "@/types/app";

export function DriverRowActions({
  driverId,
  userId,
  status,
}: {
  driverId: string;
  userId: string;
  status: DriverStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"status" | "delete" | null>(null);

  const isActive = status === "active";
  const nextStatus: DriverStatus = isActive ? "inactive" : "active";

  function handleStatusConfirm() {
    setDialog(null);

    startTransition(async () => {
      const res = await setDriverStatus(driverId, nextStatus);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        `Driver ${nextStatus === "active" ? "activated" : "deactivated"}.`,
      );
    });
  }

  function handleDeleteConfirm() {
    setDialog(null);

    startTransition(async () => {
      const res = await deleteDriverAccount(driverId, userId);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Driver account deleted.");
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Toggle Status Action */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialog("status")}
          disabled={pending}
          className={`h-8 rounded-lg border border-slate-200/80 px-3 text-xs font-semibold transition-all duration-150 ${
            isActive
              ? "bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
              : "bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          }`}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          ) : isActive ? (
            <span className="inline-flex items-center gap-1.5">
              <UserX className="h-3.5 w-3.5 text-amber-600" />
              Deactivate
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              Activate
            </span>
          )}
        </Button>

        {/* Delete Action */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDialog("delete")}
          disabled={pending}
          className="h-8 rounded-lg px-2.5 text-xs font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete driver</span>
        </Button>
      </div>

      {/* Deactivate / Activate confirmation Modal */}
      <AlertDialog
        open={dialog === "status"}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setDialog(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl backdrop-blur-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold text-slate-900">
              {isActive
                ? "Deactivate driver account?"
                : "Activate driver account?"}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-xs leading-relaxed text-slate-500">
              {isActive
                ? "This driver will be placed on inactive status and removed from standard delivery assignment lists until reactivated."
                : "This driver will be restored to active status and made available for delivery assignments."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={pending}
              className="h-9 rounded-xl border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleStatusConfirm}
              disabled={pending}
              className={`h-9 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all ${
                isActive
                  ? "bg-amber-700 text-white hover:bg-amber-800 focus:ring-amber-600"
                  : "bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600"
              }`}
            >
              {pending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </span>
              ) : isActive ? (
                "Confirm Deactivation"
              ) : (
                "Confirm Activation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation Modal */}
      <AlertDialog
        open={dialog === "delete"}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setDialog(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl border bg-white p-6 shadow-2xl backdrop-blur-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold text-slate-900">
              Permanently delete driver?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-xs leading-relaxed text-slate-500">
              This action permanently deletes the user account, performance
              profile, and driver records. This step is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={pending}
              className="h-9 rounded-xl border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={pending}
              className="h-9 rounded-xl bg-rose-900 px-4 text-xs font-semibold text-white shadow-xs hover:bg-rose-950 focus:ring-rose-800"
            >
              {pending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
