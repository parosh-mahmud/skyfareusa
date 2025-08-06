"use client";

import { ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import FlightDetailsSidebar from "./FlightDetailsSidebar";
import FareCard from "./FareCard";

// Helper functions
const formatTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
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

const getDayDifference = (departDate, arriveDate) => {
  if (!departDate || !arriveDate) return 0;
  const d1 = new Date(departDate);
  const d2 = new Date(arriveDate);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const getStopsCount = (segments) => {
  if (!segments || segments.length === 0) return 0;
  return segments.length - 1;
};

const getStopsText = (segments) => {
  const stops = getStopsCount(segments);
  if (stops === 0) return "Direct";
  return `${stops} Stop${stops > 1 ? "s" : ""}`;
};

const convertToUSD = (amount, currency) => {
  const numAmount = Number.parseFloat(amount);
  // Simple conversion rates - in production, use real-time rates
  const rates = {
    GBP: 1.27,
    EUR: 1.08,
    USD: 1.0,
  };
  return Math.round(numAmount * (rates[currency] || 1));
};

export default function FlightOfferCard({
  offerGroup,
  isExpanded,
  onToggleDetails,
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Fixed: Changed ,[object Object], to [0]
  const summaryOffer = offerGroup?.[0];

  if (!summaryOffer?.slices?.length) return null;

  // Fixed: Changed ,[object Object], to [0]
  const firstSlice = summaryOffer.slices[0];
  const segs = firstSlice.segments;

  if (!segs?.length) return null;

  // Fixed: Changed ,[object Object], to [0]
  const firstSegment = segs[0];
  const lastSegment = segs[segs.length - 1];

  const dayDiff = getDayDifference(
    firstSegment.departing_at,
    lastSegment.arriving_at
  );
  const stopsText = getStopsText(segs);
  const stopsCount = getStopsCount(segs);

  // Airline info
  const airline =
    summaryOffer.owner ||
    firstSegment.marketing_carrier ||
    firstSegment.operating_carrier ||
    {};
  const airlineLogo = airline.logo_symbol_url;
  const airlineCode = airline.iata_code || "??";
  const airlineName = airline.name || "";

  // Price
  const priceInUSD = convertToUSD(
    summaryOffer.total_amount,
    summaryOffer.total_currency
  );

  const isExpiringSoon =
    summaryOffer.expires_at &&
    new Date(summaryOffer.expires_at).getTime() - Date.now() < 30 * 60 * 1000;

  // Handlers
  const itineraryId =
    summaryOffer.slices
      .flatMap((s) => s.segments?.map((x) => x.id) || [])
      .join("-") || summaryOffer.id;

  const handleFlightDetailsClick = (e) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  const handleCloseSidebar = () => setShowDetails(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 relative overflow-hidden">
        {/* Expiry Warning */}
        {isExpiringSoon && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-t-lg">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-red-400 mr-2" />
              <p className="text-sm text-red-700">
                Offer expires soon! Book within{" "}
                {Math.round(
                  (new Date(summaryOffer.expires_at).getTime() - Date.now()) /
                    (1000 * 60)
                )}{" "}
                minutes
              </p>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Airline Info */}
            <div className="flex items-center gap-3 mb-4">
              {airlineLogo ? (
                <img
                  src={airlineLogo || "/placeholder.svg"}
                  alt={airlineName}
                  className="w-8 h-8 object-contain rounded-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center"
                style={{ display: airlineLogo ? "none" : "flex" }}
              >
                <span className="text-white text-xs font-bold">
                  {airlineCode || "??"}
                </span>
              </div>
              <span className="font-medium text-gray-800 text-sm">
                {airlineName}
              </span>
            </div>

            {/* Flight Times and Route */}
            <div className="flex items-center justify-between mb-4">
              {/* Departure */}
              <div className="text-left">
                <div className="text-xl font-bold text-gray-800">
                  {formatTime(firstSegment.departing_at)}
                </div>
                <div className="text-sm text-gray-500">
                  {firstSegment.origin?.iata_code}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex flex-col items-center flex-1 mx-4">
                <div className="text-xs text-gray-500 mb-1">
                  {formatDuration(firstSlice.duration)}
                </div>
                <div className="flex items-center w-full">
                  <div className="w-2 h-2 border-2 border-blue-400 rounded-full bg-white"></div>
                  <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                  {stopsCount > 0 && (
                    <>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    </>
                  )}
                  <div className="w-2 h-2 border-2 border-blue-400 rounded-full bg-white"></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{stopsText}</div>
              </div>

              {/* Arrival */}
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800 flex items-center gap-1">
                  {formatTime(lastSegment.arriving_at)}
                  {dayDiff > 0 && (
                    <span className="text-xs font-bold text-red-500 bg-red-100 px-1 rounded">
                      +{dayDiff}d
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {lastSegment.destination?.iata_code}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right mb-4">
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="text-lg font-bold text-gray-800">
                BDT{" "}
                <span className="text-blue-600">
                  {priceInUSD.toLocaleString()}
                </span>
              </div>
            </div>

            {/* View Fares Button */}
            <button
              onClick={() => {
                if (isExpanded) {
                  onToggleDetails(null);
                } else {
                  onToggleDetails(itineraryId);
                }
              }}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
            >
              View Fares
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <button
                onClick={handleFlightDetailsClick}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Flight Details
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              {/* Flight Info */}
              <div className="flex items-center gap-6 min-w-0 flex-1">
                {/* Airline Logo */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {airlineLogo ? (
                    <img
                      src={airlineLogo || "/placeholder.svg"}
                      alt={airlineName}
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center"
                    style={{ display: airlineLogo ? "none" : "flex" }}
                  >
                    <span className="text-white text-xs font-bold">
                      {airlineCode || "??"}
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 truncate">
                    {airlineName}
                  </span>
                </div>

                {/* Flight Details */}
                <div className="flex items-center gap-8 ml-8 min-w-0 flex-1">
                  <div className="text-center flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-800">
                      {formatTime(firstSegment.departing_at)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {firstSegment.origin?.iata_code}
                    </div>
                    {firstSegment.origin_terminal && (
                      <div className="text-xs text-gray-400">
                        T{firstSegment.origin_terminal}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="text-xs text-gray-500 mb-1">
                      {formatDuration(firstSlice.duration)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-400 rounded-full bg-white"></div>
                      <div className="w-16 h-px bg-gray-300"></div>
                      {stopsCount > 0 && (
                        <>
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <div className="w-16 h-px bg-gray-300"></div>
                        </>
                      )}
                      <div className="w-3 h-3 border-2 border-blue-400 rounded-full bg-white"></div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      {stopsText}
                    </div>
                  </div>

                  <div className="text-center flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {formatTime(lastSegment.arriving_at)}
                      {dayDiff > 0 && (
                        <span className="text-xs font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                          +{dayDiff} Day{dayDiff > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {lastSegment.destination?.iata_code}
                    </div>
                    {lastSegment.destination_terminal && (
                      <div className="text-xs text-gray-400">
                        T{lastSegment.destination_terminal}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price and Action */}
              <div className="text-right flex items-center gap-4 flex-shrink-0">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Starting from
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    BDT{" "}
                    <span className="text-blue-600">
                      {priceInUSD.toLocaleString()}
                    </span>
                  </div>
                  {summaryOffer.total_emissions_kg && (
                    <div className="text-xs text-green-600 mt-1">
                      {summaryOffer.total_emissions_kg}kg CO₂
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (isExpanded) {
                      onToggleDetails(null);
                    } else {
                      onToggleDetails(itineraryId);
                    }
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  View Fares
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Additional Info Row */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                {firstSlice.fare_brand_name && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {firstSlice.fare_brand_name}
                  </span>
                )}
                {summaryOffer.conditions?.change_before_departure?.allowed && (
                  <span className="text-green-600">✓ Changes allowed</span>
                )}
                {summaryOffer.conditions?.refund_before_departure?.allowed && (
                  <span className="text-green-600">✓ Refunds allowed</span>
                )}
              </div>
              <button
                onClick={handleFlightDetailsClick}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Flight Details
              </button>
            </div>
          </div>
        </div>

        {/* Expanded View: Show Fare Cards */}
        {isExpanded && (
          <div className="bg-blue-50 p-4 border-t border-gray-200">
            <h4 className="font-bold text-lg mb-3 text-gray-800">
              Select Your Fare
            </h4>
            {offerGroup && offerGroup.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {offerGroup.map((offer) => (
                  <FareCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No fare options available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flight Details Sidebar */}
      <FlightDetailsSidebar
        isOpen={showDetails}
        onClose={handleCloseSidebar}
        flightData={summaryOffer}
      />
    </>
  );
}
