"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Headphones,
  MapPin,
  Package,
  Route,
  ShieldCheck,
  Truck,
  Users,
  Zap,
} from "lucide-react";

const services = [
  {
    icon: Package,
    title: "Reliable Shipment Handling",
    description:
      "We provide a structured shipment experience from booking and processing through pickup, transportation, and final delivery.",
  },
  {
    icon: Truck,
    title: "Professional Delivery",
    description:
      "Our delivery operations are designed around clear processes, responsible handling, and dependable movement of packages.",
  },
  {
    icon: MapPin,
    title: "Shipment Tracking",
    description:
      "Customers can follow shipment progress and stay informed as their packages move through the delivery process.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Our support experience is built to help customers get assistance with shipments, delivery questions, and service-related concerns.",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Security",
    description:
      "We prioritize responsible shipment handling, secure account access, and transparent delivery information.",
  },
  {
    icon: Zap,
    title: "Efficiency",
    description:
      "We use streamlined processes and technology to reduce unnecessary delays and make logistics easier to manage.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "Every part of the platform is designed around making shipping clearer, simpler, and more convenient for customers.",
  },
  {
    icon: Route,
    title: "Operational Excellence",
    description:
      "We continuously improve our processes to create a more organized and dependable delivery experience.",
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
    title: "Shipment processing",
    description:
      "Your shipment is reviewed and processed through our logistics workflow before moving into delivery.",
  },
  {
    number: "03",
    title: "Pickup & transportation",
    description:
      "The package moves through the appropriate pickup and transportation stages while its status is updated.",
  },
  {
    number: "04",
    title: "Delivery",
    description:
      "Your shipment proceeds to final delivery, with delivery status updates keeping you informed.",
  },
];

export default function AboutSection() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_38%)]" />
        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur">
              <Globe2 className="h-4 w-4" />
              Logistics built around people and technology
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Moving what matters,
              <span className="block text-cyan-400">with confidence.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Emirate Global is a modern logistics and courier platform designed
              to make shipping more organized, transparent, and convenient for
              customers and delivery teams.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/customer/shipments/new"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-cyan-500"
              >
                Ship with us
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/#contact"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
              About Emirate Global
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              A simpler way to manage delivery.
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600">
              Logistics should not feel complicated. Emirate Global brings
              shipment creation, delivery management, tracking, payments,
              notifications, and customer support into one connected experience.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Our platform is built to connect customers, drivers, and
              administrators through a structured logistics workflow. From the
              moment a shipment is created to the moment it reaches its
              destination, each stage can be managed and monitored through the
              platform.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-600">
              By combining practical logistics operations with modern
              technology, we aim to make delivery more transparent and easier to
              manage for everyone involved.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-cyan-500">
                <Truck className="h-7 w-7" />
              </div>

              <h3 className="mt-7 font-display text-2xl font-bold text-slate-950">
                Built for modern logistics
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Emirate Global brings the different parts of a delivery
                operation together so that customers, drivers, and
                administrators can work from the same source of information.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  "Shipment management",
                  "Real-time status visibility",
                  "Driver operations",
                  "Payment management",
                  "Customer notifications",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
              Our mission
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Making logistics more connected and dependable.
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600">
              Our mission is to simplify the delivery experience through
              reliable operations, transparent communication, and technology
              that helps people stay connected to their shipments.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-cyan-500">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold text-slate-950">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
              What we do
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              One platform for the delivery journey.
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              From shipment creation to final delivery, Emirate Global provides
              the tools needed to coordinate and manage the logistics process.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-cyan-500 transition group-hover:bg-cyan-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-950">
                        {service.title}
                      </h3>

                      <p className="mt-3 leading-7 text-slate-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
              How it works
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A clear process from booking to delivery.
            </h2>

            <p className="mt-5 leading-8 text-slate-300">
              We structure the shipment journey into clear stages so that
              customers and delivery teams can understand what is happening at
              every step.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="font-mono text-sm font-semibold text-cyan-400">
                  {step.number}
                </span>

                <h3 className="mt-4 font-display text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
              Technology & operations
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Technology that supports the people behind every delivery.
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Our platform is designed to give customers visibility while
              providing administrators and drivers with the tools they need to
              manage logistics efficiently.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              From role-based access and shipment workflows to notifications,
              payment records, pricing, driver management, and proof of
              delivery, the system brings important operational information
              together in one place.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Structured shipment workflows",
                "Role-based customer, driver, and admin experiences",
                "Shipment status updates and tracking",
                "Integrated notification workflows",
                "Delivery and payment records",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                  <span className="text-sm leading-6 text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-8 shadow-xl sm:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Package,
                  title: "Shipments",
                  text: "Create and manage delivery orders.",
                },
                {
                  icon: MapPin,
                  title: "Tracking",
                  text: "Follow shipment progress.",
                },
                {
                  icon: Truck,
                  title: "Drivers",
                  text: "Coordinate delivery operations.",
                },
                {
                  icon: ShieldCheck,
                  title: "Security",
                  text: "Protect accounts and access.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <Icon className="h-6 w-6 text-cyan-400" />

                    <h3 className="mt-4 font-display font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
                Built around trust
              </p>

              <h2 className="mt-3 font-display text-2xl font-bold text-slate-950 sm:text-3xl">
                Every shipment deserves visibility and care.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                We believe a good logistics experience is more than moving a
                package from one location to another. It is about providing
                clear information, dependable processes, and support throughout
                the journey.
              </p>
            </div>

            <div className="mt-8 shrink-0 lg:mt-0">
              <Link
                href="/#track"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Track a shipment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cyan-600">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-8 lg:py-24">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to move your next shipment?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100">
            Create a shipment, choose your delivery option, and let Emirate
            Global help you manage the journey from start to finish.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/customer/shipments/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-cyan-500 transition hover:bg-slate-100"
            >
              Create a shipment
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/#contact"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Contact Emirate Global
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
