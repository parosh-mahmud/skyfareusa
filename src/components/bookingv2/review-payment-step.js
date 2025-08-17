"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import FlightDetailsCard from "./flight-details-card"
import PriceDisplaySection from "./price-display-section"

export default function ReviewPaymentStep({ bookingData, onBack, onConfirm }) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }))
  }

  const handleConfirmBooking = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    onConfirm({ ...bookingData, payment: paymentData })
  }

  // Mock flight data for demonstration
  const mockFlight = {
    origin: "NYC",
    destination: "LAX",
    departureTime: "2024-01-15T08:00:00Z",
    arrivalTime: "2024-01-15T11:30:00Z",
    duration: "5h 30m",
    flightNumber: "AA 123",
    aircraft: "Boeing 737",
    class: "Economy",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review & Payment</h2>
        <p className="text-gray-600">Please review your booking details and complete payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Booking Review */}
        <div className="space-y-4">
          <FlightDetailsCard flight={mockFlight} />

          {/* Traveller Details Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Traveller Details</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingData?.travellerData?.map((traveller, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="font-medium">
                    {traveller.title} {traveller.firstName} {traveller.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {traveller.dateOfBirth} • {traveller.gender}
                  </div>
                  {index === 0 && (
                    <div className="text-sm text-gray-600">
                      {traveller.email} • {traveller.phone}
                    </div>
                  )}
                </div>
              )) || <p className="text-gray-500">No traveller details available</p>}
            </CardContent>
          </Card>

          {/* Selected Services */}
          {bookingData?.selectedServices?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookingData.selectedServices.map((service, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>${service.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-4">
          <PriceDisplaySection
            basePrice={299.99}
            selectedServices={bookingData?.selectedServices || []}
            passengers={bookingData?.travellerData?.length || 1}
          />

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
                  onChange={(e) => handlePaymentChange("cardholderName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={(e) => handlePaymentChange("expiryDate", e.target.value)}
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Services
        </Button>
        <Button onClick={handleConfirmBooking} disabled={isProcessing} className="px-8">
          {isProcessing ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  )
}
