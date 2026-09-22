import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  GlobeCheck,
  Headphones,
  MapPin,
  Package,
  Route,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const services = [
  {
    icon: Package,
    title: "Reliable Shipment Handling",
    description:
      "From documents to parcels and special items, we help move your shipments safely from pickup to final delivery.",
  },
  {
    icon: Truck,
    title: "Professional Delivery",
    description:
      "Our delivery workflow is designed to keep shipments organized, visible, and moving efficiently.",
  },
  {
    icon: Route,
    title: "Real-Time Tracking",
    description:
      "Track your shipment using its tracking number and stay informed throughout the delivery journey.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Get assistance when you need it with a support experience built around your shipment and delivery needs.",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Shipment information and account access are handled through a secure platform with role-based access.",
  },
  {
    icon: Zap,
    title: "Efficient Operations",
    description:
      "From shipment creation to delivery updates, every stage is organized to reduce unnecessary delays.",
  },
  {
    icon: Clock3,
    title: "Clear Delivery Updates",
    description:
      "Stay informed as your shipment moves through processing, transportation, and delivery.",
  },
  {
    icon: Globe2,
    title: "Built to Grow",
    description:
      "Our logistics platform is designed to support customers, drivers, and operations as the business expands.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your shipment",
    description:
      "Enter your shipment details, package information, destination, and preferred delivery option.",
  },
  {
    number: "02",
    title: "We process your shipment",
    description:
      "Your shipment is reviewed and prepared for pickup and transportation.",
  },
  {
    number: "03",
    title: "Track its journey",
    description:
      "Use your tracking number to follow important shipment status updates.",
  },
  {
    number: "04",
    title: "Receive your delivery",
    description:
      "Your shipment is delivered to the destination and the delivery status is recorded.",
  },
];

const faqs = [
  {
    question: "How do I create a shipment?",
    answer:
      "Create an account, sign in, and use the shipment creation page to provide your package and delivery details.",
  },
  {
    question: "Can I track my shipment?",
    answer:
      "Yes. Once your shipment has a tracking number, you can use the tracking feature to check its current status.",
  },
  {
    question: "What is Express delivery?",
    answer:
      "Express delivery is a faster delivery option available when selected during shipment creation. Availability and pricing depend on your shipment settings.",
  },
  {
    question: "How will I know when my shipment is delivered?",
    answer:
      "Shipment status updates are recorded throughout the delivery process, including the final delivered status.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[88vh] overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-[url('/hero-logistics.jpg')] bg-cover bg-center"
          aria-hidden="true"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/10" aria-hidden="true" />

        {/* Content */}
        <div className="relative flex min-h-[88vh] items-center">
          <div className="container-lg mx-auto w-full px-4 py-16 sm:px-6 lg:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              {/* Hero content */}
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Reliable logistics. Smarter delivery.
                </div>

                <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:mx-0 lg:text-6xl">
                  Moving what matters,
                  <span className="block text-cyan-400">with confidence.</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg lg:mx-0">
                  Emirate Global provides a modern logistics and courier
                  experience for individuals and businesses. Create shipments,
                  track deliveries, manage payments, and stay informed from
                  pickup to destination.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="w-full bg-cyan-500 px-7 text-white hover:bg-cyan-400 sm:w-auto"
                    >
                      Ship with us
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-slate-700 bg-transparent px-7 text-white hover:bg-slate-800 hover:text-white sm:w-auto"
                    >
                      Learn more
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-300 lg:justify-start">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Easy shipment creation
                  </span>

                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Shipment tracking
                  </span>

                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Delivery updates
                  </span>
                </div>
              </div>

              {/* Tracking card */}
              <div
                id="track"
                className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md sm:p-6"
              >
                <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-7">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Search className="h-6 w-6 text-cyan-600" />
                  </div>

                  <h2 className="font-display text-2xl font-semibold text-slate-900">
                    Track your shipment
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your tracking number to check the latest available
                    shipment status. No account required.
                  </p>

                  <form action="/track" method="get" className="mt-6 space-y-3">
                    <Label
                      htmlFor="tracking-number"
                      className="text-sm font-medium text-slate-700"
                    >
                      Tracking number
                    </Label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="tracking-number"
                        name="tracking"
                        type="text"
                        placeholder="e.g. EMG123456789"
                        className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                      />

                      <Button
                        type="submit"
                        className="h-11 bg-slate-900 px-5 text-white hover:bg-slate-800"
                      >
                        Track
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-cyan-600" />
                      Your shipment information is handled through our secure
                      platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-white py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
              Our services
            </span>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to move shipments with confidence
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              From the moment you create a shipment to the moment it reaches its
              destination, Emirate Global keeps the process organized and
              visible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                    <Icon className="h-6 w-6 text-cyan-700" />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-navy-800 py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                Why Emirate Global
              </span>

              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                A logistics experience designed around visibility and trust.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Logistics should not feel complicated. Our platform brings
                shipment management, tracking, delivery operations, payments,
                and notifications together in one connected experience.
              </p>

              <div className="mt-7">
                <Link href="/about">
                  <Button variant="outline">
                    Discover Emirate Global
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold text-white">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
              How it works
            </span>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple from shipment creation to delivery
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Our workflow keeps each stage clear so you know what happens next.
            </p>
          </div>

          <div className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(100%-20px)] top-6 hidden h-px w-[calc(100%-10px)] bg-slate-200 lg:block" />
                )}

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 font-mono text-sm font-semibold text-cyan-700">
                    {step.number}
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery options */}
      <section id="pricing" className="bg-navy-800 py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Delivery options
            </span>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Choose the delivery speed that works for you
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-400">
              Select the delivery option that matches your timing and shipment
              requirements.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
                <Truck className="h-5 w-5 text-cyan-400" />
              </div>

              <h3 className="mt-5 font-display text-2xl font-semibold text-white">
                Standard Delivery
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                A dependable option for shipments where standard delivery timing
                meets your needs.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  Standard delivery processing
                </li>

                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  Shipment tracking
                </li>

                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  Delivery status notifications
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>

              <h3 className="mt-5 font-display text-2xl font-semibold text-white">
                Express Delivery
              </h3>

              <p className="mt-3 leading-7 text-slate-300">
                Choose Express when your shipment requires a faster delivery
                option.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  Priority delivery option
                </li>

                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  Shipment tracking
                </li>

                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  Delivery status notifications
                </li>
              </ul>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-slate-500">
            Delivery availability, pricing, and timing may depend on shipment
            details, destination, package characteristics, and operational
            conditions.
          </p>
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-white py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                  <MapPin className="h-6 w-6 text-cyan-700" />
                </div>

                <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-slate-900">
                  Built for connected delivery operations
                </h2>

                <p className="mt-5 leading-7 text-slate-600">
                  Emirate Global combines customer shipment management with
                  driver operations and administrative oversight, creating one
                  connected system for managing deliveries.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "Customer shipment management",
                    "Driver delivery workflows",
                    "Administrative shipment oversight",
                    "Tracking and delivery notifications",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium text-slate-700"
                    >
                      <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-80 overflow-hidden bg-navy-800 p-8 sm:p-12">
                <div className="relative flex h-full min-h-65 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
                      <GlobeCheck className="h-9 w-9 text-cyan-400" />
                    </div>

                    <h3 className="mt-6 font-display text-xl font-semibold text-white">
                      One connected logistics platform
                    </h3>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                      Customers, drivers, and administrators stay connected
                      through the same operational workflow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-slate-50 py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                Frequently asked questions
              </span>

              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Have questions?
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Here are some of the questions customers commonly ask about
                shipments, tracking, payments, and delivery.
              </p>
            </div>

            <Link href="/faq">
              <Button variant="outline">
                View all FAQs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  {faq.question}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="bg-white py-20">
        <div className="container-lg mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.14),transparent_55%)]" />

            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
                <Package className="h-7 w-7 text-cyan-400" />
              </div>

              <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to move your shipment?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
                Create your shipment today and experience a simpler way to
                manage deliveries from start to finish.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full bg-cyan-500 px-7 text-slate-950 hover:bg-cyan-400 sm:w-auto"
                  >
                    Create an account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-slate-700 bg-transparent px-7 text-white hover:bg-slate-800 hover:text-white sm:w-auto"
                  >
                    Contact us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
