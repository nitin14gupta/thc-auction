"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function LivePage() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <AuctionBrowseView
            scope="live"
            title="Live Auctions"
            subtitle="Bidding is open right now — jump in before time runs out."
          />
        </div>
        <Footer />
      </div>
    </RequireAuth>
  );
}
