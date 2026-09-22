import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const contactOptions = [
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Need help with a shipment, delivery, tracking, or your account? Our support team is here to help.",
    action: "Get Support",
    href: "/#contact",
  },
  {
    icon: PackageIcon,
    title: "Shipment Enquiries",
    description:
      "Have a question about sending a package, delivery options, pricing, or shipment status?",
    action: "Start Shipping",
    href: "/customer/shipments/new",
  },
  {
    icon: MessageCircle,
    title: "General Enquiries",
    description:
      "For general questions about Emirate Global and our logistics services, reach out to our team.",
    action: "Contact Us",
    href: "mailto:support@emirateglobal.com",
  },
];

function PackageIcon(props: React.ComponentProps<typeof Send>) {
  return <Send {...props} />;
}

export default function ContactSection() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_38%)]" />
        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur">
              <MessageCircle className="h-4 w-4" />
              We're here to help
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Let's talk about
              <span className="block text-blue-400">your delivery.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Whether you have a question about a shipment, need assistance with
              your account, or want to learn more about our logistics services,
              our team is ready to help.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:support@emirateglobal.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Email our team
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/customer/shipments/new"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create a shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact options */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
            How can we help?
          </p>

          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Get in touch with Emirate Global
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Choose the option that best matches what you need and we'll help you
            find the right next step.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <div
                key={option.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-slate-950">
                  {option.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {option.description}
                </p>

                <Link
                  href={option.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 transition hover:text-cyan-500"
                >
                  {option.action}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main contact section */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
          {/* Contact information */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Contact information
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              We're ready to assist.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-slate-600">
              Reach out through any of the channels below. For shipment
              enquiries, having your tracking number available can help us
              assist you faster.
            </p>

            <div className="mt-10 space-y-6">
              <Link
                href="mailto:support@emirateglobal.com"
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-cyan-50/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    support@emirateglobal.com
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    For general and shipment enquiries
                  </p>
                </div>
              </Link>

              <Link
                href="tel:+2340000000000"
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-cyan-50/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">Phone</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    +234 000 000 0000
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Customer support line
                  </p>
                </div>
              </Link>

              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">Office</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    Ilorin, Nigeria
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Emirate Global headquarters
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Support hours
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    Monday – Saturday
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    8:00 AM – 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="mb-8">
              <h3 className="font-display text-2xl font-bold text-slate-950">
                Send us a message
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Complete the form below and our team can get back to you.
              </p>
            </div>

            <form className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    First name
                  </Label>

                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Your first name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Last name
                  </Label>

                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Your last name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </Label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2"
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </Label>

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 ..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2"
                />
              </div>

              <div>
                <Label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Subject
                </Label>

                <select
                  id="subject"
                  name="subject"
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="shipment">Shipment enquiry</option>
                  <option value="tracking">Tracking enquiry</option>
                  <option value="delivery">Delivery enquiry</option>
                  <option value="account">Account support</option>
                  <option value="business">Business enquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label
                  htmlFor="trackingNumber"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Tracking number{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </Label>

                <Input
                  id="trackingNumber"
                  name="trackingNumber"
                  type="text"
                  placeholder="e.g. EG123456789"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2"
                />
              </div>

              <div>
                <Label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Message
                </Label>

                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Send message
                <Send className="h-4 w-4" />
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                Please do not include passwords, payment card details, or other
                sensitive information in this form.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Tracking CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-navy-800 px-8 py-12 sm:px-12 sm:py-16">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Already shipped?
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Need an update on your shipment?
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Use our shipment tracking experience to check the current status
                of your package and follow its progress.
              </p>
            </div>

            <Link
              href="/#track"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Track a shipment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
