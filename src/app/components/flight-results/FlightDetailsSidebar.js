"use client";
import { X, Clock, Plane, Info, AlertCircle } from "lucide-react";
import { useEffect } from "react";

const formatTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDuration = (duration) => {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim();
};

const calculateLayoverTime = (arrivalTime, departureTime) => {
  if (!arrivalTime || !departureTime) return null;
  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);
  const diffMs = departure.getTime() - arrival.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m`;
};

export default function FlightDetailsSidebar({ isOpen, onClose, flightData }) {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!flightData) return null;

  const firstSlice = flightData.slices?.[0];
  if (!firstSlice || !firstSlice.segments) return null;

  const segments = firstSlice.segments;
  const airline =
    flightData.owner ||
    segments[0]?.marketing_carrier ||
    segments[0]?.operating_carrier;

  // Check if offer is expiring soon
  const isExpiringSoon =
    flightData.expires_at &&
    new Date(flightData.expires_at).getTime() - Date.now() < 30 * 60 * 1000;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
          onClick={onClose}
          style={{ backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-[9999] transform transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: isOpen ? "-10px 0 25px -3px rgba(0, 0, 0, 0.1)" : "none",
          maxWidth: "min(96rem, 90vw)",
        }}
      >
        {/* Header */}
        <div className="bg-blue-800 text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold">Flight Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors duration-200"
            aria-label="Close flight details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-full pb-20 bg-white">
          {/* Expiry Warning */}
          {isExpiringSoon && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Offer expires soon!
                  </p>
                  <p className="text-xs text-red-600">
                    Book within{" "}
                    {Math.round(
                      (new Date(flightData.expires_at).getTime() - Date.now()) /
                        (1000 * 60)
                    )}{" "}
                    minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Flight Header */}
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Departure Flight
              </h3>
              <div className="flex items-center gap-2 mb-2">
                {airline?.logo_symbol_url ? (
                  <img
                    src={airline.logo_symbol_url || "/placeholder.svg"}
                    alt={airline.name}
                    className="w-8 h-6 object-contain"
                  />
                ) : (
                  <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {airline?.iata_code}
                    </span>
                  </div>
                )}
                <span className="font-medium">{airline?.name}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                {segments[0]?.origin?.city_name} (
                {segments[0]?.origin?.iata_code}) -{" "}
                {segments[segments.length - 1]?.destination?.city_name} (
                {segments[segments.length - 1]?.destination?.iata_code})
              </h4>
              <p className="text-gray-600">
                {formatDate(segments[0]?.departing_at)} |{" "}
                {formatTime(segments[0]?.departing_at)} -{" "}
                {formatTime(segments[segments.length - 1]?.arriving_at)} (
                {formatDuration(firstSlice.duration)},{" "}
                {segments.length - 1 === 0
                  ? "Direct"
                  : `${segments.length - 1} Stop${
                      segments.length - 1 > 1 ? "s" : ""
                    }`}
                )
              </p>
            </div>

            {/* Flight Timeline */}
            <div className="space-y-6">
              {segments.map((segment, index) => (
                <div key={segment.id} className="relative">
                  {/* Departure */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                      {index < segments.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatTime(segment.departing_at)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {formatDate(segment.departing_at)}
                      </div>
                      <div className="font-semibold text-gray-800">
                        {segment.origin?.city_name} ({segment.origin?.iata_code}
                        )
                      </div>
                      <div className="text-sm text-gray-600">
                        {segment.origin?.name}
                      </div>
                      {segment.origin_terminal && (
                        <div className="text-sm text-teal-600 font-medium">
                          Terminal {segment.origin_terminal}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDuration(segment.duration)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {segment.marketing_carrier?.logo_symbol_url ? (
                          <img
                            src={
                              segment.marketing_carrier.logo_symbol_url ||
                              "/placeholder.svg"
                            }
                            alt={segment.marketing_carrier.name}
                            className="w-6 h-4 object-contain"
                          />
                        ) : (
                          <div className="w-6 h-4 bg-blue-600 rounded"></div>
                        )}
                        <span className="text-sm font-medium">
                          {segment.marketing_carrier?.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {segment.marketing_carrier?.iata_code}{" "}
                          {segment.marketing_carrier_flight_number}
                        </span>
                      </div>

                      {segment.aircraft && (
                        <div className="text-xs text-gray-500 mt-1">
                          {segment.aircraft.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                      {index < segments.length - 1 && (
                        <div className="w-px h-20 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatTime(segment.arriving_at)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {formatDate(segment.arriving_at)}
                      </div>
                      <div className="font-semibold text-gray-800">
                        {segment.destination?.city_name} (
                        {segment.destination?.iata_code})
                      </div>
                      <div className="text-sm text-gray-600">
                        {segment.destination?.name}
                      </div>
                      {segment.destination_terminal && (
                        <div className="text-sm text-teal-600 font-medium">
                          Terminal {segment.destination_terminal}
                        </div>
                      )}

                      {/* Layover info for connecting flights */}
                      {index < segments.length - 1 && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              {calculateLayoverTime(
                                segment.arriving_at,
                                segments[index + 1]?.departing_at
                              ) || "Layover"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600 font-medium">
                              Change Aircraft
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            {(flightData.total_emissions_kg || flightData.conditions) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Additional Information
                </h4>

                {flightData.total_emissions_kg && (
                  <div className="flex items-center gap-2 mb-2">
                    <span>🌱</span>
                    <span className="text-sm text-gray-600">
                      Carbon emissions: {flightData.total_emissions_kg}kg CO₂
                    </span>
                  </div>
                )}

                {flightData.conditions?.change_before_departure?.allowed && (
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Changes allowed
                      {flightData.conditions.change_before_departure
                        .penalty_amount &&
                        flightData.conditions.change_before_departure
                          .penalty_amount !== "0.00" &&
                        ` (${flightData.conditions.change_before_departure.penalty_amount} ${flightData.conditions.change_before_departure.penalty_currency} fee)`}
                    </span>
                  </div>
                )}

                {flightData.conditions?.refund_before_departure?.allowed && (
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Refunds allowed
                      {flightData.conditions.refund_before_departure
                        .penalty_amount &&
                        flightData.conditions.refund_before_departure
                          .penalty_amount !== "0.00" &&
                        ` (${flightData.conditions.refund_before_departure.penalty_amount} ${flightData.conditions.refund_before_departure.penalty_currency} fee)`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
