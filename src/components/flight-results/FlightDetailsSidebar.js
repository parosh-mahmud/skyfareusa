// "use client";

// import { X, Clock, Plane } from "lucide-react";
// import { useEffect } from "react";

// const formatTime = (dt) => {
//   if (!dt) return "";
//   return new Date(dt).toLocaleTimeString("en-GB", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const formatDate = (dt) => {
//   if (!dt) return "";
//   return new Date(dt).toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatDuration = (duration) => {
//   if (!duration) return "";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
//   if (!match) return duration;
//   const hours = match[1] ? `${match[1]}h` : "";
//   const minutes = match[2] ? `${match[2]}m` : "";
//   return `${hours} ${minutes}`.trim();
// };

// const calculateLayoverTime = (arrivalTime, departureTime) => {
//   if (!arrivalTime || !departureTime) return null;
//   const arrival = new Date(arrivalTime);
//   const departure = new Date(departureTime);
//   const diffMs = departure.getTime() - arrival.getTime();
//   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//   const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//   return `${diffHours}h ${diffMinutes}m`;
// };

// const getDayDifference = (departDate, arriveDate) => {
//   if (!departDate || !arriveDate) return 0;
//   const d1 = new Date(departDate);
//   const d2 = new Date(arriveDate);
//   d1.setHours(0, 0, 0, 0);
//   d2.setHours(0, 0, 0, 0);
//   const diffTime = d2.getTime() - d1.getTime();
//   return Math.round(diffTime / (1000 * 60 * 60 * 24));
// };

// export default function FlightDetailsSidebar({ isOpen, onClose, flightData }) {
//   useEffect(() => {
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   if (!flightData) return null;

//   const firstSlice = flightData.slices?.[0];
//   if (!firstSlice || !firstSlice.segments) return null;

//   const segments = firstSlice.segments;
//   const airline =
//     flightData.owner ||
//     segments[0]?.marketing_carrier ||
//     segments[0]?.operating_carrier;

//   const firstSegment = segments[0];
//   const lastSegment = segments[segments.length - 1];
//   const dayDiff = getDayDifference(
//     firstSegment.departing_at,
//     lastSegment.arriving_at
//   );

//   return (
//     <>
//       {/* Remove the backdrop that's causing the darkening effect */}
//       {/* {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-5 z-40 transition-opacity duration-300"
//           onClick={onClose}
//         />
//       )} */}

//       {/* Sidebar */}
//       <div
//         className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//         style={{
//           boxShadow: isOpen ? "-8px 0 32px -8px rgba(0, 0, 0, 0.12)" : "none",
//         }}
//       >
//         {/* Header - ensure proper styling */}
//         <div className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
//           <h2 className="text-lg font-semibold text-white">Flight Details</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-blue-700 rounded-full transition-colors duration-200 text-white"
//             aria-label="Close flight details"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="overflow-y-auto h-full pb-20 bg-gray-50">
//           <div className="bg-white px-6 py-4">
//             {/* Flight Header */}
//             <div className="mb-6">
//               <h3 className="text-xl font-semibold text-blue-800 mb-3">
//                 Departure Flight
//               </h3>

//               {/* Airline Info */}
//               <div className="flex items-center gap-3 mb-3">
//                 {airline?.logo_symbol_url ? (
//                   <img
//                     src={airline.logo_symbol_url || "/placeholder.svg"}
//                     alt={airline.name}
//                     className="w-8 h-8 object-contain"
//                   />
//                 ) : (
//                   <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
//                     <span className="text-white text-xs font-bold">
//                       {airline?.iata_code || "AI"}
//                     </span>
//                   </div>
//                 )}
//                 <span className="font-medium text-gray-800">
//                   {airline?.name || "Air India"}
//                 </span>
//               </div>

//               {/* Route */}
//               <h4 className="text-lg font-semibold text-gray-800 mb-3">
//                 {firstSegment?.origin?.city_name} (
//                 {firstSegment?.origin?.iata_code}) -{" "}
//                 {lastSegment?.destination?.city_name} (
//                 {lastSegment?.destination?.iata_code})
//               </h4>

//               {/* Date and Duration */}
//               <p className="text-gray-600 text-sm">
//                 {formatDate(firstSegment?.departing_at)} |{" "}
//                 {formatTime(firstSegment?.departing_at)} -{" "}
//                 {formatTime(lastSegment?.arriving_at)}
//                 {dayDiff > 0 && (
//                   <span className="text-red-500 font-medium">
//                     {" "}
//                     +{dayDiff}Day
//                   </span>
//                 )}{" "}
//                 ({formatDuration(firstSlice.duration)},{" "}
//                 {segments.length - 1 === 0
//                   ? "Direct"
//                   : `${segments.length - 1} Stop${
//                       segments.length - 1 > 1 ? "s" : ""
//                     }`}
//                 )
//               </p>
//             </div>

//             {/* Flight Timeline */}
//             <div className="space-y-0 mt-6">
//               {segments.map((segment, index) => (
//                 <div key={segment.id}>
//                   {/* Departure */}
//                   <div className="flex items-start">
//                     {/* Left side - Time and Date */}
//                     <div className="w-20 text-right pr-6 flex-shrink-0">
//                       <div className="text-xl font-bold text-gray-800">
//                         {formatTime(segment.departing_at)}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {formatDate(segment.departing_at)}
//                       </div>
//                     </div>

//                     {/* Timeline */}
//                     <div className="flex flex-col items-center flex-shrink-0 relative">
//                       <div className="w-3 h-3 border-2 border-blue-400 bg-white rounded-full z-10"></div>
//                       <div className="w-0.5 h-20 bg-gray-300 absolute top-3"></div>
//                     </div>

//                     {/* Right side - Airport Info */}
//                     <div className="flex-1 pl-6 pt-0">
//                       <div className="font-semibold text-gray-800 text-lg mb-1">
//                         {segment.origin?.city_name} ({segment.origin?.iata_code}
//                         )
//                       </div>
//                       <div className="text-sm text-gray-600 mb-2">
//                         {segment.origin?.name}
//                       </div>
//                       {segment.origin_terminal && (
//                         <div className="text-sm text-teal-600 font-medium">
//                           Terminal {segment.origin_terminal}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Flight Duration and Airline Info */}
//                   <div className="flex items-center my-4">
//                     {/* Left side - Duration */}
//                     <div className="w-20 text-right pr-6 flex-shrink-0">
//                       <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
//                         <Clock className="w-4 h-4" />
//                         <span className="font-medium">
//                           {formatDuration(segment.duration)}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Timeline */}
//                     <div className="flex flex-col items-center flex-shrink-0 relative">
//                       <div className="w-0.5 h-16 bg-gray-300"></div>
//                     </div>

//                     {/* Right side - Airline Info */}
//                     <div className="flex-1 pl-6">
//                       <div className="flex items-center gap-3 mb-2">
//                         {segment.marketing_carrier?.logo_symbol_url ? (
//                           <img
//                             src={
//                               segment.marketing_carrier.logo_symbol_url ||
//                               "/placeholder.svg"
//                             }
//                             alt={segment.marketing_carrier.name}
//                             className="w-8 h-8 object-contain"
//                           />
//                         ) : (
//                           <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
//                             <span className="text-white text-xs font-bold">
//                               {segment.marketing_carrier?.iata_code || "AI"}
//                             </span>
//                           </div>
//                         )}
//                         <span className="font-semibold text-gray-800 text-base">
//                           {segment.marketing_carrier?.name || "Air India"}
//                         </span>
//                       </div>
//                       <div className="text-sm text-gray-600 pl-11">
//                         {segment.marketing_carrier?.iata_code || "AI"}{" "}
//                         {segment.marketing_carrier_flight_number} |{" "}
//                         {segment.aircraft?.name || "Airbus 320"}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Arrival */}
//                   <div className="flex items-start">
//                     {/* Left side - Time and Date */}
//                     <div className="w-20 text-right pr-6 flex-shrink-0">
//                       <div className="text-xl font-bold text-gray-800">
//                         {formatTime(segment.arriving_at)}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {formatDate(segment.arriving_at)}
//                       </div>
//                     </div>

//                     {/* Timeline */}
//                     <div className="flex flex-col items-center flex-shrink-0">
//                       <div className="w-3 h-3 border-2 border-blue-400 bg-white rounded-full z-10"></div>
//                       {index < segments.length - 1 && (
//                         <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
//                       )}
//                     </div>

//                     {/* Right side - Airport Info */}
//                     <div className="flex-1 pl-6 pt-0">
//                       <div className="font-semibold text-gray-800 text-lg mb-1">
//                         {segment.destination?.city_name} (
//                         {segment.destination?.iata_code})
//                       </div>
//                       <div className="text-sm text-gray-600 mb-2">
//                         {segment.destination?.name}
//                       </div>
//                       {segment.destination_terminal && (
//                         <div className="text-sm text-teal-600 font-medium">
//                           Terminal {segment.destination_terminal}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Layover for connecting flights */}
//                   {index < segments.length - 1 && (
//                     <div className="my-6">
//                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-2">
//                         <div className="flex items-center">
//                           {/* Left side - Layover Duration */}
//                           <div className="w-16 text-right pr-4 flex-shrink-0">
//                             <div className="text-sm font-semibold text-gray-700">
//                               {calculateLayoverTime(
//                                 segment.arriving_at,
//                                 segments[index + 1]?.departing_at
//                               )}
//                             </div>
//                           </div>

//                           {/* Timeline */}
//                           <div className="flex flex-col items-center px-4 flex-shrink-0">
//                             <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
//                           </div>

//                           {/* Right side - Change Aircraft */}
//                           <div className="flex-1 flex items-center gap-2">
//                             <Plane className="w-4 h-4 text-blue-600" />
//                             <span className="text-sm text-blue-600 font-semibold">
//                               Change Aircraft
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import {
  X,
  Clock,
  Plane,
  ArrowRight,
  CalendarDays,
  PlaneTakeoff,
  PlaneLanding,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

// Import shadcn/ui components
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// --- Helper Functions ---
const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
const formatDate = (dt) =>
  new Date(dt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
const formatDuration = (d) =>
  d ? d.replace("PT", "").replace("H", "h ").replace("M", "m") : "";
const calculateTimeDiff = (start, end) => {
  const diffMs = new Date(end) - new Date(start);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim();
};

// --- Sub-Components for a Cleaner Structure ---

const FlightSegment = ({ segment, isLast }) => {
  const carrier = segment.carrier || {};
  const airlineName = carrier.name || "Unknown";
  const airlineCode = carrier.iata_code || "??";
  const flightNumber = segment.flight_number || "###";
  const aircraft = segment.aircraft?.name || "";
  const logoUrl = `https://images.kiwi.com/airlines/64/${airlineCode}.png`;

  return (
    <div>
      {/* Departure */}
      <div className="flex">
        <div className="w-24 text-right pr-4 flex-shrink-0">
          <p className="font-bold text-lg">
            {formatTime(segment.departing_at)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(segment.departing_at)}
          </p>
        </div>
        <div className="flex flex-col items-center mx-4">
          <div className="w-4 h-4 rounded-full border-2 border-primary bg-background z-10 flex items-center justify-center">
            <PlaneTakeoff className="w-2 h-2 text-primary" />
          </div>
          <div className="w-0.5 flex-grow bg-border"></div>
        </div>
        <div className="flex-grow pb-8">
          <p className="font-semibold">
            {segment.origin?.name} ({segment.origin?.iata_code})
          </p>
          <p className="text-sm text-muted-foreground">
            {segment.origin?.city?.name}
          </p>
        </div>
      </div>

      {/* Flight Info */}
      <div className="flex my-2">
        <div className="w-24"></div>
        <div className="flex flex-col items-center mx-4">
          <div className="w-0.5 flex-grow bg-border"></div>
        </div>
        <div className="flex-grow pb-8 flex items-center gap-4">
          <Image
            src={logoUrl}
            alt={airlineName}
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-full p-1 shadow-sm bg-background"
            unoptimized
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/32x32/FFFFFF/000000?text=??";
            }}
          />
          <div>
            <p className="text-sm font-semibold">{airlineName}</p>
            <p className="text-xs text-muted-foreground">
              {airlineCode} {flightNumber} • {aircraft}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              Duration: {formatDuration(segment.duration)}
            </p>
          </div>
        </div>
      </div>

      {/* Arrival */}
      <div className="flex">
        <div className="w-24 text-right pr-4 flex-shrink-0">
          <p className="font-bold text-lg">{formatTime(segment.arriving_at)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(segment.arriving_at)}
          </p>
        </div>
        <div className="flex flex-col items-center mx-4">
          <div className="w-4 h-4 rounded-full border-2 border-primary bg-background z-10 flex items-center justify-center">
            <PlaneLanding className="w-2 h-2 text-primary" />
          </div>
          {!isLast && <div className="w-0.5 flex-grow bg-border"></div>}
        </div>
        <div className="flex-grow">
          <p className="font-semibold">
            {segment.destination?.name} ({segment.destination?.iata_code})
          </p>
          <p className="text-sm text-muted-foreground">
            {segment.destination?.city?.name}
          </p>
        </div>
      </div>
    </div>
  );
};

const LayoverInfo = ({ fromSegment, toSegment }) => (
  <div className="flex my-4">
    <div className="w-24"></div>
    <div className="flex flex-col items-center mx-4">
      <div className="w-0.5 flex-grow bg-border"></div>
    </div>
    <div className="flex-grow flex justify-center">
      <Badge variant="outline">
        <Clock className="w-3 h-3 mr-2" />
        Layover in {fromSegment.destination?.city?.name}:{" "}
        {calculateTimeDiff(fromSegment.arriving_at, toSegment.departing_at)}
      </Badge>
    </div>
  </div>
);

// --- Main Sidebar Component ---

export default function FlightDetailsSidebar({ isOpen, onClose, flightData }) {
  if (!flightData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-lg p-0">
        <SheetHeader className="px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b bg-background">
          <SheetTitle>Flight Itinerary</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-20">
          {flightData.slices.map((slice, sliceIndex) => (
            <div key={sliceIndex} className="p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
                  {sliceIndex + 1}
                </div>
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    {slice.origin?.iata_code} <ArrowRight size={16} />{" "}
                    {slice.destination?.iata_code}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <CalendarDays className="w-4 h-4" />
                    {sliceIndex === 0 ? "Departure" : `Return`} •{" "}
                    {formatDate(slice.segments[0].departing_at)}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />

              {slice.segments.map((segment, segIndex) => (
                <div key={segIndex}>
                  <FlightSegment
                    segment={segment}
                    isLast={segIndex === slice.segments.length - 1}
                  />
                  {segIndex < slice.segments.length - 1 && (
                    <LayoverInfo
                      fromSegment={segment}
                      toSegment={slice.segments[segIndex + 1]}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
