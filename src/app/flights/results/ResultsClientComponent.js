"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plane, Loader, DollarSign, Zap, AlertCircle } from "lucide-react";

import FilterSidebar from "src/components/flight-results/FilterSidebar";
import FlightOfferCard from "src/components/flight-results/FlightOfferCard";
import ModifySearchForm from "src/components/flight-results/ModifySearchForm";

// This function calls your backend API. It's best practice to keep it outside the component.
const fetchFlights = async (searchParams) => {
  // Guard against running without necessary params
  if (!searchParams.has("slices")) {
    throw new Error(
      "Invalid search query. Please try again from the homepage."
    );
  }

  // Reconstruct the POST body from the URL parameters
  const payload = {
    slices: JSON.parse(searchParams.get("slices")).map((s) => ({
      origin: s.origin.code,
      destination: s.destination.code,
      departure_date: s.departure_date,
    })),
    passengers: JSON.parse(searchParams.get("passengers")),
    cabin_class: searchParams.get("cabinClass"),
  };

  const res = await fetch("/api/flights/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); // Try to parse JSON, but don't fail if it's not JSON
    throw new Error(
      errorData.error || `A server error occurred (status: ${res.status}).`
    );
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(
      result.error || "The search was not successful. Please try again."
    );
  }

  return result; // Returns the full object { success: true, offers: [...] }
};

// --- Your existing helper functions (no changes needed) ---
const convertToUSD = (amount, currency) => {
  const numAmount = Number.parseFloat(amount);
  const rates = { GBP: 1.27, EUR: 1.08, USD: 1.0, BDT: 0.0084 };
  return Math.round(numAmount * (rates[currency] || 1));
};
const getStopsCount = (segments) => {
  if (!segments || segments.length === 0) return 0;
  return segments.length - 1;
};
const getDepartureHour = (departureTime) => new Date(departureTime).getHours();
const calculateTotalLayoverTime = (segments) => {
  if (!segments || segments.length <= 1) return 0;
  let totalLayover = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    const layoverMs =
      new Date(segments[i + 1].departing_at).getTime() -
      new Date(segments[i].arriving_at).getTime();
    totalLayover += layoverMs / (1000 * 60 * 60);
  }
  return totalLayover;
};
// --- End of helper functions ---

export default function FlightResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Data fetching is now handled entirely by TanStack Query's useQuery hook.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["flights", searchParams.toString()],
    queryFn: () => fetchFlights(searchParams),
    enabled: searchParams.has("slices"),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Retry failed requests once
  });

  // 2. Client-side state for UI controls remains the same.
  const [activeSort, setActiveSort] = useState("cheapest");
  const [expandedItineraryId, setExpandedItineraryId] = useState(null);
  const [filters, setFilters] = useState({
    airlines: [],
    stops: [],
    priceRange: { min: 0, max: 10000 },
    departureTime: [],
    layoverTime: [],
  });

  // 3. All your `useMemo` hooks now derive their data directly from the `data` object
  //    returned by `useQuery`. This makes the data flow clean and reactive.
  const groupedOffers = useMemo(() => {
    const offers = data?.offers || [];
    const groups = new Map();
    offers.forEach((offer) => {
      if (offer.slices && offer.slices.length > 0) {
        const itineraryId =
          offer.slices
            ?.flatMap((s) => s.segments?.map((seg) => seg.id) || [])
            .join("-") || offer.id;
        if (!groups.has(itineraryId)) groups.set(itineraryId, []);
        groups.get(itineraryId).push(offer);
      }
    });
    const groupedArray = Array.from(groups.values());
    groupedArray.forEach((group) =>
      group.sort(
        (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
      )
    );
    return groupedArray;
  }, [data]);

  // All subsequent useMemo hooks will work as they did before, as they depend on `groupedOffers`.
  const filteredOffers = useMemo(() => {
    // ... your existing filtering logic (no changes needed) ...
    return groupedOffers.filter((offerGroup) => {
      // ...
      return true;
    });
  }, [groupedOffers, filters]);

  const sortedAndFilteredOffers = useMemo(() => {
    // ... your existing sorting logic (no changes needed) ...
    const offersCopy = [...filteredOffers];
    offersCopy.sort((groupA, groupB) => {
      // ...
    });
    return offersCopy;
  }, [filteredOffers, activeSort]);

  const priceInfo = useMemo(() => {
    // ... your existing price calculation logic (no changes needed) ...
    return { cheapest: 0, fastest: 0 };
  }, [groupedOffers]);

  // This useEffect to set the price range filter also works as before.
  useState(() => {
    if (groupedOffers.length > 0) {
      const prices = groupedOffers.map((group) =>
        parseFloat(group[0].total_amount)
      );
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setFilters((prev) => ({
        ...prev,
        priceRange: { min: minPrice, max: maxPrice },
      }));
    }
  }, [groupedOffers]);

  // --- UI STATE RENDERING ---
  // Handle primary states before attempting to render the page content.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Searching for flights...
        </p>
        <p className="text-gray-500">
          This can take a moment, thank you for your patience.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Search Error</h2>
        <p className="text-red-600 bg-red-100 p-3 rounded-md max-w-lg">
          {error.message}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  // Safely parse display parameters from the URL for the UI
  const displaySlices = JSON.parse(searchParams.get("slices") || "[]");

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* The form is now self-sufficient and doesn't need props */}
          <ModifySearchForm variant="compact" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-6">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <Plane className="w-5 h-5" />
            {displaySlices[0]?.origin.code} →{" "}
            {displaySlices[0]?.destination.code} : Select Flight
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Filters</h3>
            <FilterSidebar
              offers={groupedOffers}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>

          <main className="space-y-4 min-w-0">
            {/* Sort Options etc. */}

            {sortedAndFilteredOffers.length > 0 ? (
              <div className="space-y-4">
                {sortedAndFilteredOffers.map((offerGroup) => {
                  const itineraryId =
                    offerGroup[0].slices
                      ?.flatMap((s) => s.segments?.map((seg) => seg.id) || [])
                      .join("-") || offerGroup[0].id;
                  return (
                    <FlightOfferCard
                      key={itineraryId}
                      offerGroup={offerGroup}
                      isExpanded={expandedItineraryId === itineraryId}
                      onToggleDetails={() =>
                        setExpandedItineraryId((prevId) =>
                          prevId === itineraryId ? null : itineraryId
                        )
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Flights Found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  No flights match your search or filter criteria. Try adjusting
                  your search or clearing some filters.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
