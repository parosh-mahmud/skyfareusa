// "use client";

// import {
//   X,
//   Info,
//   Luggage,
//   Armchair,
//   Wifi,
//   BatteryCharging,
//   Replace,
//   BadgePercent,
//   Star,
// } from "lucide-react";
// import { useState, useMemo, useEffect } from "react";

// // --- Sub-Component: Feature Item for clarity and reuse ---
// const FeatureItem = ({ icon: Icon, text, available = true }) => (
//   <li
//     className={`flex items-center gap-3 ${
//       !available ? "text-gray-400 line-through" : "text-gray-700"
//     }`}
//   >
//     <Icon
//       className={`w-5 h-5 flex-shrink-0 ${
//         available ? "text-blue-600" : "text-gray-400"
//       }`}
//     />
//     <span>{text}</span>
//   </li>
// );

// // --- Sub-Component: Fare Details Sidebar ---
// const FareDetailsSidebar = ({ isOpen, onClose, offer, features }) => {
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "unset";
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   if (!isOpen || !offer) return null;

//   return (
//     <>
//       <div
//         className="fixed inset-0 bg-black bg-opacity-50 z-[998] transition-opacity"
//         onClick={onClose}
//       />
//       <div
//         className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[999] transform transition-transform duration-300 ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="bg-gray-50 px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b">
//           <h2 className="text-lg font-semibold text-gray-800">
//             {offer.fare_brand_name || "Standard Fare"} Details
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
//             aria-label="Close"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="overflow-y-auto h-full pb-20 p-6 space-y-6">
//           {Object.entries(features).map(
//             ([category, items]) =>
//               items.length > 0 && (
//                 <div key={category}>
//                   <h4 className="font-bold text-gray-700 mb-3 capitalize border-b pb-1">
//                     {category}
//                   </h4>
//                   <ul className="space-y-3">
//                     {items.map((feature, idx) => (
//                       <FeatureItem key={idx} {...feature} />
//                     ))}
//                   </ul>
//                 </div>
//               )
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// // --- Main FareCard Component ---
// export default function FareCard({ offer, isRecommended = false }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   // ✅ FIX: Declare segmentPassenger in the component's main scope.
//   const segmentPassenger = offer.slices?.[0]?.segments?.[0]?.passengers?.[0];

//   const allFeatures = useMemo(() => {
//     const features = { baggage: [], flexibility: [], comfort: [] };
//     if (!offer) return features;

//     // --- Baggage ---
//     const carryOn = offer.passengers?.[0]?.baggages?.find(
//       (b) => b.type === "carry_on"
//     );
//     const checked = offer.passengers?.[0]?.baggages?.find(
//       (b) => b.type === "checked"
//     );
//     features.baggage.push({
//       icon: Luggage,
//       text: carryOn
//         ? `${carryOn.quantity}x Carry-on Bag`
//         : "Carry-on Bag Included",
//     });
//     features.baggage.push({
//       icon: Luggage,
//       text: checked ? `${checked.quantity}x Checked Bag` : "No Checked Bag",
//       available: !!checked,
//     });

//     // --- Flexibility ---
//     if (offer.conditions?.change_before_departure?.allowed) {
//       const fee = offer.conditions.change_before_departure.penalty_amount;
//       features.flexibility.push({
//         icon: Replace,
//         text: fee && parseFloat(fee) > 0 ? `Changes with fee` : "Free Changes",
//       });
//     } else {
//       features.flexibility.push({
//         icon: Replace,
//         text: "Non-changeable",
//         available: false,
//       });
//     }
//     if (offer.conditions?.refund_before_departure?.allowed) {
//       const fee = offer.conditions.refund_before_departure.penalty_amount;
//       features.flexibility.push({
//         icon: BadgePercent,
//         text:
//           fee && parseFloat(fee) > 0 ? `Refundable with fee` : "Free Refunds",
//       });
//     } else {
//       features.flexibility.push({
//         icon: BadgePercent,
//         text: "Non-refundable",
//         available: false,
//       });
//     }

//     // --- Comfort (Uses segmentPassenger from the outer scope) ---
//     const amenities = segmentPassenger?.cabin?.amenities;
//     if (amenities) {
//       if (amenities.seat) {
//         features.comfort.push({
//           icon: Armchair,
//           text: `${amenities.seat.legroom || "Standard"} Legroom`,
//         });
//       }
//       if (amenities.wifi?.available) {
//         features.comfort.push({
//           icon: Wifi,
//           text: `WiFi ${
//             amenities.wifi.cost === "free" ? "Included" : "Available"
//           }`,
//         });
//       }
//       if (amenities.power?.available) {
//         features.comfort.push({ icon: BatteryCharging, text: "In-seat Power" });
//       }
//     }

//     return features;
//   }, [offer, segmentPassenger]); // Add segmentPassenger to dependency array

//   if (!offer) return null;

//   const priceInUSD = Math.round(parseFloat(offer.total_amount));
//   // ✅ FIX: This line now works because segmentPassenger is in scope.
//   const fareName =
//     offer.fare_brand_name ||
//     segmentPassenger?.cabin_class_marketing_name ||
//     "Standard";
//   const displayFeatures = [
//     ...allFeatures.baggage,
//     ...allFeatures.flexibility,
//     ...allFeatures.comfort,
//   ];

//   return (
//     <>
//       <div
//         className={`relative flex-shrink-0 w-full bg-white border-2 rounded-xl p-5 flex flex-col group transition-all duration-300 ${
//           isRecommended
//             ? "border-blue-500 shadow-lg"
//             : "border-gray-200 hover:border-blue-500 hover:shadow-md"
//         }`}
//       >
//         {isRecommended && (
//           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
//             <Star size={12} fill="white" />
//             MOST POPULAR
//           </div>
//         )}

//         <div className="flex justify-between items-start">
//           <h5 className="font-bold text-lg text-gray-800">{fareName}</h5>
//         </div>

//         <div className="my-3">
//           <span className="text-4xl font-extrabold text-gray-900">
//             ${priceInUSD.toLocaleString()}
//           </span>
//           <span className="text-sm text-gray-500 ml-1">/ person</span>
//         </div>

//         <ul className="text-sm space-y-3 mb-5 flex-grow border-t pt-4">
//           {displayFeatures.slice(0, 4).map((feature, idx) => (
//             <FeatureItem key={idx} {...feature} />
//           ))}
//         </ul>

//         {displayFeatures.length > 4 && (
//           <button
//             onClick={() => setIsSidebarOpen(true)}
//             className="text-sm text-blue-600 font-semibold hover:underline mb-5 flex items-center gap-1 self-start"
//           >
//             <Info size={14} /> View all features
//           </button>
//         )}

//         <button className="w-full mt-auto bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors transform group-hover:scale-105">
//           Select
//         </button>
//       </div>

//       <FareDetailsSidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         offer={offer}
//         features={allFeatures}
//       />
//     </>
//   );
// }

//src/components/flight-results/FareCard.js
"use client";

import {
  X,
  Info,
  Luggage,
  Armchair,
  Wifi,
  BatteryCharging,
  Replace,
  BadgePercent,
  Star,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "src/lib/store";

// --- Sub-Component: Feature Item for clarity and reuse ---
const FeatureItem = ({ icon: Icon, text, available = true }) => (
  <li
    className={`flex items-center gap-3 ${
      !available ? "text-gray-400 line-through" : "text-gray-700"
    }`}
  >
    <Icon
      className={`w-5 h-5 flex-shrink-0 ${
        available ? "text-blue-600" : "text-gray-400"
      }`}
    />
    <span>{text}</span>
  </li>
);

// --- Sub-Component: Fare Details Sidebar ---
const FareDetailsSidebar = ({ isOpen, onClose, offer, features }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !offer) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[998] transition-opacity"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[999] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {offer.fare_brand_name || "Standard Fare"} Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20 p-6 space-y-6">
          {Object.entries(features).map(
            ([category, items]) =>
              items.length > 0 && (
                <div key={category}>
                  <h4 className="font-bold text-gray-700 mb-3 capitalize border-b pb-1">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {items.map((feature, idx) => (
                      <FeatureItem key={idx} {...feature} />
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
};

// --- Main FareCard Component ---
export default function FareCard({ offer, isRecommended = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const selectOfferForBooking = useBookingStore(
    (state) => state.selectOfferForBooking
  );

  const segmentPassenger = offer.slices?.[0]?.segments?.[0]?.passengers?.[0];

  const allFeatures = useMemo(() => {
    const features = { baggage: [], flexibility: [], comfort: [] };
    if (!offer) return features;

    // --- Baggage ---
    const carryOn = offer.passengers?.[0]?.baggages?.find(
      (b) => b.type === "carry_on"
    );
    const checked = offer.passengers?.[0]?.baggages?.find(
      (b) => b.type === "checked"
    );
    features.baggage.push({
      icon: Luggage,
      text: carryOn
        ? `${carryOn.quantity}x Carry-on Bag`
        : "Carry-on Bag Included",
    });
    features.baggage.push({
      icon: Luggage,
      text: checked ? `${checked.quantity}x Checked Bag` : "No Checked Bag",
      available: !!checked,
    });

    // --- Flexibility ---
    if (offer.conditions?.change_before_departure?.allowed) {
      const fee = offer.conditions.change_before_departure.penalty_amount;
      features.flexibility.push({
        icon: Replace,
        text: fee && parseFloat(fee) > 0 ? `Changes with fee` : "Free Changes",
      });
    } else {
      features.flexibility.push({
        icon: Replace,
        text: "Non-changeable",
        available: false,
      });
    }
    if (offer.conditions?.refund_before_departure?.allowed) {
      const fee = offer.conditions.refund_before_departure.penalty_amount;
      features.flexibility.push({
        icon: BadgePercent,
        text:
          fee && parseFloat(fee) > 0 ? `Refundable with fee` : "Free Refunds",
      });
    } else {
      features.flexibility.push({
        icon: BadgePercent,
        text: "Non-refundable",
        available: false,
      });
    }

    // --- Comfort ---
    const amenities = segmentPassenger?.cabin?.amenities;
    if (amenities) {
      if (amenities.seat) {
        features.comfort.push({
          icon: Armchair,
          text: `${amenities.seat.legroom || "Standard"} Legroom`,
        });
      }
      if (amenities.wifi?.available) {
        features.comfort.push({
          icon: Wifi,
          text: `WiFi ${
            amenities.wifi.cost === "free" ? "Included" : "Available"
          }`,
        });
      }
      if (amenities.power?.available) {
        features.comfort.push({ icon: BatteryCharging, text: "In-seat Power" });
      }
    }

    return features;
  }, [offer, segmentPassenger]);

  if (!offer) return null;

  const priceInUSD = Math.round(parseFloat(offer.total_amount));
  const fareName =
    offer.fare_brand_name ||
    segmentPassenger?.cabin_class_marketing_name ||
    "Standard";
  const displayFeatures = [
    ...allFeatures.baggage,
    ...allFeatures.flexibility,
    ...allFeatures.comfort,
  ];

  const handleSelectFare = () => {
    // 1. Save the chosen offer (with its sourceApi) to the global Zustand store.
    selectOfferForBooking(offer);

    // 2. Navigate the user to the next step of the booking flow.
    router.push("/book/selected");
  };

  return (
    <>
      <div
        className={`relative flex-shrink-0 w-full bg-white border-2 rounded-xl p-5 flex flex-col group transition-all duration-300 ${
          isRecommended
            ? "border-blue-500 shadow-lg"
            : "border-gray-200 hover:border-blue-500 hover:shadow-md"
        }`}
      >
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star size={12} fill="white" />
            MOST POPULAR
          </div>
        )}

        <div className="flex justify-between items-start">
          <h5 className="font-bold text-lg text-gray-800">{fareName}</h5>
        </div>

        <div className="my-3">
          <span className="text-4xl font-extrabold text-gray-900">
            ${priceInUSD.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-1">/ person</span>
        </div>

        <ul className="text-sm space-y-3 mb-5 flex-grow border-t pt-4">
          {displayFeatures.slice(0, 4).map((feature, idx) => (
            <FeatureItem key={idx} {...feature} />
          ))}
        </ul>

        {displayFeatures.length > 4 && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-sm text-blue-600 font-semibold hover:underline mb-5 flex items-center gap-1 self-start"
          >
            <Info size={14} /> View all features
          </button>
        )}

        <button
          onClick={handleSelectFare}
          className="w-full mt-auto bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors transform group-hover:scale-105"
        >
          Select
        </button>
      </div>

      <FareDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        offer={offer}
        features={allFeatures}
      />
    </>
  );
}
