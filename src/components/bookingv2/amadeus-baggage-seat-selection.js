"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"

export default function AmadeusBaggageSeatSelection({ onSelectionChange }) {
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [selectedBaggage, setSelectedBaggage] = useState([])

  // Mock seat map data
  const seatMap = [
    { row: 1, seats: ["1A", "1B", "1C", "1D", "1E", "1F"] },
    { row: 2, seats: ["2A", "2B", "2C", "2D", "2E", "2F"] },
    { row: 3, seats: ["3A", "3B", "3C", "3D", "3E", "3F"] },
  ]

  const baggageOptions = [
    { id: "carry-on", name: "Carry-on Bag", price: 0, included: true },
    { id: "checked-20", name: "Checked Bag 20kg", price: 45 },
    { id: "checked-32", name: "Checked Bag 32kg", price: 75 },
    { id: "extra-bag", name: "Extra Bag", price: 95 },
  ]

  const handleSeatSelect = (seatId) => {
    setSelectedSeat(seatId)
    onSelectionChange({ seat: seatId, baggage: selectedBaggage })
  }

  const handleBaggageToggle = (baggageId) => {
    const newBaggage = selectedBaggage.includes(baggageId)
      ? selectedBaggage.filter((id) => id !== baggageId)
      : [...selectedBaggage, baggageId]

    setSelectedBaggage(newBaggage)
    onSelectionChange({ seat: selectedSeat, baggage: newBaggage })
  }

  return (
    <div className="space-y-6">
      {/* Seat Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Seat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seatMap.map((row) => (
              <div key={row.row} className="flex items-center space-x-2">
                <span className="w-8 text-center font-medium">{row.row}</span>
                <div className="flex space-x-1">
                  {row.seats.map((seat) => (
                    <Button
                      key={seat}
                      variant={selectedSeat === seat ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10"
                      onClick={() => handleSeatSelect(seat)}
                    >
                      {seat.slice(-1)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Baggage Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Baggage Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {baggageOptions.map((option) => (
              <div
                key={option.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedBaggage.includes(option.id) || option.included
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => !option.included && handleBaggageToggle(option.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    {option.included && (
                      <Badge variant="secondary" className="mt-1">
                        Included
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {option.price === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span className="font-medium">${option.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
