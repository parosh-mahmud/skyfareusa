"use client";

import { useState } from "react";
// REMOVED: No longer need to import useBookingStore here
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Loader2, User, Mail, Phone } from "lucide-react";
import FlightDetailsCard from "./flight-details-card";

// UPDATED: Accept pricedOffer as a prop
export default function ReviewPaymentStep({
  bookingData,
  pricedOffer,
  onBack,
  onConfirm,
  isProcessing,
  error,
}) {
  // REMOVED: The component no longer fetches from the store
  // const { pricedOffer } = useBookingStore();

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onConfirm(paymentData);
  };

  const { contactDetails, travellerData } = bookingData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review & Payment</h2>
        <p className="text-muted-foreground">
          Please review your booking details and complete payment.
        </p>
      </div>

      <div className="space-y-6">
        {/* This will now receive the correct data via props */}
        <FlightDetailsCard offer={pricedOffer} />

        <Card>
          <CardHeader>
            <CardTitle>Traveller Details</CardTitle>
          </CardHeader>
          <CardContent>
            {contactDetails && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="font-semibold text-base mb-2">
                  Primary Contact
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{contactDetails.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{contactDetails.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {travellerData?.map((traveller, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="font-medium">
                    {traveller.title?.toUpperCase()}. {traveller.firstName}{" "}
                    {traveller.lastName}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground pl-8">
                  Born on {traveller.dateOfBirth} • {traveller.gender}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                value={paymentData.cardholderName}
                onChange={(e) =>
                  handlePaymentChange("cardholderName", e.target.value)
                }
                placeholder="Name as it appears on card"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={paymentData.cardNumber}
                onChange={(e) =>
                  handlePaymentChange("cardNumber", e.target.value)
                }
                placeholder="1234 5678 9012 3456"
                disabled={isProcessing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={(e) =>
                    handlePaymentChange("expiryDate", e.target.value)
                  }
                  placeholder="MM/YY"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={paymentData.cvv}
                  onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                  placeholder="123"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Services
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="px-8 w-[180px]"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </div>
    </div>
  );
}
