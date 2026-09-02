import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/constants/fonts";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const SITE_URL = "https://thehypecompany.in";
const SITE_TITLE = "HYPE. — India's First Live Auction Marketplace";
const SITE_DESCRIPTION =
  "India's first live auction marketplace for hype culture — sneakers, streetwear, luxury, and collectibles at real market prices, authenticated on every sale.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | HYPE.",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "sneaker auction India",
    "streetwear resale marketplace",
    "live auction marketplace",
    "hype culture",
    "sneaker resale India",
    "authenticated sneakers",
  ],
  applicationName: "HYPE.",
  authors: [{ name: "HYPE." }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/images/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "HYPE.",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/hero-1.webp", width: 1200, height: 630, alt: "HYPE. — Live Auction Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-1.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink text-paper">
        <SmoothScroll>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
