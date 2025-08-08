"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import FlightDetailsSidebar from "./FlightDetailsSidebar";
import FareCard from "./FareCard";

// Helper functions
const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatDuration = (d) =>
  d ? d.replace("PT", "").replace("H", "h ").replace("M", "m") : "";

const getStopsText = (s) =>
  s.length - 1 === 0 ? "Direct" : `${s.length - 1} Stop`;

const convertToUSD = (a, c) => {
  const rates = { GBP: 1.27, EUR: 1.08, BDT: 0.0085, USD: 1.0 };
  return Math.round(parseFloat(a) * (rates[c] || 1));
};

const formatPrice = (amount, currency) => {
  if (currency === "BDT") {
    return `BDT ${Math.round(amount).toLocaleString()}`;
  }
  const usdAmount = convertToUSD(amount, currency);
  return `$${usdAmount.toLocaleString()}`;
};

export default function FlightOfferCard({
  offerGroup,
  isExpanded,
  onToggleDetails,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const summaryOffer = offerGroup?.[0];

  if (!summaryOffer) return null;

  const { slices, total_amount, total_currency } = summaryOffer;
  const airline = slices?.[0]?.segments?.[0]?.carrier || {};
  const airlineName = airline.name || "Multiple Airlines";
  const airlineCode = airline.iata_code || "??";
  const airlineLogo = `https://images.kiwi.com/airlines/64/${airlineCode}.png`;

  const itineraryId =
    slices
      ?.flatMap(
        (s) =>
          s.segments?.map(
            (seg) =>
              `${seg.carrier?.iata_code}-${seg.flight_number}-${seg.departing_at}`
          ) || []
      )
      .join("--") || summaryOffer.id;

  // Get main flight details (assuming single slice for now)
  const mainSlice = slices?.[0];
  const firstSeg = mainSlice?.segments?.[0];
  const lastSeg = mainSlice?.segments?.[mainSlice.segments.length - 1];

  if (!firstSeg || !lastSeg) return null;

  const departureTime = formatTime(firstSeg.departing_at);
  const arrivalTime = formatTime(lastSeg.arriving_at);
  const duration = formatDuration(mainSlice.duration);
  const stops = getStopsText(mainSlice.segments);
  const departureCode = firstSeg.origin?.iata_code;
  const arrivalCode = lastSeg.destination?.iata_code;

  // Check if arrival is next day
  const depDate = new Date(firstSeg.departing_at);
  const arrDate = new Date(lastSeg.arriving_at);
  const isNextDay = arrDate.getDate() !== depDate.getDate();

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="p-4">
            {/* Airline Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <Image
                  src={airlineLogo || "/placeholder.svg"}
                  alt={airlineName}
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="font-medium text-gray-800 text-sm">
                {airlineName}
              </span>
            </div>

            {/* Flight Route */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {departureTime}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {departureCode}
                </div>
              </div>

              <div className="flex-1 mx-4">
                <div className="text-center mb-1">
                  <div className="text-xs text-gray-500">{duration}</div>
                </div>
                <div className="relative">
                  <div className="h-px bg-gray-300 w-full"></div>
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full -translate-y-1/2"></div>
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full -translate-y-1/2"></div>
                </div>
                <div className="text-center mt-1">
                  <div className="text-xs text-blue-600 font-medium">
                    {stops}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {arrivalTime}
                  {isNextDay && (
                    <span className="text-xs text-red-500 ml-1">+1 Day</span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {arrivalCode}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right mb-4">
              <div className="text-xs text-gray-500"></div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(total_amount, total_currency)}
              </div>
            </div>
          </div>

          {/* View Fares Button */}
          <button
            onClick={() => onToggleDetails(isExpanded ? null : itineraryId)}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 transition-colors flex items-center justify-center gap-2"
          >
            <span>View Fares</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Bottom Links */}
          <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
            <div></div>
            <button
              onClick={() => setShowDetails(true)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Flight Details
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="p-4">
            <div className="flex items-center justify-between">
              {/* Left: Airline + Flight Info */}
              <div className="flex items-center gap-6 flex-1">
                {/* Airline */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                    <Image
                      src={airlineLogo || "/placeholder.svg"}
                      alt={airlineName}
                      width={28}
                      height={28}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="font-medium text-gray-800">
                    {airlineName}
                  </span>
                </div>

                {/* Flight Route */}
                <div className="flex items-center gap-8 flex-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {departureTime}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {departureCode}
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs">
                    <div className="text-center mb-1">
                      <div className="text-xs text-gray-500">{duration}</div>
                    </div>
                    <div className="relative">
                      <div className="h-px bg-gray-300 w-full"></div>
                      <div className="absolute left-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full -translate-y-1/2"></div>
                      <div className="absolute right-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full -translate-y-1/2"></div>
                    </div>
                    <div className="text-center mt-1">
                      <div className="text-xs text-blue-600 font-medium">
                        {stops}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {arrivalTime}
                      {isNextDay && (
                        <span className="text-xs text-red-500 ml-1">
                          +1 Day
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {arrivalCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Price + Button */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500"></div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(total_amount, total_currency)}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onToggleDetails(isExpanded ? null : itineraryId)
                  }
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-6 rounded transition-colors flex items-center gap-2"
                >
                  <span>View Fares</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
            <div></div>
            <button
              onClick={() => setShowDetails(true)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Flight Details
            </button>
          </div>
        </div>

        {/* Expanded Fares Section */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <h4 className="font-bold text-gray-800 mb-3">Select Your Fare</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offerGroup.map((offer) => (
                <FareCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}
      </div>

      <FlightDetailsSidebar
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        flightData={summaryOffer}
      />
    </>
  );
}
