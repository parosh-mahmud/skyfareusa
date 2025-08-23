// //src/components/bookingv2/selected-client-component.js
// "use client";

// import { useState } from "react";
// import { Card, CardContent } from "../ui/card";
// import { useTimeRemaining } from "../../hooks/use-time-remaining";
// import BookingProgress from "./booking-progress";
// import TravellerDetailsStep from "./traveller-details-step";
// import ExtraBaggagesStep from "./extra-baggages-step";
// import ReviewPaymentStep from "./review-payment-step";

// export default function SelectedClientComponent() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [bookingData, setBookingData] = useState({
//     travellerData: [],
//     selectedServices: [],
//     amadeusSelection: { seat: null, baggage: [] },
//   });

//   const { minutes, seconds, isExpired } = useTimeRemaining(15);

//   // Mock passengers data
//   const mockPassengers = [{ type: "adult" }, { type: "adult" }];

//   const handleTravellerDetailsNext = (travellerData) => {
//     setBookingData((prev) => ({ ...prev, travellerData }));
//     setCurrentStep(2);
//   };

//   const handleServicesNext = (servicesData) => {
//     setBookingData((prev) => ({ ...prev, ...servicesData }));
//     setCurrentStep(3);
//   };

//   const handleConfirmBooking = (finalData) => {
//     console.log("Booking confirmed:", finalData);
//     // Handle booking confirmation
//     alert("Booking confirmed successfully!");
//   };

//   if (isExpired) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <Card>
//           <CardContent className="p-8 text-center">
//             <h2 className="text-2xl font-semibold text-red-600 mb-4">
//               Session Expired
//             </h2>
//             <p className="text-gray-600 mb-4">
//               Your booking session has expired. Please start a new search.
//             </p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//             >
//               Start New Search
//             </button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Timer */}
//       <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//         <div className="flex items-center justify-between">
//           <span className="text-yellow-800">Complete your booking within:</span>
//           <span className="font-mono text-lg font-semibold text-yellow-900">
//             {String(minutes).padStart(2, "0")}:
//             {String(seconds).padStart(2, "0")}
//           </span>
//         </div>
//       </div>

//       {/* Progress Indicator */}
//       <BookingProgress currentStep={currentStep} />

//       {/* Step Content */}
//       <Card className="mt-6">
//         <CardContent className="p-6">
//           {currentStep === 1 && (
//             <TravellerDetailsStep
//               passengers={mockPassengers}
//               onNext={handleTravellerDetailsNext}
//             />
//           )}

//           {currentStep === 2 && (
//             <ExtraBaggagesStep
//               onNext={handleServicesNext}
//               onBack={() => setCurrentStep(1)}
//               provider="duffel" // or "amadeus"
//             />
//           )}

//           {currentStep === 3 && (
//             <ReviewPaymentStep
//               bookingData={bookingData}
//               onBack={() => setCurrentStep(2)}
//               onConfirm={handleConfirmBooking}
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTimeRemaining } from "../../hooks/use-time-remaining";
import { useBookingStore } from "../../lib/store";

import BookingProgress from "./booking-progress";
import TravellerDetailsStep from "./traveller-details-step";
import ExtraBaggagesStep from "./extra-baggages-step";
import ReviewPaymentStep from "./review-payment-step";
import PriceDisplaySection from "./price-display-section";
import BookingConfirmation from "./booking-confirmation";
export default function SelectedClientComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    travellerData: [],
    selectedServices: [],
    amadeusSelection: { seat: null, baggage: [] },
  });

  const [isPricing, setIsPricing] = useState(true);
  const [pricingError, setPricingError] = useState(null);

  const { minutes, seconds, isExpired } = useTimeRemaining(15);
  const { pricedOffer, setPricedOffer, selectedFlight } = useBookingStore();
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  useEffect(() => {
    const repriceOffer = async () => {
      if (!selectedFlight) {
        setPricingError(
          "No flight offer was selected. Please go back and try again."
        );
        setIsPricing(false);
        return;
      }

      try {
        const res = await fetch("/api/flights/offers/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerId: selectedFlight.id,
            offer: selectedFlight,
            sourceApi: selectedFlight.sourceApi,
          }),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to get the latest price.");
        }

        setPricedOffer(result.pricedOffer);
      } catch (error) {
        console.error("Repricing failed:", error);
        setPricingError(error.message);
      } finally {
        setIsPricing(false);
      }
    };

    repriceOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passengers = pricedOffer?.passengers || [];

  const priceDetails = useMemo(() => {
    if (!pricedOffer) return { totalAmount: 0, currency: "USD" };
    return {
      totalAmount: parseFloat(pricedOffer.total_amount),
      currency: pricedOffer.total_currency,
    };
  }, [pricedOffer]);

  const handleTravellerDetailsNext = (travellerData) => {
    setBookingData((prev) => ({ ...prev, travellerData }));
    setCurrentStep(2);
  };

  const handleServicesNext = (servicesData) => {
    setBookingData((prev) => ({ ...prev, ...servicesData }));
    setCurrentStep(3);
  };

  const handleConfirmBooking = (orderData) => {
    console.log("Booking confirmed successfully!", orderData);
    setConfirmedOrder(orderData);
  };
  if (confirmedOrder) {
    return <BookingConfirmation order={confirmedOrder} />;
  }

  if (isPricing) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Confirming Latest Price...</h2>
        <p className="text-gray-600">
          Please wait while we fetch the most up-to-date details for your
          flight.
        </p>
      </div>
    );
  }

  if (pricingError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Price Confirmation Failed</AlertTitle>
          <AlertDescription>{pricingError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Session Expired
            </h2>
            <p className="text-gray-600 mb-4">
              Your booking session has expired. Please start a new search.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start New Search
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800">Complete your booking within:</span>
          <span className="font-mono text-lg font-semibold text-yellow-900">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <BookingProgress currentStep={currentStep} />
          <Card className="mt-6">
            <CardContent className="p-6">
              {currentStep === 1 && (
                <TravellerDetailsStep
                  passengers={passengers}
                  onNext={handleTravellerDetailsNext}
                />
              )}
              {currentStep === 2 && (
                <ExtraBaggagesStep
                  onNext={handleServicesNext}
                  onBack={() => setCurrentStep(1)}
                  provider="duffel"
                />
              )}
              {currentStep === 3 && (
                <ReviewPaymentStep
                  bookingData={bookingData}
                  onBack={() => setCurrentStep(2)}
                  onConfirm={handleConfirmBooking}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="sticky top-6">
            <PriceDisplaySection
              totalAmount={priceDetails.totalAmount}
              selectedServices={bookingData.selectedServices}
              currency={priceDetails.currency}
              passengers={passengers.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
