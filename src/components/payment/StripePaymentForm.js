// This is a client-side React component for a Stripe-like payment form.
// It is written in plain JavaScript and uses a fetch call to process the payment.

"use client";

import { useState } from "react";
// We import the UI components needed for the form.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";

/**
 * A component to handle payment via a form, simulating a Stripe integration.
 * @param {object} props - The component properties.
 * @param {object} props.offer - The flight offer data.
 * @param {Array<any>} props.passengers - The list of passengers.
 * @param {Array<any>} props.selectedServices - The selected additional services.
 * @param {object} props.payment - The payment details.
 * @param {number} props.payment.amount - The total amount to pay.
 * @param {string} props.payment.currency - The currency.
 * @param {Function} props.onSuccess - Callback function to run on successful payment.
 */
export default function StripePaymentForm({
  offer,
  passengers,
  selectedServices,
  payment,
  onSuccess,
}) {
  // State to manage the processing status of the payment.
  const [isProcessing, setIsProcessing] = useState(false);
  // State to hold the credit card details.
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  // State to hold the billing address details.
  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  /**
   * Formats the credit card number with spaces every 4 digits.
   * @param {string} value - The input value of the card number.
   * @returns {string} The formatted card number.
   */
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    }
    return v;
  };

  /**
   * Formats the expiry date to MM/YY.
   * @param {string} value - The input value of the expiry date.
   * @returns {string} The formatted expiry date.
   */
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  /**
   * Handles the form submission for payment processing.
   * @param {object} e - The form event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create a booking record by making a POST request to your API route.
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flight: offer,
          passengers,
          baggage: selectedServices.filter((s) => s.type === "baggage"),
          seats: selectedServices.filter((s) => s.type === "seat"),
          services: selectedServices.filter(
            (s) => s.type !== "baggage" && s.type !== "seat"
          ),
          totalAmount: payment.amount,
          currency: payment.currency,
          paymentOption: "pay-now", // Hardcoded for this form
          paymentDetails: {
            // In a real app, you would send a token from Stripe, not raw card data.
            cardDetails,
            billingAddress,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process payment and create booking.");
      }

      const data = await response.json();
      console.log("[v1] Payment and booking successful:", data);

      // Call the success callback with the new booking reference.
      onSuccess(data.bookingReference);
    } catch (error) {
      console.error("Payment error:", error);
      // You could handle showing an error message to the user here.
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Card Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                value={cardDetails.cardholderName}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    cardholderName: e.target.value,
                  }))
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                value={cardDetails.expiryDate}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    expiryDate: formatExpiryDate(e.target.value),
                  }))
                }
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Billing Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={billingAddress.address}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billingAddress.city}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                placeholder="New York"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={billingAddress.state}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
                placeholder="NY"
                required
              />
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input
                id="zipCode"
                value={billingAddress.zipCode}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                placeholder="10001"
                required
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={billingAddress.country}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                placeholder="United States"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-lg font-semibold mb-4">
            <span>Total Amount</span>
            <span>
              {payment.currency} {payment.amount.toFixed(2)}
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" />
                Pay {payment.currency} {payment.amount.toFixed(2)}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
