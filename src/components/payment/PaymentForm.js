// src/components/StripePaymentForm.jsx
"use client";

import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "src/lib/store";
import { Loader2, CreditCard } from "lucide-react";

// Load your Stripe public key from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function CheckoutForm({
  offer,
  passengers,
  selectedServices,
  payment,
  onSuccess,
  onError,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { resetBookingFlow } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create a payment intent on your server
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: payment.amount,
            currency: payment.currency,
            bookingData: {
              flight_offer_id: offer.id,
              total_price: payment.amount,
              currency: payment.currency,
              passengers,
              contact_details: passengers[0], // Assuming first passenger is the contact
            },
          }),
        });
        if (!response.ok) throw new Error("Failed to create payment intent.");
        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        setMessage(`Payment initialization failed: ${error.message}`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    if (payment.amount > 0 && offer) {
      createPaymentIntent();
    }
  }, [payment, offer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Confirm the payment with Stripe
      const { paymentIntent, error: stripeError } = await stripe.confirmPayment(
        {
          elements,
          redirect: "if_required", // Do not redirect automatically
        }
      );

      if (stripeError) {
        setMessage(`Payment failed: ${stripeError.message}`);
        setIsLoading(false);
        onError?.(stripeError);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        setMessage("Payment successful! Creating your order...");
        setIsSuccess(true);

        // 2. Call your backend API to create the order
        const orderResponse = await fetch("/api/flights/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceApi: offer.sourceApi,
            offer: offer,
            passengers: passengers,
            selectedServices: selectedServices,
            payment: {
              ...payment,
              amount: paymentIntent.amount / 100,
            },
            contacts: {
              // Simplified contacts for the API call
              email: passengers[0]?.email,
              phoneNumber: passengers[0]?.phoneNumber,
              phoneCountryCode: passengers[0]?.phoneCountryCode,
            },
          }),
        });

        if (!orderResponse.ok) {
          throw new Error("Failed to create flight order.");
        }

        const orderData = await orderResponse.json();
        onSuccess?.(orderData.id);
      } else {
        setMessage(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      setMessage(`Order creation failed: ${error.message}`);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: "#ffffff",
      colorText: "#1f2937",
    },
  };

  return (
    <>
      {clientSecret ? (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" />
            <button
              disabled={isLoading || isSuccess || !stripe || !elements}
              id="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <span id="button-text">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  `Pay ${payment.currency} ${payment.amount.toFixed(2)}`
                )}
              </span>
            </button>
            {message && (
              <div
                id="payment-message"
                className="mt-4 text-center text-sm font-medium text-red-600"
              >
                {message}
              </div>
            )}
          </form>
        </Elements>
      ) : (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
    </>
  );
}
