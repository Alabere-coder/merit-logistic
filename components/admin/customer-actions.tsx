"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Power, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  toggleCustomerStatus,
  deleteCustomer,
} from "@/lib/actions/customer-action";

type CustomerActionsProps = {
  customerId: string;
  customerName: string;
  isActive: boolean;
};

export function CustomerActions({
  customerId,
  customerName,
  isActive,
}: CustomerActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleToggleStatus() {
    startTransition(async () => {
      try {
        await toggleCustomerStatus(customerId, !isActive);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCustomer(customerId);
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              disabled={isPending}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Customer actions</span>
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={handleToggleStatus}>
            <Power className="mr-2 h-4 w-4" />
            {isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex flex-col items-center justify-center w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-navy-900">
              Delete customer?
            </h2>

            <p className="mt-2 text-sm leading-6 text-navy-600 text-wrap text-center">
              You are about to permanently delete{" "}
              <span className="font-semibold text-navy-900">
                {customerName}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                className="bg-black text-white "
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 p-4"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete customer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
