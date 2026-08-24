import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SECTIONS = [
  {
    heading: "1. Information We Collect",
    body: "We collect information you provide directly — your name, email, and password when you register, plus listing details, photos, and payment information when you buy or sell. We also collect usage data like pages visited and bids placed to keep the platform running smoothly.",
  },
  {
    heading: "2. How We Use Your Information",
    body: "We use your information to operate your account, process listings and bids, facilitate payments and payouts, verify item authenticity, and communicate with you about orders, auctions, and account activity.",
  },
  {
    heading: "3. Sharing Your Information",
    body: "We share the minimum necessary information with our logistics and payment partners to complete a transaction. We don't sell your personal data to third parties. Buyers and sellers never see each other's contact details — all pickup and delivery goes through our logistics partner.",
  },
  {
    heading: "4. Cookies",
    body: "We use cookies to keep you signed in and to understand how the platform is used, so we can improve it. You can control cookies through your browser settings, though some features may not work correctly without them.",
  },
  {
    heading: "5. Data Retention",
    body: "We retain account and transaction data for as long as your account is active and as needed to meet legal, accounting, and dispute-resolution requirements.",
  },
  {
    heading: "6. Your Rights",
    body: "You can access, update, or request deletion of your personal information at any time by contacting us. Some information tied to completed transactions may be retained where required by law.",
  },
  {
    heading: "7. Security",
    body: "We use industry-standard measures — including encrypted password storage and secure payment processing — to protect your information. No system is perfectly secure, so we encourage you to use a strong, unique password.",
  },
  {
    heading: "8. Changes to This Policy",
    body: "We may update this policy from time to time. We'll post the updated version here with a new \"last updated\" date.",
  },
  {
    heading: "9. Contact",
    body: "Questions about how we handle your data? Reach out through our Contact page and we'll get back to you within 24 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />

      <section className="bg-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-lg">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-7xl">
            Privacy Policy.
          </h1>
          <p className="mt-4 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">Last updated August 2026</p>
        </div>
      </section>

      <main className="flex-1 bg-sand px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto flex max-w-screen-lg flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.heading}>
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight text-ink-on-sand md:text-3xl">
                {s.heading}
              </h2>
              <p className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-sm leading-relaxed text-muted-on-sand md:text-base">
                {s.body}
              </p>
            </div>
          ))}

          <p className="border-t border-ink-on-sand/10 pt-8 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
            See also our{" "}
            <Link href="/terms" className="border-b border-muted-on-sand/40 text-ink-on-sand hover:border-gold hover:text-gold">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
