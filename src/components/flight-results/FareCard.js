"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "src/lib/store";

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
  const setSelectedOffer = useBookingStore((state) => state.setSelectedOffer);

  // Memoized logic to extract and normalize fare details
  const fareDetails = useMemo(() => {
    if (!offer) {
      return {
        features: { baggage: [], comfort: [], flexibility: [] },
        fareName: "Standard",
        airline: "",
      };
    }

    const isAmadeus = offer.sourceApi === "amadeus";
    const features = { baggage: [], comfort: [], flexibility: [] };
    let fareName = "Standard";
    let airline = "";

    if (isAmadeus) {
      const travelerPricing = offer.rawOffer?.travelerPricings?.[0];
      const fareSegment = travelerPricing?.fareDetailsBySegment?.[0];
      fareName =
        fareSegment?.brandedFareLabel || fareSegment?.cabin || "Economy";
      airline = offer.rawOffer?.validatingAirlineCodes?.[0] || "";

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
          text,
          available: true,
        });
      }

      features.comfort.push({
        icon: Icons.Armchair,
        text: `${fareSegment?.cabin || "Economy"} Class`,
        available: true,
        isHighlight: fareSegment?.cabin !== "ECONOMY",
      });

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
    } else {
      // Handle Duffel API response structure
      const baggageAllowance =
        offer.passengers?.[0]?.baggages?.[0]?.quantity || 0;
      const cabinAllowance =
        offer.passengers?.[0]?.baggages?.[1]?.quantity || 0;

      fareName = "Duffel Fare"; // Or extract from offer if available
      airline = offer.slices?.[0]?.segments?.[0]?.carrier?.name || "";

      if (baggageAllowance > 0) {
        features.baggage.push({
          icon: Icons.Luggage,
          text: `${baggageAllowance} Checked Bag(s)`,
          available: true,
          isHighlight: baggageAllowance > 1,
        });
      } else {
        features.baggage.push({
          icon: Icons.Luggage,
          text: "No Checked Bag",
          available: false,
        });
      }

      if (cabinAllowance > 0) {
        features.baggage.push({
          icon: Icons.Luggage,
          text: `${cabinAllowance} Cabin Bag(s)`,
          available: true,
        });
      }

      // Duffel's conditions are at the offer level
      const isRefundable =
        offer.conditions?.refund_before_departure?.allowed || false;
      const isChangeable =
        offer.conditions?.change_before_departure?.allowed || false;

      features.flexibility.push({
        icon: Icons.RefreshCw,
        text: isChangeable ? "Free Changes" : "Change Fees Apply",
        available: isChangeable,
        isHighlight: isChangeable,
      });

      features.flexibility.push({
        icon: Icons.Shield,
        text: isRefundable ? "Refundable" : "Non-refundable",
        available: isRefundable,
        isHighlight: isRefundable,
      });
    }

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
    setSelectedOffer(offer);
    if (onSelect) {
      onSelect(offer);
    } else {
      console.log("Selected Offer:", offer);
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
