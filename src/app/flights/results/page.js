// // src/app/flights/results/page.js
// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { Plane, Loader, DollarSign, Zap } from "lucide-react";
// import FilterSidebar from "src/components/flight-results/FilterSidebar";
// import FlightOfferCard from "src/components/flight-results/FlightOfferCard";
// import ModifySearchForm from "src/components/flight-results/ModifySearchForm";

// const convertToUSD = (amount, currency) => {
//   const numAmount = Number.parseFloat(amount);
//   const rates = {
//     GBP: 1.27,
//     EUR: 1.08,
//     USD: 1.0,
//     BDT: 0.0084,
//   };
//   return Math.round(numAmount * (rates[currency] || 1));
// };

// // Helper function to get stops count
// const getStopsCount = (segments) => {
//   if (!segments || segments.length === 0) return 0;
//   return segments.length - 1;
// };

// // Helper function to get departure hour
// const getDepartureHour = (departureTime) => {
//   return new Date(departureTime).getHours();
// };

// // Helper function to calculate layover time in hours
// const calculateTotalLayoverTime = (segments) => {
//   if (!segments || segments.length <= 1) return 0;

//   let totalLayover = 0;
//   for (let i = 0; i < segments.length - 1; i++) {
//     const arrivalTime = new Date(segments[i].arriving_at);
//     const departureTime = new Date(segments[i + 1].departing_at);
//     const layoverMs = departureTime.getTime() - arrivalTime.getTime();
//     totalLayover += layoverMs / (1000 * 60 * 60); // Convert to hours
//   }
//   return totalLayover;
// };

// export default function FlightResultsPage() {
//   const router = useRouter();
//   const [searchParams, setSearchParams] = useState(null);
//   const [allOffers, setAllOffers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeSort, setActiveSort] = useState("cheapest");
//   const [expandedItineraryId, setExpandedItineraryId] = useState(null);

//   // Filter state
//   const [filters, setFilters] = useState({
//     airlines: [],
//     stops: [],
//     priceRange: { min: 0, max: 10000 },
//     departureTime: [],
//     layoverTime: [],
//   });

//   useEffect(() => {
//     try {
//       const data = sessionStorage.getItem("flightSearchResults");
//       if (data) {
//         const parsedData = JSON.parse(data);
//         setSearchParams(parsedData.searchParams);
//         setAllOffers(parsedData.results.offers || []);
//       } else {
//         router.push("/");
//       }
//     } catch (error) {
//       console.error("Error loading flight results:", error);
//       router.push("/");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [router]);

//   const handleNewSearch = (newResult, newSearchParams) => {
//     setIsLoading(true);
//     setAllOffers(newResult.offers || []);
//     setSearchParams(newSearchParams);
//     sessionStorage.setItem(
//       "flightSearchResults",
//       JSON.stringify({
//         searchParams: newSearchParams,
//         results: newResult,
//       })
//     );
//     setTimeout(() => setIsLoading(false), 200);
//   };

//   const groupedOffers = useMemo(() => {
//     const groups = new Map();
//     allOffers.forEach((offer) => {
//       if (offer.slices && offer.slices.length > 0) {
//         const itineraryId =
//           offer.slices
//             ?.flatMap((s) => s.segments?.map((seg) => seg.id) || [])
//             .join("-") || offer.id;
//         if (!groups.has(itineraryId)) groups.set(itineraryId, []);
//         groups.get(itineraryId).push(offer);
//       }
//     });

//     const groupedArray = Array.from(groups.values());
//     groupedArray.forEach((group) =>
//       group.sort(
//         (a, b) =>
//           Number.parseFloat(a.total_amount) - Number.parseFloat(b.total_amount)
//       )
//     );
//     return groupedArray;
//   }, [allOffers]);

//   // Apply filters to grouped offers
//   const filteredOffers = useMemo(() => {
//     return groupedOffers.filter((offerGroup) => {
//       const offer = offerGroup[0]; // Use cheapest offer for filtering
//       const firstSlice = offer.slices[0];
//       const segments = firstSlice.segments;

//       // Filter by airline
//       if (filters.airlines.length > 0) {
//         const airlineCode = segments[0].marketing_carrier.iata_code;
//         if (!filters.airlines.includes(airlineCode)) {
//           return false;
//         }
//       }

//       // Filter by stops
//       if (filters.stops.length > 0) {
//         const stopsCount = getStopsCount(segments);
//         const hasMatchingStops = filters.stops.some((stopFilter) => {
//           switch (stopFilter) {
//             case "direct":
//               return stopsCount === 0;
//             case "1-stop":
//               return stopsCount === 1;
//             case "2-plus-stops":
//               return stopsCount >= 2;
//             default:
//               return false;
//           }
//         });
//         if (!hasMatchingStops) {
//           return false;
//         }
//       }

//       // Filter by price range
//       const price = parseFloat(offer.total_amount);
//       if (price < filters.priceRange.min || price > filters.priceRange.max) {
//         return false;
//       }

//       // Filter by departure time
//       if (filters.departureTime.length > 0) {
//         const departureHour = getDepartureHour(segments[0].departing_at);
//         const hasMatchingTime = filters.departureTime.some((timeSlot) => {
//           switch (timeSlot) {
//             case "early-morning":
//               return departureHour >= 0 && departureHour < 6;
//             case "morning":
//               return departureHour >= 6 && departureHour < 12;
//             case "afternoon":
//               return departureHour >= 12 && departureHour < 18;
//             case "evening":
//               return departureHour >= 18 && departureHour < 24;
//             default:
//               return false;
//           }
//         });
//         if (!hasMatchingTime) {
//           return false;
//         }
//       }

//       // Filter by layover time
//       if (filters.layoverTime.length > 0 && segments.length > 1) {
//         const totalLayover = calculateTotalLayoverTime(segments);
//         const hasMatchingLayover = filters.layoverTime.some((layoverRange) => {
//           switch (layoverRange) {
//             case "0-5h":
//               return totalLayover >= 0 && totalLayover < 5;
//             case "5-10h":
//               return totalLayover >= 5 && totalLayover < 10;
//             case "10-15h":
//               return totalLayover >= 10 && totalLayover < 15;
//             case "15h-plus":
//               return totalLayover >= 15;
//             default:
//               return false;
//           }
//         });
//         if (!hasMatchingLayover) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }, [groupedOffers, filters]);

//   const sortedAndFilteredOffers = useMemo(() => {
//     const offersCopy = [...filteredOffers];

//     // Sort based on active sort type
//     offersCopy.sort((groupA, groupB) => {
//       const priceA = Number.parseFloat(groupA[0].total_amount);
//       const priceB = Number.parseFloat(groupB[0].total_amount);

//       if (activeSort === "fastest") {
//         const durationA = groupA[0].slices?.reduce(
//           (sum, s) =>
//             sum +
//             (s.duration
//               ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
//                 Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
//               : 0),
//           0
//         );
//         const durationB = groupB[0].slices?.reduce(
//           (sum, s) =>
//             sum +
//             (s.duration
//               ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
//                 Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
//               : 0),
//           0
//         );
//         return durationA - durationB;
//       }
//       return priceA - priceB;
//     });

//     return offersCopy;
//   }, [filteredOffers, activeSort]);

//   const priceInfo = useMemo(() => {
//     if (groupedOffers.length === 0) return { cheapest: 0, fastest: 0 };

//     // Get cheapest price (already sorted by price in groupedOffers)
//     const cheapestPrice = convertToUSD(
//       groupedOffers[0]?.[0]?.total_amount || 0,
//       groupedOffers[0]?.[0]?.total_currency || "USD"
//     );

//     // Calculate fastest option price
//     const fastestSorted = [...groupedOffers].sort((groupA, groupB) => {
//       const durationA = groupA[0].slices?.reduce(
//         (sum, s) =>
//           sum +
//           (s.duration
//             ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
//               Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
//             : 0),
//         0
//       );
//       const durationB = groupB[0].slices?.reduce(
//         (sum, s) =>
//           sum +
//           (s.duration
//             ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
//               Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
//             : 0),
//         0
//       );
//       return durationA - durationB;
//     });

//     const fastestPrice = convertToUSD(
//       fastestSorted[0]?.[0]?.total_amount || 0,
//       fastestSorted[0]?.[0]?.total_currency || "USD"
//     );

//     return { cheapest: cheapestPrice, fastest: fastestPrice };
//   }, [groupedOffers]);

//   // Initialize price range when offers are loaded
//   useEffect(() => {
//     if (groupedOffers.length > 0) {
//       const prices = groupedOffers.map((group) =>
//         parseFloat(group[0].total_amount)
//       );
//       const minPrice = Math.floor(Math.min(...prices));
//       const maxPrice = Math.ceil(Math.max(...prices));

//       setFilters((prev) => ({
//         ...prev,
//         priceRange: { min: minPrice, max: maxPrice },
//       }));
//     }
//   }, [groupedOffers]);

//   if (!searchParams) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader className="w-12 h-12 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 overflow-x-hidden">
//       {/* Compact Search Form Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4 max-w-7xl">
//           <ModifySearchForm
//             variant="compact"
//             initialState={searchParams}
//             onSearch={handleNewSearch}
//           />
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-6 max-w-7xl">
//         {/* Flight Route Header */}
//         <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-6">
//           <h2 className="font-bold text-xl flex items-center gap-2">
//             <Plane className="w-5 h-5" />
//             {searchParams.slices[0].origin.code} →{" "}
//             {searchParams.slices[0].destination.code} : Select Flight
//           </h2>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
//           {/* Filters Sidebar */}
//           <aside className="bg-white rounded-lg shadow-sm p-6 h-fit">
//             <h3 className="font-bold text-lg mb-4 text-gray-800">Filters</h3>
//             <FilterSidebar
//               offers={groupedOffers}
//               filters={filters}
//               onFiltersChange={setFilters}
//             />
//           </aside>

//           {/* Results Section */}
//           <main className="space-y-4 min-w-0">
//             {/* Sort Options */}
//             <div className="bg-white rounded-lg shadow-sm p-4">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <button
//                   onClick={() => setActiveSort("cheapest")}
//                   className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//                     activeSort === "cheapest"
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   <DollarSign className="w-4 h-4" />
//                   Cheapest
//                   {priceInfo.cheapest > 0 && (
//                     <span
//                       className={`text-xs px-2 py-1 rounded ml-2 ${
//                         activeSort === "cheapest"
//                           ? "bg-blue-500"
//                           : "bg-gray-200 text-gray-600"
//                       }`}
//                     >
//                       From ${priceInfo.cheapest.toLocaleString()}
//                     </span>
//                   )}
//                 </button>
//                 <button
//                   onClick={() => setActiveSort("fastest")}
//                   className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//                     activeSort === "fastest"
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   <Zap className="w-4 h-4" />
//                   Fastest
//                   {priceInfo.fastest > 0 && (
//                     <span
//                       className={`text-xs px-2 py-1 rounded ml-2 ${
//                         activeSort === "fastest"
//                           ? "bg-blue-500"
//                           : "bg-gray-200 text-gray-600"
//                       }`}
//                     >
//                       From ${priceInfo.fastest.toLocaleString()}
//                     </span>
//                   )}
//                 </button>

//                 {/* Results count */}
//                 <div className="ml-auto text-sm text-gray-600">
//                   {sortedAndFilteredOffers.length} of {groupedOffers.length}{" "}
//                   flights
//                 </div>
//               </div>
//             </div>

//             {/* Flight Results */}
//             {isLoading ? (
//               <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//                 <Loader className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
//                 <p className="text-gray-500">Searching for flights...</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {sortedAndFilteredOffers.length > 0 ? (
//                   sortedAndFilteredOffers.map((offerGroup) => {
//                     const itineraryId =
//                       offerGroup[0].slices
//                         ?.flatMap((s) => s.segments?.map((seg) => seg.id) || [])
//                         .join("-") || offerGroup[0].id;
//                     return (
//                       <FlightOfferCard
//                         key={itineraryId}
//                         offerGroup={offerGroup}
//                         isExpanded={expandedItineraryId === itineraryId}
//                         onToggleDetails={(id) => {
//                           setExpandedItineraryId(id);
//                         }}
//                       />
//                     );
//                   })
//                 ) : (
//                   <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//                     <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-bold text-gray-800 mb-2">
//                       No Flights Found
//                     </h3>
//                     <p className="text-gray-500 max-w-md mx-auto">
//                       No flights match your current filters. Try adjusting your
//                       filter criteria or clearing some filters.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/app/flights/results/page.js
"use client";

import { useState, useMemo, useEffect } from "react";
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

const getTotalDuration = (slices) => {
  return slices.reduce((total, slice) => {
    const segments = slice.segments;
    if (segments.length === 0) return total;

    const start = new Date(segments[0].departing_at).getTime();
    const end = new Date(segments[segments.length - 1].arriving_at).getTime();
    return total + (end - start) / (1000 * 60 * 60);
  }, 0);
};

// --- End of helper functions ---

export default function FlightResultsContent() {
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

  // Filter offers
  const filteredOffers = useMemo(() => {
    return groupedOffers.filter((offerGroup) => {
      const offer = offerGroup[0];
      const priceUSD = convertToUSD(offer.total_amount, offer.total_currency);

      // Price filter
      if (
        priceUSD < filters.priceRange.min ||
        priceUSD > filters.priceRange.max
      ) {
        return false;
      }

      // Airlines filter
      if (filters.airlines.length > 0) {
        const offerAirlines = offer.slices.flatMap((slice) =>
          slice.segments.map((seg) => seg.marketing_carrier.iata_code)
        );
        if (
          !filters.airlines.some((airline) => offerAirlines.includes(airline))
        ) {
          return false;
        }
      }

      // Stops filter
      if (filters.stops.length > 0) {
        const stopsCount = offer.slices.reduce(
          (max, slice) => Math.max(max, getStopsCount(slice.segments)),
          0
        );
        const stopsCategory =
          stopsCount === 0 ? "0" : stopsCount === 1 ? "1" : "2+";
        if (!filters.stops.includes(stopsCategory)) {
          return false;
        }
      }

      // Departure time filter
      if (filters.departureTime.length > 0) {
        const departureHour = getDepartureHour(
          offer.slices[0].segments[0].departing_at
        );
        let timeCategory = "";
        if (departureHour >= 6 && departureHour < 12) timeCategory = "morning";
        else if (departureHour >= 12 && departureHour < 18)
          timeCategory = "afternoon";
        else if (departureHour >= 18 && departureHour < 24)
          timeCategory = "evening";
        else timeCategory = "night";

        if (!filters.departureTime.includes(timeCategory)) {
          return false;
        }
      }

      return true;
    });
  }, [groupedOffers, filters]);

  const sortedAndFilteredOffers = useMemo(() => {
    const offersCopy = [...filteredOffers];
    offersCopy.sort((groupA, groupB) => {
      const offerA = groupA[0];
      const offerB = groupB[0];

      switch (activeSort) {
        case "cheapest":
          return (
            parseFloat(offerA.total_amount) - parseFloat(offerB.total_amount)
          );
        case "fastest":
          return (
            getTotalDuration(offerA.slices) - getTotalDuration(offerB.slices)
          );
        case "best":
          // Best value: combination of price and duration
          const scoreA =
            parseFloat(offerA.total_amount) / 100 +
            getTotalDuration(offerA.slices);
          const scoreB =
            parseFloat(offerB.total_amount) / 100 +
            getTotalDuration(offerB.slices);
          return scoreA - scoreB;
        default:
          return 0;
      }
    });
    return offersCopy;
  }, [filteredOffers, activeSort]);

  const priceInfo = useMemo(() => {
    if (groupedOffers.length === 0) return { cheapest: 0, fastest: 0 };

    const prices = groupedOffers.map((group) =>
      parseFloat(group[0].total_amount)
    );
    const durations = groupedOffers.map((group) =>
      getTotalDuration(group[0].slices)
    );

    const cheapestIndex = prices.indexOf(Math.min(...prices));
    const fastestIndex = durations.indexOf(Math.min(...durations));

    return {
      cheapest: prices[cheapestIndex],
      fastest: prices[fastestIndex],
    };
  }, [groupedOffers]);

  // Fixed: Changed useState to useEffect
  useEffect(() => {
    if (groupedOffers.length > 0) {
      const prices = groupedOffers.map((group) =>
        convertToUSD(group[0].total_amount, group[0].total_currency)
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
            {/* Sort Options */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSort("cheapest")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSort === "cheapest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Cheapest ${priceInfo.cheapest}
                </button>
                <button
                  onClick={() => setActiveSort("fastest")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSort === "fastest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Fastest ${priceInfo.fastest}
                </button>
                <button
                  onClick={() => setActiveSort("best")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSort === "best"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Best Value
                </button>
              </div>
            </div>

            {/* Results */}
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
