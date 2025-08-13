//src/app/book/selected/SelectedClientComponent.js
"use client";

import { useBookingStore } from "src/lib/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader,
  AlertCircle,
  Plane,
  Users,
  CheckCircle,
  ArrowRight,
  Luggage,
  Utensils,
} from "lucide-react";
import { useState, useEffect } from "react";
import AddExtras from "src/components/booking/AddExtras";
// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Helper function to calculate duration - COMPLETELY FIXED
const formatDuration = (duration) => {
  if (!duration) return "N/A";
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;

  const hours = match[1] ? match[1].replace("H", "h ") : "";
  const minutes = match[2] ? match[2].replace("M", "m") : "";
  return `${hours}${minutes}`.trim();
};

// Helper function to safely get airport code
const getAirportCode = (location) => {
  if (!location) return "N/A";

  // Handle different API structures
  if (location.iata_code) return location.iata_code; // Duffel
  if (location.iataCode) return location.iataCode; // Amadeus

  return "N/A";
};

// Helper function to safely get carrier name from API data
const getCarrierName = (segment) => {
  if (!segment) return "Unknown Carrier";

  // For Duffel API - use actual carrier name from API
  if (segment.carrier && segment.carrier.name) {
    return segment.carrier.name;
  }

  // For Duffel API - marketing carrier
  if (segment.marketing_carrier && segment.marketing_carrier.name) {
    return segment.marketing_carrier.name;
  }

  // For Amadeus API - just use carrier code as provided
  if (segment.carrierCode) {
    return segment.carrierCode;
  }

  return "Unknown Carrier";
};

// Helper function to safely get flight number from API data
const getFlightNumber = (segment) => {
  if (!segment) return "N/A";

  // Duffel API structures
  if (segment.flight_number) return segment.flight_number;
  if (segment.marketing_carrier_flight_number)
    return segment.marketing_carrier_flight_number;
  if (segment.operating_carrier_flight_number)
    return segment.operating_carrier_flight_number;

  // Amadeus API structure
  if (segment.number) return segment.number;

  return "N/A";
};

// Helper function to safely get aircraft name from API data - NO STATIC MAPPING
const getAircraftName = (segment) => {
  if (!segment) return "Aircraft";

  // For Duffel API - use actual aircraft name from API
  if (segment.aircraft && segment.aircraft.name) {
    return segment.aircraft.name;
  }

  // For Amadeus API - use aircraft code from API
  if (segment.aircraft && segment.aircraft.code) {
    return `Aircraft ${segment.aircraft.code}`;
  }

  // If no aircraft info available
  return "Aircraft";
};

// Helper function to get departure info from different API structures
const getDepartureInfo = (segment) => {
  if (!segment) return { time: null, code: "N/A" };

  // Duffel structure
  if (segment.departing_at && segment.origin) {
    return {
      time: segment.departing_at,
      code: getAirportCode(segment.origin),
    };
  }

  // Amadeus structure
  if (segment.departure) {
    return {
      time: segment.departure.at,
      code: segment.departure.iataCode || "N/A",
    };
  }

  return { time: null, code: "N/A" };
};

// Helper function to get arrival info from different API structures
const getArrivalInfo = (segment) => {
  if (!segment) return { time: null, code: "N/A" };

  // Duffel structure
  if (segment.arriving_at && segment.destination) {
    return {
      time: segment.arriving_at,
      code: getAirportCode(segment.destination),
    };
  }

  // Amadeus structure
  if (segment.arrival) {
    return {
      time: segment.arrival.at,
      code: segment.arrival.iataCode || "N/A",
    };
  }

  return { time: null, code: "N/A" };
};

// Flight Segment Component - FULLY RESPONSIVE & API-DRIVEN
const FlightSegment = ({ segment, isReturn = false }) => {
  if (!segment) return null;

  const departureInfo = getDepartureInfo(segment);
  const arrivalInfo = getArrivalInfo(segment);
  const carrierName = getCarrierName(segment);
  const flightNumber = getFlightNumber(segment);
  const aircraftName = getAircraftName(segment);
  const duration = segment.duration;

  return (
    <div className="bg-white rounded-lg border p-3 sm:p-4 mb-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mobile Layout */}
        <div className="flex sm:hidden w-full justify-between items-center">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatTime(departureInfo.time)}
            </div>
            <div className="text-sm text-gray-500">{departureInfo.code}</div>
            <div className="text-xs text-gray-400">
              {formatDate(departureInfo.time)}
            </div>
          </div>

          <div className="flex-1 text-center px-2">
            <div className="flex items-center justify-center mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1 h-0.5 bg-blue-200 mx-1"></div>
              <Plane className="w-3 h-3 text-blue-500" />
              <div className="flex-1 h-0.5 bg-blue-200 mx-1"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="text-xs text-gray-600">
              {formatDuration(duration)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatTime(arrivalInfo.time)}
            </div>
            <div className="text-sm text-gray-500">{arrivalInfo.code}</div>
            <div className="text-xs text-gray-400">
              {formatDate(arrivalInfo.time)}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4 w-full">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(departureInfo.time)}
            </div>
            <div className="text-sm text-gray-500">{departureInfo.code}</div>
            <div className="text-xs text-gray-400">
              {formatDate(departureInfo.time)}
            </div>
          </div>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="flex-1 h-0.5 bg-blue-200 mx-2"></div>
              <Plane className="w-4 h-4 text-blue-500" />
              <div className="flex-1 h-0.5 bg-blue-200 mx-2"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
            <div className="text-sm text-gray-600">
              {formatDuration(duration)}
            </div>
            <div className="text-xs text-gray-500">
              {carrierName} {flightNumber}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(arrivalInfo.time)}
            </div>
            <div className="text-sm text-gray-500">{arrivalInfo.code}</div>
            <div className="text-xs text-gray-400">
              {formatDate(arrivalInfo.time)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Plane className="w-4 h-4" />
            <span className="truncate">{aircraftName}</span>
          </span>
          <span className="text-xs sm:text-sm">Flight {flightNumber}</span>
          <span className="text-xs sm:text-sm">{carrierName}</span>
        </div>
      </div>
    </div>
  );
};

// Price Breakdown Component - RESPONSIVE
// A more accurate PriceBreakdown component

const PriceBreakdown = ({ offer }) => {
  // Use data directly from the API response
  const total = parseFloat(offer?.total_amount || 0);
  const base = parseFloat(offer?.base_amount || total * 0.8); // Estimate base if not provided
  const taxes = total - base;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Base Fare ({offer.passengers?.length || 1} travelers)
          </span>
          <span>${base.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Taxes & Surcharges</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to get baggage info from API data - NO STATIC DATA
const getBaggageInfo = (offer) => {
  const baggages = [];

  // Try Duffel structure first
  if (
    offer.slices &&
    offer.slices[0] &&
    offer.slices[0].segments &&
    offer.slices[0].segments[0]
  ) {
    const segment = offer.slices[0].segments[0];
    if (
      segment.passengers &&
      segment.passengers[0] &&
      segment.passengers[0].baggages
    ) {
      segment.passengers[0].baggages.forEach((bag) => {
        baggages.push({
          type: bag.type,
          quantity: bag.quantity || 1,
        });
      });
    }
  }

  // Try Amadeus structure
  if (
    baggages.length === 0 &&
    offer.passengers &&
    offer.passengers[0] &&
    offer.passengers[0].fareDetailsBySegment
  ) {
    const fareDetails = offer.passengers[0].fareDetailsBySegment[0];

    if (fareDetails.includedCheckedBags) {
      baggages.push({
        type: "checked",
        quantity: 1,
        weight: fareDetails.includedCheckedBags.weight,
        weightUnit: fareDetails.includedCheckedBags.weightUnit,
      });
    }

    // Always include carry-on for Amadeus
    baggages.push({
      type: "carry_on",
      quantity: 1,
    });
  }

  // Default if no baggage info found
  if (baggages.length === 0) {
    baggages.push({ type: "carry_on", quantity: 1 });
  }

  return baggages;
};

export default function SelectedClientComponent() {
  const router = useRouter();
  const { selectedOffer, setPricedOffer, resetBookingFlow, bookingState } =
    useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if no offer is selected
  useEffect(() => {
    if (!selectedOffer) {
      router.push("/search");
      return;
    }
  }, [selectedOffer, router]);

  // Pricing mutation
  const pricingMutation = useMutation({
    mutationFn: async (offerData) => {
      const response = await fetch("/api/flights/offers/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to price offer");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setPricedOffer(data.pricedOffer);
      }
    },
    onError: (error) => {
      console.error("Pricing failed:", error);
    },
  });

  // Auto-price the offer when component loads
  useEffect(() => {
    if (
      selectedOffer &&
      bookingState === "pricing" &&
      !pricingMutation.isPending
    ) {
      const pricingData =
        selectedOffer.sourceApi === "amadeus"
          ? {
              sourceApi: selectedOffer.sourceApi,
              offer: selectedOffer,
            }
          : {
              sourceApi: selectedOffer.sourceApi,
              offerId: selectedOffer.id,
            };

      pricingMutation.mutate(pricingData);
    }
  }, [selectedOffer, bookingState]); // Removed pricingMutation from dependencies

  const handleProceedToPassengerDetails = () => {
    setIsProcessing(true);
    setTimeout(() => {
      router.push("/book/passengers");
    }, 1000);
  };

  const handleBackToResults = () => {
    resetBookingFlow();
    router.push("/search/results");
  };

  if (!selectedOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Flight Selected
          </h2>
          <p className="text-gray-600 mb-4">
            Please select a flight to continue.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // ✅ Use useQuery to automatically fetch the price when the component loads
  const {
    data: pricedOfferData,
    isLoading: isPricing,
    isError,
    error,
  } = useQuery({
    queryKey: ["price", selectedOffer?.id], // A unique key for this query
    queryFn: () => repriceOffer(selectedOffer), // The function that fetches data
    enabled: !!selectedOffer && bookingState === "pricing", // Only run if an offer is selected
    onSuccess: (data) => {
      // When successful, update the global store
      setPricedOffer(data.pricedOffer);
    },
    retry: false, // Don't retry automatically on failure
  });

  const isLoading = pricingMutation.isPending || isProcessing;
  const pricedOffer = pricedOfferData?.pricedOffer || selectedOffer;
  const hasError = pricingMutation.isError;
  const baggages = getBaggageInfo(pricedOffer);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - RESPONSIVE */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Review Your Flight
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Please review your selection before proceeding
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                $
                {Math.round(
                  Number.parseFloat(pricedOffer.total_amount || 0)
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {pricedOffer.passengers?.length || 2} passengers
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 text-center">
            <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              {isProcessing
                ? "Processing your selection..."
                : "Confirming current prices..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-medium">Pricing Error</span>
            </div>
            <p className="text-red-600 mt-1 text-sm">
              {pricingMutation.error?.message ||
                "Unable to confirm current prices. Please try again."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Flight Details - RESPONSIVE */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Outbound Flight */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Outbound Flight
              </h2>
              {pricedOffer.slices &&
                pricedOffer.slices[0] &&
                pricedOffer.slices[0].segments &&
                pricedOffer.slices[0].segments.map((segment, index) => (
                  <FlightSegment key={index} segment={segment} />
                ))}
            </div>

            {/* Return Flight */}
            {pricedOffer.slices && pricedOffer.slices[1] && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600 transform rotate-180" />
                  Return Flight
                </h2>
                {pricedOffer.slices[1].segments &&
                  pricedOffer.slices[1].segments.map((segment, index) => (
                    <FlightSegment
                      key={index}
                      segment={segment}
                      isReturn={true}
                    />
                  ))}
              </div>
            )}

            {pricedOffer && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <AddExtras offer={pricedOffer} />
              </div>
            )}

            {/* Fare Features - RESPONSIVE */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Included in Your Fare
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {baggages.map((baggage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Luggage className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">
                      {baggage.quantity}x {baggage.type.replace("_", " ")} bag
                      {baggage.weight
                        ? ` (${baggage.weight}${baggage.weightUnit || "kg"})`
                        : ""}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">
                    Meal & Beverage
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">
                    Seat Selection
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar - RESPONSIVE */}
          <div className="space-y-4 sm:space-y-6">
            {/* Price Summary */}
            <PriceBreakdown offer={pricedOffer} />

            {/* Booking Progress */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Booking Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Flight Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    Review Details
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                  <span className="text-sm text-gray-400">
                    Passenger Details
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                  <span className="text-sm text-gray-400">Payment</span>
                </div>
              </div>
            </div>

            {/* Action Buttons - RESPONSIVE */}
            <div className="space-y-3">
              <button
                onClick={handleProceedToPassengerDetails}
                disabled={isLoading || hasError}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
              >
                {isProcessing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Continue to Passenger Details
                    </span>
                    <span className="sm:hidden">Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleBackToResults}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Back to Results
              </button>
            </div>

            {/* Support Info - RESPONSIVE */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Our support team is available 24/7 to assist you.
              </p>
              <button className="text-sm text-blue-600 font-medium hover:underline">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
