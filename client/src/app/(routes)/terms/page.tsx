import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    body: "By creating an account or using HYPE. (\"we\", \"us\", \"the platform\"), you agree to these Terms of Service. If you don't agree, please don't use the platform.",
  },
  {
    heading: "2. Who Can Use HYPE.",
    body: "You must be at least 18 years old and able to form a legally binding contract to buy, sell, or bid on HYPE. You're responsible for keeping your account credentials secure and for all activity under your account.",
  },
  {
    heading: "3. Listings & Authentication",
    body: "Sellers must accurately describe an item's condition, size, and authenticity. All accepted listings pass through our authentication centre before shipping to a buyer. Listings found to misrepresent an item may be removed, and repeat violations can result in account suspension.",
  },
  {
    heading: "4. Bidding & Auctions",
    body: "Placing a bid is a binding commitment to purchase the item at that price if you win. Auctions close using a soft-close mechanism — every new bid extends the closing window. Sellers may not bid on their own listings or use other accounts to inflate bids.",
  },
  {
    heading: "5. Payments & Payouts",
    body: "Winning bidders must complete payment within the payment window shown at checkout, or the item may be offered to the next highest bidder. Seller payouts are released once buyer payment is confirmed and the item is confirmed picked up by our logistics partner, less HYPE.'s commission.",
  },
  {
    heading: "6. Prohibited Conduct",
    body: "You may not use the platform to list counterfeit or stolen goods, manipulate bidding, harass other users, or attempt to circumvent our authentication or logistics process (including arranging direct buyer–seller contact or off-platform payment).",
  },
  {
    heading: "7. Limitation of Liability",
    body: "HYPE. is provided \"as is.\" We work to authenticate every item and facilitate a fair market, but we are not liable for indirect or consequential damages arising from your use of the platform, to the fullest extent permitted by law.",
  },
  {
    heading: "8. Termination",
    body: "We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users or the platform.",
  },
  {
    heading: "9. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of HYPE. after changes take effect means you accept the updated terms.",
  },
  {
    heading: "10. Contact",
    body: "Questions about these terms? Reach out through our Contact page and we'll get back to you within 24 hours.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />

      <section className="bg-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-lg">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-7xl">
            Terms of Service.
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
            <Link href="/privacy" className="border-b border-muted-on-sand/40 text-ink-on-sand hover:border-gold hover:text-gold">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
