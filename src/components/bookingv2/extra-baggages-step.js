"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import DuffelAddServices from "./duffel-add-services"
import AmadeusBaggageSeatSelection from "./amadeus-baggage-seat-selection"

export default function ExtraBaggagesStep({ onNext, onBack, provider = "duffel" }) {
  const [selectedServices, setSelectedServices] = useState([])
  const [amadeusSelection, setAmadeusSelection] = useState({ seat: null, baggage: [] })

  const handleNext = () => {
    if (provider === "amadeus") {
      onNext({ amadeusSelection })
    } else {
      onNext({ selectedServices })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Extra Services</h2>
        <p className="text-gray-600">Add extra services to enhance your travel experience</p>
      </div>

      {provider === "amadeus" ? (
        <AmadeusBaggageSeatSelection onSelectionChange={setAmadeusSelection} />
      ) : (
        <DuffelAddServices onServicesChange={setSelectedServices} selectedServices={selectedServices} />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Traveller Details
        </Button>
        <Button onClick={handleNext}>Continue to Review</Button>
      </div>
    </div>
  )
}
