"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function UpcomingPage() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <AuctionBrowseView
            scope="upcoming"
            title="Upcoming Auctions"
            subtitle="Set a reminder — these listings go live soon."
          />
        </div>
        <Footer />
      </div>
    </RequireAuth>
  );
}
