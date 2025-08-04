"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRightLeft, Search, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Reusable Suggestions Dropdown Component ---
const SuggestionsList = ({
  suggestions,
  isLoading,
  onSelect,
  dropdownRef,
  type,
  query,
  onQueryChange,
  placeholder,
}) => {
  const inputRef = useRef(null);

  // Auto-focus the search input when the dropdown opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 flex flex-col"
    >
      {/* Search Bar inside Dropdown */}
      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={onQueryChange}
            placeholder={placeholder || "Type city or airport"}
            className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <Loader className="w-5 h-5 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">Searching...</span>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((airport) => (
            <div
              key={airport.iata}
              onClick={() => onSelect(airport, type)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {airport.name}
                  </p>
                </div>
                <p className="font-mono text-sm text-gray-700 font-medium">
                  {airport.iata}
                </p>
              </div>
            </div>
          ))
        ) : query.length >= 2 ? (
          <p className="p-4 text-sm text-center text-gray-500">
            No airports found.
          </p>
        ) : (
          <p className="p-4 text-sm text-center text-gray-500">
            Type to search for an airport.
          </p>
        )}
      </div>
    </div>
  );
};

// --- Main Flight Search Form Component ---
export default function FlightSearchForm() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    tripType: "one-way",
    from: "Dhaka",
    fromCode: "DAC",
    fromAirport: "Hazrat Shahjalal International Airport",
    to: "Cox's Bazar",
    toCode: "CXB",
    toAirport: "Cox's Bazar Airport",
    journeyDate: "2025-08-09",
    returnDate: "",
    travelers: "1 Traveler",
    class: "economy",
  });

  // State for airport suggestions and search queries
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [isFromSearchingApi, setIsFromSearchingApi] = useState(false);
  const [isToSearchingApi, setIsToSearchingApi] = useState(false);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Refs for inputs and dropdowns to handle outside clicks
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  // --- API-based Airport Search ---
  const searchAirports = (query, setSuggestions, setIsLoading) => {
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Set new timeout
    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/flights/search?q=${query}&limit=5`);
        const result = await response.json();
        setSuggestions(result.success ? result.data : []);
      } catch (error) {
        console.error("Failed to fetch airports:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay
  };

  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFromQuery(value);
    searchAirports(value, setFromSuggestions, setIsFromSearchingApi);
  };
  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToQuery(value);
    searchAirports(value, setToSuggestions, setIsToSearchingApi);
  };

  // --- Airport Selection ---
  const selectAirport = (airport, type) => {
    const airportDetails = {
      city: airport.city,
      code: airport.iata,
      airportName: airport.name,
    };
    if (type === "from") {
      setFormData((prev) => ({
        ...prev,
        from: airportDetails.city,
        fromCode: airportDetails.code,
        fromAirport: airportDetails.airportName,
      }));
      setShowFromSuggestions(false);
      setFromQuery(""); // Clear query
    } else {
      setFormData((prev) => ({
        ...prev,
        to: airportDetails.city,
        toCode: airportDetails.code,
        toAirport: airportDetails.airportName,
      }));
      setShowToSuggestions(false);
      setToQuery(""); // Clear query
    }
  };

  // --- UI Event Handlers ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target) &&
        fromRef.current &&
        !fromRef.current.contains(event.target)
      ) {
        setShowFromSuggestions(false);
      }
      if (
        toDropdownRef.current &&
        !toDropdownRef.current.contains(event.target) &&
        toRef.current &&
        !toRef.current.contains(event.target)
      ) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      fromCode: prev.toCode,
      fromAirport: prev.toAirport,
      to: prev.from,
      toCode: prev.fromCode,
      toAirport: prev.fromAirport,
    }));
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    // ... rest of the submit logic from previous answer ...
    try {
      const searchPayload = {
        origin: formData.fromCode,
        destination: formData.toCode,
        departure_date: formData.journeyDate,
        return_date:
          formData.tripType === "round-trip" ? formData.returnDate : null,
        passengers: [{ type: "adult" }],
        cabin_class: formData.class,
      };

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload),
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem(
          "flightSearchResults",
          JSON.stringify({
            searchParams: formData,
            results: result,
            timestamp: new Date().toISOString(),
          })
        );
        router.push("/flights/results");
      } else {
        console.error("Search failed:", result.error, result.details);
        alert(`Search failed: ${result.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("An error occurred while searching for flights.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl relative z-10 pt-8">
      <form onSubmit={handleSubmit} className="px-8">
        {/* ... Trip Type Radio Buttons ... */}
        <div className="flex items-center gap-6 mb-8 pt-4">
          {["one-way", "round-trip", "multi-city"].map((trip) => (
            <label
              key={trip}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="tripType"
                value={trip}
                checked={formData.tripType === trip}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tripType: e.target.value,
                    returnDate:
                      e.target.value !== "round-trip" ? "" : prev.returnDate,
                  }))
                }
                className="sr-only"
                disabled={trip === "multi-city"}
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.tripType === trip
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                } ${trip === "multi-city" ? "opacity-50" : ""}`}
              >
                {formData.tripType === trip && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
              <span
                className={`font-medium text-base capitalize ${
                  formData.tripType === trip ? "text-blue-600" : "text-gray-400"
                } ${trip === "multi-city" ? "opacity-50" : ""}`}
              >
                {trip.replace("-", " ")}
              </span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 border border-gray-200 rounded-2xl mb-12">
          {/* FROM Section */}
          <div
            ref={fromRef}
            onClick={() => setShowFromSuggestions(true)}
            className={`p-5 bg-white rounded-l-2xl border-b md:border-b-0 md:border-r border-gray-200 relative cursor-pointer ${
              showFromSuggestions ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase">
              FROM
            </p>
            <p className="text-xl font-bold text-blue-900 truncate">
              {formData.from}
            </p>
            <p className="text-xs text-gray-400 leading-tight truncate">
              {formData.fromAirport}
            </p>
            {showFromSuggestions && (
              <SuggestionsList
                suggestions={fromSuggestions}
                isLoading={isFromSearchingApi}
                onSelect={selectAirport}
                dropdownRef={fromDropdownRef}
                type="from"
                query={fromQuery}
                onQueryChange={handleFromInputChange}
              />
            )}
          </div>

          {/* TO Section (with swap button) */}
          <div
            ref={toRef}
            onClick={() => setShowToSuggestions(true)}
            className={`p-5 bg-white border-b md:border-b-0 md:border-r border-gray-200 relative cursor-pointer ${
              showToSuggestions ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleSwapLocations}
              className="absolute left-0 top-[50%] -translate-y-[50%] transform -translate-x-1/2 p-2 bg-white rounded-full border border-gray-300 hover:bg-gray-100 transition-colors z-20 shadow-md md:top-[50%]"
            >
              <ArrowRightLeft className="w-4 h-4 text-gray-600" />
            </button>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase">
              TO
            </p>
            <p className="text-xl font-bold text-blue-900 truncate">
              {formData.to}
            </p>
            <p className="text-xs text-gray-400 leading-tight truncate">
              {formData.toAirport}
            </p>
            {showToSuggestions && (
              <SuggestionsList
                suggestions={toSuggestions}
                isLoading={isToSearchingApi}
                onSelect={selectAirport}
                dropdownRef={toDropdownRef}
                type="to"
                query={toQuery}
                onQueryChange={handleToInputChange}
              />
            )}
          </div>
          {/* ... Date, Traveler, and Class Sections ... */}
          {/* DEPARTURE DATE Section */}
          <div className="p-5 bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              DEPARTURE
            </p>
            <input
              type="date"
              value={formData.journeyDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  journeyDate: e.target.value,
                }))
              }
              className="text-xl font-bold text-blue-900 bg-transparent border-none outline-none w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* RETURN DATE Section */}
          <div className="p-5 bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              RETURN
            </p>
            {formData.tripType === "round-trip" ? (
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    returnDate: e.target.value,
                  }))
                }
                className="text-base font-medium text-blue-900 bg-transparent border-none outline-none w-full"
                min={
                  formData.journeyDate || new Date().toISOString().split("T")[0]
                }
              />
            ) : (
              <p className="text-sm text-gray-400 pt-3">Click Round Way</p>
            )}
          </div>

          {/* TRAVELER, CLASS Section */}
          <div className="p-5 bg-white rounded-r-2xl">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              PASSENGERS & CLASS
            </p>
            <p className="text-xl font-bold text-blue-900 mb-1">
              {formData.travelers}
            </p>
            <select
              value={formData.class}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, class: e.target.value }))
              }
              className="text-xs text-gray-400 bg-transparent border-none outline-none -ml-1"
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>
      </form>
      {/* Search Button */}
      <div className="flex justify-center relative -mb-7">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSearching}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-blue-900 font-bold text-lg px-16 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 focus:outline-none"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            "Search Flights"
          )}
        </button>
      </div>
    </div>
  );
}
