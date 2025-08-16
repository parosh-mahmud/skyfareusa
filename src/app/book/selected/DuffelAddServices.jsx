// src/components/DuffelAncillaryServices.jsx

"use client";

import { useEffect, useState } from "react";
import { DuffelAncillaries } from "@duffel/components";
import { Loader } from "lucide-react";
import { useBookingStore } from "src/lib/store";

export default function DuffelAncillaryServices({
  offer, // Expecting the full priced offer object now
  passengers,
  onPayloadReady,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seatMaps, setSeatMaps] = useState(null);

  const { resetBookingFlow } = useBookingStore();

//   useEffect(() => {
//     const fetchAncillariesData = async () => {
//       // The Duffel component can work with the offer object directly, but for seatmaps, we need a separate call
//       if (!offer?.id || !offer.sourceApi) {
//         setError("Offer ID or source API is missing.");
//         setLoading(false);
//         return;
//       }
      
//       setLoading(true);
//       setError(null);

//       try {
//         // We fetch seat maps separately as per Duffel's documentation and your API design
//         const seatmapRes = await fetch(`/api/flights/offers/seatmaps`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ offer: offer }),
//         });

//         if (!seatmapRes.ok) throw new Error("Failed to fetch seat maps.");
        
//         const seatmapData = await seatmapRes.json();
//         setSeatMaps(seatmapData.seatMaps);

//       } catch (e) {
//         console.error("Error fetching ancillary data:", e);
//         setError(e.message || "An error occurred while loading services.");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchAncillariesData();
//   }, [offer]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader className="w-8 h-8 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center p-6 text-red-600 bg-red-50 rounded-lg">
//         <p className="font-semibold mb-2">Error: {error}</p>
//         <button
//           onClick={() => {
//             resetBookingFlow();
//             window.location.href = '/flights/results';
//           }}
//           className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
//         >
//           Return to Search Results
//         </button>
//       </div>
//     );
//   }

  return (
    
 <DuffelAncillaries
    debug={true}
    offer_id="fixture_off_1"
    services={["bags", "seats", "cancel_for_any_reason"]}
    passengers={[
      {
       given_name: "Mae",
            family_name: "Jemison",
            gender: "F",
            title: "dr",
            born_on: "1956-10-17",
            email: "m.jemison@nasa.gov",
            phone_number: "+16177562626"
      }
    ]}
    onPayloadReady={console.log}
    />
  );
}
