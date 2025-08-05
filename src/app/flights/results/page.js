// "use client";
// import { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { Plane, Loader, DollarSign, Zap } from "lucide-react";
// import FlightSearchForm from "../../components/feature/FlightSearchForm";
// import FilterSidebar from "../../components/flight-results/FilterSidebar";
// import FlightOfferCard from "../../components/flight-results/FlightOfferCard";

// export default function FlightResultsPage() {
//   const router = useRouter();
//   const [searchParams, setSearchParams] = useState(null);
//   const [allOffers, setAllOffers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeSort, setActiveSort] = useState("cheapest");
//   const [expandedItineraryId, setExpandedItineraryId] = useState(null);

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
//       const itineraryId = offer.slices
//         .flatMap((s) => s.segments.map((seg) => seg.id))
//         .join("-");
//       if (!groups.has(itineraryId)) groups.set(itineraryId, []);
//       groups.get(itineraryId).push(offer);
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

//   const sortedAndFilteredOffers = useMemo(() => {
//     const offersCopy = [...groupedOffers];
//     offersCopy.sort((groupA, groupB) => {
//       const priceA = Number.parseFloat(groupA[0].total_amount);
//       const priceB = Number.parseFloat(groupB[0].total_amount);
//       if (activeSort === "fastest") {
//         const durationA = groupA[0].slices.reduce(
//           (sum, s) =>
//             sum +
//             (s.duration
//               ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
//                 Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
//               : 0),
//           0
//         );
//         const durationB = groupB[0].slices.reduce(
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
//   }, [groupedOffers, activeSort]);

//   if (!searchParams) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader className="w-12 h-12 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 overflow-x-hidden">
//       {/* Search Form Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4 max-w-7xl">
//           <FlightSearchForm
//             initialState={searchParams}
//             onNewSearch={handleNewSearch}
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
//             <FilterSidebar offers={groupedOffers} />
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
//                   {activeSort === "cheapest" && (
//                     <span className="text-xs bg-blue-500 px-2 py-1 rounded">
//                       From BDT 61,942
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
//                   {activeSort === "fastest" && (
//                     <span className="text-xs bg-blue-500 px-2 py-1 rounded">
//                       From BDT 72,019
//                     </span>
//                   )}
//                 </button>
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
//                     const itineraryId = offerGroup[0].slices
//                       .flatMap((s) => s.segments.map((seg) => seg.id))
//                       .join("-");
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
//                       Your search returned no results. Try modifying your search
//                       criteria above or adjusting your filters.
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

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plane, Loader, DollarSign, Zap } from "lucide-react";
import FlightSearchForm from "../../components/feature/FlightSearchForm";
import FilterSidebar from "../../components/flight-results/FilterSidebar";
import FlightOfferCard from "../../components/flight-results/FlightOfferCard";

const convertToUSD = (amount, currency) => {
  const numAmount = Number.parseFloat(amount);
  const rates = {
    GBP: 1.27,
    EUR: 1.08,
    USD: 1.0,
    BDT: 0.0084, // Add BDT conversion rate
  };
  return Math.round(numAmount * (rates[currency] || 1));
};

export default function FlightResultsPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState(null);
  const [allOffers, setAllOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("cheapest");
  const [expandedItineraryId, setExpandedItineraryId] = useState(null);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem("flightSearchResults");
      if (data) {
        const parsedData = JSON.parse(data);
        setSearchParams(parsedData.searchParams);
        setAllOffers(parsedData.results.offers || []);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading flight results:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleNewSearch = (newResult, newSearchParams) => {
    setIsLoading(true);
    setAllOffers(newResult.offers || []);
    setSearchParams(newSearchParams);
    sessionStorage.setItem(
      "flightSearchResults",
      JSON.stringify({
        searchParams: newSearchParams,
        results: newResult,
      })
    );
    setTimeout(() => setIsLoading(false), 200);
  };

  const groupedOffers = useMemo(() => {
    const groups = new Map();
    allOffers.forEach((offer) => {
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
        (a, b) =>
          Number.parseFloat(a.total_amount) - Number.parseFloat(b.total_amount)
      )
    );
    return groupedArray;
  }, [allOffers]);

  const sortedAndFilteredOffers = useMemo(() => {
    const offersCopy = [...groupedOffers];

    // Sort based on active sort type
    offersCopy.sort((groupA, groupB) => {
      const priceA = Number.parseFloat(groupA[0].total_amount);
      const priceB = Number.parseFloat(groupB[0].total_amount);

      if (activeSort === "fastest") {
        const durationA = groupA[0].slices?.reduce(
          (sum, s) =>
            sum +
            (s.duration
              ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
                Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
              : 0),
          0
        );
        const durationB = groupB[0].slices?.reduce(
          (sum, s) =>
            sum +
            (s.duration
              ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
                Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
              : 0),
          0
        );
        return durationA - durationB;
      }
      return priceA - priceB;
    });

    return offersCopy;
  }, [groupedOffers, activeSort]);

  const priceInfo = useMemo(() => {
    if (groupedOffers.length === 0) return { cheapest: 0, fastest: 0 };

    // Get cheapest price (already sorted by price in groupedOffers)
    const cheapestPrice = convertToUSD(
      groupedOffers[0]?.[0]?.total_amount || 0,
      groupedOffers[0]?.[0]?.total_currency || "USD"
    );

    // Calculate fastest option price
    const fastestSorted = [...groupedOffers].sort((groupA, groupB) => {
      const durationA = groupA[0].slices?.reduce(
        (sum, s) =>
          sum +
          (s.duration
            ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
              Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
            : 0),
        0
      );
      const durationB = groupB[0].slices?.reduce(
        (sum, s) =>
          sum +
          (s.duration
            ? Number.parseInt(s.duration.match(/(\d+)M/)?.[1] || 0) +
              Number.parseInt(s.duration.match(/(\d+)H/)?.[1] || 0) * 60
            : 0),
        0
      );
      return durationA - durationB;
    });

    const fastestPrice = convertToUSD(
      fastestSorted[0]?.[0]?.total_amount || 0,
      fastestSorted[0]?.[0]?.total_currency || "USD"
    );

    return { cheapest: cheapestPrice, fastest: fastestPrice };
  }, [groupedOffers]);

  if (!searchParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Compact Search Form Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <FlightSearchForm
            variant="compact"
            initialState={searchParams}
            onNewSearch={handleNewSearch}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Flight Route Header */}
        <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-6">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <Plane className="w-5 h-5" />
            {searchParams.slices[0].origin.code} →{" "}
            {searchParams.slices[0].destination.code} : Select Flight
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Filters</h3>
            <FilterSidebar offers={groupedOffers} />
          </aside>

          {/* Results Section */}
          <main className="space-y-4 min-w-0">
            {/* Sort Options */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setActiveSort("cheapest")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeSort === "cheapest"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Cheapest
                  {priceInfo.cheapest > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded ml-2 ${
                        activeSort === "cheapest"
                          ? "bg-blue-500"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      From ${priceInfo.cheapest.toLocaleString()}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveSort("fastest")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeSort === "fastest"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Fastest
                  {priceInfo.fastest > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded ml-2 ${
                        activeSort === "fastest"
                          ? "bg-blue-500"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      From ${priceInfo.fastest.toLocaleString()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Flight Results */}
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Loader className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-500">Searching for flights...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAndFilteredOffers.length > 0 ? (
                  sortedAndFilteredOffers.map((offerGroup) => {
                    const itineraryId =
                      offerGroup[0].slices
                        ?.flatMap((s) => s.segments?.map((seg) => seg.id) || [])
                        .join("-") || offerGroup[0].id;
                    return (
                      <FlightOfferCard
                        key={itineraryId}
                        offerGroup={offerGroup}
                        isExpanded={expandedItineraryId === itineraryId}
                        onToggleDetails={(id) => {
                          setExpandedItineraryId(id);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No Flights Found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Your search returned no results. Try modifying your search
                      criteria above or adjusting your filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
