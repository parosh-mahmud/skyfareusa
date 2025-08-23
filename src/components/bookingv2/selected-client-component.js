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
    contactDetails: null,
    travellerData: [],
    selectedServices: [],
  });

  // State for the re-pricing call on load
  const [isPricing, setIsPricing] = useState(true);
  const [pricingError, setPricingError] = useState(null);

  // New state for the final order creation process
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const { minutes, seconds, isExpired } = useTimeRemaining(15);

  // Get state and actions from Zustand store
  const { pricedOffer, setPricedOffer, selectedFlight, resetBooking } =
    useBookingStore();

  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    const repriceOffer = async () => {
      if (!selectedFlight) {
        setPricingError(
          "No flight selected. Please return to the search results."
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
        if (!res.ok || !result.success)
          throw new Error(result.error || "Failed to get latest price.");
        setPricedOffer(result.pricedOffer);
      } catch (error) {
        setPricingError(error.message);
      } finally {
        setIsPricing(false);
      }
    };
    repriceOffer();
  }, [selectedFlight, setPricedOffer]);

  const passengers = pricedOffer?.passengers || [];

  const priceDetails = useMemo(() => {
    if (!pricedOffer) return { totalAmount: 0, currency: "USD" };
    return {
      totalAmount: parseFloat(pricedOffer.total_amount),
      currency: pricedOffer.total_currency,
    };
  }, [pricedOffer]);

  // --- Step Navigation Handlers ---

  const handleTravellerDetailsNext = (data) => {
    // Correctly merge contact and traveller data
    setBookingData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleServicesNext = (servicesData) => {
    setBookingData((prev) => ({ ...prev, ...servicesData }));
    setCurrentStep(3);
  };

  // This function now contains the final API call logic
  const handleConfirmBooking = async (paymentData) => {
    setIsCreatingOrder(true);
    setOrderError(null);

    const { contactDetails, travellerData } = bookingData;

    // Format payload for the order creation API
    const orderPayload = {
      pricedOffer,
      payments: [
        {
          type: "balance",
          currency: pricedOffer.total_currency,
          amount: pricedOffer.total_amount,
        },
      ],
      passengers: travellerData.map((p, index) => {
        const passengerPayload = {
          id: pricedOffer.passengers[index].id,
          given_name: p.firstName,
          family_name: p.lastName,
          born_on: p.dateOfBirth,
          gender: p.gender.toLowerCase().startsWith("m") ? "m" : "f",
          title: p.title,
          phone_number: contactDetails.phone,
          email: contactDetails.email,
        };
        if (p.passportNumber) {
          passengerPayload.identity_documents = [
            {
              type: "passport",
              unique_identifier: p.passportNumber,
              issuing_country_code: p.issuingCountry,
              expires_on: p.passportExpiry,
            },
          ];
        }
        return passengerPayload;
      }),
      selectedServices: bookingData.selectedServices || [],
    };
    console.log("Order Payload:", orderPayload);

    try {
      const res = await fetch("/api/flights/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const result = await res.json();
      if (!res.ok || !result.success)
        throw new Error(result.error || "Booking failed.");

      setConfirmedOrder(result.order);
      resetBooking(); // Clean up the store for the next booking
    } catch (error) {
      setOrderError(error.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // --- Render Logic ---

  if (confirmedOrder) {
    return <BookingConfirmation order={confirmedOrder} />;
  }
  if (isPricing) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Confirming Latest Price...</h2>
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
            <button onClick={() => window.location.reload()}>
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
                  pricedOffer={pricedOffer} // <-- ADD THIS PROP
                  onBack={() => setCurrentStep(2)}
                  onConfirm={handleConfirmBooking}
                  isProcessing={isCreatingOrder}
                  error={orderError}
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
