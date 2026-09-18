"use client";

import Link from "next/link";
import {
  BotMessageSquareIcon,
  Headphones,
  HelpCircleIcon,
  LucidePhone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import WhatsAppIcon from "../icon/WhatsAppIcon";

type FloatingSupportButtonProps = {
  href: string;
  whatsappNumber?: string | null;
  helpCenterUrl?: string | null;
};

function getWhatsAppUrl(phoneNumber?: string | null) {
  if (!phoneNumber) return null;

  const phone = phoneNumber.replace(/\D/g, "");

  if (!phone) return null;

  return `https://wa.me/${phone}`;
}

export function FloatingSupportButton({
  href,
  whatsappNumber,
  helpCenterUrl,
}: FloatingSupportButtonProps) {
  const whatsappUrl = getWhatsAppUrl(whatsappNumber);

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-center gap-2 font-semibol transition-all">
      <Popover>
        {/* <PopoverTrigger
          render={
            <div className="flex flex-col items-center gap-2 font-semibol transition-all ">
              <button className="flex items-center gap-2 rounded-full bg-cyan-600 p-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-cyan-500">
                <BotMessageSquareIcon className="h-6 w-6" />
              </button>
              <span className="text-cyan-600 hover:text-cyan-500">Support</span>
            </div>
          }
        /> */}
        <PopoverTrigger
          type="button"
          className="flex flex-col items-center gap-1"
        >
          {/* Floating assistant button */}
          <span className="relative flex items-center justify-center">
            {/* Soft pulsing ring */}
            {/* <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/40" /> */}
            <span className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/20" />

            {/* Main button */}
            <span className="relative flex items-center justify-center rounded-full bg-cyan-600 p-3 text-white shadow-lg shadow-cyan-600/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500 group-active:scale-95">
              <BotMessageSquareIcon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />
            </span>
          </span>

          <span className="text-sm font-semibold text-cyan-600 transition-colors hover:text-cyan-500">
            Support
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="bg-slate-50">
          <PopoverHeader>
            <PopoverTitle className="bg-cyan-600 flex items-center gap-2 py-2 px-2 rounded-lg text-white">
              <BotMessageSquareIcon className="h-4 w-4" />
              Emirate Assistant
            </PopoverTitle>

            <div className=" flex flex-col gap-2 font-semibol transition-all my-2">
              <Link
                href={href}
                className="flex items-center gap-2 rounded-lg py-2 px-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
              >
                <Headphones className="h-3.5 w-3.5" /> Support
              </Link>
            </div>
            {/* WhatsApp */}
            {whatsappUrl && (
              <div className="mb-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 text-green-500" />
                  Reach out on WhatsApp
                </a>
              </div>
            )}

            {/* Help Center */}
            {helpCenterUrl && (
              <div>
                <a
                  href={helpCenterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
                >
                  <HelpCircleIcon className="h-4 w-4 text-cyan-600" />
                  Help Center
                </a>
              </div>
            )}
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  );
}
