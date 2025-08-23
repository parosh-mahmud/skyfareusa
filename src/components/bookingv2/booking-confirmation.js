"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { CheckCircle, Printer, Home, User, Ticket } from "lucide-react";
import FlightDetailsCard from "./flight-details-card";

export default function BookingConfirmation({ order }) {
  if (!order) return null;

  const mainPassenger = order.passengers[0];
  const eTicket = order.documents?.find(
    (doc) => doc.type === "electronic_ticket"
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your flight is booked. You will receive a confirmation email at{" "}
          <span className="font-semibold text-primary">
            {mainPassenger.email}
          </span>
          .
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Booking Reference (PNR)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use this reference for check-in and managing your booking.
              </p>
            </div>
            <Badge variant="outline" className="text-2xl font-mono p-3">
              {order.booking_reference}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Re-use the FlightDetailsCard for a consistent look */}
      <FlightDetailsCard offerSlice={order.slices[0]} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User /> Passenger Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.passengers.map((p) => (
              <div key={p.id}>
                <p className="font-semibold">
                  {p.title.toUpperCase()}. {p.given_name} {p.family_name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    E-Ticket: {eTicket?.unique_identifier || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Base Fare</span>
              <span>
                {order.base_amount} {order.base_currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Fees</span>
              <span>
                {order.tax_amount} {order.tax_currency}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span>
                {order.total_amount} {order.total_currency}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Confirmation
        </Button>
        <Button onClick={() => (window.location.href = "/")}>
          <Home className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
    </div>
  );
}
