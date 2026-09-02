export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Live", href: "/live" },
  { label: "Upcoming", href: "/upcoming" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const stats = [
  { icon: "auctions", value: "12", label: "Live Auctions" },
  { icon: "users", value: "1.2K", label: "Users Watching" },
  { icon: "volume", value: "₹2.4 CR+", label: "Total Volume" },
] as const;

export const howItWorksSteps = [
  {
    number: "01",
    title: "List",
    description: "List your authentic item in minutes.",
    icon: "list",
  },
  {
    number: "02",
    title: "Bid",
    description: "Real-time bidding decides the price.",
    icon: "hammer",
  },
  {
    number: "03",
    title: "Own",
    description: "Highest bid wins. We authenticate & deliver.",
    icon: "box",
  },
] as const;

export const marketMoves = [
  "Nike Dunk Low sold for ₹19,200",
  "Yeezy 350 Beluga highest bid ₹25,500",
  "Supreme Tee sold for ₹8,500",
  "Off-White Air Jordan 1 new bid ₹83,200",
] as const;

// Every link here must point to a real, working route — no "#" placeholders
// and no dead ends. Add the page first, then add the entry.
export const footerColumns = [
  {
    heading: "Market",
    links: [
      { label: "Live Auctions", href: "/live" },
      { label: "Upcoming", href: "/upcoming" },
      { label: "Sold", href: "/sold" },
      { label: "Saved", href: "/saved" },
    ],
  },
  {
    heading: "Sell",
    links: [
      { label: "Sell With Us", href: "/sell-with-us" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Contact Us", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
] as const;

export const footerBrand = {
  name: "HYPE.",
  tagline: "The market decides.",
  copyright: "© 2026 HYPE. All rights reserved.",
} as const;
