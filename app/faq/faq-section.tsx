"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  CreditCard,
  HelpCircle,
  Package,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: FAQ[];
};

const faqCategories: FAQCategory[] = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    questions: [
      {
        question: "What is Emirate Global?",
        answer:
          "Emirate Global is a logistics and courier platform designed to make shipment creation, delivery management, tracking, and customer communication easier. Customers can create shipments and monitor their delivery progress through the platform.",
      },
      {
        question: "What services does Emirate Global provide?",
        answer:
          "Emirate Global provides shipment booking, package transportation, delivery management, shipment tracking, customer notifications, delivery status updates, and support services. Available services may depend on your location and the options configured by the company.",
      },
      {
        question: "Where does Emirate Global operate?",
        answer:
          "Service availability depends on the delivery locations currently supported by Emirate Global. During shipment creation, the available origin and destination information can be used to determine whether a shipment can be processed.",
      },
      {
        question: "How do I contact Emirate Global?",
        answer:
          "You can contact the support team through the Contact page, email, phone, or any other support channel provided by Emirate Global. If your enquiry concerns an existing shipment, include your tracking number where possible.",
      },
      {
        question: "Do I need an account to ship a package?",
        answer:
          "Yes. Customers need an account to create and manage shipments through the customer dashboard. Creating an account also allows you to access your shipment history, payments, notifications, and other account features.",
      },
    ],
  },

  {
    id: "account",
    label: "Account",
    icon: UserRound,
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Select the Sign Up or Create Account option on the website and provide the required information. After completing the registration process, you can sign in and access your customer dashboard.",
      },
      {
        question: "Who can create a customer account?",
        answer:
          "Customers can create their own accounts through the public registration process. Driver and administrative accounts are managed separately by authorized administrators.",
      },
      {
        question: "Can I change my account information?",
        answer:
          "Yes. Depending on the information and account settings available to you, you can update your profile information from your customer settings. Some account information may require assistance from support.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          "Use the password reset option on the login page and follow the instructions provided. If you cannot complete the reset process, contact support for assistance.",
      },
      {
        question: "Why can't I log into my account?",
        answer:
          "Check that your email address and password are correct and that your internet connection is working. If your account has been deactivated or you continue to experience problems, contact support so the account can be reviewed.",
      },
      {
        question: "Can I have more than one account?",
        answer:
          "Customers should generally use one account for their shipments and account activity. If you need multiple users or accounts for a business operation, contact Emirate Global to discuss the appropriate arrangement.",
      },
    ],
  },

  {
    id: "shipments",
    label: "Shipments",
    icon: Package,
    questions: [
      {
        question: "How do I create a shipment?",
        answer:
          "Sign in to your customer account and open the shipment creation page. Enter the required sender, recipient, package, destination, and delivery information, review the estimated cost, select the available delivery option, and confirm the shipment.",
      },
      {
        question: "What information do I need to create a shipment?",
        answer:
          "You generally need sender and recipient information, pickup and destination details, package information, package weight, package type, and the requested delivery option. Additional information may be required depending on the shipment.",
      },
      {
        question: "What types of packages can I send?",
        answer:
          "The platform supports package categories such as documents, parcels, fragile items, electronics, food, and other permitted items. Availability and restrictions may vary according to the shipment type and applicable regulations.",
      },
      {
        question: "Is there a weight limit?",
        answer:
          "Weight limits depend on the services and operational rules configured by Emirate Global. Enter the package weight accurately when creating a shipment. If your package exceeds the available limits, contact support before arranging delivery.",
      },
      {
        question: "Can I send fragile items?",
        answer:
          "Fragile shipments can be identified as fragile during shipment creation where that option is available. Fragile items should also be properly packaged before handover. Additional charges may apply to fragile handling.",
      },
      {
        question: "Can I send electronics?",
        answer:
          "Electronics can be selected as a package category where supported. Customers are responsible for appropriate packaging and should contact support if the item has special transportation requirements.",
      },
      {
        question: "Can I send food?",
        answer:
          "Food shipments may be supported depending on the type of food, destination, packaging requirements, and applicable restrictions. Contact support before shipping items that require temperature control, special handling, or have a limited shelf life.",
      },
      {
        question: "What items are prohibited?",
        answer:
          "Prohibited items can include dangerous, illegal, restricted, or otherwise unsuitable materials. Customers should not attempt to ship prohibited items. If you are unsure whether an item can be transported, contact Emirate Global before creating the shipment.",
      },
      {
        question:
          "Can I change shipment information after creating a shipment?",
        answer:
          "Some shipment information may be changeable before processing or pickup, while other information may require support assistance. Contact support as soon as possible if you discover an error.",
      },
      {
        question: "Can I cancel a shipment?",
        answer:
          "Cancellation availability depends on the shipment's current status. A shipment may be cancellable before certain processing or delivery stages. If the cancellation option is unavailable, contact support for assistance.",
      },
    ],
  },

  {
    id: "pricing",
    label: "Pricing",
    icon: CreditCard,
    questions: [
      {
        question: "How is my shipping cost calculated?",
        answer:
          "Shipping charges can depend on factors such as package weight, package type, special handling, delivery speed, and the pricing rules configured by Emirate Global. The platform calculates an estimated shipment price from the information you provide.",
      },
      {
        question: "Does package weight affect the price?",
        answer:
          "Yes. Package weight can affect the shipping cost. Customers should provide an accurate weight when creating a shipment because the final charge may depend on the actual shipment details.",
      },
      {
        question: "Is there an additional fee for fragile packages?",
        answer:
          "A fragile handling fee may apply when a shipment is marked as fragile. The applicable amount depends on the pricing configuration used by Emirate Global.",
      },
      {
        question: "What is Express delivery?",
        answer:
          "Express delivery is a faster delivery option where available. Selecting Express may result in an additional delivery fee compared with the standard delivery option.",
      },
      {
        question: "What is Standard delivery?",
        answer:
          "Standard delivery is the regular delivery option. It is intended for customers who do not require the additional speed associated with an Express service.",
      },
      {
        question: "Can the shipping price change?",
        answer:
          "The estimated price is based on the information entered during shipment creation and the current pricing configuration. If shipment details change or additional services are required, the final amount may differ.",
      },
      {
        question: "Where can I see the price before confirming my shipment?",
        answer:
          "The shipment creation page displays an estimated total based on the package information and delivery option you select before you confirm the shipment.",
      },
    ],
  },

  {
    id: "tracking",
    label: "Tracking",
    icon: Truck,
    questions: [
      {
        question: "How do I track my shipment?",
        answer:
          "Use the shipment tracking feature and enter your tracking number. You can also view shipment information and status updates from your customer dashboard after signing in.",
      },
      {
        question: "Where can I find my tracking number?",
        answer:
          "Your tracking number is associated with the shipment after it is created. You can find it in your shipment details, shipment history, and relevant shipment notifications.",
      },
      {
        question: "What do the shipment statuses mean?",
        answer:
          "Shipment statuses describe the current stage of your delivery. They can include Pending, Approved, Picked Up, In Transit, Arrived at Warehouse, Out for Delivery, Delivered, or Cancelled.",
      },
      {
        question: "What does Pending mean?",
        answer:
          "Pending means the shipment has been created but has not yet completed the next processing stage.",
      },
      {
        question: "What does Approved mean?",
        answer:
          "Approved means the shipment has passed the applicable approval or processing stage and can proceed through the delivery workflow.",
      },
      {
        question: "What does Picked Up mean?",
        answer:
          "Picked Up means the shipment has been collected and is now moving through the delivery process.",
      },
      {
        question: "What does In Transit mean?",
        answer:
          "In Transit means the shipment is currently being transported toward its destination or the next stage of the delivery network.",
      },
      {
        question: "What does Arrived at Warehouse mean?",
        answer:
          "This status indicates that the shipment has arrived at a warehouse or processing location as part of its delivery journey.",
      },
      {
        question: "What does Out for Delivery mean?",
        answer:
          "Out for Delivery means the shipment has entered the final delivery stage and is being taken toward the recipient.",
      },
      {
        question: "What does Delivered mean?",
        answer:
          "Delivered means the shipment has been marked as successfully delivered through the delivery workflow.",
      },
      {
        question: "What does Cancelled mean?",
        answer:
          "Cancelled means the shipment will no longer continue through the normal delivery workflow.",
      },
      {
        question: "Why hasn't my tracking information changed?",
        answer:
          "Tracking information may not change immediately between delivery stages. If your shipment appears to remain at the same status for an unusually long period, contact support with your tracking number.",
      },
    ],
  },

  {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
    questions: [
      {
        question: "How long does delivery take?",
        answer:
          "Delivery time depends on the origin, destination, selected delivery service, shipment characteristics, and operational conditions. Standard and Express options may have different expected delivery times.",
      },
      {
        question: "Will I receive delivery notifications?",
        answer:
          "The platform can provide notifications for important shipment events, including delivery status changes. The notifications available to you depend on the shipment stage and your account settings.",
      },
      {
        question: "What happens if the recipient is unavailable?",
        answer:
          "If a recipient is unavailable during delivery, the delivery team may follow the applicable delivery procedure, which can include another attempt or contacting the appropriate party. Contact support if you need assistance with a missed delivery.",
      },
      {
        question: "Can someone else receive my package?",
        answer:
          "Whether another person can receive a package depends on the delivery circumstances and applicable verification requirements. Contact support if someone else needs to receive the shipment on your behalf.",
      },
      {
        question: "What is proof of delivery?",
        answer:
          "Proof of delivery is information recorded to confirm that a shipment was delivered. Depending on the delivery process, this may include delivery details or supporting evidence recorded by the delivery team.",
      },
      {
        question: "What should I do if my package is damaged?",
        answer:
          "Contact Emirate Global support as soon as possible and provide your tracking number and relevant details about the condition of the package. Photographs and other supporting information may help with the investigation.",
      },
      {
        question: "What should I do if my package is missing?",
        answer:
          "Contact support immediately and provide your tracking number. The support team can review the shipment status and available delivery records.",
      },
      {
        question: "What if I receive the wrong package?",
        answer:
          "Do not use or alter the package. Contact support and provide your tracking number and the information available on the package so the issue can be investigated.",
      },
    ],
  },

  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods are supported?",
        answer:
          "Available payment methods can include card, bank transfer, wallet, and cash on delivery, depending on what has been enabled for your account and shipment.",
      },
      {
        question: "When do I need to pay for my shipment?",
        answer:
          "Payment timing depends on the payment method and shipment configuration. The platform will show the applicable payment information during the shipment and payment process.",
      },
      {
        question: "How do I know if my payment was successful?",
        answer:
          "A successful payment is reflected in the payment status associated with your shipment. You may also receive a payment confirmation notification when available.",
      },
      {
        question: "My payment failed. What should I do?",
        answer:
          "Check the payment information and try again if appropriate. If your payment continues to fail or your account was charged despite a failed status, contact support with the relevant payment and shipment details.",
      },
      {
        question:
          "I was charged but my payment still shows as pending. What should I do?",
        answer:
          "Do not repeatedly submit the same payment without checking the transaction status. Contact support and provide the shipment and payment details so the transaction can be reviewed.",
      },
      {
        question: "Can I get a refund?",
        answer:
          "Refund availability depends on the circumstances of the transaction, shipment status, payment method, and applicable refund policy. Contact support if you believe a refund is required.",
      },
      {
        question: "Where can I see my payment history?",
        answer:
          "Customers can view available payment information through the Payments section of their customer dashboard.",
      },
    ],
  },

  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    questions: [
      {
        question: "Is my account information secure?",
        answer:
          "Emirate Global uses account authentication and controlled access to protect customer information. Customers should also use strong passwords and never share their login credentials with other people.",
      },
      {
        question: "Does Emirate Global store my payment card details?",
        answer:
          "Payment information is handled according to the payment processing configuration used by the platform. Customers should never send card numbers, CVVs, passwords, or other sensitive credentials through the contact form or support messages.",
      },
      {
        question: "Should I share my password with support?",
        answer:
          "No. Never share your password, authentication codes, card PIN, CVV, or other account credentials with anyone, including someone claiming to be support.",
      },
      {
        question: "What should I do if I think someone accessed my account?",
        answer:
          "Change your password as soon as possible and contact support. Review your recent account and shipment activity and report anything you do not recognize.",
      },
    ],
  },

  {
    id: "support",
    label: "Support",
    icon: Clock3,
    questions: [
      {
        question: "How do I contact customer support about a shipment?",
        answer:
          "Use the Contact page or the available support channels and provide your tracking number, a description of the issue, and any relevant information. This helps the support team identify your shipment more quickly.",
      },
      {
        question: "What information should I provide when contacting support?",
        answer:
          "For shipment-related issues, provide your tracking number, the email associated with your account, a clear description of the problem, and any relevant dates or supporting information. Never include your password or full payment credentials.",
      },
      {
        question: "How quickly will support respond?",
        answer:
          "Response times depend on the type of enquiry, support availability, and the complexity of the issue. Urgent shipment problems should include the tracking number and clear details so they can be reviewed efficiently.",
      },
      {
        question: "Can I contact support about someone else's shipment?",
        answer:
          "Support may require appropriate authorization or verification before discussing shipment information belonging to another person. This helps protect customer privacy and shipment security.",
      },
      {
        question: "What if my question isn't answered here?",
        answer:
          "If you cannot find the information you need, contact the Emirate Global support team. Include as much relevant information as possible so the team can assist you.",
      },
    ],
  },
];

const allQuestions = faqCategories.flatMap((category) =>
  category.questions.map((question) => ({
    ...question,
    category: category.label,
    categoryId: category.id,
  })),
);

export default function FAQsection() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return (
        faqCategories.find((category) => category.id === activeCategory)
          ?.questions ?? []
      );
    }

    return allQuestions.filter(
      (question) =>
        question.question.toLowerCase().includes(query) ||
        question.answer.toLowerCase().includes(query) ||
        question.category.toLowerCase().includes(query),
    );
  }, [activeCategory, search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_38%)]" />
        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur">
              <HelpCircle className="h-4 w-4" />
              Help & frequently asked questions
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              How can we
              <span className="block text-cyan-400">help you?</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Find answers about shipments, pricing, tracking, payments,
              delivery, accounts, security, and customer support.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-10 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setOpenQuestion(null);
                }}
                placeholder="Search questions..."
                className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-sm text-slate-950 shadow-xl outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          {/* Categories */}
          <aside>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Categories
            </p>

            <div className="space-y-2 lg:sticky lg:top-24">
              {faqCategories.map((category) => {
                const Icon = category.icon;
                const active = activeCategory === category.id && !search;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearch("");
                      setOpenQuestion(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Questions */}
          <div>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
                {search
                  ? `Search results`
                  : faqCategories.find(
                      (category) => category.id === activeCategory,
                    )?.label}
              </p>

              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950">
                Frequently asked questions
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {search
                  ? `${filteredQuestions.length} result${
                      filteredQuestions.length === 1 ? "" : "s"
                    } found.`
                  : "Select a question to view the answer."}
              </p>
            </div>

            {filteredQuestions.length > 0 ? (
              <div className="space-y-3">
                {filteredQuestions.map((item, index) => {
                  const key = `${item.question}-${index}`;
                  const isOpen = openQuestion === key;

                  return (
                    <div
                      key={key}
                      className={`overflow-hidden rounded-2xl border bg-white transition ${
                        isOpen
                          ? "border-blue-200 shadow-sm"
                          : "border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenQuestion(isOpen ? null : key)}
                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="font-semibold leading-6 text-slate-950">
                          {item.question}
                        </span>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                            isOpen
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                          <p className="text-sm leading-7 text-slate-600">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-display text-xl font-semibold text-slate-950">
                  No matching questions
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  We couldn't find an answer matching your search. Try a
                  different search term or contact our support team.
                </p>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                >
                  Contact support
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick answers */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Quick answers
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950">
              Looking for something specific?
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/customer/shipments/new"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40"
            >
              <Package className="h-6 w-6 text-cyan-600" />

              <h3 className="mt-4 font-semibold text-slate-950">
                Create a shipment
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Start a new delivery and get your shipment estimate.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600">
                Get started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/#track"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40"
            >
              <Truck className="h-6 w-6 text-cyan-600" />

              <h3 className="mt-4 font-semibold text-slate-950">
                Track a shipment
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Check the current status of an existing shipment.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600">
                Track now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/contact"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40"
            >
              <HelpCircle className="h-6 w-6 text-cyan-600" />

              <h3 className="mt-4 font-semibold text-slate-950">Get help</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact our team about a shipment or account issue.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600">
                Contact us
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/about"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40"
            >
              <ShieldCheck className="h-6 w-6 text-cyan-600" />

              <h3 className="mt-4 font-semibold text-slate-950">
                About Emirate Global
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Learn more about our platform and logistics operations.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600">
                Learn more
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-12 text-center sm:px-12 sm:py-16">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-600/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white">
              <HelpCircle className="h-5 w-5" />
            </div>

            <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
              Still have questions?
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              If you couldn't find the answer you're looking for, our support
              team is ready to help with your shipment or account.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Contact support
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/customer/shipments/new"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create a shipment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
