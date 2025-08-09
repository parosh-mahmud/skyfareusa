"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Loader,
  AlertCircle,
  ShieldCheck,
  BedDouble,
} from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = params.offerId;

  // Get offer details directly from URL search parameters
  const hotelName = searchParams.get("hotelName") || "Your Hotel";
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const totalPrice = searchParams.get("price");
  const currency = searchParams.get("currency");

  const [form, setForm] = useState({
    title: "MR",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardVendor: "VI",
    cardNumber: "",
    expiryDate: "",
  });
  const [bookingState, setBookingState] = useState({
    loading: false,
    error: null,
  });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingState({ loading: true, error: null });

    const payload = {
      offerId: offerId,
      guests: [
        {
          id: 1,
          name: {
            title: form.title,
            firstName: form.firstName,
            lastName: form.lastName,
          },
          contact: { phone: form.phone, email: form.email },
        },
      ],
      payments: [
        {
          method: "creditCard",
          card: {
            vendorCode: form.cardVendor,
            cardNumber: form.cardNumber,
            expiryDate: form.expiryDate,
          },
        },
      ],
    };

    try {
      const res = await fetch("/api/hotels/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      // On success, redirect to a confirmation page (you will need to create this)
      router.push(`/booking-confirmation?id=${result.data.id}`);
    } catch (err) {
      setBookingState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2">
          Confirm Your Booking
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Please review your details before completing the purchase.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BedDouble size={20} /> Your Stay
          </h2>
          <div className="space-y-2 text-gray-700">
            <p className="font-bold text-lg">{hotelName}</p>
            <p>
              <strong>Check-in:</strong> {checkInDate}
            </p>
            <p>
              <strong>Check-out:</strong> {checkOutDate}
            </p>
            <p className="text-2xl font-bold text-blue-600 pt-2 border-t mt-4">
              Total: {totalPrice} {currency}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleBooking} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleInputChange}
                  required
                  className="p-3 border rounded-lg w-full"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleInputChange}
                  required
                  className="p-3 border rounded-lg w-full"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={handleInputChange}
                required
                className="mt-4 p-3 border rounded-lg w-full"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                onChange={handleInputChange}
                required
                className="mt-4 p-3 border rounded-lg w-full"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Payment Details
              </h2>
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                onChange={handleInputChange}
                required
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="expiryDate"
                placeholder="Expiry Date (YYYY-MM)"
                onChange={handleInputChange}
                required
                className="mt-4 p-3 border rounded-lg w-full"
              />
            </div>

            {bookingState.error && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                {bookingState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={bookingState.loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {bookingState.loading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} /> Confirm & Book ({totalPrice}{" "}
                  {currency})
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
