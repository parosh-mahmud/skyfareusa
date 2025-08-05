// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowRightLeft, Search, Loader, X, PlusCircle } from "lucide-react";

// // --- Reusable Suggestions Dropdown Component ---
// const SuggestionsList = ({
//   suggestions,
//   isLoading,
//   onSelect,
//   dropdownRef,
//   query,
//   onQueryChange,
//   placeholder,
// }) => {
//   const inputRef = useRef(null);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   return (
//     <div
//       ref={dropdownRef}
//       className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 flex flex-col"
//     >
//       <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             ref={inputRef}
//             type="text"
//             value={query}
//             onChange={onQueryChange}
//             placeholder={placeholder || "Type city or airport"}
//             className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-blue-300"
//           />
//         </div>
//       </div>
//       <div className="overflow-y-auto">
//         {isLoading ? (
//           <div className="flex justify-center items-center p-4">
//             <Loader className="w-5 h-5 text-gray-400 animate-spin" />
//           </div>
//         ) : suggestions.length > 0 ? (
//           suggestions.map((airport) => (
//             <div
//               key={airport.iata}
//               onClick={() => onSelect(airport)}
//               className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
//             >
//               <div className="flex justify-between items-center">
//                 <div>
//                   <p className="font-semibold text-sm text-gray-800">
//                     {airport.city}, {airport.country}
//                   </p>
//                   <p className="text-xs text-gray-500 truncate max-w-[200px]">
//                     {airport.name}
//                   </p>
//                 </div>
//                 <p className="font-mono text-sm text-gray-700 font-medium">
//                   {airport.iata}
//                 </p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="p-4 text-sm text-center text-gray-500">
//             {query.length >= 2 ? "No airports found." : "Type to search."}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Main Flight Search Form Component ---
// export default function FlightSearchForm({
//   variant = "main", // "main" or "compact"
//   initialState = null,
//   onNewSearch = null,
// }) {
//   const router = useRouter();
//   const [isSearching, setIsSearching] = useState(false);
//   const [tripType, setTripType] = useState(initialState?.tripType || "one-way");

//   // A single state to manage which airport input is active
//   const [activeAirportSelector, setActiveAirportSelector] = useState(null);
//   const [airportQuery, setAirportQuery] = useState("");
//   const [airportSuggestions, setAirportSuggestions] = useState([]);
//   const [isSearchingAirports, setIsSearchingAirports] = useState(false);

//   // Initialize slices from props or default
//   const [slices, setSlices] = useState(
//     initialState?.slices || [
//       {
//         origin: {
//           name: "Jashore",
//           code: "JSR",
//           airportName: "Jashore Airport",
//         },
//         destination: {
//           name: "Dhaka",
//           code: "DAC",
//           airportName: "Hazrat Shahjalal International Airport",
//         },
//         departure_date: "2025-08-20",
//       },
//     ]
//   );

//   const [passengers, setPassengers] = useState(
//     initialState?.passengers || [{ age: 30 }]
//   );
//   const activeDropdownRef = useRef(null);
//   const debounceTimeout = useRef(null);

//   // --- Airport Search Logic ---
//   const searchAirports = (query) => {
//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
//     if (query.length < 2) {
//       setAirportSuggestions([]);
//       return;
//     }
//     setIsSearchingAirports(true);
//     debounceTimeout.current = setTimeout(async () => {
//       try {
//         const response = await fetch(`/api/airports?q=${query}&limit=5`);
//         const result = await response.json();
//         setAirportSuggestions(result.success ? result.data : []);
//       } catch (error) {
//         console.error("Failed to fetch airports:", error);
//       } finally {
//         setIsSearchingAirports(false);
//       }
//     }, 300);
//   };

//   const handleAirportQueryChange = (e) => {
//     setAirportQuery(e.target.value);
//     searchAirports(e.target.value);
//   };

//   const handleSelectAirport = (airport) => {
//     if (!activeAirportSelector) return;
//     const { sliceIndex, field } = activeAirportSelector;
//     const newSlices = [...slices];
//     newSlices[sliceIndex][field] = {
//       name: airport.city,
//       code: airport.iata,
//       airportName: airport.name,
//     };

//     // For multi-city, auto-populate the next origin
//     if (
//       tripType === "multi-city" &&
//       field === "destination" &&
//       sliceIndex < newSlices.length - 1
//     ) {
//       newSlices[sliceIndex + 1].origin = {
//         name: airport.city,
//         code: airport.iata,
//         airportName: airport.name,
//       };
//     }

//     setSlices(newSlices);
//     setActiveAirportSelector(null);
//     setAirportQuery("");
//   };

//   const handleSwapLocations = () => {
//     const newSlices = [...slices];
//     const firstSlice = newSlices[0];
//     // Swap origin and destination of first slice
//     const temp = firstSlice.origin;
//     firstSlice.origin = firstSlice.destination;
//     firstSlice.destination = temp;
//     // If round trip, also update the return slice
//     if (tripType === "round-trip" && newSlices[1]) {
//       newSlices[1].origin = firstSlice.destination;
//       newSlices[1].destination = firstSlice.origin;
//     }
//     setSlices(newSlices);
//   };

//   const handleTripTypeChange = (newTripType) => {
//     setTripType(newTripType);
//     if (newTripType === "one-way") {
//       setSlices(slices.slice(0, 1));
//     } else if (newTripType === "round-trip") {
//       const firstSlice = slices[0];
//       const returnSlice = {
//         origin: firstSlice.destination,
//         destination: firstSlice.origin,
//         departure_date: "",
//       };
//       setSlices([firstSlice, returnSlice]);
//     } else if (newTripType === "multi-city") {
//       if (slices.length < 2) {
//         setSlices([
//           ...slices,
//           {
//             origin: slices[0]?.destination || { name: "", code: "" },
//             destination: { name: "", code: "" },
//             departure_date: "",
//           },
//         ]);
//       }
//     }
//   };

//   const handleAddSlice = () => {
//     const lastDestination = slices[slices.length - 1]?.destination || {
//       name: "",
//       code: "",
//     };
//     setSlices([
//       ...slices,
//       {
//         origin: lastDestination,
//         destination: { name: "", code: "" },
//         departure_date: "",
//       },
//     ]);
//   };

//   const handleRemoveSlice = (index) => {
//     if (slices.length > 2) {
//       setSlices(slices.filter((_, i) => i !== index));
//     }
//   };

//   const handleSliceDateChange = (index, date) => {
//     const newSlices = [...slices];
//     newSlices[index].departure_date = date;
//     setSlices(newSlices);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSearching(true);
//     try {
//       const apiSlices = slices.map((slice) => ({
//         origin: slice.origin.code,
//         destination: slice.destination.code,
//         departure_date: slice.departure_date,
//       }));
//       const searchPayload = {
//         slices: apiSlices,
//         passengers: passengers,
//         cabin_class: "economy",
//       };

//       const response = await fetch("/api/flights/search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(searchPayload),
//       });
//       const result = await response.json();

//       if (result.success) {
//         const searchData = {
//           searchParams: { tripType, slices, passengers },
//           results: result,
//         };

//         if (onNewSearch) {
//           // If we're on results page, call the callback
//           onNewSearch(result, { tripType, slices, passengers });
//         } else {
//           // If we're on main page, navigate to results
//           sessionStorage.setItem(
//             "flightSearchResults",
//             JSON.stringify(searchData)
//           );
//           router.push("/flights/results");
//         }
//       } else {
//         alert(
//           `Search failed: ${
//             result.details?.[0]?.message || result.error || "Please try again."
//           }`
//         );
//       }
//     } catch (error) {
//       alert("An error occurred while searching for flights.");
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         activeDropdownRef.current &&
//         !activeDropdownRef.current.contains(event.target)
//       ) {
//         const isTrigger = Array.from(
//           document.querySelectorAll(".airport-selector-trigger")
//         ).some((el) => el.contains(event.target));
//         if (!isTrigger) {
//           setActiveAirportSelector(null);
//         }
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const day = date.getDate();
//     const month = date.toLocaleDateString("en-US", { month: "short" });
//     const year = date.getFullYear().toString().slice(-2);
//     const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
//     return { day, month, year, dayName, full: `${day} ${month}'${year}` };
//   };

//   const commonSuggestionProps = {
//     suggestions: airportSuggestions,
//     isLoading: isSearchingAirports,
//     query: airportQuery,
//     onQueryChange: handleAirportQueryChange,
//   };

//   // Compact layout for results page
//   if (variant === "compact") {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <form onSubmit={handleSubmit}>
//           {/* Trip Type Radio Buttons */}
//           <div className="flex items-center gap-6 mb-4">
//             {["one-way", "round-trip", "multi-city"].map((type) => (
//               <label
//                 key={type}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <input
//                   type="radio"
//                   name="tripType"
//                   value={type}
//                   checked={tripType === type}
//                   onChange={() => handleTripTypeChange(type)}
//                   className="sr-only"
//                 />
//                 <div
//                   className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                     tripType === type
//                       ? "border-blue-600 bg-blue-600"
//                       : "border-gray-300"
//                   }`}
//                 >
//                   {tripType === type && (
//                     <div className="w-2 h-2 bg-white rounded-full"></div>
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm font-medium capitalize ${
//                     tripType === type ? "text-blue-600" : "text-gray-500"
//                   }`}
//                 >
//                   {type.replace("-", " ")}
//                 </span>
//               </label>
//             ))}
//           </div>

//           {/* Compact Form Fields */}
//           <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-end">
//             {/* FROM */}
//             <div
//               className="relative airport-selector-trigger"
//               ref={
//                 activeAirportSelector?.sliceIndex === 0 &&
//                 activeAirportSelector?.field === "origin"
//                   ? activeDropdownRef
//                   : null
//               }
//             >
//               <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
//                 FROM
//               </label>
//               <div
//                 onClick={() =>
//                   setActiveAirportSelector({ sliceIndex: 0, field: "origin" })
//                 }
//                 className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 bg-white"
//               >
//                 <p className="font-bold text-blue-900 truncate">
//                   {slices[0]?.origin?.name || "Select"}
//                 </p>
//                 <p className="text-xs text-gray-400 truncate">
//                   {slices[0]?.origin?.code
//                     ? `${slices[0].origin.code}, ${slices[0].origin.airportName}`
//                     : ""}
//                 </p>
//               </div>
//               {activeAirportSelector?.sliceIndex === 0 &&
//                 activeAirportSelector?.field === "origin" && (
//                   <SuggestionsList
//                     {...commonSuggestionProps}
//                     onSelect={handleSelectAirport}
//                   />
//                 )}
//             </div>

//             {/* TO */}
//             <div
//               className="relative airport-selector-trigger"
//               ref={
//                 activeAirportSelector?.sliceIndex === 0 &&
//                 activeAirportSelector?.field === "destination"
//                   ? activeDropdownRef
//                   : null
//               }
//             >
//               <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
//                 TO
//               </label>
//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={handleSwapLocations}
//                   className="absolute -left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors z-10 shadow-sm"
//                 >
//                   <ArrowRightLeft className="w-3 h-3 text-gray-600" />
//                 </button>
//                 <div
//                   onClick={() =>
//                     setActiveAirportSelector({
//                       sliceIndex: 0,
//                       field: "destination",
//                     })
//                   }
//                   className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 bg-white"
//                 >
//                   <p className="font-bold text-blue-900 truncate">
//                     {slices[0]?.destination?.name || "Select"}
//                   </p>
//                   <p className="text-xs text-gray-400 truncate">
//                     {slices[0]?.destination?.code
//                       ? `${slices[0].destination.code}, ${slices[0].destination.airportName}`
//                       : ""}
//                   </p>
//                 </div>
//               </div>
//               {activeAirportSelector?.sliceIndex === 0 &&
//                 activeAirportSelector?.field === "destination" && (
//                   <SuggestionsList
//                     {...commonSuggestionProps}
//                     onSelect={handleSelectAirport}
//                   />
//                 )}
//             </div>

//             {/* DEPARTURE DATE */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
//                 DEPARTURE DATE
//               </label>
//               <div className="p-3 border border-gray-200 rounded-lg bg-white">
//                 {slices[0]?.departure_date ? (
//                   <>
//                     <p className="font-bold text-blue-900">
//                       {formatDate(slices[0].departure_date).full}
//                     </p>
//                     <p className="text-xs text-gray-400">
//                       {formatDate(slices[0].departure_date).dayName}
//                     </p>
//                   </>
//                 ) : (
//                   <p className="text-gray-400">Select date</p>
//                 )}
//                 <input
//                   type="date"
//                   value={slices[0]?.departure_date || ""}
//                   onChange={(e) => handleSliceDateChange(0, e.target.value)}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                   min={new Date().toISOString().split("T")[0]}
//                 />
//               </div>
//             </div>

//             {/* RETURN DATE */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
//                 RETURN DATE
//               </label>
//               <div className="p-3 border border-gray-200 rounded-lg bg-white">
//                 {tripType === "round-trip" ? (
//                   slices[1]?.departure_date ? (
//                     <>
//                       <p className="font-bold text-blue-900">
//                         {formatDate(slices[1].departure_date).full}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         {formatDate(slices[1].departure_date).dayName}
//                       </p>
//                     </>
//                   ) : (
//                     <p className="text-gray-400">Select date</p>
//                   )
//                 ) : (
//                   <p className="text-xs text-gray-500">
//                     Save more on return flight
//                   </p>
//                 )}
//                 {tripType === "round-trip" && (
//                   <input
//                     type="date"
//                     value={slices[1]?.departure_date || ""}
//                     onChange={(e) => handleSliceDateChange(1, e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                     min={
//                       slices[0]?.departure_date ||
//                       new Date().toISOString().split("T")[0]
//                     }
//                   />
//                 )}
//               </div>
//             </div>

//             {/* TRAVELER, CLASS */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
//                 TRAVELER, CLASS
//               </label>
//               <div className="p-3 border border-gray-200 rounded-lg bg-white">
//                 <p className="font-bold text-blue-900">
//                   {passengers.length} Traveler
//                 </p>
//                 <p className="text-xs text-gray-400">Economy</p>
//               </div>
//             </div>

//             {/* SEARCH BUTTON */}
//             <div>
//               <button
//                 type="submit"
//                 disabled={isSearching}
//                 className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-6 py-4 rounded-lg shadow-lg flex items-center justify-center transition-colors"
//               >
//                 {isSearching ? (
//                   <Loader className="w-5 h-5 animate-spin" />
//                 ) : (
//                   "Search"
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     );
//   }

//   // Original main page layout
//   const renderSlicesUI = () => {
//     if (tripType === "multi-city") {
//       return (
//         <div className="mb-4">
//           {slices.map((slice, index) => (
//             <div
//               key={index}
//               className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center mb-2"
//             >
//               <div
//                 className="relative airport-selector-trigger"
//                 ref={
//                   activeAirportSelector?.sliceIndex === index &&
//                   activeAirportSelector?.field === "origin"
//                     ? activeDropdownRef
//                     : null
//                 }
//               >
//                 <div
//                   onClick={() =>
//                     setActiveAirportSelector({
//                       sliceIndex: index,
//                       field: "origin",
//                     })
//                   }
//                   className="p-3 border rounded-lg cursor-pointer hover:border-blue-400"
//                 >
//                   <p className="text-xs text-gray-500">FROM</p>
//                   <p className="font-bold truncate">
//                     {slice.origin.name || "Select Origin"}
//                   </p>
//                 </div>
//                 {activeAirportSelector?.sliceIndex === index &&
//                   activeAirportSelector?.field === "origin" && (
//                     <SuggestionsList
//                       {...commonSuggestionProps}
//                       onSelect={handleSelectAirport}
//                     />
//                   )}
//               </div>
//               <div
//                 className="relative airport-selector-trigger"
//                 ref={
//                   activeAirportSelector?.sliceIndex === index &&
//                   activeAirportSelector?.field === "destination"
//                     ? activeDropdownRef
//                     : null
//                 }
//               >
//                 <div
//                   onClick={() =>
//                     setActiveAirportSelector({
//                       sliceIndex: index,
//                       field: "destination",
//                     })
//                   }
//                   className="p-3 border rounded-lg cursor-pointer hover:border-blue-400"
//                 >
//                   <p className="text-xs text-gray-500">TO</p>
//                   <p className="font-bold truncate">
//                     {slice.destination.name || "Select Destination"}
//                   </p>
//                 </div>
//                 {activeAirportSelector?.sliceIndex === index &&
//                   activeAirportSelector?.field === "destination" && (
//                     <SuggestionsList
//                       {...commonSuggestionProps}
//                       onSelect={handleSelectAirport}
//                     />
//                   )}
//               </div>
//               <input
//                 type="date"
//                 value={slice.departure_date}
//                 onChange={(e) => handleSliceDateChange(index, e.target.value)}
//                 className="p-3.5 border rounded-lg text-gray-700"
//               />
//               {slices.length > 2 && (
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveSlice(index)}
//                   className="p-2 text-gray-400 hover:text-red-500"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       );
//     }

//     const oneWayReturnSlice = slices[0];
//     const returnSlice = slices[1];

//     return (
//       <div className="grid grid-cols-1 md:grid-cols-5 border border-gray-200 rounded-2xl mb-12">
//         <div
//           className="relative p-5 border-b md:border-b-0 md:border-r airport-selector-trigger"
//           ref={
//             activeAirportSelector?.sliceIndex === 0 &&
//             activeAirportSelector?.field === "origin"
//               ? activeDropdownRef
//               : null
//           }
//         >
//           <div
//             onClick={() =>
//               setActiveAirportSelector({ sliceIndex: 0, field: "origin" })
//             }
//             className="cursor-pointer"
//           >
//             <p className="text-xs text-gray-500 uppercase">From</p>
//             <p className="text-xl font-bold text-blue-900 truncate">
//               {oneWayReturnSlice.origin.name}
//             </p>
//             <p className="text-xs text-gray-400 truncate">
//               {oneWayReturnSlice.origin.airportName}
//             </p>
//           </div>
//           {activeAirportSelector?.sliceIndex === 0 &&
//             activeAirportSelector?.field === "origin" && (
//               <SuggestionsList
//                 {...commonSuggestionProps}
//                 onSelect={handleSelectAirport}
//               />
//             )}
//         </div>
//         <div
//           className="relative p-5 border-b md:border-b-0 md:border-r airport-selector-trigger"
//           ref={
//             activeAirportSelector?.sliceIndex === 0 &&
//             activeAirportSelector?.field === "destination"
//               ? activeDropdownRef
//               : null
//           }
//         >
//           <button
//             type="button"
//             onClick={handleSwapLocations}
//             className="absolute left-0 top-1/2 -translate-x-1/2 p-2 bg-white rounded-full border shadow-md"
//           >
//             <ArrowRightLeft className="w-4 h-4" />
//           </button>
//           <div
//             onClick={() =>
//               setActiveAirportSelector({ sliceIndex: 0, field: "destination" })
//             }
//             className="cursor-pointer"
//           >
//             <p className="text-xs text-gray-500 uppercase">To</p>
//             <p className="text-xl font-bold text-blue-900 truncate">
//               {oneWayReturnSlice.destination.name}
//             </p>
//             <p className="text-xs text-gray-400 truncate">
//               {oneWayReturnSlice.destination.airportName}
//             </p>
//           </div>
//           {activeAirportSelector?.sliceIndex === 0 &&
//             activeAirportSelector?.field === "destination" && (
//               <SuggestionsList
//                 {...commonSuggestionProps}
//                 onSelect={handleSelectAirport}
//               />
//             )}
//         </div>
//         <div className="p-5 border-b md:border-b-0 md:border-r">
//           <p className="text-xs text-gray-500 uppercase">Departure</p>
//           <input
//             type="date"
//             value={oneWayReturnSlice.departure_date}
//             onChange={(e) => handleSliceDateChange(0, e.target.value)}
//             className="text-xl font-bold bg-transparent border-none outline-none w-full"
//             min={new Date().toISOString().split("T")[0]}
//           />
//         </div>
//         <div className="p-5 border-b md:border-b-0 md:border-r">
//           <p className="text-xs text-gray-500 uppercase">Return</p>
//           {tripType === "round-trip" ? (
//             <input
//               type="date"
//               value={returnSlice?.departure_date}
//               onChange={(e) => handleSliceDateChange(1, e.target.value)}
//               className="text-xl font-bold bg-transparent border-none outline-none w-full"
//               min={oneWayReturnSlice.departure_date}
//             />
//           ) : (
//             <p
//               className="pt-3 text-gray-400 text-sm cursor-pointer"
//               onClick={() => handleTripTypeChange("round-trip")}
//             >
//               Add return date
//             </p>
//           )}
//         </div>
//         <div className="p-5">
//           <p className="text-xs text-gray-500 font-medium mb-2 uppercase">
//             PASSENGERS
//           </p>
//           <p className="text-xl font-bold text-blue-900 mb-1">
//             {passengers.length} Traveler
//           </p>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl relative z-10 pt-8">
//       <form onSubmit={handleSubmit} className="px-8">
//         <div className="flex items-center gap-6 mb-8 pt-4">
//           {["one-way", "round-trip", "multi-city"].map((type) => (
//             <label
//               key={type}
//               className="flex items-center gap-2 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 name="tripType"
//                 value={type}
//                 checked={tripType === type}
//                 onChange={() => handleTripTypeChange(type)}
//                 className="sr-only"
//               />
//               <div
//                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                   tripType === type
//                     ? "border-blue-600 bg-blue-600"
//                     : "border-gray-300"
//                 }`}
//               >
//                 {tripType === type && (
//                   <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
//                 )}
//               </div>
//               <span
//                 className={`font-medium text-base capitalize ${
//                   tripType === type ? "text-blue-600" : "text-gray-400"
//                 }`}
//               >
//                 {type.replace("-", " ")}
//               </span>
//             </label>
//           ))}
//         </div>
//         {renderSlicesUI()}
//         {tripType === "multi-city" && (
//           <button
//             type="button"
//             onClick={handleAddSlice}
//             className="flex items-center gap-2 text-blue-600 font-medium mb-6 hover:text-blue-800"
//           >
//             <PlusCircle className="w-5 h-5" /> Add Another Flight
//           </button>
//         )}
//       </form>
//       <div className="flex justify-center relative -mb-7">
//         <button
//           type="submit"
//           onClick={handleSubmit}
//           disabled={isSearching}
//           className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-16 py-4 rounded-2xl shadow-lg flex items-center justify-center"
//         >
//           {isSearching ? (
//             <Loader className="w-6 h-6 animate-spin" />
//           ) : (
//             "Search Flights"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { Loader, Plus, X } from "lucide-react";
// import DateSelector from "../flight-search/DateSelector";
// import FromToSelector from "../flight-search/FromToSelector";
// import TravelerClassSelector from "../flight-search/TravelerClassSelector";

// export default function FlightSearchForm({
//   variant = "main", // "main" or "compact"
//   initialState = null,
//   onNewSearch = null,
// }) {
//   const router = useRouter();
//   const [isSearching, setIsSearching] = useState(false);
//   const [tripType, setTripType] = useState(initialState?.tripType || "one-way");
//   const [activeAirportSelector, setActiveAirportSelector] = useState(null);
//   const [airportQuery, setAirportQuery] = useState("");
//   const [airportSuggestions, setAirportSuggestions] = useState([]);
//   const [isSearchingAirports, setIsSearchingAirports] = useState(false);

//   const [slices, setSlices] = useState(
//     initialState?.slices || [
//       {
//         origin: {
//           name: "Jashore",
//           code: "JSR",
//           airportName: "Jashore Airport",
//         },
//         destination: {
//           name: "Dhaka",
//           code: "DAC",
//           airportName: "Hazrat Shahjalal International Airport",
//         },
//         departure_date: "2025-08-20",
//       },
//     ]
//   );

//   const [passengers, setPassengers] = useState(
//     initialState?.passengers || [{ type: "adult", age: 30 }]
//   );
//   const [cabinClass, setCabinClass] = useState("economy");

//   const debounceTimeout = useRef(null);

//   const searchAirports = (query) => {
//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
//     if (query.length < 2) {
//       setAirportSuggestions([]);
//       return;
//     }
//     setIsSearchingAirports(true);
//     debounceTimeout.current = setTimeout(async () => {
//       try {
//         const response = await fetch(`/api/airports?q=${query}&limit=5`);
//         const result = await response.json();
//         setAirportSuggestions(result.success ? result.data : []);
//       } catch (error) {
//         console.error("Failed to fetch airports:", error);
//       } finally {
//         setIsSearchingAirports(false);
//       }
//     }, 300);
//   };

//   const handleAirportQueryChange = (e) => {
//     setAirportQuery(e.target.value);
//     searchAirports(e.target.value);
//   };

//   const handleSelectAirport = (airport, field, sliceIndex = 0) => {
//     const newSlices = [...slices];
//     newSlices[sliceIndex][field] = {
//       name: airport.city,
//       code: airport.iata,
//       airportName: airport.name,
//     };

//     // For round-trip, update the return slice
//     if (tripType === "round-trip" && newSlices[1] && sliceIndex === 0) {
//       if (field === "origin") newSlices[1].destination = newSlices[0].origin;
//       else newSlices[1].origin = newSlices[0].destination;
//     }

//     setSlices(newSlices);
//     setActiveAirportSelector(null);
//     setAirportQuery("");
//     setAirportSuggestions([]);
//   };

//   const handleSwapLocations = (sliceIndex = 0) => {
//     const newSlices = [...slices];
//     const temp = newSlices[sliceIndex].origin;
//     newSlices[sliceIndex].origin = newSlices[sliceIndex].destination;
//     newSlices[sliceIndex].destination = temp;

//     // For round-trip, also swap the return slice
//     if (tripType === "round-trip" && newSlices[1] && sliceIndex === 0) {
//       newSlices[1].origin = newSlices[0].destination;
//       newSlices[1].destination = newSlices[0].origin;
//     }

//     setSlices(newSlices);
//   };

//   const handleTripTypeChange = (newTripType) => {
//     setTripType(newTripType);

//     if (newTripType === "one-way") {
//       setSlices(slices.slice(0, 1));
//     } else if (newTripType === "round-trip") {
//       const firstSlice = slices[0];
//       setSlices([
//         firstSlice,
//         {
//           origin: firstSlice.destination,
//           destination: firstSlice.origin,
//           departure_date: "",
//         },
//       ]);
//     } else if (newTripType === "multi-city") {
//       // Start with at least 2 slices for multi-city
//       if (slices.length < 2) {
//         const firstSlice = slices[0];
//         setSlices([
//           firstSlice,
//           {
//             origin: firstSlice.destination || {
//               name: "",
//               code: "",
//               airportName: "",
//             },
//             destination: { name: "", code: "", airportName: "" },
//             departure_date: "",
//           },
//         ]);
//       }
//     }
//   };

//   const addMultiCitySlice = () => {
//     const lastSlice = slices[slices.length - 1];
//     const newSlice = {
//       origin: lastSlice.destination || { name: "", code: "", airportName: "" },
//       destination: { name: "", code: "", airportName: "" },
//       departure_date: "",
//     };
//     setSlices([...slices, newSlice]);
//   };

//   const removeMultiCitySlice = (index) => {
//     if (slices.length > 2) {
//       const newSlices = slices.filter((_, i) => i !== index);
//       setSlices(newSlices);
//     }
//   };

//   const handleDepartureChange = (date, sliceIndex = 0) => {
//     const newSlices = [...slices];
//     newSlices[sliceIndex].departure_date = date;
//     setSlices(newSlices);
//   };

//   const handleReturnChange = (date) => {
//     const newSlices = [...slices];
//     if (newSlices[1]) {
//       newSlices[1].departure_date = date;
//     }
//     setSlices(newSlices);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation for multi-city
//     if (tripType === "multi-city") {
//       for (let i = 0; i < slices.length; i++) {
//         const slice = slices[i];
//         if (
//           !slice.origin.code ||
//           !slice.destination.code ||
//           !slice.departure_date
//         ) {
//           alert(`Please complete all fields for flight ${i + 1}`);
//           return;
//         }
//       }
//     }

//     setIsSearching(true);
//     try {
//       const apiSlices = slices.map((s) => ({
//         origin: s.origin.code,
//         destination: s.destination.code,
//         departure_date: s.departure_date,
//       }));

//       const searchPayload = {
//         slices: apiSlices,
//         passengers,
//         cabin_class: cabinClass,
//       };

//       const response = await fetch("/api/flights/search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(searchPayload),
//       });
//       const result = await response.json();

//       if (result.success) {
//         const searchData = {
//           searchParams: { tripType, slices, passengers },
//           results: result,
//         };

//         if (onNewSearch) {
//           onNewSearch(result, { tripType, slices, passengers });
//         } else {
//           sessionStorage.setItem(
//             "flightSearchResults",
//             JSON.stringify(searchData)
//           );
//           router.push("/flight-results");
//         }
//       } else {
//         alert(`Search failed: ${result.details?.[0]?.message || result.error}`);
//       }
//     } catch (error) {
//       alert("An error occurred.");
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isTrigger = Array.from(
//         document.querySelectorAll(".airport-selector-trigger")
//       ).some((el) => el.contains(event.target));
//       if (!isTrigger) {
//         setActiveAirportSelector(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Compact layout for results page
//   if (variant === "compact") {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <form onSubmit={handleSubmit}>
//           <div className="flex items-center gap-6 mb-4">
//             {["one-way", "round-trip", "multi-city"].map((type) => (
//               <label
//                 key={type}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <input
//                   type="radio"
//                   name="tripType"
//                   value={type}
//                   checked={tripType === type}
//                   onChange={() => handleTripTypeChange(type)}
//                   className="sr-only"
//                 />
//                 <div
//                   className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                     tripType === type ? "border-blue-600" : "border-gray-300"
//                   }`}
//                 >
//                   {tripType === type && (
//                     <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm font-medium capitalize ${
//                     tripType === type ? "text-blue-600" : "text-gray-500"
//                   }`}
//                 >
//                   {type.replace("-", " ")}
//                 </span>
//               </label>
//             ))}
//           </div>

//           {tripType === "multi-city" ? (
//             <div className="space-y-4">
//               {slices.map((slice, index) => (
//                 <div
//                   key={index}
//                   className="border border-gray-200 rounded-lg p-4"
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <h4 className="font-semibold text-gray-800">
//                       Flight {index + 1}
//                     </h4>
//                     {slices.length > 2 && (
//                       <button
//                         type="button"
//                         onClick={() => removeMultiCitySlice(index)}
//                         className="text-red-500 hover:text-red-700 p-1"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <FromToSelector
//                       fromValue={slice.origin}
//                       toValue={slice.destination}
//                       onFromSelect={(airport) =>
//                         handleSelectAirport(airport, "origin", index)
//                       }
//                       onToSelect={(airport) =>
//                         handleSelectAirport(airport, "destination", index)
//                       }
//                       onSwap={() => handleSwapLocations(index)}
//                       activeSelector={activeAirportSelector}
//                       onActivateSelector={setActiveAirportSelector}
//                       suggestions={airportSuggestions}
//                       isLoading={isSearchingAirports}
//                       query={airportQuery}
//                       onQueryChange={handleAirportQueryChange}
//                       variant="compact"
//                     />
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
//                         DEPARTURE DATE
//                       </label>
//                       <input
//                         type="date"
//                         value={slice.departure_date}
//                         onChange={(e) =>
//                           handleDepartureChange(e.target.value, index)
//                         }
//                         min={new Date().toISOString().split("T")[0]}
//                         className="w-full p-3 border border-gray-200 rounded-lg bg-white"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={addMultiCitySlice}
//                   className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
//                   disabled={slices.length >= 6}
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add Another Flight
//                 </button>
//                 <span className="text-xs text-gray-500">
//                   {slices.length}/6 flights
//                 </span>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <TravelerClassSelector
//                   passengers={passengers}
//                   onPassengersChange={setPassengers}
//                   cabinClass={cabinClass}
//                   onCabinClassChange={setCabinClass}
//                   variant="compact"
//                 />
//                 <button
//                   type="submit"
//                   disabled={isSearching}
//                   className="w-full bg-yellow-400 hover:bg-yellow-500 font-bold h-11 text-blue-900 rounded-lg flex items-center justify-center"
//                 >
//                   {isSearching ? (
//                     <Loader className="animate-spin w-5 h-5" />
//                   ) : (
//                     "Search Multi-City"
//                   )}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-3 items-end">
//               <div className="md:col-span-2 lg:col-span-3">
//                 <FromToSelector
//                   fromValue={slices[0]?.origin}
//                   toValue={slices[0]?.destination}
//                   onFromSelect={(airport) =>
//                     handleSelectAirport(airport, "origin")
//                   }
//                   onToSelect={(airport) =>
//                     handleSelectAirport(airport, "destination")
//                   }
//                   onSwap={() => handleSwapLocations()}
//                   activeSelector={activeAirportSelector}
//                   onActivateSelector={setActiveAirportSelector}
//                   suggestions={airportSuggestions}
//                   isLoading={isSearchingAirports}
//                   query={airportQuery}
//                   onQueryChange={handleAirportQueryChange}
//                   variant="compact"
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <DateSelector
//                   departureDate={slices[0]?.departure_date}
//                   returnDate={slices[1]?.departure_date}
//                   onDepartureChange={handleDepartureChange}
//                   onReturnChange={handleReturnChange}
//                   tripType={tripType}
//                   variant="compact"
//                 />
//               </div>
//               <TravelerClassSelector
//                 passengers={passengers}
//                 onPassengersChange={setPassengers}
//                 cabinClass={cabinClass}
//                 onCabinClassChange={setCabinClass}
//                 variant="compact"
//               />
//               <button
//                 type="submit"
//                 disabled={isSearching}
//                 className="w-full bg-yellow-400 hover:bg-yellow-500 font-bold h-11 text-blue-900 rounded-lg flex items-center justify-center"
//               >
//                 {isSearching ? (
//                   <Loader className="animate-spin w-5 h-5" />
//                 ) : (
//                   "Search"
//                 )}
//               </button>
//             </div>
//           )}
//         </form>
//       </div>
//     );
//   }

//   // Main variant layout
//   return (
//     <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl relative z-10 pt-8">
//       <form onSubmit={handleSubmit} className="px-8">
//         <div className="flex items-center gap-6 mb-8 pt-4">
//           {["one-way", "round-trip", "multi-city"].map((type) => (
//             <label
//               key={type}
//               className="flex items-center gap-2 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 name="tripType"
//                 value={type}
//                 checked={tripType === type}
//                 onChange={() => handleTripTypeChange(type)}
//                 className="sr-only"
//               />
//               <div
//                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                   tripType === type
//                     ? "border-blue-600 bg-blue-600"
//                     : "border-gray-300"
//                 }`}
//               >
//                 {tripType === type && (
//                   <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
//                 )}
//               </div>
//               <span
//                 className={`font-medium text-base capitalize ${
//                   tripType === type ? "text-blue-600" : "text-gray-400"
//                 }`}
//               >
//                 {type.replace("-", " ")}
//               </span>
//             </label>
//           ))}
//         </div>

//         {tripType === "multi-city" ? (
//           <div className="space-y-6 mb-12">
//             {slices.map((slice, index) => (
//               <div
//                 key={index}
//                 className="border border-gray-200 rounded-2xl overflow-hidden"
//               >
//                 <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
//                   <h4 className="font-semibold text-gray-800">
//                     Flight {index + 1}
//                   </h4>
//                   {slices.length > 2 && (
//                     <button
//                       type="button"
//                       onClick={() => removeMultiCitySlice(index)}
//                       className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
//                     >
//                       <X className="w-5 h-5" />
//                     </button>
//                   )}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-3">
//                   <FromToSelector
//                     fromValue={slice.origin}
//                     toValue={slice.destination}
//                     onFromSelect={(airport) =>
//                       handleSelectAirport(airport, "origin", index)
//                     }
//                     onToSelect={(airport) =>
//                       handleSelectAirport(airport, "destination", index)
//                     }
//                     onSwap={() => handleSwapLocations(index)}
//                     activeSelector={activeAirportSelector}
//                     onActivateSelector={setActiveAirportSelector}
//                     suggestions={airportSuggestions}
//                     isLoading={isSearchingAirports}
//                     query={airportQuery}
//                     onQueryChange={handleAirportQueryChange}
//                   />
//                   <div className="p-5 border-b md:border-b-0 md:border-r bg-white">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-2">
//                       DEPARTURE DATE
//                     </p>
//                     <input
//                       type="date"
//                       value={slice.departure_date}
//                       onChange={(e) =>
//                         handleDepartureChange(e.target.value, index)
//                       }
//                       min={new Date().toISOString().split("T")[0]}
//                       className="w-full text-xl font-bold text-blue-900 bg-transparent border-none outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}

//             <div className="flex items-center justify-center gap-4">
//               <button
//                 type="button"
//                 onClick={addMultiCitySlice}
//                 className="flex items-center gap-2 px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium"
//                 disabled={slices.length >= 6}
//               >
//                 <Plus className="w-5 h-5" />
//                 Add Another Flight
//               </button>
//               <span className="text-sm text-gray-500">
//                 {slices.length}/6 flights added
//               </span>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden">
//               <TravelerClassSelector
//                 passengers={passengers}
//                 onPassengersChange={setPassengers}
//                 cabinClass={cabinClass}
//                 onCabinClassChange={setCabinClass}
//               />
//               <div className="p-5 bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-600 mb-2">Ready to search?</p>
//                   <p className="text-xs text-gray-500">
//                     {slices.length} flight{slices.length > 1 ? "s" : ""} •{" "}
//                     {passengers.length} passenger
//                     {passengers.length > 1 ? "s" : ""}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-5 border border-gray-200 rounded-2xl mb-12">
//             <FromToSelector
//               fromValue={slices[0]?.origin}
//               toValue={slices[0]?.destination}
//               onFromSelect={(airport) => handleSelectAirport(airport, "origin")}
//               onToSelect={(airport) =>
//                 handleSelectAirport(airport, "destination")
//               }
//               onSwap={() => handleSwapLocations()}
//               activeSelector={activeAirportSelector}
//               onActivateSelector={setActiveAirportSelector}
//               suggestions={airportSuggestions}
//               isLoading={isSearchingAirports}
//               query={airportQuery}
//               onQueryChange={handleAirportQueryChange}
//             />
//             <DateSelector
//               departureDate={slices[0]?.departure_date}
//               returnDate={slices[1]?.departure_date}
//               onDepartureChange={handleDepartureChange}
//               onReturnChange={handleReturnChange}
//               tripType={tripType}
//             />
//             <TravelerClassSelector
//               passengers={passengers}
//               onPassengersChange={setPassengers}
//               cabinClass={cabinClass}
//               onCabinClassChange={setCabinClass}
//             />
//           </div>
//         )}
//       </form>

//       <div className="flex justify-center relative -mb-7">
//         <button
//           type="submit"
//           onClick={handleSubmit}
//           disabled={isSearching}
//           className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-16 py-4 rounded-2xl shadow-lg flex items-center justify-center"
//         >
//           {isSearching ? (
//             <Loader className="w-6 h-6 animate-spin" />
//           ) : tripType === "multi-city" ? (
//             "Search Multi-City Flights"
//           ) : (
//             "Search Flights"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Loader, X, PlusCircle } from "lucide-react";
import TripTypeSelector from "./TripTypeSelector";
import SuggestionsList from "./SuggestionsList";
import DatePicker from "../flight-search/DatePicker";
import TravelerClassSelector from "../flight-search/TravelerClassSelector";

export default function FlightSearchForm({
  variant = "main", // "main" or "compact"
  initialState = null,
  onNewSearch = null,
}) {
  const router = useRouter();

  // ─── State & Refs ──────────────────────────────────────────────────────────────
  const [isSearching, setIsSearching] = useState(false);
  const [tripType, setTripType] = useState(initialState?.tripType || "one-way");
  const [activeSelector, setActiveSelector] = useState(null);
  const [airportQuery, setAirportQuery] = useState("");
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [isSearchingAirports, setIsSearchingAirports] = useState(false);
  const [cabinClass, setCabinClass] = useState(
    initialState?.cabinClass || "economy"
  );
  const [slices, setSlices] = useState(
    initialState?.slices || [
      {
        origin: {
          name: "Dhaka",
          code: "DAC",
          airportName: "Hazrat Shahjalal International Airport",
        },
        destination: {
          name: "Cox's Bazar",
          code: "CXB",
          airportName: "Cox's Bazar Airport",
        },
        departure_date: "2025-08-25",
      },
    ]
  );
  const [passengers, setPassengers] = useState(
    initialState?.passengers || [{ type: "adult" }]
  );

  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  // ─── Airport Search Logic ─────────────────────────────────────────────────────
  const searchAirports = (q) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (q.length < 2) {
      setAirportSuggestions([]);
      return;
    }
    setIsSearchingAirports(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?q=${q}&limit=5`);
        const json = await res.json();
        setAirportSuggestions(json.success ? json.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingAirports(false);
      }
    }, 300);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setAirportQuery(val);
    searchAirports(val);
  };

  const handleSelectAirport = (airport) => {
    if (!activeSelector) return;
    const { sliceIndex, field } = activeSelector;
    const newSlices = [...slices];
    newSlices[sliceIndex][field] = {
      name: airport.city,
      code: airport.iata,
      airportName: airport.name,
    };

    if (
      tripType === "multi-city" &&
      field === "destination" &&
      sliceIndex < newSlices.length - 1
    ) {
      newSlices[sliceIndex + 1].origin = {
        name: airport.city,
        code: airport.iata,
        airportName: airport.name,
      };
    }

    setSlices(newSlices);
    setActiveSelector(null);
    setAirportQuery("");
  };

  // ─── SWAP ORIGIN & DESTINATION ─────────────────────────────────────────────────
  const handleSwapLocations = () => {
    const newSlices = [...slices];
    const firstSlice = newSlices[0];
    const tmp = firstSlice.origin;
    firstSlice.origin = firstSlice.destination;
    firstSlice.destination = tmp;

    if (tripType === "round-trip" && newSlices[1]) {
      newSlices[1].origin = firstSlice.destination;
      newSlices[1].destination = firstSlice.origin;
    }

    setSlices(newSlices);
  };

  // ─── TRIP TYPE CHANGE ───────────────────────────────────────────────────────────
  const handleTripTypeChange = (type) => {
    setTripType(type);
    setActiveSelector(null);

    if (type === "one-way") {
      setSlices((prev) => prev.slice(0, 1));
    } else if (type === "round-trip") {
      const first = slices[0];
      setSlices([
        first,
        {
          origin: first.destination,
          destination: first.origin,
          departure_date: "",
        },
      ]);
    } else if (type === "multi-city" && slices.length < 2) {
      setSlices([
        ...slices,
        {
          origin: slices[0].destination,
          destination: { name: "", code: "", airportName: "" },
          departure_date: "",
        },
      ]);
    }
  };

  // ─── ADD / REMOVE SLICES ────────────────────────────────────────────────────────
  const handleAddSlice = () => {
    const lastDest = slices[slices.length - 1].destination;

    setSlices([
      ...slices,
      {
        origin: lastDest,
        destination: { name: "", code: "", airportName: "" },
        departure_date: "",
      },
    ]);
  };

  const handleRemoveSlice = (i) => {
    if (slices.length > 2) setSlices(slices.filter((_, idx) => idx !== i));
  };

  // ─── DATE CHANGE ────────────────────────────────────────────────────────────────
  const handleDateChange = (i, date) => {
    const updated = [...slices];
    updated[i].departure_date = date;
    setSlices(updated);
  };

  // ─── OPEN/CLOSE SELECTORS ───────────────────────────────────────────────────────
  const handleSelectorChange = (newSelector) => {
    setActiveSelector(newSelector);
    setAirportQuery("");
  };

  // ─── FORM SUBMIT ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);

    const apiSlices = slices.map((s) => ({
      origin: s.origin.code,
      destination: s.destination.code,
      departure_date: s.departure_date,
    }));

    const payload = { slices: apiSlices, passengers, cabin_class: cabinClass };

    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        const searchData = {
          searchParams: { tripType, slices, passengers, cabinClass },
          results: result,
        };

        if (onNewSearch) {
          onNewSearch(result, { tripType, slices, passengers, cabinClass });
        } else {
          sessionStorage.setItem(
            "flightSearchResults",
            JSON.stringify(searchData)
          );
          router.push("/flights/results");
        }
      } else {
        alert(
          `Search failed: ${
            result.details?.[0]?.message || result.error || "Please try again."
          }`
        );
      }
    } catch {
      alert("An error occurred while searching for flights.");
    } finally {
      setIsSearching(false);
    }
  };

  // ─── CLICK‐OUTSIDE TO CLOSE ALL DROPDOWNS ────────────────────────────────────────
  useEffect(() => {
    const onClickOutside = (e) => {
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(e.target);
      const outsideAirport = ![
        ...document.querySelectorAll(".airport-selector-trigger"),
      ].some((el) => el.contains(e.target));
      const outsideDate = ![
        ...document.querySelectorAll(".date-picker-trigger"),
      ].some((el) => el.contains(e.target));
      const outsideTraveler = ![
        ...document.querySelectorAll(".traveler-selector-trigger"),
      ].some((el) => el.contains(e.target));

      if (
        isOutsideDropdown &&
        outsideAirport &&
        outsideDate &&
        outsideTraveler
      ) {
        setActiveSelector(null);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const suggestionProps = {
    suggestions: airportSuggestions,
    isLoading: isSearchingAirports,
    query: airportQuery,
    onQueryChange: handleQueryChange,
    dropdownRef,
  };

  // ─── COMPACT VARIANT ─────────────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-2xl mx-auto overflow-visible">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TripTypeSelector
            tripType={tripType}
            onChange={handleTripTypeChange}
            size="compact"
          />

          {/* FROM */}
          <div
            className="relative airport-selector-trigger"
            ref={
              activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "origin"
                ? dropdownRef
                : null
            }
          >
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              FROM
            </label>
            <div
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 bg-white transition-colors"
              onClick={() =>
                handleSelectorChange({ sliceIndex: 0, field: "origin" })
              }
            >
              <p className="font-bold text-blue-900 text-base truncate">
                {slices[0].origin.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {slices[0].origin.code}, {slices[0].origin.airportName}
              </p>
            </div>
            {activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "origin" && (
                <SuggestionsList
                  {...suggestionProps}
                  onSelect={handleSelectAirport}
                  placeholder="Type to search airports"
                />
              )}
          </div>

          {/* TO */}
          <div
            className="relative airport-selector-trigger"
            ref={
              activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "destination"
                ? dropdownRef
                : null
            }
          >
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              TO
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute -top-6 right-4 p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 z-10 shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div
                className="p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() =>
                  handleSelectorChange({ sliceIndex: 0, field: "destination" })
                }
              >
                <p className="font-bold text-blue-900 text-base truncate">
                  {slices[0].destination.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {slices[0].destination.code},{" "}
                  {slices[0].destination.airportName}
                </p>
              </div>
            </div>
            {activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "destination" && (
                <SuggestionsList
                  {...suggestionProps}
                  onSelect={handleSelectAirport}
                  placeholder="Type to search airports"
                />
              )}
          </div>

          {/* DEPARTURE DATE */}
          <div className="date-picker-trigger relative z-50">
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              DEPARTURE DATE
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <DatePicker
                value={slices[0].departure_date}
                onChange={(date) => handleDateChange(0, date)}
                placeholder="Select date"
                minDate={new Date().toISOString().split("T")[0]}
                label="Select journey date"
                onOpen={() => setActiveSelector(null)}
              />
            </div>
          </div>

          {/* RETURN DATE */}
          <div className="date-picker-trigger relative z-50">
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              RETURN DATE
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              {tripType === "round-trip" ? (
                <DatePicker
                  value={slices[1]?.departure_date || ""}
                  onChange={(date) => handleDateChange(1, date)}
                  placeholder="Select date"
                  minDate={
                    slices[0].departure_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  isDualMonth={true}
                  label="Select return date"
                  onOpen={() => setActiveSelector(null)}
                />
              ) : (
                <p className="text-gray-500 text-base">
                  Save more on return flight
                </p>
              )}
            </div>
          </div>

          {/* TRAVELER & CLASS */}
          <div className="traveler-selector-trigger relative z-50">
            <TravelerClassSelector
              passengers={passengers}
              onPassengersChange={setPassengers}
              cabinClass={cabinClass}
              onCabinClassChange={setCabinClass}
              variant="compact"
              onOpen={() => setActiveSelector(null)}
            />
          </div>

          {/* SEARCH BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-6 py-4 rounded-xl shadow-lg flex items-center justify-center transition-colors"
            >
              {isSearching ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── MAIN VARIANT ────────────────────────────────────────────────────────────────
  const renderSlicesUI = () => {
    if (tripType === "multi-city") {
      return (
        <div className="mb-6 space-y-4 overflow-visible">
          {slices.map((slice, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-4 items-center p-4 border border-gray-200 rounded-lg overflow-visible"
            >
              {/* ORIGIN */}
              <div
                className="relative airport-selector-trigger"
                ref={
                  activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "origin"
                    ? dropdownRef
                    : null
                }
              >
                <div
                  onClick={() =>
                    handleSelectorChange({ sliceIndex: idx, field: "origin" })
                  }
                  className="cursor-pointer"
                >
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">
                    FROM
                  </p>
                  <p className="font-bold text-blue-900 text-base truncate">
                    {slice.origin.name || "Select Origin"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {slice.origin.code}, {slice.origin.airportName}
                  </p>
                </div>
                {activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "origin" && (
                    <SuggestionsList
                      {...suggestionProps}
                      onSelect={handleSelectAirport}
                    />
                  )}
              </div>

              {/* DESTINATION */}
              <div
                className="relative airport-selector-trigger"
                ref={
                  activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "destination"
                    ? dropdownRef
                    : null
                }
              >
                <div
                  onClick={() =>
                    handleSelectorChange({
                      sliceIndex: idx,
                      field: "destination",
                    })
                  }
                  className="cursor-pointer"
                >
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">
                    TO
                  </p>
                  <p className="font-bold text-blue-900 text-base truncate">
                    {slice.destination.name || "Select Destination"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {slice.destination.code}, {slice.destination.airportName}
                  </p>
                </div>
                {activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "destination" && (
                    <SuggestionsList
                      {...suggestionProps}
                      onSelect={handleSelectAirport}
                    />
                  )}
              </div>

              {/* DATE */}
              <div className="date-picker-trigger relative z-50">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">
                  DEPARTURE DATE
                </p>
                <DatePicker
                  value={slice.departure_date}
                  onChange={(date) => handleDateChange(idx, date)}
                  placeholder="Select date"
                  minDate={new Date().toISOString().split("T")[0]}
                  label="Select journey date"
                  onOpen={() => setActiveSelector(null)}
                />
              </div>

              {/* REMOVE */}
              {slices.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlice(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    // ONE-WAY or ROUND-TRIP
    const one = slices[0];
    const ret = slices[1];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 border border-gray-200 rounded-2xl mb-8 bg-white overflow-visible">
        {/* FROM */}
        <div
          className="relative p-5 border-b lg:border-b-0 lg:border-r border-gray-200 airport-selector-trigger"
          ref={
            activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "origin"
              ? dropdownRef
              : null
          }
        >
          <div
            onClick={() =>
              handleSelectorChange({ sliceIndex: 0, field: "origin" })
            }
            className="cursor-pointer"
          >
            <p className="text-xs text-blue-600 uppercase font-medium mb-2">
              FROM
            </p>
            <p className="text-lg lg:text-xl font-bold text-blue-900 truncate">
              {one.origin.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {one.origin.code}, {one.origin.airportName}
            </p>
          </div>
          {activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "origin" && (
              <SuggestionsList
                {...suggestionProps}
                onSelect={handleSelectAirport}
              />
            )}
        </div>

        {/* TO */}
        <div
          className="relative p-5 border-b lg:border-b-0 lg:border-r border-gray-200 airport-selector-trigger"
          ref={
            activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "destination"
              ? dropdownRef
              : null
          }
        >
          <button
            type="button"
            onClick={handleSwapLocations}
            className="absolute left-0 top-1/2 -translate-x-1/2 p-2 bg-white rounded-full border border-gray-200 shadow-md hover:bg-gray-50 transition-colors z-10"
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div
            onClick={() =>
              handleSelectorChange({ sliceIndex: 0, field: "destination" })
            }
            className="cursor-pointer"
          >
            <p className="text-xs text-blue-600 uppercase font-medium mb-2">
              TO
            </p>
            <p className="text-lg lg:text-xl font-bold text-blue-900 truncate">
              {one.destination.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {one.destination.code}, {one.destination.airportName}
            </p>
          </div>
          {activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "destination" && (
              <SuggestionsList
                {...suggestionProps}
                onSelect={handleSelectAirport}
              />
            )}
        </div>

        {/* DEPARTURE */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-200 date-picker-trigger relative z-50">
          <p className="text-xs text-blue-600 uppercase font-medium mb-2">
            DEPARTURE DATE
          </p>
          <DatePicker
            value={one.departure_date}
            onChange={(date) => handleDateChange(0, date)}
            placeholder="Select date"
            minDate={new Date().toISOString().split("T")[0]}
            label="Select journey date"
            onOpen={() => setActiveSelector(null)}
          />
        </div>

        {/* RETURN */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-200 date-picker-trigger relative z-50">
          <p className="text-xs text-blue-600 uppercase font-medium mb-2">
            RETURN DATE
          </p>
          {tripType === "round-trip" ? (
            <DatePicker
              value={ret?.departure_date || ""}
              onChange={(date) => handleDateChange(1, date)}
              placeholder="Select date"
              minDate={one.departure_date}
              isDualMonth={true}
              label="Select return date"
              onOpen={() => setActiveSelector(null)}
            />
          ) : (
            <div className="pt-1">
              <p
                className="text-gray-500 text-base cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleTripTypeChange("round-trip")}
              >
                Save more on return flight
              </p>
            </div>
          )}
        </div>

        {/* PASSENGERS & CLASS */}
        <div className="p-5 traveler-selector-trigger relative z-50">
          <TravelerClassSelector
            passengers={passengers}
            onPassengersChange={setPassengers}
            cabinClass={cabinClass}
            onCabinClassChange={setCabinClass}
            variant="main"
            onOpen={() => setActiveSelector(null)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full relative z-20 pt-8 border border-gray-100 overflow-visible">
      <form onSubmit={handleSubmit} className="px-8 pb-20">
        <TripTypeSelector
          tripType={tripType}
          onChange={handleTripTypeChange}
          size="main"
        />

        {renderSlicesUI()}

        {tripType === "multi-city" && (
          <button
            type="button"
            onClick={handleAddSlice}
            className="flex items-center gap-2 text-blue-600 font-medium mb-6 hover:text-blue-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> Add Another Flight
          </button>
        )}
      </form>

      {/* Floating Search Button */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <button
          onClick={handleSubmit}
          disabled={isSearching}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-16 py-4 rounded-2xl shadow-lg flex items-center justify-center transition-colors border-0"
        >
          {isSearching ? <Loader className="w-6 h-6 animate-spin" /> : "Search"}
        </button>
      </div>
    </div>
  );
}
