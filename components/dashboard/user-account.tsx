"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, Settings, User2 } from "lucide-react";

type UserAccountProfileProps = {
  firstName: string;
  lastName: string;
  email: string;
  settingsHref: string;
  onLogout: () => void;
};

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function UserAccountProfile({
  firstName,
  lastName,
  email,
  settingsHref,
  onLogout,
}: UserAccountProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full border-2 border-slate-300 bg-slate-200 p-0 hover:bg-slate-300"
          >
            {firstName || lastName ? (
              <span className="text-xs font-bold text-slate-700">
                {initials(firstName, lastName)}
              </span>
            ) : (
              <User2 className="h-4 w-4 text-slate-600" />
            )}
          </Button>
        }
      />

      <DropdownMenuContent
        className="w-60 bg-white  border border-slate-200 shadow-lg"
        align="end"
        sideOffset={8}
      >
        {/* User information */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3 my-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white">
                {initials(firstName, lastName)}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {firstName} {lastName}
                </p>

                <p className="truncate text-xs text-slate-500">{email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Account */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link href={settingsHref}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            }
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="" />

        {/* Logout */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onLogout}
            className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 my-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
