"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Loader2 } from "lucide-react"

export default function DuffelAddServices({ onServicesChange, selectedServices = [] }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState(selectedServices)

  useEffect(() => {
    // Simulate API call to fetch available services
    const fetchServices = async () => {
      setLoading(true)
      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockServices = [
        {
          id: "baggage-20kg",
          name: "Extra Baggage 20kg",
          description: "Additional 20kg checked baggage",
          price: 45.0,
          currency: "USD",
        },
        {
          id: "seat-selection",
          name: "Seat Selection",
          description: "Choose your preferred seat",
          price: 25.0,
          currency: "USD",
        },
        {
          id: "priority-boarding",
          name: "Priority Boarding",
          description: "Board the aircraft first",
          price: 15.0,
          currency: "USD",
        },
        {
          id: "meal-upgrade",
          name: "Meal Upgrade",
          description: "Premium meal selection",
          price: 35.0,
          currency: "USD",
        },
      ]

      setServices(mockServices)
      setLoading(false)
    }

    fetchServices()
  }, [])

  const handleServiceToggle = (serviceId, checked) => {
    let newSelectedServices
    if (checked) {
      newSelectedServices = [...selectedServiceIds, serviceId]
    } else {
      newSelectedServices = selectedServiceIds.filter((id) => id !== serviceId)
    }

    setSelectedServiceIds(newSelectedServices)

    // Get full service objects for the selected services
    const selectedServiceObjects = services.filter((service) => newSelectedServices.includes(service.id))

    onServicesChange(selectedServiceObjects)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading available services...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Additional Services</h3>
        <p className="text-gray-600">Enhance your travel experience with these optional services</p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={service.id}
                  checked={selectedServiceIds.includes(service.id)}
                  onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">${service.price}</span>
                      <span className="text-sm text-gray-500 ml-1">{service.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedServiceIds.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Services:</h4>
          <ul className="space-y-1">
            {services
              .filter((service) => selectedServiceIds.includes(service.id))
              .map((service) => (
                <li key={service.id} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span>${service.price}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
