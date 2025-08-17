// This component fetches and displays booking details based on a provided reference ID.
// It's a client component because it uses hooks like useState and useEffect for data fetching.

"use client";

import { useState, useEffect } from "react";
// Import the UI components from a library. These components are assumed to be available.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Import icons from lucide-react for a better user experience.
import {
  CheckCircle,
  Clock,
  Plane,
  User,
  Luggage,
  MapPin,
  Download,
  Mail,
} from "lucide-react";

/**
 * A component to display the booking confirmation details.
 * It fetches the booking data from the API and renders it.
 * @param {object} props - The component properties.
 * @param {string} props.reference - The booking reference ID.
 */
export default function BookingConfirmation({ reference }) {
  // State to hold the fetched booking data.
  const [booking, setBooking] = useState(null);
  // State to manage the loading status.
  const [loading, setLoading] = useState(true);
  // State to store any errors that occur during the fetch.
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches booking data from the API.
     */
    const fetchBooking = async () => {
      try {
        setLoading(true);
        // We'll use a fetch call to the API route you created earlier.
        // This is a placeholder for your actual API endpoint.
        // You'll need to replace '/api/bookings/getBooking' with the correct path.
        const response = await fetch(`/api/bookings/${reference}`);

        if (!response.ok) {
          // If the server response is not okay, throw an error.
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setBooking(data.booking);
        setError(null);
      } catch (e) {
        console.error("Failed to fetch booking:", e);
        setError("Booking not found or an error occurred.");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchBooking();
    }
  }, [reference]);

  // --- Render logic based on state ---

  // Show a loading spinner while data is being fetched.
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show an error message if the fetch failed or no booking was found.
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Booking Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => (window.location.href = "/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's no booking data but no error, return a not-found card.
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Booking Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't find a booking with reference: {reference}
            </p>
            <Button onClick={() => (window.location.href = "/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render the main booking confirmation details ---
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your booking reference is <strong>{booking.id}</strong>
          </p>
          {booking.payment_option === "book-now-pay-later" &&
            booking.payment_status === "pending" && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <Clock className="w-5 h-5 text-yellow-600 inline mr-2" />
                <span className="text-yellow-800 text-sm">
                  Payment due within 24 hours. Check your email for payment
                  instructions.
                </span>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="w-5 h-5 mr-2" />
                  Flight Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {booking.flight_data.origin}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(
                        booking.flight_data.departureTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="border-t-2 border-dashed border-gray-300 relative">
                      <Plane className="w-4 h-4 text-gray-400 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2" />
                    </div>
                    <div className="text-center text-sm text-gray-600 mt-2">
                      {booking.flight_data.flightNumber}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {booking.flight_data.destination}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(
                        booking.flight_data.arrivalTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {new Date(
                    booking.flight_data.departureTime
                  ).toLocaleDateString()}{" "}
                  • {booking.flight_data.airline}
                </div>
                <div className="text-center text-sm text-gray-600">
                  {booking.flight_data.route} • {booking.flight_data.duration} •{" "}
                  {booking.flight_data.stops}
                </div>
              </CardContent>
            </Card>

            {/* Passengers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Passengers ({booking.passenger_details.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.passenger_details.map((passenger, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {passenger.type}
                        </div>
                      </div>
                      {booking.seat_selections.find(
                        (s) =>
                          s.passengerName ===
                          `${passenger.firstName} ${passenger.lastName}`
                      ) && (
                        <Badge variant="secondary">
                          Seat{" "}
                          {
                            booking.seat_selections.find(
                              (s) =>
                                s.passengerName ===
                                `${passenger.firstName} ${passenger.lastName}`
                            ).seat
                          }
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Services */}
            {(booking.baggage_selections.length > 0 ||
              booking.seat_selections.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.baggage_selections.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Luggage className="w-4 h-4 mr-2" />
                        <span className="font-medium">Baggage</span>
                      </div>
                      {booking.baggage_selections.map((passenger, index) => (
                        <div key={index} className="ml-6 text-sm text-gray-600">
                          <div className="font-medium">
                            {passenger.passengerName}
                          </div>
                          {passenger.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex justify-between"
                            >
                              <span>{item.description}</span>
                              <span>${item.price}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {booking.seat_selections.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="font-medium">Seat Selection</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {booking.seat_selections.map((seat, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>
                              {seat.passengerName} - Seat {seat.seat}
                            </span>
                            <span>
                              {seat.price > 0 ? `$${seat.price}` : "Free"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge
                    variant={
                      booking.status === "confirmed" ? "default" : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <Badge
                    variant={
                      booking.payment_status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {booking.payment_status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span>
                    {booking.currency} {booking.total_amount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full bg-transparent" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Ticket
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email Confirmation
              </Button>
              {booking.payment_option === "book-now-pay-later" &&
                booking.payment_status === "pending" && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      (window.location.href = `/payment/${booking.id}`)
                    }
                  >
                    Complete Payment
                  </Button>
                )}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1">
                <li>• Check-in opens 24 hours before departure</li>
                <li>• Arrive at airport 2 hours early for domestic flights</li>
                <li>• Ensure passport is valid for at least 6 months</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
