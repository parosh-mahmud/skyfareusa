"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { useTimeRemaining } from "../../hooks/use-time-remaining";
import BookingProgress from "./booking-progress";
import TravellerDetailsStep from "./traveller-details-step";
import ExtraBaggagesStep from "./extra-baggages-step";
import ReviewPaymentStep from "./review-payment-step";

export default function SelectedClientComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    travellerData: [],
    selectedServices: [],
    amadeusSelection: { seat: null, baggage: [] },
  });

  const { minutes, seconds, isExpired } = useTimeRemaining(15);

  // Mock passengers data
  const mockPassengers = [{ type: "adult" }, { type: "adult" }];

  const handleTravellerDetailsNext = (travellerData) => {
    setBookingData((prev) => ({ ...prev, travellerData }));
    setCurrentStep(2);
  };

  const handleServicesNext = (servicesData) => {
    setBookingData((prev) => ({ ...prev, ...servicesData }));
    setCurrentStep(3);
  };

  const handleConfirmBooking = (finalData) => {
    console.log("Booking confirmed:", finalData);
    // Handle booking confirmation
    alert("Booking confirmed successfully!");
  };

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
    <div className="max-w-4xl mx-auto p-6">
      {/* Timer */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800">Complete your booking within:</span>
          <span className="font-mono text-lg font-semibold text-yellow-900">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <BookingProgress currentStep={currentStep} />

      {/* Step Content */}
      <Card className="mt-6">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <TravellerDetailsStep
              passengers={mockPassengers}
              onNext={handleTravellerDetailsNext}
            />
          )}

          {currentStep === 2 && (
            <ExtraBaggagesStep
              onNext={handleServicesNext}
              onBack={() => setCurrentStep(1)}
              provider="duffel" // or "amadeus"
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
  );
}
