import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { TrackingSection } from "@/components/landing/tracking-section";
import { ServiceCards } from "@/components/landing/service-cards";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import {
  ContactForm,
  Newsletter,
} from "@/components/landing/contact-newsletter";
import { Footer } from "@/components/landing/footer";

// HSjyebVac43SdT9L

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <TrackingSection />
      <ServiceCards />
      <Testimonials />
      <Pricing />
      <FAQ />
      <ContactForm />
      <Newsletter />
      <Footer />
    </main>
  );
}
