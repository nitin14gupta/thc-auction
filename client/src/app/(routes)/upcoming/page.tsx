"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function UpcomingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={null}>
          <AuctionBrowseView
            scope="upcoming"
            title="Upcoming Auctions"
            subtitle="Set a reminder — these listings go live soon."
          />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
