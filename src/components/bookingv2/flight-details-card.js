// //src/components/bookingv2/flight-details-card.js
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Badge } from "../ui/badge";
// import { Plane, MapPin } from "lucide-react";

// export default function FlightDetailsCard({ flight }) {
//   if (!flight) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <p className="text-gray-500">No flight details available</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   const formatTime = (timeString) => {
//     if (!timeString) return "N/A";
//     return new Date(timeString).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center space-x-2">
//           <Plane className="w-5 h-5" />
//           <span>Flight Details</span>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex justify-between items-center">
//           <div className="text-center">
//             <div className="flex items-center space-x-1 mb-1">
//               <MapPin className="w-4 h-4 text-gray-500" />
//               <span className="font-semibold">{flight.origin || "N/A"}</span>
//             </div>
//             <div className="text-sm text-gray-600">
//               {formatTime(flight.departureTime)}
//             </div>
//             <div className="text-xs text-gray-500">
//               {formatDate(flight.departureTime)}
//             </div>
//           </div>

//           <div className="flex-1 mx-4">
//             <div className="border-t border-dashed border-gray-300 relative">
//               <Plane className="w-4 h-4 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-blue-500" />
//             </div>
//             <div className="text-center text-xs text-gray-500 mt-1">
//               {flight.duration || "N/A"}
//             </div>
//           </div>

//           <div className="text-center">
//             <div className="flex items-center space-x-1 mb-1">
//               <MapPin className="w-4 h-4 text-gray-500" />
//               <span className="font-semibold">
//                 {flight.destination || "N/A"}
//               </span>
//             </div>
//             <div className="text-sm text-gray-600">
//               {formatTime(flight.arrivalTime)}
//             </div>
//             <div className="text-xs text-gray-500">
//               {formatDate(flight.arrivalTime)}
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-between items-center pt-2 border-t">
//           <div>
//             <span className="text-sm text-gray-600">Flight</span>
//             <div className="font-medium">{flight.flightNumber || "N/A"}</div>
//           </div>
//           <div>
//             <span className="text-sm text-gray-600">Aircraft</span>
//             <div className="font-medium">{flight.aircraft || "N/A"}</div>
//           </div>
//           <div>
//             <Badge variant="secondary">{flight.class || "Economy"}</Badge>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Plane, Clock, Calendar } from "lucide-react";

// Helper to format date and time
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return { date: "N/A", time: "N/A" };
  const date = new Date(dateTimeString);
  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

// Helper to parse ISO 8601 duration format (e.g., "PT5H30M")
const parseDuration = (durationString) => {
  if (!durationString) return "N/A";
  const match = durationString.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return durationString;
  const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
  const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
};

// Helper to calculate layover duration
const calculateLayover = (arrival, departure) => {
  const arrivalTime = new Date(arrival).getTime();
  const departureTime = new Date(departure).getTime();
  const diff = departureTime - arrivalTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export default function FlightDetailsCard({ offerSlice }) {
  if (!offerSlice || !offerSlice.segments?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No flight details available.</p>
        </CardContent>
      </Card>
    );
  }

  const firstSegment = offerSlice.segments[0];
  const lastSegment = offerSlice.segments[offerSlice.segments.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plane className="w-5 h-5" />
          <span>Flight Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Journey */}
        <div className="flex justify-between items-center text-center">
          <div>
            <p className="text-2xl font-bold">{offerSlice.origin?.iata_code}</p>
            <p className="text-sm text-muted-foreground">
              {offerSlice.origin?.city_name}
            </p>
          </div>
          <div className="flex-1 px-2">
            <p className="text-sm font-semibold">
              {parseDuration(offerSlice.duration)}
            </p>
            <div className="border-t border-dashed w-full my-1"></div>
            <p className="text-xs text-muted-foreground">
              {offerSlice.segments.length - 1 > 0
                ? `${offerSlice.segments.length - 1} stop(s)`
                : "Non-stop"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {offerSlice.destination?.iata_code}
            </p>
            <p className="text-sm text-muted-foreground">
              {offerSlice.destination?.city_name}
            </p>
          </div>
        </div>

        <Separator />

        {/* Segments Details */}
        <div className="space-y-4">
          {offerSlice.segments.map((segment, index) => {
            const departure = formatDateTime(segment.departing_at);
            const arrival = formatDateTime(segment.arriving_at);
            const nextSegment = offerSlice.segments[index + 1];

            return (
              <div key={segment.id || index}>
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{departure.time}</div>
                    <div className="text-xs text-muted-foreground">
                      {segment.origin?.iata_code}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        {/* SAFELY access carrier name */}
                        <span className="font-semibold">
                          {segment.carrier?.name}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          • {segment.carrier?.iata_code}
                          {segment.flight_number}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {parseDuration(segment.duration)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {/* SAFELY access aircraft name */}
                      {segment.aircraft?.name || "Aircraft info not available"}
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-right">
                    <div className="font-semibold">{arrival.time}</div>
                    <div className="text-xs text-muted-foreground">
                      {segment.destination?.iata_code}
                    </div>
                  </div>
                </div>

                {/* Layover Information */}
                {nextSegment && (
                  <div className="text-center text-sm text-amber-700 bg-amber-50 rounded-md p-2 my-3 mx-8">
                    {/* SAFELY access city name */}
                    Layover in {segment.destination?.city_name} (
                    {segment.destination?.iata_code}) :{" "}
                    {calculateLayover(
                      segment.arriving_at,
                      nextSegment.departing_at
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
