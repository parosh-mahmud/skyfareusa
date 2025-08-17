// // src/components/flight-results/FlightOfferCard.js
// "use client";

// import { ChevronDown, CheckCircle, Luggage } from "lucide-react";
// import { useState } from "react";
// import Image from "next/image";
// import FlightDetailsSidebar from "./FlightDetailsSidebar";
// import FareCard from "./FareCard";

// // Helper functions
// const formatTime = (dt) =>
//   new Date(dt).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// const formatDuration = (d) =>
//   d ? d.replace("PT", "").replace("H", "h ").replace("M", "m") : "";
// const getStopsText = (s) =>
//   s.length - 1 === 0 ? "Direct" : `${s.length - 1} Stop(s)`;
// const convertToUSD = (a, c) => {
//   const rates = { GBP: 1.27, EUR: 1.08, BDT: 0.0085, USD: 1.0 };
//   return Math.round(parseFloat(a) * (rates[c] || 1));
// };

// // Sub-component to render details for a single flight leg (slice)
// const FlightSliceDetails = ({ slice }) => {
//   if (!slice?.segments?.length) return null;
//   const firstSeg = slice.segments[0];
//   const lastSeg = slice.segments[slice.segments.length - 1];
//   console.log(slice);
//   return (
//     <div className="bg-gray-100 p-4 flex justify-between items-center rounded-lg">
//       <div className="text-center w-20">
//         <p className="font-bold text-lg text-gray-800">
//           {formatTime(firstSeg.departing_at)}
//         </p>
//         <p className="text-sm text-gray-600 font-semibold">
//           {firstSeg.origin?.iata_code}
//         </p>
//       </div>
//       <div className="flex flex-col items-center flex-1 mx-2">
//         <p className="text-xs text-gray-500">
//           {formatDuration(slice.duration)}
//         </p>
//         <div className="w-full h-px bg-gray-300 relative my-1">
//           <div className="w-2 h-2 rounded-full bg-gray-400 absolute top-1/2 -translate-y-1/2 left-0 border-2 border-gray-100"></div>
//           <div className="w-2 h-2 rounded-full bg-gray-400 absolute top-1/2 -translate-y-1/2 right-0 border-2 border-gray-100"></div>
//         </div>
//         <p className="text-xs text-blue-600 font-semibold">
//           {getStopsText(slice.segments)}
//         </p>
//       </div>
//       <div className="text-center w-20">
//         <p className="font-bold text-lg text-gray-800">
//           {formatTime(lastSeg.arriving_at)}
//         </p>
//         <p className="text-sm text-gray-600 font-semibold">
//           {lastSeg.destination?.iata_code}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default function FlightOfferCard({
//   offerGroup,
//   isExpanded,
//   onToggleDetails,
// }) {
//   const [showDetails, setShowDetails] = useState(false);
//   const summaryOffer = offerGroup?.[0];

//   if (!summaryOffer) return null;

//   const { slices, total_amount, total_currency } = summaryOffer;
//   const airline = slices?.[0]?.segments?.[0]?.carrier || {};
//   const airlineName = airline.name || "Multiple Airlines";
//   const airlineCode = airline.iata_code || "??";
//   const airlineLogo = `https://images.kiwi.com/airlines/64/${airlineCode}.png`;

//   const itineraryId =
//     slices[0]?.segments
//       ?.map((seg) => `${seg.carrier?.iata_code}-${seg.flight_number}`)
//       .join("_") || summaryOffer.id;

//   const priceInUSD = convertToUSD(total_amount, total_currency);

//   return (
//     <>
//       <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
//         <div className="p-4">
//           <div className="flex flex-col md:flex-row md:justify-between">
//             {/* Left Side: Airline Info & Flight Path */}
//             <div className="flex-grow md:border-r md:pr-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <Image
//                   src={airlineLogo}
//                   alt={airlineName}
//                   width={40}
//                   height={40}
//                   className="h-10 w-10 object-contain rounded-full bg-white shadow-sm p-1"
//                   unoptimized
//                 />
//                 <span className="font-semibold text-gray-800 text-base">
//                   {airlineName}
//                 </span>
//               </div>
//               <div className="space-y-2">
//                 {slices.map((slice, index) => (
//                   <FlightSliceDetails key={index} slice={slice} />
//                 ))}
//               </div>
//             </div>

//             {/* Right Side: Price */}
//             <div className="text-center md:text-right flex-shrink-0 md:pl-6 mt-4 md:mt-0">
//               <p className="text-sm text-gray-500">Starts from</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 ${priceInUSD.toLocaleString()}
//               </p>
//               <p className="text-sm text-gray-500">per person</p>
//             </div>
//           </div>
//         </div>

//         {/* ✅ FIX: Action Bar with both buttons */}
//         <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
//           <button
//             onClick={() => setShowDetails(true)}
//             className="text-blue-600 hover:underline text-sm font-medium transition-colors"
//           >
//             Flight Details
//           </button>
//           <div className="flex-grow"></div>
//           <button
//             onClick={() => onToggleDetails(isExpanded ? null : itineraryId)}
//             className="w-full sm:w-auto bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//           >
//             <span>{isExpanded ? "Hide Fares" : "View Fares"}</span>
//             <ChevronDown
//               className={`w-5 h-5 transition-transform ${
//                 isExpanded ? "rotate-180" : ""
//               }`}
//             />
//           </button>
//         </div>

//         {/* Expanded View for Fares */}
//         {isExpanded && (
//           <div className="p-4 border-t border-gray-200 bg-gray-50">
//             <h4 className="font-bold text-gray-800 mb-3">Select Your Fare</h4>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {offerGroup.map((offer, index) => (
//                 <FareCard
//                   key={offer.id}
//                   offer={offer}
//                   // Make the first card in the group (which is the cheapest) the recommended one
//                   isRecommended={index === 0}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <FlightDetailsSidebar
//         isOpen={showDetails}
//         onClose={() => setShowDetails(false)}
//         flightData={summaryOffer}
//       />
//     </>
//   );
// }

"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useBookingStore } from "src/lib/store";

import FlightDetailsSidebar from "./FlightDetailsSidebar";
import FareCard from "./FareCard";

// Import shadcn/ui components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// --- Helper Functions (unchanged) ---
const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
const formatDuration = (d) =>
  d ? d.replace("PT", "").replace("H", "h ").replace("M", "m") : "";
const getStopsText = (s) =>
  (s?.length || 1) - 1 === 0 ? "Direct" : `${(s?.length || 1) - 1} Stop(s)`;

// --- Sub-component for a single flight leg ---
const FlightSliceDetails = ({ slice }) => {
  if (!slice?.segments?.length) return null;
  const firstSeg = slice.segments[0];
  const lastSeg = slice.segments.slice(-1)[0];

  return (
    <div className="bg-muted p-4 flex justify-between items-center rounded-lg">
      <div className="text-center w-24">
        <p className="font-bold text-lg text-foreground">
          {formatTime(firstSeg.departing_at)}
        </p>
        <p className="text-sm text-muted-foreground font-semibold">
          {firstSeg.origin?.iata_code}
        </p>
      </div>
      <div className="flex flex-col items-center flex-1 mx-2">
        <p className="text-xs text-muted-foreground">
          {formatDuration(slice.duration)}
        </p>
        <div className="w-full h-px bg-border relative my-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground absolute top-1/2 -translate-y-1/2 left-0 border-2 border-muted"></div>
          <div className="w-2 h-2 rounded-full bg-muted-foreground absolute top-1/2 -translate-y-1/2 right-0 border-2 border-muted"></div>
        </div>
        <p className="text-xs text-primary font-semibold">
          {getStopsText(slice.segments)}
        </p>
      </div>
      <div className="text-center w-24">
        <p className="font-bold text-lg text-foreground">
          {formatTime(lastSeg.arriving_at)}
        </p>
        <p className="text-sm text-muted-foreground font-semibold">
          {lastSeg.destination?.iata_code}
        </p>
      </div>
    </div>
  );
};

// --- Main Flight Offer Card Component ---
export default function FlightOfferCard({
  offerGroup,
  isExpanded,
  onToggleDetails,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const summaryOffer = offerGroup?.[0];

  if (!summaryOffer) return null;

  const { slices, total_amount } = summaryOffer;
  const airline = slices?.[0]?.segments?.[0]?.carrier || {};
  const airlineName = airline.name || "Multiple Airlines";
  const airlineCode = airline.iata_code || "??";
  const airlineLogo = `https://images.kiwi.com/airlines/64/${airlineCode}.png`;

  const itineraryId =
    slices[0]?.segments
      ?.map((seg) => `${seg.carrier?.iata_code}-${seg.flight_number}`)
      .join("_") || summaryOffer.id;
  const priceInUSD = Math.round(parseFloat(total_amount));

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:justify-between">
            {/* Left Side: Airline Info & Flight Path */}
            <div className="flex-grow md:border-r md:pr-6">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={airlineLogo}
                  alt={airlineName}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain rounded-full bg-background shadow-sm p-1"
                  unoptimized
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/40x40/FFFFFF/000000?text=??";
                  }}
                />
                <span className="font-semibold text-foreground text-base">
                  {airlineName}
                </span>
              </div>
              <div className="space-y-2">
                {slices.map((slice, index) => (
                  <FlightSliceDetails key={index} slice={slice} />
                ))}
              </div>
            </div>

            {/* Right Side: Price */}
            <div className="text-center md:text-right flex-shrink-0 md:pl-6 mt-4 md:mt-0">
              <p className="text-sm text-muted-foreground">Starts from</p>
              <p className="text-3xl font-bold text-foreground">
                ${priceInUSD.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">per person</p>
            </div>
          </div>
        </CardContent>

        {/* Action Bar */}
        <CardFooter className="bg-muted/70 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="link"
            onClick={() => setShowDetails(true)}
            className="text-primary"
          >
            Flight Details
          </Button>
          <Button
            onClick={() => onToggleDetails(isExpanded ? null : itineraryId)}
            className="w-full sm:w-auto"
          >
            <span>{isExpanded ? "Hide Fares" : "View Fares"}</span>
            <ChevronDown
              className={`w-5 h-5 ml-2 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CardFooter>

        {/* Expanded View for Fares */}
        {isExpanded && (
          <>
            <Separator />
            <div className="p-4 bg-muted/40">
              <h4 className="font-bold text-foreground mb-3">
                Select Your Fare
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {offerGroup.map((offer, index) => (
                  <FareCard
                    key={offer.id}
                    offer={offer}
                    isRecommended={index === 0} // Cheapest is recommended
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      <FlightDetailsSidebar
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        flightData={summaryOffer}
      />
    </>
  );
}
