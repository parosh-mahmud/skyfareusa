"use client";
import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";

export default function FlightSearchForm() {
  const [formData, setFormData] = useState({
    tripType: "one-way",
    from: "Dhaka",
    fromAirport: "DAC, Hazrat Shahjalal International Airport",
    to: "Cox's Bazar",
    toAirport: "CXB, Cox's Bazar Airport",
    journeyDate: "2025-08-09",
    returnDate: "",
    travelers: "1 Traveler",
    class: "Economy",
  });

  const handleTripTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tripType: value,
      returnDate: value !== "round-trip" ? "" : prev.returnDate,
    }));
  };

  const handleSwapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
      fromAirport: prev.toAirport,
      toAirport: prev.fromAirport,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching with data:", formData);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl relative z-10 pt-8">
      <form onSubmit={handleSubmit} className="px-8 ">
        {/* Trip Type Radio Buttons */}
        <div className="flex items-center gap-6 mb-8 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={formData.tripType === "one-way"}
                onChange={handleTripTypeChange}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.tripType === "one-way"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {formData.tripType === "one-way" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span
              className={`font-medium text-base ${
                formData.tripType === "one-way"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              One Way
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={formData.tripType === "round-trip"}
                onChange={handleTripTypeChange}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.tripType === "round-trip"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {formData.tripType === "round-trip" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span
              className={`font-medium text-base ${
                formData.tripType === "round-trip"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              Round Way
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="tripType"
                value="multi-city"
                checked={formData.tripType === "multi-city"}
                onChange={handleTripTypeChange}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.tripType === "multi-city"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {formData.tripType === "multi-city" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span
              className={`font-medium text-base ${
                formData.tripType === "multi-city"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              Multi City
            </span>
          </label>
        </div>

        {/* Form Fields Container */}
        <div className="grid grid-cols-5 border border-gray-200 rounded-2xl mb-12 overflow-hidden">
          {/* FROM Section */}
          <div className="p-5 bg-white border-r border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              FROM
            </p>
            <p className="text-xl font-bold text-blue-900 mb-1">
              {formData.from}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {formData.fromAirport}
            </p>
          </div>

          {/* TO Section with Swap Button */}
          <div className="p-5 bg-white border-r border-gray-200 relative">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              TO
            </p>
            <p className="text-xl font-bold text-blue-900 mb-1">
              {formData.to}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {formData.toAirport}
            </p>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapLocations}
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors z-10 shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* DEPARTURE DATE Section */}
          <div className="p-5 bg-white border-r border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              DEPARTURE DATE
            </p>
            <p className="text-blue-900 mb-1">
              <span className="text-xl font-bold">09</span>
              <span className="text-base font-semibold ml-1">Aug'25</span>
            </p>
            <p className="text-xs text-gray-400">Saturday</p>
          </div>

          {/* RETURN DATE Section */}
          <div className="p-5 bg-white border-r border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              RETURN DATE
            </p>
            {formData.tripType === "round-trip" ? (
              <p className="text-gray-400 text-base font-medium">Select Date</p>
            ) : (
              <p className="text-xs text-gray-500 mt-3 leading-tight">
                Save more on return flight
              </p>
            )}
          </div>

          {/* TRAVELER, CLASS Section */}
          <div className="p-5 bg-white">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              TRAVELER, CLASS
            </p>
            <p className="text-xl font-bold text-blue-900 mb-1">
              {formData.travelers}
            </p>
            <p className="text-xs text-gray-400">{formData.class}</p>
          </div>
        </div>

        {/* Search Button - Positioned to overlap upward into form */}
      </form>
      <div className="flex justify-center relative -mb-7">
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg px-16 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 relative z-40"
        >
          Search
        </button>
      </div>
    </div>
  );
}
