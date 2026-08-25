import Link from "next/link";
import { PackageSearch } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      ["Services", "#services"],
      ["Pricing", "#pricing"],
      ["Track a shipment", "#track"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#"],
      ["Careers", "#"],
      ["Contact", "#contact"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["FAQ", "#faq"],
      ["Help center", "#"],
      ["API docs", "#"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "#"],
      ["Terms of service", "#"],
      ["Shipping policy", "#"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="container-lg py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-700 text-navy-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-brand-500">
                <PackageSearch className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              Integrity<span className="text-brand-500">Logistics</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-navy-500">
              Real-time logistics and courier management for businesses that
              ship every day.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-600 text-navy-900">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-navy-500 transition-colors hover:text-brand-600"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-6 sm:flex-row">
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} Integrity Logistics. All rights
            reserved.
          </p>
          <p className="font-mono text-xs text-navy-300">SS-HQ · Ilorin, NG</p>
        </div>
      </div>
    </footer>
  );
}
