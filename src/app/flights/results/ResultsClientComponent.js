// // "use client";

// // import { useState, useMemo, useEffect } from "react";
// // import { useSearchParams, useRouter } from "next/navigation";
// // import { useQuery } from "@tanstack/react-query";
// // import {
// //   Plane,
// //   Loader,
// //   AlertCircle,
// //   DollarSign,
// //   Zap,
// //   Star,
// //   SlidersHorizontal,
// //   X,
// // } from "lucide-react";

// // import FilterSidebar from "src/components/flight-results/FilterSidebar";
// // import FlightOfferCard from "src/components/flight-results/FlightOfferCard";
// // import ModifySearchForm from "src/components/flight-results/ModifySearchForm";

// // // This function calls your backend API. It's best practice to keep it outside the component.
// // const fetchFlights = async (searchParams) => {
// //   if (!searchParams.has("slices")) {
// //     throw new Error(
// //       "Invalid search query. Please try again from the homepage."
// //     );
// //   }

// //   const payload = {
// //     slices: JSON.parse(searchParams.get("slices")).map((s) => ({
// //       origin: s.origin.code,
// //       destination: s.destination.code,
// //       departure_date: s.departure_date,
// //     })),
// //     passengers: JSON.parse(searchParams.get("passengers")),
// //     cabin_class: searchParams.get("cabinClass"),
// //   };

// //   const res = await fetch("/api/flights/search", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify(payload),
// //   });

// //   if (!res.ok) {
// //     const errorData = await res.json().catch(() => ({}));
// //     throw new Error(
// //       errorData.error || `A server error occurred (status: ${res.status}).`
// //     );
// //   }

// //   const result = await res.json();
// //   if (!result.success) {
// //     throw new Error(
// //       result.error || "The search was not successful. Please try again."
// //     );
// //   }
// //   return result;
// // };

// // // --- Helper Functions ---
// // const getStopsCount = (segments) => (segments?.length || 1) - 1;
// // const getDepartureHour = (dateTime) => new Date(dateTime).getHours();
// // const calculateTotalDuration = (offer) => {
// //   return offer.slices.reduce((total, slice) => {
// //     const durationMatch = slice.duration?.match(/PT(\d+)H(\d+)M/);
// //     if (!durationMatch) return total;
// //     const hours = parseInt(durationMatch[1] || "0", 10);
// //     const minutes = parseInt(durationMatch[2] || "0", 10);
// //     return total + hours * 60 + minutes;
// //   }, 0);
// // };

// // export default function ResultsClientComponent() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

// //   // --- Data Fetching ---
// //   const { data, isLoading, isError, error } = useQuery({
// //     queryKey: ["flights", searchParams.toString()],
// //     queryFn: () => fetchFlights(searchParams),
// //     enabled: searchParams.has("slices"),
// //     staleTime: 1000 * 60 * 5,
// //     refetchOnWindowFocus: false,
// //     retry: 1,
// //   });

// //   // --- State Management ---
// //   const [activeSort, setActiveSort] = useState("cheapest");
// //   const [expandedItineraryId, setExpandedItineraryId] = useState(null);
// //   const [filters, setFilters] = useState({
// //     airlines: [],
// //     stops: [],
// //     priceRange: { min: 0, max: 10000 },
// //     departureTime: [],
// //   });

// //   // --- Memoized Data Processing ---
// //   const groupedOffers = useMemo(() => {
// //     const offers = data?.offers || [];
// //     const groups = new Map();
// //     offers.forEach((offer) => {
// //       const itineraryId =
// //         offer.slices
// //           ?.flatMap(
// //             (s) =>
// //               s.segments?.map(
// //                 (seg) =>
// //                   `${seg.carrier?.iata_code || "XX"}-${
// //                     seg.flight_number || "0000"
// //                   }-${seg.departing_at}`
// //               ) || []
// //           )
// //           .join("--") || offer.id;
// //       if (!groups.has(itineraryId)) groups.set(itineraryId, []);
// //       groups.get(itineraryId).push(offer);
// //     });
// //     const groupedArray = Array.from(groups.values());
// //     groupedArray.forEach((group) =>
// //       group.sort(
// //         (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
// //       )
// //     );
// //     return groupedArray;
// //   }, [data]);

// //   const filteredOffers = useMemo(() => {
// //     if (!groupedOffers) return [];
// //     const timeRanges = {
// //       "early-morning": [0, 6],
// //       morning: [6, 12],
// //       afternoon: [12, 18],
// //       evening: [18, 24],
// //     };
// //     return groupedOffers.filter((group) => {
// //       const offer = group[0];
// //       if (!offer) return false;
// //       const price = parseFloat(offer.total_amount);
// //       if (price < filters.priceRange.min || price > filters.priceRange.max)
// //         return false;
// //       if (filters.airlines.length > 0) {
// //         const airlineCode = offer.slices[0]?.segments[0]?.carrier?.iata_code;
// //         if (!filters.airlines.includes(airlineCode)) return false;
// //       }
// //       if (filters.stops.length > 0) {
// //         const stopsMatch = offer.slices.every((slice) => {
// //           const stops = getStopsCount(slice.segments);
// //           return (
// //             filters.stops.includes(stops) ||
// //             (filters.stops.includes(2) && stops >= 2)
// //           );
// //         });
// //         if (!stopsMatch) return false;
// //       }
// //       if (filters.departureTime.length > 0) {
// //         const departureHour = getDepartureHour(
// //           offer.slices[0].segments[0].departing_at
// //         );
// //         const matchesTime = filters.departureTime.some((slot) => {
// //           const [start, end] = timeRanges[slot];
// //           return departureHour >= start && departureHour < end;
// //         });
// //         if (!matchesTime) return false;
// //       }
// //       return true;
// //     });
// //   }, [groupedOffers, filters]);

// //   const sortedAndFilteredOffers = useMemo(() => {
// //     const sorted = [...filteredOffers];
// //     switch (activeSort) {
// //       case "cheapest":
// //         return sorted.sort(
// //           (a, b) =>
// //             parseFloat(a[0].total_amount) - parseFloat(b[0].total_amount)
// //         );
// //       case "fastest":
// //         return sorted.sort(
// //           (a, b) => calculateTotalDuration(a[0]) - calculateTotalDuration(b[0])
// //         );
// //       case "best":
// //         const getScore = (offer) =>
// //           parseFloat(offer.total_amount) + calculateTotalDuration(offer) * 2;
// //         return sorted.sort((a, b) => getScore(a[0]) - getScore(b[0]));
// //       default:
// //         return sorted;
// //     }
// //   }, [filteredOffers, activeSort]);

// //   useEffect(() => {
// //     if (groupedOffers.length > 0) {
// //       const prices = groupedOffers.map((g) => parseFloat(g[0].total_amount));
// //       const min = Math.floor(Math.min(...prices));
// //       const max = Math.ceil(Math.max(...prices));
// //       if (filters.priceRange.min === 0 && filters.priceRange.max === 10000) {
// //         setFilters((prev) => ({ ...prev, priceRange: { min, max } }));
// //       }
// //     }
// //   }, [groupedOffers]);

// //   // --- UI Rendering ---
// //   if (isLoading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
// //         <Loader className="w-12 h-12 text-blue-600 animate-spin" />
// //         <p className="mt-4 text-lg font-semibold text-gray-700">
// //           Searching for flights...
// //         </p>
// //       </div>
// //     );
// //   }

// //   if (isError) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
// //         <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
// //         <h2 className="text-2xl font-bold text-gray-800 mb-2">Search Error</h2>
// //         <p className="text-red-600 bg-red-100 p-3 rounded-md max-w-lg">
// //           {error.message}
// //         </p>
// //         <button
// //           onClick={() => router.push("/")}
// //           className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
// //         >
// //           Return to Homepage
// //         </button>
// //       </div>
// //     );
// //   }

// //   const displaySlices = JSON.parse(searchParams.get("slices") || "[]");
// //   const sortOptions = [
// //     { id: "cheapest", label: "Cheapest", icon: DollarSign },
// //     { id: "fastest", label: "Fastest", icon: Zap },
// //     { id: "best", label: "Best", icon: Star },
// //   ];

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <div className="bg-white shadow-sm border-b  top-0 z-40">
// //         <div className="container mx-auto px-4 py-4 max-w-7xl">
// //           <ModifySearchForm variant="compact" />
// //         </div>
// //       </div>

// //       <div className="container mx-auto px-4 py-6 max-w-7xl">
// //         <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-4">
// //           <h2 className="font-bold text-xl flex items-center gap-2">
// //             <Plane className="w-5 h-5" />
// //             {displaySlices[0]?.origin.code} →{" "}
// //             {displaySlices[0]?.destination.code}
// //           </h2>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
// //           <aside className="hidden lg:block bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
// //             <FilterSidebar
// //               offers={groupedOffers}
// //               filters={filters}
// //               onFiltersChange={setFilters}
// //             />
// //           </aside>

// //           <main className="space-y-4 min-w-0">
// //             <div className="lg:hidden">
// //               <button
// //                 onClick={() => setIsFilterSidebarOpen(true)}
// //                 className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white shadow-sm font-semibold text-gray-700 hover:bg-gray-50 border"
// //               >
// //                 <SlidersHorizontal size={16} />
// //                 Filters
// //               </button>
// //             </div>

// //             <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-around">
// //               {sortOptions.map((opt) => (
// //                 <button
// //                   key={opt.id}
// //                   onClick={() => setActiveSort(opt.id)}
// //                   className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-colors text-sm font-semibold ${
// //                     activeSort === opt.id
// //                       ? "bg-blue-100 text-blue-700"
// //                       : "text-gray-600 hover:bg-gray-100"
// //                   }`}
// //                 >
// //                   <opt.icon className="w-4 h-4" />
// //                   {opt.label}
// //                 </button>
// //               ))}
// //             </div>

// //             {sortedAndFilteredOffers.length > 0 ? (
// //               <div className="space-y-4">
// //                 {sortedAndFilteredOffers.map((offerGroup) => {
// //                   const itineraryId =
// //                     offerGroup[0].slices
// //                       .flatMap(
// //                         (s) =>
// //                           s.segments?.map(
// //                             (seg) =>
// //                               `${seg.carrier?.iata_code || "XX"}-${
// //                                 seg.flight_number || "0000"
// //                               }-${seg.departing_at}`
// //                           ) || []
// //                       )
// //                       .join("--") || offerGroup[0].id;
// //                   return (
// //                     <FlightOfferCard
// //                       key={itineraryId}
// //                       offerGroup={offerGroup}
// //                       isExpanded={expandedItineraryId === itineraryId}
// //                       onToggleDetails={() =>
// //                         setExpandedItineraryId((prev) =>
// //                           prev === itineraryId ? null : itineraryId
// //                         )
// //                       }
// //                     />
// //                   );
// //                 })}
// //               </div>
// //             ) : (
// //               <div className="bg-white rounded-lg shadow-sm p-12 text-center">
// //                 <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
// //                 <h3 className="text-xl font-bold text-gray-800 mb-2">
// //                   No Flights Found
// //                 </h3>
// //                 <p className="text-gray-500 max-w-md mx-auto">
// //                   No flights match your filter criteria. Try adjusting your
// //                   filters.
// //                 </p>
// //               </div>
// //             )}
// //           </main>
// //         </div>
// //       </div>

// //       {/* Mobile Filter Drawer */}
// //       {isFilterSidebarOpen && (
// //         <div
// //           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
// //           onClick={() => setIsFilterSidebarOpen(false)}
// //         />
// //       )}
// //       <div
// //         className={`fixed left-0 top-0 h-full w-full max-w-xs bg-gray-50 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
// //           isFilterSidebarOpen ? "translate-x-0" : "-translate-x-full"
// //         }`}
// //       >
// //         <div className="flex items-center justify-between p-4 border-b bg-white">
// //           <h3 className="font-bold text-lg text-gray-800">Filters</h3>
// //           <button
// //             onClick={() => setIsFilterSidebarOpen(false)}
// //             className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
// //           >
// //             <X size={20} />
// //           </button>
// //         </div>
// //         <div className="p-4 overflow-y-auto">
// //           <FilterSidebar
// //             offers={groupedOffers}
// //             filters={filters}
// //             onFiltersChange={setFilters}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import { useState, useMemo, useEffect, useRef } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import {
//   Plane,
//   Loader,
//   AlertCircle,
//   DollarSign,
//   Zap,
//   Star,
//   SlidersHorizontal,
//   X,
//   ChevronDown,
//   Users,
//   Briefcase,
// } from "lucide-react";

// import FilterSidebar from "src/components/flight-results/FilterSidebar";
// import FlightOfferCard from "src/components/flight-results/FlightOfferCard";
// import ModifySearchForm from "src/components/flight-results/ModifySearchForm";

// // API fetching function with pagination support
// const fetchFlights = async ({ searchParams, pageParam = 1 }) => {
//   if (!searchParams.has("slices")) {
//     throw new Error(
//       "Invalid search query. Please try again from the homepage."
//     );
//   }
//   const payload = {
//     slices: JSON.parse(searchParams.get("slices")).map((s) => ({
//       origin: s.origin.code,
//       destination: s.destination.code,
//       departure_date: s.departure_date,
//     })),
//     passengers: JSON.parse(searchParams.get("passengers")),
//     cabin_class: searchParams.get("cabinClass"),
//     page: pageParam,
//   };
//   const res = await fetch("/api/flights/search", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) {
//     const errorData = await res.json().catch(() => ({}));
//     throw new Error(
//       errorData.error || `A server error occurred (status: ${res.status}).`
//     );
//   }
//   const result = await res.json();
//   console.log("API Response:", result);
//   if (!result.success) {
//     throw new Error(
//       result.error || "The search was not successful. Please try again."
//     );
//   }
//   return result;
// };

// // --- Helper Functions ---
// const getStopsCount = (segments) => (segments?.length || 1) - 1;
// const getDepartureHour = (dateTime) => new Date(dateTime).getHours();
// const calculateTotalDuration = (offer) => {
//   return offer.slices.reduce((total, slice) => {
//     const durationMatch = slice.duration?.match(/PT(\d+)H(\d+)M/);
//     if (!durationMatch) return total;
//     const hours = parseInt(durationMatch[1] || "0", 10);
//     const minutes = parseInt(durationMatch[2] || "0", 10);
//     return total + hours * 60 + minutes;
//   }, 0);
// };

// // --- Loading Skeleton Components ---
// const SkeletonCard = () => (
//   <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
//     <div className="p-4">
//       <div className="flex flex-col md:flex-row md:justify-between">
//         <div className="flex-grow md:border-r md:pr-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="h-10 w-10 rounded-full bg-gray-200"></div>
//             <div className="h-4 w-32 bg-gray-200 rounded"></div>
//           </div>
//           <div className="space-y-2">
//             <div className="bg-gray-100 p-4 h-20 rounded-lg"></div>
//           </div>
//         </div>
//         <div className="text-center md:text-right flex-shrink-0 md:pl-6 mt-4 md:mt-0">
//           <div className="h-5 w-20 bg-gray-200 rounded mx-auto md:ml-auto mb-1"></div>
//           <div className="h-8 w-28 bg-gray-300 rounded mx-auto md:ml-auto"></div>
//         </div>
//       </div>
//     </div>
//     <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center justify-between">
//       <div className="h-4 w-24 bg-gray-200 rounded"></div>
//       <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
//     </div>
//   </div>
// );

// const LoadingState = () => (
//   <main className="space-y-4 min-w-0">
//     <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-around">
//       <div className="h-10 flex-1 bg-gray-100 rounded-md mx-1"></div>
//       <div className="h-10 flex-1 bg-gray-100 rounded-md mx-1"></div>
//       <div className="h-10 flex-1 bg-gray-100 rounded-md mx-1"></div>
//     </div>
//     {[...Array(5)].map((_, i) => (
//       <SkeletonCard key={i} />
//     ))}
//   </main>
// );

// const SearchSummaryBar = ({ searchParams, onModifyClick, isOpen }) => {
//   const displaySlices = JSON.parse(searchParams.get("slices") || "[]");
//   const passengers = JSON.parse(searchParams.get("passengers") || "[]");
//   const cabinClass = searchParams.get("cabinClass") || "economy";
//   const totalPassengers = passengers.length;
//   if (displaySlices.length === 0) return null;
//   const departure = displaySlices[0];
//   const returnSlice = displaySlices.length > 1;

//   return (
//     <div className="flex flex-col md:flex-row justify-between items-center w-full gap-2 md:gap-4">
//       <div className="flex items-center gap-4 text-sm text-gray-700 overflow-x-auto w-full pb-2 md:pb-0">
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <Plane size={16} className="text-gray-500" />
//           <span className="font-semibold">
//             {departure.origin.code} → {departure.destination.code}
//           </span>
//           {returnSlice && (
//             <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
//               Round Trip
//             </span>
//           )}
//         </div>
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <Users size={16} className="text-gray-500" />
//           <span className="font-semibold">
//             {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
//           </span>
//         </div>
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <Briefcase size={16} className="text-gray-500" />
//           <span className="font-semibold capitalize">{cabinClass}</span>
//         </div>
//       </div>
//       <button
//         onClick={onModifyClick}
//         className="w-full md:w-auto flex-shrink-0 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2"
//       >
//         Modify Search{" "}
//         <ChevronDown
//           size={16}
//           className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
//         />
//       </button>
//     </div>
//   );
// };

// // --- Main Client Component ---
// export default function ResultsClientComponent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
//   const [isModifySearchOpen, setIsModifySearchOpen] = useState(false);
//   const modifySearchRef = useRef(null);

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading,
//     isError,
//     error,
//   } = useInfiniteQuery({
//     queryKey: ["flights", searchParams.toString()],
//     queryFn: ({ pageParam }) => fetchFlights({ searchParams, pageParam }),
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) =>
//       lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
//     enabled: searchParams && searchParams.has("slices"),
//     staleTime: 1000 * 60 * 5,
//     refetchOnWindowFocus: false,
//   });

//   const [activeSort, setActiveSort] = useState("cheapest");
//   const [expandedItineraryId, setExpandedItineraryId] = useState(null);
//   const [filters, setFilters] = useState({
//     airlines: [],
//     stops: [],
//     priceRange: { min: 0, max: 10000 },
//     departureTime: [],
//   });

//   const allOffers = useMemo(
//     () => data?.pages?.flatMap((page) => page.offers) || [],
//     [data]
//   );

//   const groupedOffers = useMemo(() => {
//     // Add a null check here
//     if (!allOffers || allOffers.length === 0) return [];

//     const groups = new Map();
//     allOffers.forEach((offer) => {
//       // Use the exact same key generation logic as the backend
//       const itineraryId =
//         offer.slices
//           ?.map((slice) =>
//             slice.segments
//               ?.map(
//                 (seg) =>
//                   `${seg.carrier?.iata_code || "XX"}${seg.flight_number}-${
//                     seg.origin?.iata_code
//                   }`
//               )
//               .join("_")
//           )
//           .join("__") || offer.id;

//       if (!groups.has(itineraryId)) {
//         groups.set(itineraryId, []);
//       }
//       groups.get(itineraryId).push(offer);
//     });

//     const groupedArray = Array.from(groups.values());
//     // Sort each group internally by price so the first offer is always the cheapest
//     groupedArray.forEach((group) =>
//       group.sort(
//         (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
//       )
//     );
//     return groupedArray;
//   }, [allOffers]);

//   const filteredOffers = useMemo(() => {
//     if (!groupedOffers) return [];
//     const timeRanges = {
//       "early-morning": [0, 6],
//       morning: [6, 12],
//       afternoon: [12, 18],
//       evening: [18, 24],
//     };
//     return groupedOffers.filter((group) => {
//       const offer = group[0];
//       if (!offer) return false;
//       const price = parseFloat(offer.total_amount);
//       if (price < filters.priceRange.min || price > filters.priceRange.max)
//         return false;
//       if (
//         filters.airlines.length > 0 &&
//         !filters.airlines.includes(
//           offer.slices[0]?.segments[0]?.carrier?.iata_code
//         )
//       )
//         return false;
//       if (filters.stops.length > 0) {
//         const stops = getStopsCount(offer.slices[0].segments);
//         if (
//           !(
//             filters.stops.includes(stops) ||
//             (filters.stops.includes(2) && stops >= 2)
//           )
//         )
//           return false;
//       }
//       if (filters.departureTime.length > 0) {
//         const departureHour = getDepartureHour(
//           offer.slices[0].segments[0].departing_at
//         );
//         if (
//           !filters.departureTime.some(
//             (slot) =>
//               departureHour >= timeRanges[slot][0] &&
//               departureHour < timeRanges[slot][1]
//           )
//         )
//           return false;
//       }
//       return true;
//     });
//   }, [groupedOffers, filters]);

//   const sortedAndFilteredOffers = useMemo(() => {
//     const sorted = [...filteredOffers];
//     switch (activeSort) {
//       case "fastest":
//         return sorted.sort(
//           (a, b) => calculateTotalDuration(a[0]) - calculateTotalDuration(b[0])
//         );
//       case "best":
//         const getScore = (o) =>
//           parseFloat(o.total_amount) +
//           calculateTotalDuration(o) * 2 +
//           getStopsCount(o.slices[0].segments) * 100;
//         return sorted.sort((a, b) => getScore(a[0]) - getScore(b[0]));
//       case "cheapest":
//       default:
//         return sorted.sort(
//           (a, b) =>
//             parseFloat(a[0].total_amount) - parseFloat(b[0].total_amount)
//         );
//     }
//   }, [filteredOffers, activeSort]);

//   useEffect(() => {
//     if (!groupedOffers || groupedOffers.length === 0) return;
//     const prices = groupedOffers.map((g) => parseFloat(g[0].total_amount));
//     const min = Math.floor(Math.min(...prices));
//     const max = Math.ceil(Math.max(...prices));
//     if (filters.priceRange.min === 0 && filters.priceRange.max === 10000) {
//       setFilters((prev) => ({ ...prev, priceRange: { min, max } }));
//     }
//   }, [groupedOffers, filters.priceRange.min, filters.priceRange.max]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         modifySearchRef.current &&
//         !modifySearchRef.current.contains(event.target)
//       ) {
//         setIsModifySearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const displaySlices = JSON.parse(searchParams.get("slices") || "[]");

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="bg-white shadow-sm border-b sticky top-0 z-40">
//           <div className="container mx-auto px-4 py-3 max-w-7xl">
//             <SearchSummaryBar
//               searchParams={searchParams}
//               onModifyClick={() => {}}
//               isOpen={false}
//             />
//           </div>
//         </div>
//         <div className="container mx-auto px-4 py-6 max-w-7xl">
//           <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-4">
//             <h2 className="font-bold text-xl flex items-center gap-2">
//               <Plane size={20} />
//               {displaySlices[0]?.origin.code} →{" "}
//               {displaySlices[0]?.destination.code}
//             </h2>
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
//             <aside className="hidden lg:block bg-white rounded-lg shadow-sm p-6 h-fit animate-pulse">
//               <div className="h-6 w-2/3 bg-gray-200 rounded mb-4"></div>
//               <div className="space-y-4">
//                 <div className="h-20 bg-gray-100 rounded"></div>
//                 <div className="h-20 bg-gray-100 rounded"></div>
//                 <div className="h-20 bg-gray-100 rounded"></div>
//               </div>
//             </aside>
//             <LoadingState />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
//         <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Search Error</h2>
//         <p className="text-red-600 bg-red-100 p-3 rounded-md max-w-lg">
//           {error.message}
//         </p>
//         <button
//           onClick={() => router.push("/")}
//           className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
//         >
//           Return to Homepage
//         </button>
//       </div>
//     );
//   }

//   const sortOptions = [
//     { id: "cheapest", label: "Cheapest", icon: DollarSign },
//     { id: "fastest", label: "Fastest", icon: Zap },
//     { id: "best", label: "Best", icon: Star },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white shadow-sm border-b sticky top-0 z-40">
//         <div
//           ref={modifySearchRef}
//           className="container mx-auto px-4 py-3 max-w-7xl relative"
//         >
//           <SearchSummaryBar
//             searchParams={searchParams}
//             isOpen={isModifySearchOpen}
//             onModifyClick={() => setIsModifySearchOpen((prev) => !prev)}
//           />
//           {isModifySearchOpen && (
//             <div className="absolute top-full left-0 w-full mt-2 px-4 md:px-0">
//               <ModifySearchForm />
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-6 max-w-7xl">
//         <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-4">
//           <h2 className="font-bold text-xl flex items-center gap-2">
//             <Plane size={20} /> {displaySlices[0]?.origin.code} →{" "}
//             {displaySlices[0]?.destination.code}
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
//           <aside className="hidden lg:block bg-white rounded-lg shadow-sm p-6 h-fit sticky top-[85px]">
//             <FilterSidebar
//               offers={groupedOffers}
//               filters={filters}
//               onFiltersChange={setFilters}
//             />
//           </aside>

//           <main className="space-y-4 min-w-0">
//             <div className="lg:hidden">
//               <button
//                 onClick={() => setIsFilterSidebarOpen(true)}
//                 className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white shadow-sm font-semibold text-gray-700 hover:bg-gray-50 border"
//               >
//                 <SlidersHorizontal size={16} /> Filters
//               </button>
//             </div>

//             <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-around">
//               {sortOptions.map((opt) => (
//                 <button
//                   key={opt.id}
//                   onClick={() => setActiveSort(opt.id)}
//                   className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-colors text-sm font-semibold ${
//                     activeSort === opt.id
//                       ? "bg-blue-100 text-blue-700"
//                       : "text-gray-600 hover:bg-gray-100"
//                   }`}
//                 >
//                   <opt.icon size={16} /> {opt.label}
//                 </button>
//               ))}
//             </div>

//             {sortedAndFilteredOffers.length > 0 ? (
//               <div className="space-y-4">
//                 {sortedAndFilteredOffers.map((offerGroup) => {
//                   const itineraryId =
//                     offerGroup[0].slices
//                       ?.flatMap(
//                         (s) =>
//                           s.segments?.map(
//                             (seg) =>
//                               `${seg.carrier?.iata_code || "XX"}${
//                                 seg.flight_number
//                               }-${seg.origin?.iata_code}`
//                           ) || []
//                       )
//                       .join("--") || offerGroup[0].id;
//                   return (
//                     <FlightOfferCard
//                       key={itineraryId}
//                       offerGroup={offerGroup}
//                       isExpanded={expandedItineraryId === itineraryId}
//                       onToggleDetails={() =>
//                         setExpandedItineraryId((prev) =>
//                           prev === itineraryId ? null : itineraryId
//                         )
//                       }
//                     />
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//                 <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">
//                   No Flights Found
//                 </h3>
//                 <p className="text-gray-500 max-w-md mx-auto">
//                   No flights match your filter criteria. Try adjusting your
//                   filters.
//                 </p>
//               </div>
//             )}

//             <div className="pt-4 text-center">
//               {hasNextPage && (
//                 <button
//                   onClick={() => fetchNextPage()}
//                   disabled={isFetchingNextPage}
//                   className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//                 >
//                   {isFetchingNextPage ? "Loading More..." : "Load More Flights"}
//                 </button>
//               )}
//               {!isLoading && !hasNextPage && allOffers.length > 0 && (
//                 <p className="text-gray-500">
//                   You&apos;ve reached the end of the list.
//                 </p>
//               )}
//             </div>
//           </main>
//         </div>
//       </div>

//       {isFilterSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setIsFilterSidebarOpen(false)}
//         />
//       )}
//       <div
//         className={`fixed left-0 top-0 h-full w-full max-w-xs bg-gray-50 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
//           isFilterSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex items-center justify-between p-4 border-b bg-white">
//           <h3 className="font-bold text-lg text-gray-800">Filters</h3>
//           <button
//             onClick={() => setIsFilterSidebarOpen(false)}
//             className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="p-4 overflow-y-auto">
//           <FilterSidebar
//             offers={groupedOffers}
//             filters={filters}
//             onFiltersChange={setFilters}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Plane,
  Loader,
  AlertCircle,
  DollarSign,
  Zap,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  Users,
  Briefcase,
} from "lucide-react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import FilterSidebar from "src/components/flight-results/FilterSidebar";
import FlightOfferCard from "src/components/flight-results/FlightOfferCard";
import ModifySearchForm from "src/components/flight-results/ModifySearchForm";

// API fetching function remains the same...
const fetchFlights = async ({ searchParams, pageParam = 1 }) => {
  if (!searchParams.has("slices")) {
    throw new Error(
      "Invalid search query. Please try again from the homepage."
    );
  }
  const payload = {
    slices: JSON.parse(searchParams.get("slices")).map((s) => ({
      origin: s.origin.code,
      destination: s.destination.code,
      departure_date: s.departure_date,
    })),
    passengers: JSON.parse(searchParams.get("passengers")),
    cabin_class: searchParams.get("cabinClass"),
    page: pageParam,
  };
  const res = await fetch("/api/flights/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
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
  return result;
};

// --- Helper Functions (unchanged) ---
const getStopsCount = (segments) => (segments?.length || 1) - 1;
const getDepartureHour = (dateTime) => new Date(dateTime).getHours();
const calculateTotalDuration = (offer) => {
  return offer.slices.reduce((total, slice) => {
    const durationMatch = slice.duration?.match(/PT(\d+)H(\d+)M/);
    if (!durationMatch) return total;
    const hours = parseInt(durationMatch[1] || "0", 10);
    const minutes = parseInt(durationMatch[2] || "0", 10);
    return total + hours * 60 + minutes;
  }, 0);
};

// --- Loading Skeleton using shadcn/ui ---
const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between">
        <div className="flex-grow md:border-r md:pr-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="flex-shrink-0 md:pl-6 mt-4 md:mt-0 flex flex-col items-center md:items-end">
          <Skeleton className="h-5 w-20 mb-1" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </CardContent>
    <div className="border-t bg-muted/70 px-4 py-3 flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
  </Card>
);

const SearchSummaryBar = ({ searchParams, onModifyClick, isOpen }) => {
  const displaySlices = JSON.parse(searchParams.get("slices") || "[]");
  const passengers = JSON.parse(searchParams.get("passengers") || "[]");
  const cabinClass = searchParams.get("cabinClass") || "economy";
  const totalPassengers = passengers.length;
  if (displaySlices.length === 0) return null;
  const departure = displaySlices[0];
  const returnSlice = displaySlices.length > 1;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-2 md:gap-4">
      <div className="flex items-center gap-4 text-sm overflow-x-auto w-full pb-2 md:pb-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Plane size={16} className="text-muted-foreground" />
          <span className="font-semibold">
            {departure.origin.code} → {departure.destination.code}
          </span>
          {returnSlice && <Badge variant="secondary">Round Trip</Badge>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Users size={16} className="text-muted-foreground" />
          <span className="font-semibold">
            {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Briefcase size={16} className="text-muted-foreground" />
          <span className="font-semibold capitalize">{cabinClass}</span>
        </div>
      </div>
      <Button
        onClick={onModifyClick}
        variant="secondary"
        className="w-full md:w-auto flex-shrink-0"
      >
        Modify Search
        <ChevronDown
          size={16}
          className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>
    </div>
  );
};

// --- Main Client Component ---
export default function ResultsClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [isModifySearchOpen, setIsModifySearchOpen] = useState(false);
  const modifySearchRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["flights", searchParams.toString()],
    queryFn: ({ pageParam }) => fetchFlights({ searchParams, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
    enabled: searchParams && searchParams.has("slices"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const [activeSort, setActiveSort] = useState("cheapest");
  const [expandedItineraryId, setExpandedItineraryId] = useState(null);
  const [filters, setFilters] = useState({
    airlines: [],
    stops: [],
    priceRange: { min: 0, max: 10000 },
    departureTime: [],
  });

  const allOffers = useMemo(
    () => data?.pages?.flatMap((page) => page.offers) || [],
    [data]
  );

  const groupedOffers = useMemo(() => {
    if (!allOffers || allOffers.length === 0) return [];
    const groups = new Map();
    allOffers.forEach((offer) => {
      const itineraryId =
        offer.slices
          ?.map((slice) =>
            slice.segments
              ?.map(
                (seg) =>
                  `${seg.carrier?.iata_code || "XX"}${seg.flight_number}-${
                    seg.origin?.iata_code
                  }`
              )
              .join("_")
          )
          .join("__") || offer.id;
      if (!groups.has(itineraryId)) {
        groups.set(itineraryId, []);
      }
      groups.get(itineraryId).push(offer);
    });
    const groupedArray = Array.from(groups.values());
    groupedArray.forEach((group) =>
      group.sort(
        (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
      )
    );
    return groupedArray;
  }, [allOffers]);

  // Filtering and Sorting logic remains the same...
  const filteredOffers = useMemo(() => {
    if (!groupedOffers) return [];
    const timeRanges = {
      "early-morning": [0, 6],
      morning: [6, 12],
      afternoon: [12, 18],
      evening: [18, 24],
    };
    return groupedOffers.filter((group) => {
      const offer = group[0];
      if (!offer) return false;
      const price = parseFloat(offer.total_amount);
      if (price < filters.priceRange.min || price > filters.priceRange.max)
        return false;
      if (
        filters.airlines.length > 0 &&
        !filters.airlines.includes(
          offer.slices[0]?.segments[0]?.carrier?.iata_code
        )
      )
        return false;
      if (filters.stops.length > 0) {
        const stops = getStopsCount(offer.slices[0].segments);
        if (
          !(
            filters.stops.includes(stops) ||
            (filters.stops.includes(2) && stops >= 2)
          )
        )
          return false;
      }
      if (filters.departureTime.length > 0) {
        const departureHour = getDepartureHour(
          offer.slices[0].segments[0].departing_at
        );
        if (
          !filters.departureTime.some(
            (slot) =>
              departureHour >= timeRanges[slot][0] &&
              departureHour < timeRanges[slot][1]
          )
        )
          return false;
      }
      return true;
    });
  }, [groupedOffers, filters]);

  const sortedAndFilteredOffers = useMemo(() => {
    const sorted = [...filteredOffers];
    switch (activeSort) {
      case "fastest":
        return sorted.sort(
          (a, b) => calculateTotalDuration(a[0]) - calculateTotalDuration(b[0])
        );
      case "best":
        const getScore = (o) =>
          parseFloat(o.total_amount) +
          calculateTotalDuration(o) * 2 +
          getStopsCount(o.slices[0].segments) * 100;
        return sorted.sort((a, b) => getScore(a[0]) - getScore(b[0]));
      case "cheapest":
      default:
        return sorted.sort(
          (a, b) =>
            parseFloat(a[0].total_amount) - parseFloat(b[0].total_amount)
        );
    }
  }, [filteredOffers, activeSort]);

  useEffect(() => {
    if (!groupedOffers || groupedOffers.length === 0) return;
    const prices = groupedOffers.map((g) => parseFloat(g[0].total_amount));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    if (filters.priceRange.min === 0 && filters.priceRange.max === 10000) {
      setFilters((prev) => ({ ...prev, priceRange: { min, max } }));
    }
  }, [groupedOffers, filters.priceRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modifySearchRef.current &&
        !modifySearchRef.current.contains(event.target)
      ) {
        setIsModifySearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    // The main loading fallback is handled by the server component's Suspense
    return null;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <div className="mt-4">
            <Button onClick={() => router.push("/")}>Return to Homepage</Button>
          </div>
        </Alert>
      </div>
    );
  }

  const sortOptions = [
    { id: "cheapest", label: "Cheapest", icon: DollarSign },
    { id: "fastest", label: "Fastest", icon: Zap },
    { id: "best", label: "Best", icon: Star },
  ];

  const displaySlices = JSON.parse(searchParams.get("slices") || "[]");

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="bg-background shadow-sm border-b sticky top-0 z-40">
        <div
          ref={modifySearchRef}
          className="container mx-auto px-4 py-3 max-w-7xl relative"
        >
          <SearchSummaryBar
            searchParams={searchParams}
            isOpen={isModifySearchOpen}
            onModifyClick={() => setIsModifySearchOpen((prev) => !prev)}
          />
          {isModifySearchOpen && (
            <div className="absolute top-full left-0 w-full mt-2 px-4 md:px-0">
              <ModifySearchForm />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg mb-4">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <Plane size={20} /> {displaySlices[0]?.origin.code} →{" "}
            {displaySlices[0]?.destination.code}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden lg:block h-fit sticky top-[85px]">
            <Card>
              <CardHeader>
                <CardTitle>Filter Results</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSidebar
                  offers={groupedOffers}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-4 min-w-0">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal size={16} className="mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs">
                  <SheetHeader>
                    <SheetTitle>Filter Results</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 overflow-y-auto">
                    <FilterSidebar
                      offers={groupedOffers}
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Card>
              <CardContent className="p-2">
                <ToggleGroup
                  type="single"
                  value={activeSort}
                  onValueChange={(value) => {
                    if (value) setActiveSort(value);
                  }}
                  className="w-full justify-around"
                >
                  {sortOptions.map((opt) => (
                    <ToggleGroupItem
                      key={opt.id}
                      value={opt.id}
                      className="flex-1"
                    >
                      <opt.icon size={16} className="mr-2" /> {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </CardContent>
            </Card>

            {sortedAndFilteredOffers.length > 0 ? (
              <div className="space-y-4">
                {sortedAndFilteredOffers.map((offerGroup) => {
                  const itineraryId =
                    offerGroup[0].slices
                      ?.flatMap(
                        (s) =>
                          s.segments?.map(
                            (seg) =>
                              `${seg.carrier?.iata_code || "XX"}${
                                seg.flight_number
                              }-${seg.origin?.iata_code}`
                          ) || []
                      )
                      .join("--") || offerGroup[0].id;
                  return (
                    <FlightOfferCard
                      key={itineraryId}
                      offerGroup={offerGroup}
                      isExpanded={expandedItineraryId === itineraryId}
                      onToggleDetails={() =>
                        setExpandedItineraryId((prev) =>
                          prev === itineraryId ? null : itineraryId
                        )
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Plane className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Flights Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No flights match your filter criteria. Try adjusting your
                  filters.
                </p>
              </Card>
            )}

            <div className="pt-4 text-center">
              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Loading More...
                    </>
                  ) : (
                    "Load More Flights"
                  )}
                </Button>
              )}
              {!isLoading && !hasNextPage && allOffers.length > 0 && (
                <p className="text-muted-foreground">
                  You've reached the end of the list.
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
