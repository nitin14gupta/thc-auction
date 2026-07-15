"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { createListing, getListing, updateListing } from "@/api/listingApi";
import { getProduct } from "@/api/productApi";
import { useAuth } from "@/hooks/useAuth";
import type { ConditionGrade, Listing, ListingPhoto, ListingUpdatePatch, SuggestedBidPrice } from "@/types/listing";
import type { Product, ProductSearchResult } from "@/types/product";

type WizardState = {
  listingId: string | null;
  product: Product | ProductSearchResult | null;
  variantSize: string;
  colorway: string;
  yearOfRelease: string;
  styleSku: string;
  conditionGrade: ConditionGrade | null;
  conditionNotes: string;
  photos: ListingPhoto[];
  basePrice: number | null;
  bidPrice: number | null;
  auctionStartAt: string | null;
  suggestedBidPrices: SuggestedBidPrice[];
  currentStep: number;
  isHydrating: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: WizardState = {
  listingId: null,
  product: null,
  variantSize: "",
  colorway: "",
  yearOfRelease: "",
  styleSku: "",
  conditionGrade: null,
  conditionNotes: "",
  photos: [],
  basePrice: null,
  bidPrice: null,
  auctionStartAt: null,
  suggestedBidPrices: [],
  currentStep: 1,
  isHydrating: true,
  isSaving: false,
  error: null,
};

type Action =
  | { type: "SET_PRODUCT"; product: Product | ProductSearchResult }
  | { type: "HYDRATE_LISTING"; listing: Listing }
  | { type: "SET_FIELDS"; fields: Partial<WizardState> }
  | { type: "SET_SAVING"; isSaving: boolean }
  | { type: "SET_HYDRATING"; isHydrating: boolean }
  | { type: "SET_ERROR"; error: string | null };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_PRODUCT":
      return { ...state, product: action.product };
    case "HYDRATE_LISTING":
      return {
        ...state,
        listingId: action.listing.id,
        variantSize: action.listing.variant_size ?? "",
        colorway: action.listing.colorway ?? "",
        yearOfRelease: action.listing.year_of_release ?? "",
        styleSku: action.listing.style_sku ?? "",
        conditionGrade: action.listing.condition_grade,
        conditionNotes: action.listing.condition_notes ?? "",
        photos: action.listing.photos,
        basePrice: action.listing.base_price,
        bidPrice: action.listing.bid_price,
        auctionStartAt: action.listing.auction_start_at,
        suggestedBidPrices: action.listing.suggested_bid_prices,
        currentStep: action.listing.current_step,
      };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    case "SET_SAVING":
      return { ...state, isSaving: action.isSaving };
    case "SET_HYDRATING":
      return { ...state, isHydrating: action.isHydrating };
    case "SET_ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
}

type ListingWizardContextValue = {
  state: WizardState;
  selectProduct: (product: ProductSearchResult) => Promise<void>;
  persistStep: (patch: ListingUpdatePatch) => Promise<void>;
  setFields: (fields: Partial<WizardState>) => void;
};

export const ListingWizardContext = createContext<ListingWizardContextValue | undefined>(undefined);

export function ListingWizardProvider({ children }: { children: ReactNode }) {
  const { authFetch } = useAuth();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const resumeListingId = searchParams.get("listingId");

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!resumeListingId) {
        dispatch({ type: "SET_HYDRATING", isHydrating: false });
        return;
      }
      try {
        const listing = await getListing(authFetch, resumeListingId);
        if (cancelled) return;
        dispatch({ type: "HYDRATE_LISTING", listing });
        if (listing.product_id) {
          const product = await getProduct(authFetch, listing.product_id);
          if (!cancelled) dispatch({ type: "SET_PRODUCT", product });
        }
      } catch {
        if (!cancelled) dispatch({ type: "SET_ERROR", error: "Couldn't load this draft listing." });
      } finally {
        if (!cancelled) dispatch({ type: "SET_HYDRATING", isHydrating: false });
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeListingId]);

  const selectProduct = useCallback(
    async (product: ProductSearchResult) => {
      dispatch({ type: "SET_SAVING", isSaving: true });
      dispatch({ type: "SET_ERROR", error: null });
      try {
        const listing = await createListing(authFetch, product.id);
        dispatch({ type: "HYDRATE_LISTING", listing });
        dispatch({ type: "SET_PRODUCT", product });
      } catch {
        dispatch({ type: "SET_ERROR", error: "Couldn't start this listing. Try again." });
        throw new Error("selectProduct failed");
      } finally {
        dispatch({ type: "SET_SAVING", isSaving: false });
      }
    },
    [authFetch]
  );

  const persistStep = useCallback(
    async (patch: ListingUpdatePatch) => {
      if (!state.listingId) return;
      dispatch({ type: "SET_SAVING", isSaving: true });
      dispatch({ type: "SET_ERROR", error: null });
      try {
        const listing = await updateListing(authFetch, state.listingId, patch);
        dispatch({ type: "HYDRATE_LISTING", listing });
      } catch {
        dispatch({ type: "SET_ERROR", error: "Couldn't save your changes. Try again." });
        throw new Error("persistStep failed");
      } finally {
        dispatch({ type: "SET_SAVING", isSaving: false });
      }
    },
    [authFetch, state.listingId]
  );

  const setFields = useCallback((fields: Partial<WizardState>) => {
    dispatch({ type: "SET_FIELDS", fields });
  }, []);

  const value = useMemo<ListingWizardContextValue>(
    () => ({ state, selectProduct, persistStep, setFields }),
    [state, selectProduct, persistStep, setFields]
  );

  return <ListingWizardContext.Provider value={value}>{children}</ListingWizardContext.Provider>;
}
