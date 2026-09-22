import { Navbar } from "@/components/landing/navbar";
import Link from "next/link";
import ContactSection from "./contact-section";

export default function ContactPage() {
  return (
    <div>
      <Navbar />
      <ContactSection />
    </div>
  );
}
