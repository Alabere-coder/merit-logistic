"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  valueClassName?: string;
};

export function CopyButton({ value, valueClassName }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);
      toast.add({
        type: "success",
        title: "Phone number copied",
        description: "The phone number has been copied to your clipboard.",
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY PHONE NUMBER ERROR:", error);
      toast.add({
        type: "error",
        title: "Error",
        description: "Unable to copy phone number.",
      });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <p className={valueClassName}> {value} </p>

      <Button
        type="button"
        variant="secondary"
        onClick={handleCopy}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        title={copied ? "Copied" : "Copy phone number"}
        aria-label={copied ? "Phone number copied" : "Copy phone number"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
