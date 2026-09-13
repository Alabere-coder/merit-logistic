"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Search,
  Loader2,
  Package,
  Users,
  Truck,
  CreditCard,
  LifeBuoy,
  ArrowRight,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  globalSearch,
  type GlobalSearchResult,
  type GlobalSearchResultType,
} from "@/lib/actions/search";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

/* =========================================================
   TYPES
========================================================= */

type GlobalSearchProps = {
  className?: string;
};

/* =========================================================
   RESULT CONFIG
========================================================= */

const resultTypeConfig: Record<
  GlobalSearchResultType,
  {
    label: string;
    icon: typeof Package;
    iconClassName: string;
    iconBackground: string;
  }
> = {
  shipment: {
    label: "Shipments",
    icon: Package,
    iconClassName: "text-blue-600",
    iconBackground: "bg-blue-50",
  },

  customer: {
    label: "Customers",
    icon: Users,
    iconClassName: "text-violet-600",
    iconBackground: "bg-violet-50",
  },

  driver: {
    label: "Drivers",
    icon: Truck,
    iconClassName: "text-emerald-600",
    iconBackground: "bg-emerald-50",
  },

  payment: {
    label: "Payments",
    icon: CreditCard,
    iconClassName: "text-amber-600",
    iconBackground: "bg-amber-50",
  },

  support: {
    label: "Support",
    icon: LifeBuoy,
    iconClassName: "text-rose-600",
    iconBackground: "bg-rose-50",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  /* =======================================================
     OPEN SEARCH
  ======================================================= */

  function openSearch() {
    setOpen(true);
  }

  /* =======================================================
     CLOSE SEARCH
  ======================================================= */

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError(null);
  }

  /* =======================================================
     FOCUS INPUT WHEN DIALOG OPENS
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  /* =======================================================
     KEYBOARD SHORTCUT
  ======================================================= */

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");

      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      /* Ctrl/Cmd + K */
      if (modifierKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }

      /* Escape */
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeSearch();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  /* =======================================================
     SEARCH
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const search = query.trim();

    if (!search) {
      setResults([]);
      setError(null);
      return;
    }

    if (search.length < 2) {
      setResults([]);
      setError("Please enter at least 2 characters.");
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const response = await globalSearch(search);

        if (response.error) {
          setResults([]);
          setError(response.error);
          return;
        }

        setResults(response.results);
        setError(null);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  /* =======================================================
     RESULT CLICK
  ======================================================= */

  function handleResultClick(result: GlobalSearchResult) {
    closeSearch();
    router.push(result.href);
  }

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  function clearSearch() {
    setQuery("");
    setResults([]);
    setError(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  /* =======================================================
     GROUP RESULTS
  ======================================================= */

  const groupedResults = (
    Object.keys(resultTypeConfig) as GlobalSearchResultType[]
  )
    .map((type) => ({
      type,
      ...resultTypeConfig[type],
      results: results.filter((result) => result.type === type),
    }))
    .filter((group) => group.results.length > 0);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }}
    >
      {/* ===================================================
          SEARCH BUTTON
      =================================================== */}

      <DialogTrigger
        render={
          <Button
            type="button"
            className={cn(
              "group flex h-9 w-fit items-center justify-center px-4",
              "rounded-xl border border-slate-200",
              "bg-slate-200 text-slate-500",
              "shadow-sm transition-all",
              "hover:border-slate-300",
              "hover:bg-slate-50",
              "hover:text-slate-600",
              "active:scale-95",
              "focus:bg-slate-200",
              "focus-visible:ring-2",
              "focus-visible:ring-slate-500/30",
              className,
            )}
            aria-label="Open search"
            title="Search"
          >
            <div className="flex items-center gap-4">
              <Search
                className={cn(
                  "h-4.5 w-4.5 text-cyan-600 transition-transform",
                  "max-sm:hidden",
                  "group-hover:scale-105",
                )}
              />

              <span className="text-xs text-slate-500">
                Search documentation...
              </span>

              <kbd className="hidden rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400 sm:inline-flex">
                Ctrl K
              </kbd>
            </div>
          </Button>
        }
      />

      {/* ===================================================
          SEARCH DIALOG
      =================================================== */}

      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] max-w-full top-[45%] sm:top-1/3",
          "gap-0 overflow-hidden p-0",
          "rounded-2xl border border-slate-200",
          "bg-white shadow-2xl",
        )}
        showCloseButton={false}
      >
        {/* Accessible dialog information */}
        <DialogHeader className="sr-only">
          <DialogTitle>Global Search</DialogTitle>

          <DialogDescription>
            Search shipments, customers, drivers, payments, and support tickets.
          </DialogDescription>
        </DialogHeader>

        {/* =================================================
            SEARCH INPUT
        ================================================= */}

        <div className="flex items-center gap-3 border-b border-slate-100 px-4 mt-4">
          {isPending ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan-500" />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-slate-700" />
          )}

          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search shipments, customers, drivers..."
            className={cn(
              "h-10 min-w-0 flex-1",
              "border bg-slate-200 px-0 pl-2",
              "text-slate-500",
              "shadow-none",
              "placeholder:text-slate-700",
              "focus-visible:border-0",
              "focus-visible:ring-0",
              "[&::-webkit-search-cancel-button]:appearance-none",
            )}
            autoComplete="off"
            spellCheck={false}
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* <kbd className="hidden shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-400 sm:block">
            ESC
          </kbd> */}
        </div>

        {/* =================================================
            INITIAL STATE
        ================================================= */}

        {!query.trim() && (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
              <Search className="h-6 w-6 text-cyan-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              Search your dashboard
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
              Search shipments, customers, drivers, payments, and support
              tickets.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                "Tracking number",
                "Customer name",
                "Driver",
                "Payment reference",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {query.trim() && error && (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
              <X className="h-5 w-5 text-rose-500" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Search error
            </p>

            <p className="mt-1 text-xs text-rose-500">{error}</p>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {query.trim() && !error && isPending && results.length === 0 && (
          <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            Searching...
          </div>
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        {query.trim() && !error && !isPending && results.length > 0 && (
          <div className="max-h-[35vh] overflow-y-auto px-2 py-3">
            {groupedResults.map((group) => {
              const GroupIcon = group.icon;

              return (
                <div key={group.type} className="mb-3 last:mb-0">
                  {/* Group heading */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <GroupIcon className="h-3.5 w-3.5 text-slate-400" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {group.label}
                    </span>
                  </div>

                  {/* Results */}
                  <div className="space-y-0.5">
                    {group.results.map((result) => {
                      const ResultIcon = resultTypeConfig[result.type].icon;

                      const config = resultTypeConfig[result.type];

                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          onClick={() => handleResultClick(result)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
                            "transition-colors",
                            "hover:bg-slate-200",
                            "focus:bg-slate-50",
                            "focus:outline-none",
                          )}
                        >
                          {/* Icon */}
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              config.iconBackground,
                            )}
                          >
                            <ResultIcon
                              className={cn(
                                "h-4.5 w-4.5",
                                config.iconClassName,
                              )}
                            />
                          </span>

                          {/* Text */}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">
                              {result.title}
                            </span>

                            <span className="mt-0.5 block truncate text-xs text-slate-500">
                              {result.subtitle}
                            </span>

                            {result.meta && (
                              <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                                {result.meta}
                              </span>
                            )}
                          </span>

                          {/* Arrow */}
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-all group-hover:bg-white group-hover:text-cyan-500">
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =================================================
            NO RESULTS
        ================================================= */}

        {query.trim() && !error && !isPending && results.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              No results found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try a tracking number, name, email, phone number, or payment
              reference.
            </p>
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <p className="text-[10px] text-slate-400">
            Search across your dashboard
          </p>

          <div className="flex items-center gap-2">
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400">
              ESC
            </kbd>

            <span className="text-[10px] text-slate-400">to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
