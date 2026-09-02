import type { MetadataRoute } from "next";

const SITE_URL = "https://thehypecompany.in";

// Only the public, non-personalized marketing/browsing routes — /dashboard
// and auth pages are excluded (private, and not something search engines
// should index). Auction detail pages ([id] routes) are omitted too: they're
// client-rendered and constantly churning as auctions start/close, so a
// static sitemap entry wouldn't be reliably crawlable or stay accurate.
const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "hourly" as const },
  { path: "/live", priority: 0.9, changeFrequency: "hourly" as const },
  { path: "/upcoming", priority: 0.8, changeFrequency: "hourly" as const },
  { path: "/sold", priority: 0.6, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/how-it-works", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/sell-with-us", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/careers", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/help-center", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
