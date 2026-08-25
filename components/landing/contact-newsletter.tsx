"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Wire this up to a server action (e.g. lib/actions/contact.ts) that
    // inserts into a `contact_messages` table or forwards to an email service.
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    toast.promise(
      new Promise((resolve) => {
        setTimeout(
          () => resolve("Message sent — we'll reply within one business day."),
          1000,
        );
      }),
      {
        loading: "Sending message...",
        success: "Message sent — we'll reply within one business day.",
        error: "Failed to send message.",
      },
    );
    e.currentTarget.reset();
  }

  return (
    <section id="contact" className="bg-[#f7fbfc] px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5 lg:items-center lg:gap-16">
        <div className="lg:col-span-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Contact
          </p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Talk to our team
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
            Questions about pricing, integrations, or a shipment that needs
            attention — we&apos;re here for it.
          </p>
          <div className="mt-9 space-y-3">
            {[
              [Mail, "support@swiftship.example"],
              [Phone, "+234 700 000 0000"],
              [MapPin, "Dispatch HQ, Ibadan, Nigeria"],
            ].map(([Icon, value]) => (
              <div
                key={value as string}
                className="flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {value as string}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] sm:p-9 lg:col-span-3"
        >
          <div className="mb-8">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              Send us a note
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ll get back to you within one business day.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Jane Doe"
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@company.com"
                className={fieldClass}
              />
            </div>
          </div>
          <div className="mt-5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="Bulk shipping quote"
              className={fieldClass}
            />
          </div>
          <div className="mt-5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="Tell us what you need..."
              className={fieldClass}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send message"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve("Subscribed — welcome aboard."), 1000);
      }),
      {
        loading: "Subscribing...",
        success: "Subscribed — welcome aboard.",
        error: "Failed to subscribe.",
      },
    );
    e.currentTarget.reset();
  }

  return (
    <section className="bg-slate-950 px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-7 rounded-3xl border border-white/10 bg-white/4 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-display text-xl font-700 text-white">
            Get shipping tips in your inbox
          </h3>
          <p className="mt-1.5 text-sm text-navy-300">
            One email a month. No spam, unsubscribe anytime.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
          <Input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
          <Button
            type="submit"
            disabled={loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-slate-950 transition hover:bg-brand-400 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
