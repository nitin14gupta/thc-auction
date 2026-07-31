export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Live Auction", href: "/live" },
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

export const footerColumns = [
  {
    heading: "Market",
    links: ["Auctions", "Live", "Upcoming", "Sold", "Categories"],
  },
  {
    heading: "Sell",
    links: ["Sell With Us", "How It Works", "Seller Guide", "Payouts"],
  },
  {
    heading: "Company",
    links: ["About Us", "Careers", "Blog", "Press"],
  },
  {
    heading: "Support",
    links: ["Help Center", "Contact Us", "Terms", "Privacy Policy"],
  },
] as const;

export const footerBrand = {
  name: "HYPE.",
  tagline: "The market decides.",
  copyright: "© 2024 HYPE. All rights reserved.",
} as const;
