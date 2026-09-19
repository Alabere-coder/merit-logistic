"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { markDriverEarningPaid } from "./actions";

type MarkEarningPaidProps = {
  earningId: string;
};

export function MarkEarningPaid({ earningId }: MarkEarningPaidProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      const result = await markDriverEarningPaid(earningId, reference);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      setReference("");
      setError(null);
    });
  }

  function handleOpenChange(value: boolean) {
    if (isPending) return;

    setOpen(value);

    if (!value) {
      setError(null);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark paid
          </Button>
        }
      ></PopoverTrigger>

      <PopoverContent align="start" side="left" className="w-72 p-4">
        <div>
          <p className="text-sm font-semibold text-navy-800">Confirm payout</p>

          <p className="mt-1 text-xs leading-5 text-navy-500">
            Mark this earning as paid. Add a payment reference if available.
          </p>
        </div>

        <div className="mt-4">
          <Input
            type="text"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="e.g. TXN-123456"
            disabled={isPending}
            className="h-9 text-xs"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => setOpen(false)}
            className=" bg-black text-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleSubmit}
            className="gap-2 bg-green-500 text-white"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}

            {isPending ? "Saving..." : "Confirm paid"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
