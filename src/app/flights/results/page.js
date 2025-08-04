"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plane,
  Clock,
  Calendar,
  Users,
  CreditCard,
  ArrowRight,
  Wifi,
  Utensils,
  Luggage,
} from "lucide-react";

export default function FlightResultsPage() {
  const router = useRouter();
  const [searchData, setSearchData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("price");
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("flightSearchResults");
    if (data) {
      const parsedData = JSON.parse(data);
      setSearchData(parsedData);
      setOffers(parsedData.results.offers || []);
      setLoading(false);
    } else {
      router.push("/");
    }
  }, [router]);

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;

    const hours = match[1] ? match[1].replace("H", "h ") : "";
    const minutes = match[2] ? match[2].replace("M", "m") : "";
    return `${hours}${minutes}`.trim();
  };

  const formatTime = (datetime) => {
    if (!datetime) return "N/A";
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (datetime) => {
    if (!datetime) return "N/A";
    return new Date(datetime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getStopsText = (segments) => {
    if (!segments || segments.length <= 1) return "Non-stop";
    return `${segments.length - 1} stop${segments.length > 2 ? "s" : ""}`;
  };

  const sortOffers = (offers, sortType) => {
    const sorted = [...offers].sort((a, b) => {
      switch (sortType) {
        case "price":
          return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        case "duration":
          const aDuration = a.slices?.[0]?.duration || "PT999H";
          const bDuration = b.slices?.[0]?.duration || "PT999H";
          return aDuration.localeCompare(bDuration);
        case "departure":
          const aTime = a.slices?.[0]?.segments?.[0]?.departing_at || "";
          const bTime = b.slices?.[0]?.segments?.[0]?.departing_at || "";
          return aTime.localeCompare(bTime);
        default:
          return 0;
      }
    });
    return sorted;
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setOffers((prevOffers) => sortOffers(prevOffers, sortType));
  };

  const handleSelectFlight = (offer) => {
    setSelectedOffer(offer);
    // Here you would typically navigate to booking page or show booking modal
    console.log("Selected offer:", offer);
    alert("Flight selected! This would normally proceed to booking.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {searchData?.searchParams?.from} →{" "}
                {searchData?.searchParams?.to}
              </h1>
              <p className="text-sm text-gray-600">
                {formatDate(searchData?.searchParams?.journeyDate)} •{" "}
                {searchData?.searchParams?.travelers} •{" "}
                {searchData?.searchParams?.class}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Found {offers.length} flights
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <div className="flex gap-2">
                {[
                  { key: "price", label: "Price" },
                  { key: "duration", label: "Duration" },
                  { key: "departure", label: "Departure Time" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSort(option.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filters:</span>
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option>All Airlines</option>
                <option>Non-stop only</option>
                <option>Morning departure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flight Offers */}
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No flights found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or dates
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search Again
              </button>
            </div>
          ) : (
            offers.map((offer, index) => (
              <div
                key={offer.id || index}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                {/* Main Flight Card */}
                <div className="p-6">
                  {offer.slices?.map((slice, sliceIndex) => (
                    <div
                      key={sliceIndex}
                      className={`${
                        sliceIndex > 0
                          ? "mt-6 pt-6 border-t border-gray-200"
                          : ""
                      }`}
                    >
                      {/* Route Header */}
                      {offer.slices.length > 1 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-600">
                            {sliceIndex === 0 ? "Outbound" : "Return"} •{" "}
                            {formatDate(slice.segments?.[0]?.departing_at)}
                          </h3>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Flight Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-6">
                            {/* Airline Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              {slice.segments?.[0]?.marketing_carrier
                                ?.logo_symbol_url ? (
                                <img
                                  src={
                                    slice.segments[0].marketing_carrier
                                      .logo_symbol_url
                                  }
                                  alt={slice.segments[0].marketing_carrier.name}
                                  className="w-10 h-10 object-contain flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0"
                                style={{
                                  display: slice.segments?.[0]
                                    ?.marketing_carrier?.logo_symbol_url
                                    ? "none"
                                    : "flex",
                                }}
                              >
                                <Plane className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {slice.segments?.[0]?.marketing_carrier
                                    ?.name || "Unknown Airline"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {slice.segments?.[0]
                                    ?.marketing_carrier_flight_number || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Route Timeline */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Departure */}
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatTime(
                                    slice.segments?.[0]?.departing_at
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {slice.origin?.iata_code || slice.origin}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(
                                    slice.segments?.[0]?.departing_at
                                  )}
                                </p>
                              </div>

                              {/* Flight Path */}
                              <div className="flex-1 flex flex-col items-center min-w-0">
                                <div className="flex items-center w-full">
                                  <div className="flex-1 h-px bg-gray-300"></div>
                                  <Plane className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                                  <div className="flex-1 h-px bg-gray-300"></div>
                                </div>
                                <div className="mt-1 text-center">
                                  <p className="text-sm font-medium text-gray-600">
                                    {formatDuration(slice.duration)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {getStopsText(slice.segments)}
                                  </p>
                                </div>
                              </div>

                              {/* Arrival */}
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatTime(
                                    slice.segments?.[slice.segments.length - 1]
                                      ?.arriving_at
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {slice.destination?.iata_code ||
                                    slice.destination}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(
                                    slice.segments?.[slice.segments.length - 1]
                                      ?.arriving_at
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Stops Details */}
                          {slice.segments && slice.segments.length > 1 && (
                            <div className="mt-4 pl-16">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Stops: </span>
                                {slice.segments
                                  .slice(0, -1)
                                  .map((segment, segIndex) => (
                                    <span key={segIndex}>
                                      {segment.destination?.iata_code}
                                      {segIndex < slice.segments.length - 2
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price & Book Section */}
                        <div className="text-right ml-6 flex-shrink-0">
                          <div className="mb-4">
                            <p className="text-3xl font-bold text-blue-600">
                              {formatPrice(
                                offer.total_amount,
                                offer.total_currency
                              )}
                            </p>
                            <p className="text-sm text-gray-500">per person</p>
                            {offer.tax_amount && (
                              <p className="text-xs text-gray-400">
                                +
                                {formatPrice(
                                  offer.tax_amount,
                                  offer.tax_currency
                                )}{" "}
                                taxes
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleSelectFlight(offer)}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Select Flight
                          </button>

                          {/* Amenities */}
                          <div className="mt-3 flex justify-center gap-2">
                            {offer.available_services?.includes("wifi") && (
                              <Wifi
                                className="w-4 h-4 text-gray-400"
                                title="WiFi Available"
                              />
                            )}
                            {offer.available_services?.includes("meal") && (
                              <Utensils
                                className="w-4 h-4 text-gray-400"
                                title="Meal Included"
                              />
                            )}
                            {offer.baggage_allowances?.quantity > 0 && (
                              <Luggage
                                className="w-4 h-4 text-gray-400"
                                title="Baggage Included"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Additional Flight Details */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Cabin: {offer.cabin_class || "Economy"}</span>
                        {offer.baggage_allowances && (
                          <span>
                            Baggage: {offer.baggage_allowances.quantity}x{" "}
                            {offer.baggage_allowances.type}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            offer.refundable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {offer.refundable ? "Refundable" : "Non-refundable"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Flight Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Price Breakdown
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {offers.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Results
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {offers.length} flights found
            </p>
            <p className="text-xs text-gray-500">
              Prices from{" "}
              {offers.length > 0
                ? formatPrice(
                    Math.min(...offers.map((o) => parseFloat(o.total_amount))),
                    offers[0]?.total_currency
                  )
                : "N/A"}
            </p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">
            Filter & Sort
          </button>
        </div>
      </div>
    </div>
  );
}
