"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deactivateAdmin, reactivateAdmin } from "@/lib/actions/admins";

import { Button } from "@/components/ui/button";

type AdminActionsProps = {
  adminId: string;
  isActive: boolean;
};

export function AdminActions({ adminId, isActive }: AdminActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction() {
    const confirmed = window.confirm(
      isActive
        ? "Are you sure you want to deactivate this administrator?"
        : "Are you sure you want to reactivate this administrator?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const result = isActive
      ? await deactivateAdmin(adminId)
      : await reactivateAdmin(adminId);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant={isActive ? "destructive" : "outline"}
        onClick={handleAction}
        disabled={loading}
      >
        {loading ? "Please wait..." : isActive ? "Deactivate" : "Reactivate"}
      </Button>

      {error && (
        <p className="max-w-48 text-right text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
