import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Plane, MapPin } from "lucide-react"

export default function FlightDetailsCard({ flight }) {
  if (!flight) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No flight details available</p>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plane className="w-5 h-5" />
          <span>Flight Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">{flight.origin || "N/A"}</span>
            </div>
            <div className="text-sm text-gray-600">{formatTime(flight.departureTime)}</div>
            <div className="text-xs text-gray-500">{formatDate(flight.departureTime)}</div>
          </div>

          <div className="flex-1 mx-4">
            <div className="border-t border-dashed border-gray-300 relative">
              <Plane className="w-4 h-4 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-blue-500" />
            </div>
            <div className="text-center text-xs text-gray-500 mt-1">{flight.duration || "N/A"}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">{flight.destination || "N/A"}</span>
            </div>
            <div className="text-sm text-gray-600">{formatTime(flight.arrivalTime)}</div>
            <div className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div>
            <span className="text-sm text-gray-600">Flight</span>
            <div className="font-medium">{flight.flightNumber || "N/A"}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Aircraft</span>
            <div className="font-medium">{flight.aircraft || "N/A"}</div>
          </div>
          <div>
            <Badge variant="secondary">{flight.class || "Economy"}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
