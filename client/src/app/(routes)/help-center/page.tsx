"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Faq = { q: string; a: string };
type FaqCategory = { heading: string; items: Faq[] };

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    heading: "Buying",
    items: [
      {
        q: "How does bidding work?",
        a: "Every live listing has a current price and a minimum next bid. Place a bid at or above that amount and you become the highest bidder. Auctions use a soft close — every new bid extends the closing window, so there's never a last-second snipe you can't respond to.",
      },
      {
        q: "What happens if I win an auction?",
        a: "You'll get a notification and a payment window to complete checkout. Once payment is confirmed, the item goes through authentication and then ships to you. If payment isn't completed in time, the item goes to the next highest bidder.",
      },
      {
        q: "Are the items authentic?",
        a: "Yes. Every item passes through our authentication centre before it's shipped to a buyer. If an item fails authentication, the sale is cancelled and the buyer is fully refunded.",
      },
    ],
  },
  {
    heading: "Selling",
    items: [
      {
        q: "How do I list an item?",
        a: "Head to Sell With Us, search for your product, add condition details and photos, and set your starting bid price. Submitted listings are reviewed before they go live.",
      },
      {
        q: "What does HYPE. charge to sell?",
        a: "A flat commission on the final sale price — 8% on sales under ₹50,000, 10% at or above. No listing fees, no hidden charges.",
      },
      {
        q: "When do I get paid?",
        a: "Payouts are released once the buyer's payment is confirmed and the item has been picked up by our logistics partner. You can track payout status from your seller dashboard.",
      },
    ],
  },
  {
    heading: "Payments & Orders",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We support all major cards, UPI, and net banking through our payment partner.",
      },
      {
        q: "Can I cancel an order after winning?",
        a: "Winning bids are binding. If you no longer want the item, contact support as soon as possible — cancellations are handled on a case-by-case basis before the item ships.",
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        q: "How do I become a verified seller?",
        a: "Verification happens automatically once one of your listings is reviewed and accepted — no separate application needed.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Use the \"Forgot password?\" link on the sign-in page to get a reset code sent to your email.",
      },
    ],
  },
];

function FaqItem({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink-on-sand/10 py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 text-left"
      >
        <span className="font-[family-name:var(--font-barlow)] text-base font-medium text-ink-on-sand md:text-lg">
          {item.q}
        </span>
        <ChevronIcon className={`h-4 w-4 shrink-0 text-muted-on-sand transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-sm leading-relaxed text-muted-on-sand md:text-base">
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />

      {/* Hero */}
      <section className="bg-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-xl">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-7xl lg:text-8xl">
            Help Center.
          </h1>
          <p className="mt-4 max-w-xl font-[family-name:var(--font-barlow)] text-sm tracking-wide text-gray-on-dark md:text-base">
            Answers to the questions we hear most. Can&apos;t find what you need?{" "}
            <Link href="/contact" className="border-b border-gray-on-dark/40 text-paper hover:border-tan hover:text-tan">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <main className="flex-1 bg-sand px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-lg">
          <div className="flex flex-col gap-14">
            {FAQ_CATEGORIES.map((cat) => (
              <div key={cat.heading}>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight text-ink-on-sand md:text-3xl">
                  {cat.heading}
                </h2>
                <div className="mt-2">
                  {cat.items.map((item) => (
                    <FaqItem key={item.q} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
