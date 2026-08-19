import type { Metadata } from "next";
import { fontVariables } from "@/constants/fonts";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "HYPE. — India's First Live Auction Marketplace",
  description: "India's first live auction marketplace for hype culture.",
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
