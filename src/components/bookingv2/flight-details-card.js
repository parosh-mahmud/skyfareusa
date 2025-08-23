import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Plane, ArrowRight } from "lucide-react";
import Image from "next/image";

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

// IMPROVED: Helper to parse complex ISO 8601 duration format (e.g., P1DT5H30M)
const parseDuration = (durationString) => {
  if (!durationString) return "N/A";
  const match = durationString.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationString;
  const days = match[1] ? parseInt(match[1]) : 0;
  const hours = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
  const minutes = match[3] ? parseInt(match[3].slice(0, -1)) : 0;

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || (days === 0 && hours === 0)) result += `${minutes}m`;
  return result.trim();
};

// Helper to calculate layover duration
const calculateLayover = (arrival, departure) => {
  const diff = new Date(departure).getTime() - new Date(arrival).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

// --- Sub-component to render a single slice (e.g., Outbound or Return) ---
const SliceDetails = ({ slice }) => {
  if (!slice || !slice.segments?.length) return null;

  return (
    <div className="space-y-4">
      {/* Overall Slice Journey */}
      <div className="flex justify-between items-center text-center">
        <div>
          <p className="text-xl font-bold">{slice.origin?.iata_code}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(slice.segments[0].departing_at).date}
          </p>
        </div>
        <div className="flex-1 px-2">
          <p className="text-sm font-semibold">
            {parseDuration(slice.duration)}
          </p>
          <div className="border-t border-dashed w-full my-1"></div>
          <p className="text-xs text-muted-foreground">
            {slice.segments.length - 1 > 0
              ? `${slice.segments.length - 1} stop(s)`
              : "Non-stop"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{slice.destination?.iata_code}</p>
          <p className="text-xs text-muted-foreground">
            {
              formatDateTime(
                slice.segments[slice.segments.length - 1].arriving_at
              ).date
            }
          </p>
        </div>
      </div>

      {/* Segments within the Slice */}
      {slice.segments.map((segment, index) => {
        const departure = formatDateTime(segment.departing_at);
        const arrival = formatDateTime(segment.arriving_at);
        const nextSegment = slice.segments[index + 1];

        return (
          <div key={segment.id || index}>
            <div className="flex items-start space-x-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="font-semibold">{departure.time}</div>
                <div className="text-xs text-muted-foreground">
                  {segment.origin?.iata_code}
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <Image
                    src={segment.carrier?.logo_symbol_url}
                    alt={`${segment.carrier?.name} logo`}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  <span className="font-semibold">{segment.carrier?.name}</span>
                  <span className="text-muted-foreground text-xs">
                    • {segment.carrier?.iata_code}
                    {segment.flight_number}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {segment.aircraft?.name || "Aircraft info unavailable"}
                </div>
              </div>
              <div className="flex flex-col items-center text-right">
                <div className="font-semibold">{arrival.time}</div>
                <div className="text-xs text-muted-foreground">
                  {segment.destination?.iata_code}
                </div>
              </div>
            </div>

            {nextSegment && (
              <div className="text-center text-sm text-amber-700 bg-amber-50 rounded-md p-2 my-3 mx-8">
                Layover in {segment.destination?.city_name} •{" "}
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
  );
};

export default function FlightDetailsCard({ offer }) {
  if (!offer || !offer.slices?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No flight details available.</p>
        </CardContent>
      </Card>
    );
  }

  const isRoundTrip = offer.slices.length > 1;
  const title = isRoundTrip ? "Round Trip Itinerary" : "One-Way Itinerary";
  const airports = `${offer.slices[0].origin.iata_code} ↔ ${offer.slices[0].destination.iata_code}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plane className="w-5 h-5" />
          <div>
            <span>{title}</span>
            {isRoundTrip && (
              <p className="text-sm font-normal text-muted-foreground">
                {airports}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {offer.slices.map((slice, index) => (
          <div key={slice.id || index}>
            {index > 0 && <Separator className="my-4" />}
            <h3 className="text-base font-semibold mb-3">
              {index === 0
                ? "Outbound"
                : index === 1
                ? "Return"
                : `Flight ${index + 1}`}
            </h3>
            <SliceDetails slice={slice} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
