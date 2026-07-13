"use client";

import { useContext } from "react";
import { ListingWizardContext } from "@/context/ListingWizardContext";

export function useListingWizard() {
  const context = useContext(ListingWizardContext);
  if (!context) {
    throw new Error("useListingWizard must be used within a ListingWizardProvider");
  }
  return context;
}
