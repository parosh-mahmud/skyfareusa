// //src/components/flight-results/FareCard.js
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
// import { useRouter } from "next/navigation";
// import { useBookingStore } from "src/lib/store";

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
//   const router = useRouter();
//   // ✅ FIX: Use the correct action name from your Zustand store
//   const setSelectedOffer = useBookingStore((state) => state.setSelectedOffer);
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

//     // --- Comfort ---
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
//   }, [offer, segmentPassenger]);

//   if (!offer) return null;

//   const priceInUSD = Math.round(parseFloat(offer.total_amount));
//   const fareName =
//     offer.fare_brand_name ||
//     segmentPassenger?.cabin_class_marketing_name ||
//     "Standard";
//   const displayFeatures = [
//     ...allFeatures.baggage,
//     ...allFeatures.flexibility,
//     ...allFeatures.comfort,
//   ];

//   const handleSelectFare = () => {
//     // 1. Save the chosen offer (with its sourceApi) to the global Zustand store.
//     setSelectedOffer(offer);

//     // 2. Navigate the user to the next step of the booking flow.
//     router.push("/book/selected");
//   };

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

//         <button
//           onClick={handleSelectFare}
//           className="w-full mt-auto bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors transform group-hover:scale-105"
//         >
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

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

// Icon components as simple SVGs to avoid external dependencies
const Icons = {
  Star: ({ size = 16, fill = "none", className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  ),
  Luggage: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
      <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
    </svg>
  ),
  Armchair: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
    </svg>
  ),
  Wifi: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <path d="M12 20h.01" />
    </svg>
  ),
  Coffee: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  RefreshCw: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  Shield: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),
  X: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  ),
  Info: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  Crown: ({ size = 16, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L14.5 8.5l4.5-1.5a.5.5 0 0 1 .65.65L18 12.5l3.5 4.5a.5.5 0 0 1-.65.65L16 16l-4 4-4-4-4.85 1.65a.5.5 0 0 1-.65-.65L6.5 12.5 5 7.65a.5.5 0 0 1 .65-.65L10 8.5l1.562-5.234Z" />
    </svg>
  ),
};

// Feature Item Component
const FeatureItem = ({
  icon: Icon,
  text,
  available = true,
  isHighlight = false,
}) => (
  <div
    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
      isHighlight ? "bg-blue-50 border border-blue-200" : ""
    } ${!available ? "opacity-50" : ""}`}
  >
    <Icon
      size={18}
      className={`flex-shrink-0 ${
        available
          ? isHighlight
            ? "text-blue-600"
            : "text-green-600"
          : "text-gray-400"
      }`}
    />
    <span
      className={`text-sm ${
        available ? "text-gray-700" : "text-gray-400 line-through"
      }`}
    >
      {text}
    </span>
  </div>
);

// Fare Details Modal
const FareDetailsModal = ({ isOpen, onClose, offer, features }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !offer) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          borderRadius: "16px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            {offer.rawOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
              ?.brandedFareLabel || "Fare Details"}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            maxHeight: "calc(80vh - 100px)",
          }}
        >
          <div style={{ display: "grid", gap: "24px" }}>
            {Object.entries(features).map(
              ([category, items]) =>
                items.length > 0 && (
                  <div key={category}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#374151",
                        marginBottom: "16px",
                        textTransform: "capitalize",
                        borderBottom: "2px solid #e5e7eb",
                        paddingBottom: "8px",
                      }}
                    >
                      {category}
                    </h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {items.map((feature, idx) => (
                        <FeatureItem key={idx} {...feature} />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main FareCard Component
export default function FareCard({ offer, isRecommended = false, onSelect }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fareDetails = useMemo(() => {
    if (!offer)
      return {
        features: { baggage: [], comfort: [], flexibility: [] },
        fareName: "Standard",
        airline: "",
      };

    const features = { baggage: [], comfort: [], flexibility: [] };
    const travelerPricing = offer.rawOffer?.travelerPricings?.[0];
    const fareSegment = travelerPricing?.fareDetailsBySegment?.[0];

    // Extract fare name and airline
    const fareName =
      fareSegment?.brandedFareLabel || fareSegment?.cabin || "Economy";
    const airline = offer.rawOffer?.validatingAirlineCodes?.[0] || "";

    // Baggage features
    if (fareSegment?.includedCheckedBags) {
      const weight = fareSegment.includedCheckedBags.weight;
      const unit = fareSegment.includedCheckedBags.weightUnit || "KG";
      features.baggage.push({
        icon: Icons.Luggage,
        text: `${weight}${unit} Checked Bag`,
        available: true,
        isHighlight: weight >= 25,
      });
    } else {
      features.baggage.push({
        icon: Icons.Luggage,
        text: "No Checked Bag",
        available: false,
      });
    }

    if (fareSegment?.includedCabinBags) {
      const cabinBag = fareSegment.includedCabinBags;
      const text = cabinBag.weight
        ? `${cabinBag.weight}${cabinBag.weightUnit || "KG"} Cabin Bag`
        : `${cabinBag.quantity || 1}x Cabin Bag`;
      features.baggage.push({
        icon: Icons.Luggage,
        text: text,
        available: true,
      });
    }

    // Comfort features
    features.comfort.push({
      icon: Icons.Armchair,
      text: `${fareSegment?.cabin || "Economy"} Class`,
      available: true,
      isHighlight: fareSegment?.cabin !== "ECONOMY",
    });

    // Check for amenities
    if (fareSegment?.amenities) {
      fareSegment.amenities.forEach((amenity) => {
        if (amenity.amenityType === "LOUNGE" && !amenity.isChargeable) {
          features.comfort.push({
            icon: Icons.Crown,
            text: amenity.description,
            available: true,
            isHighlight: true,
          });
        }
        if (amenity.description.toLowerCase().includes("wifi")) {
          features.comfort.push({
            icon: Icons.Wifi,
            text: "WiFi Available",
            available: true,
          });
        }
        if (amenity.description.toLowerCase().includes("meal")) {
          features.comfort.push({
            icon: Icons.Coffee,
            text: "Meal Service",
            available: true,
          });
        }
      });
    }

    // Flexibility features
    const hasChangeableFare = fareSegment?.amenities?.some(
      (a) => a.description.toLowerCase().includes("change") && !a.isChargeable
    );
    const hasRefundableFare = fareSegment?.amenities?.some(
      (a) =>
        a.description.toLowerCase().includes("refund") ||
        a.description.toLowerCase().includes("cancellation")
    );

    features.flexibility.push({
      icon: Icons.RefreshCw,
      text: hasChangeableFare ? "Free Changes" : "Change Fees Apply",
      available: hasChangeableFare,
      isHighlight: hasChangeableFare,
    });

    features.flexibility.push({
      icon: Icons.Shield,
      text: hasRefundableFare ? "Refundable" : "Non-refundable",
      available: hasRefundableFare,
      isHighlight: hasRefundableFare,
    });

    return { features, fareName, airline };
  }, [offer]);

  if (!offer) return null;

  const price = Math.round(Number.parseFloat(offer.total_amount));
  const currency = offer.total_currency || "USD";
  const { features, fareName, airline } = fareDetails;

  const allFeatures = [
    ...features.baggage,
    ...features.comfort,
    ...features.flexibility,
  ];
  const displayFeatures = allFeatures.slice(0, 4);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(offer);
    } else {
      router.push("/book/selected");
    }
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          border: `2px solid ${isRecommended ? "#3b82f6" : "#e5e7eb"}`,
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          minHeight: "400px",
          transition: "all 0.3s ease",
          boxShadow: isRecommended
            ? "0 10px 25px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          transform: "translateY(0)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
          if (!isRecommended) {
            e.currentTarget.style.borderColor = "#3b82f6";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isRecommended
            ? "0 10px 25px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
          if (!isRecommended) {
            e.currentTarget.style.borderColor = "#e5e7eb";
          }
        }}
      >
        {isRecommended && (
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              padding: "6px 16px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Icons.Star size={12} fill="white" />
            MOST POPULAR
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 4px 0",
              }}
            >
              {fareName}
            </h3>
            {airline && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                {airline} Airlines
              </p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#1f2937",
                lineHeight: "1",
              }}
            >
              {currency === "USD" ? "$" : currency}
              {price.toLocaleString()}
            </span>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>/ person</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            borderTop: "1px solid #f3f4f6",
            paddingTop: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            {displayFeatures.map((feature, idx) => (
              <FeatureItem key={idx} {...feature} />
            ))}
          </div>
        </div>

        {allFeatures.length > 4 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "20px",
              padding: "4px 0",
            }}
          >
            <Icons.Info size={14} /> View all features ({allFeatures.length})
          </button>
        )}

        <button
          onClick={handleSelect}
          style={{
            width: "100%",
            background: isRecommended
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 8px 15px -3px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
          }}
        >
          Select This Fare
        </button>
      </div>

      <FareDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={offer}
        features={features}
      />
    </>
  );
}
