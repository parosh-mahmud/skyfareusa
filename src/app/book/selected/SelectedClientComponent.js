"use client";

import { useBookingStore } from "src/lib/store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader,
  AlertCircle,
  Plane,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Users,
  Luggage,
  Utensils,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import AddExtras from "src/components/booking/AddExtras";

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatDuration = (duration) => {
  if (!duration) return "N/A";
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;

  const hours = match[1] ? match[1].replace("H", "h ") : "";
  const minutes = match[2] ? match[2].replace("M", "m") : "";
  return `${hours}${minutes}`.trim();
};

const FlightSegment = ({ segment }) => {
  if (!segment) return null;

  const departureTime = segment.departing_at || segment.departure?.at;
  const arrivalTime = segment.arriving_at || segment.arrival?.at;
  const departureCode =
    segment.origin?.iata_code || segment.departure?.iataCode || "N/A";
  const arrivalCode =
    segment.destination?.iata_code || segment.arrival?.iataCode || "N/A";
  const carrierName = segment.carrier?.name || segment.carrierCode || "Unknown";
  const flightNumber = segment.flight_number || segment.number || "N/A";

  return (
    <div className="bg-white rounded-lg border p-3 sm:p-4 mb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {formatTime(departureTime)}
          </div>
          <div className="text-sm text-gray-500">{departureCode}</div>
          <div className="text-xs text-gray-400">
            {formatDate(departureTime)}
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
            {formatDuration(segment.duration)}
          </div>
          <div className="text-xs text-gray-500">
            {carrierName} {flightNumber}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {formatTime(arrivalTime)}
          </div>
          <div className="text-sm text-gray-500">{arrivalCode}</div>
          <div className="text-xs text-gray-400">{formatDate(arrivalTime)}</div>
        </div>
      </div>
    </div>
  );
};

// Updated PriceBreakdown component to include selectedServices
const PriceBreakdown = ({ offer, selectedServices = [] }) => {
  const basePrice = Number.parseFloat(offer?.total_amount || 0);
  const taxes = basePrice * 0.15;
  const fees = 25;

  // Calculate services total
  const servicesTotal = selectedServices.reduce((total, service) => {
    return total + service.price * (service.quantity || 1);
  }, 0);

  const finalTotal = basePrice + servicesTotal;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-xs sm:text-sm">
            Base Fare ({offer?.passengers?.length || 2} passengers)
          </span>
          <span>${(basePrice - taxes - fees).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Taxes & Fees</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Booking Fee</span>
          <span>${fees.toFixed(2)}</span>
        </div>

        {/* Added services breakdown */}
        {selectedServices.length > 0 && (
          <>
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Additional Services
              </div>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    {service.name} x{service.quantity || 1}
                  </span>
                  <span>
                    ${(service.price * (service.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t pt-2 flex justify-between font-semibold text-base sm:text-lg">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

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
  const {
    selectedOffer,
    setPricedOffer,
    resetBookingFlow,
    bookingState,
    selectedServices,
    selectedSeats,
    setSelectedServices,
    setSelectedSeats,
    pricedOffer,
  } = useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const pricingQuery = useQuery({
    queryKey: ["flight-pricing", selectedOffer?.id, selectedOffer?.sourceApi],
    queryFn: async () => {
      if (!selectedOffer) throw new Error("No offer selected");

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

      const response = await fetch("/api/flights/offers/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `HTTP ${response.status}: Failed to price offer`
        );
      }

      return response.json();
    },
    enabled: !!selectedOffer && bookingState === "pricing",
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary re-fetching
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 429 (rate limit)
      if (error.message.includes("HTTP 4") && !error.message.includes("429")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    onSuccess: (data) => {
      if (data.success) {
        setPricedOffer(data.pricedOffer);
        setRetryCount(0);
      }
    },
    onError: (error) => {
      console.error("Pricing failed:", error);
      setRetryCount((prev) => prev + 1);
    },
  });

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    pricingQuery.refetch();
  }, [pricingQuery]);

  // Redirect if no offer is selected
  useEffect(() => {
    if (!selectedOffer) {
      router.push("/search");
      return;
    }
  }, [selectedOffer, router]);

  const handleServiceSelection = (service, action) => {
    const updatedServices = [...selectedServices];
    const existingIndex = updatedServices.findIndex((s) => s.id === service.id);

    if (action === "add") {
      if (existingIndex >= 0) {
        updatedServices[existingIndex] = {
          ...updatedServices[existingIndex],
          quantity: (updatedServices[existingIndex].quantity || 1) + 1,
        };
      } else {
        updatedServices.push({ ...service, quantity: 1 });
      }
    } else if (action === "remove") {
      if (existingIndex >= 0) {
        const current = updatedServices[existingIndex];
        if (current.quantity > 1) {
          updatedServices[existingIndex] = {
            ...updatedServices[existingIndex],
            quantity: current.quantity - 1,
          };
        } else {
          updatedServices.splice(existingIndex, 1);
        }
      }
    }

    setSelectedServices(updatedServices);
  };

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

  const getErrorMessage = (error) => {
    if (
      error?.message?.includes("429") ||
      error?.message?.includes("rate limit")
    ) {
      return `Rate limit exceeded. Please wait ${Math.min(
        30,
        5 * retryCount
      )} seconds before trying again.`;
    }
    if (error?.message?.includes("HTTP 4")) {
      return "Invalid request. Please go back and select a different flight.";
    }
    return (
      error?.message || "Unable to confirm current prices. Please try again."
    );
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

  const currentOffer = pricedOffer || selectedOffer;
  const isLoading = pricingQuery.isLoading || isProcessing;
  const hasError = pricingQuery.isError;
  const baggages = getBaggageInfo(currentOffer);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
                  Number.parseFloat(currentOffer.total_amount || 0)
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {currentOffer.passengers?.length || 2} passengers
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
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-medium">Pricing Error</span>
            </div>
            <p className="text-red-600 mb-3 text-sm">
              {getErrorMessage(pricingQuery.error)}
            </p>
            <button
              onClick={handleRetry}
              disabled={pricingQuery.isFetching}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {pricingQuery.isFetching ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Try Again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Flight Details */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Outbound Flight */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Outbound Flight
              </h2>
              {currentOffer.slices &&
                currentOffer.slices[0] &&
                currentOffer.slices[0].segments &&
                currentOffer.slices[0].segments.map((segment, index) => (
                  <FlightSegment key={index} segment={segment} />
                ))}
            </div>

            {/* Return Flight */}
            {currentOffer.slices && currentOffer.slices[1] && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600 transform rotate-180" />
                  Return Flight
                </h2>
                {currentOffer.slices[1].segments &&
                  currentOffer.slices[1].segments.map((segment, index) => (
                    <FlightSegment key={index} segment={segment} />
                  ))}
              </div>
            )}

            {currentOffer && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <AddExtras offer={currentOffer} />
              </div>
            )}

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

          {/* Booking Summary Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <PriceBreakdown
              offer={currentOffer}
              selectedServices={selectedServices}
            />

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

            {/* Action Buttons */}
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
