"use client";

// Helper functions specific to this component
const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
const formatDuration = (d) => {
  if (!d) return "";
  const match = d.match(/PT(\d+H)?(\d+M)?/);
  return `${match[1]?.replace("H", "h ") || ""}${
    match[2]?.replace("M", "m") || ""
  }`.trim();
};

export default function FlightDetails({ offer }) {
  return (
    <div className="bg-gray-50/70 p-6 -m-6 mt-4 border-t">
      {offer.slices.map((slice, sliceIndex) => (
        <div
          key={sliceIndex}
          className={sliceIndex > 0 ? "mt-6 pt-6 border-t border-gray-200" : ""}
        >
          <div className="font-semibold text-gray-800 mb-4 text-center">
            {offer.slices.length > 1 &&
              (sliceIndex === 0 ? "Outbound" : "Return")}{" "}
            <span className="font-normal">
              {slice.origin.city_name} to {slice.destination.city_name}
            </span>
          </div>
          {slice.segments.map((segment) => (
            <div key={segment.id} className="relative pl-8 mb-4 last:mb-0">
              <div className="absolute left-2.5 top-1 h-full w-px bg-gray-300"></div>
              <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-400"></div>

              <p className="font-bold text-gray-800">
                {formatTime(segment.departing_at)}: Depart from{" "}
                {segment.origin.name} ({segment.origin.iata_code})
              </p>
              <p className="text-sm text-gray-500 ml-1 py-2">
                Flight duration: {formatDuration(segment.duration)}
              </p>

              <div className="absolute left-0 bottom-1.5 w-5 h-5 rounded-full bg-gray-400 border-2 border-gray-400"></div>
              <p className="font-bold text-gray-800">
                {formatTime(segment.arriving_at)}: Arrive at{" "}
                {segment.destination.name} ({segment.destination.iata_code})
              </p>
              <p className="text-sm text-gray-500 ml-1">
                {segment.marketing_carrier.name} •{" "}
                {segment.marketing_carrier.iata_code}
                {segment.marketing_carrier_flight_number}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
