"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRightLeft, Loader, X, PlusCircle } from "lucide-react";
import TripTypeSelector from "./TripTypeSelector";
import SuggestionsList from "./SuggestionsList";
import DatePicker from "../flight-search/DatePicker";
import TravelerClassSelector from "../flight-search/TravelerClassSelector";

export default function FlightSearchForm({
  variant = "main", // "main" or "compact"
  initialState = null,
  onNewSearch = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ─── State & Refs ──────────────────────────────────────────────────────────────
  const [isSearching, setIsSearching] = useState(false);
  const [activeSelector, setActiveSelector] = useState(null);
  const [airportQuery, setAirportQuery] = useState("");
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [isSearchingAirports, setIsSearchingAirports] = useState(false);

  // Helper function to build initial state from URL or defaults
  const initializeState = () => {
    try {
      const tripType = searchParams.get("tripType") || "one-way";
      const cabinClass = searchParams.get("cabinClass") || "economy";
      const slicesParam = searchParams.get("slices");
      const passengersParam = searchParams.get("passengers");

      const slices = slicesParam
        ? JSON.parse(slicesParam)
        : [
            {
              origin: {
                name: "Dhaka",
                code: "DAC",
                airportName: "Hazrat Shahjalal International Airport",
              },
              destination: {
                name: "Cox's Bazar",
                code: "CXB",
                airportName: "Cox's Bazar Airport",
              },
              departure_date: "2025-08-25",
            },
          ];

      const passengers = passengersParam
        ? JSON.parse(passengersParam)
        : [{ type: "adult" }];

      return { tripType, cabinClass, slices, passengers };
    } catch (error) {
      console.error("Failed to parse search params:", error);
      // Return default state if URL params are corrupted
      return {
        tripType: "one-way",
        cabinClass: "economy",
        slices: [
          {
            origin: {
              name: "Dhaka",
              code: "DAC",
              airportName: "Hazrat Shahjalal International Airport",
            },
            destination: {
              name: "Cox's Bazar",
              code: "CXB",
              airportName: "Cox's Bazar Airport",
            },
            departure_date: "2025-08-25",
          },
        ],
        passengers: [{ type: "adult" }],
      };
    }
  };

  useEffect(() => {
    const { tripType, slices, passengers, cabinClass } = initializeState();
    setTripType(tripType);
    setSlices(slices);
    setPassengers(passengers);
    setCabinClass(cabinClass);
  }, [searchParams]);

  const [tripType, setTripType] = useState(initializeState().tripType);
  const [slices, setSlices] = useState(initializeState().slices);
  const [passengers, setPassengers] = useState(initializeState().passengers);
  const [cabinClass, setCabinClass] = useState(initializeState().cabinClass);

  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  // ─── Airport Search Logic ─────────────────────────────────────────────────────
  const searchAirports = (q) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (q.length < 2) {
      setAirportSuggestions([]);
      return;
    }
    setIsSearchingAirports(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?q=${q}&limit=5`);
        const json = await res.json();
        setAirportSuggestions(json.success ? json.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingAirports(false);
      }
    }, 300);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setAirportQuery(val);
    searchAirports(val);
  };

  const handleSelectAirport = (airport) => {
    if (!activeSelector) return;
    const { sliceIndex, field } = activeSelector;
    const newSlices = [...slices];
    newSlices[sliceIndex][field] = {
      name: airport.city,
      code: airport.iata,
      airportName: airport.name,
    };

    if (
      tripType === "multi-city" &&
      field === "destination" &&
      sliceIndex < newSlices.length - 1
    ) {
      newSlices[sliceIndex + 1].origin = {
        name: airport.city,
        code: airport.iata,
        airportName: airport.name,
      };
    }

    setSlices(newSlices);
    setActiveSelector(null);
    setAirportQuery("");
  };

  // ─── SWAP ORIGIN & DESTINATION ─────────────────────────────────────────────────
  const handleSwapLocations = () => {
    const newSlices = [...slices];
    const firstSlice = newSlices[0];
    const tmp = firstSlice.origin;
    firstSlice.origin = firstSlice.destination;
    firstSlice.destination = tmp;

    if (tripType === "round-trip" && newSlices[1]) {
      newSlices[1].origin = firstSlice.destination;
      newSlices[1].destination = firstSlice.origin;
    }

    setSlices(newSlices);
  };

  // ─── TRIP TYPE CHANGE ───────────────────────────────────────────────────────────
  const handleTripTypeChange = (type) => {
    setTripType(type);
    setActiveSelector(null);

    if (type === "one-way") {
      setSlices((prev) => prev.slice(0, 1));
    } else if (type === "round-trip") {
      const first = slices[0];
      setSlices([
        first,
        {
          origin: first.destination,
          destination: first.origin,
          departure_date: "",
        },
      ]);
    } else if (type === "multi-city" && slices.length < 2) {
      setSlices([
        ...slices,
        {
          origin: slices[0].destination,
          destination: { name: "", code: "", airportName: "" },
          departure_date: "",
        },
      ]);
    }
  };

  // ─── ADD / REMOVE SLICES ────────────────────────────────────────────────────────
  const handleAddSlice = () => {
    const lastDest = slices[slices.length - 1].destination;

    setSlices([
      ...slices,
      {
        origin: lastDest,
        destination: { name: "", code: "", airportName: "" },
        departure_date: "",
      },
    ]);
  };

  const handleRemoveSlice = (i) => {
    if (slices.length > 2) setSlices(slices.filter((_, idx) => idx !== i));
  };

  // ─── DATE CHANGE ────────────────────────────────────────────────────────────────
  const handleDateChange = (i, date) => {
    const updated = [...slices];
    updated[i].departure_date = date;
    setSlices(updated);
  };

  // ─── OPEN/CLOSE SELECTORS ───────────────────────────────────────────────────────
  const handleSelectorChange = (newSelector) => {
    setActiveSelector(newSelector);
    setAirportQuery("");
  };

  // ─── FORM SUBMIT ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true); // You can still show a loader briefly

    const params = new URLSearchParams();
    params.set("tripType", tripType);
    params.set("cabinClass", cabinClass);
    params.set("slices", JSON.stringify(slices));
    params.set("passengers", JSON.stringify(passengers));

    router.push(`/flights/results?${params.toString()}`);

    // The `isSearching` state should be managed on the results page,
    // but we can set it to false after a short delay to prevent a locked UI if navigation fails.
    setTimeout(() => setIsSearching(false), 2000);
  };

  // ─── CLICK‐OUTSIDE TO CLOSE ALL DROPDOWNS ────────────────────────────────────────
  useEffect(() => {
    const onClickOutside = (e) => {
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(e.target);
      const outsideAirport = ![
        ...document.querySelectorAll(".airport-selector-trigger"),
      ].some((el) => el.contains(e.target));
      const outsideDate = ![
        ...document.querySelectorAll(".date-picker-trigger"),
      ].some((el) => el.contains(e.target));
      const outsideTraveler = ![
        ...document.querySelectorAll(".traveler-selector-trigger"),
      ].some((el) => el.contains(e.target));

      if (
        isOutsideDropdown &&
        outsideAirport &&
        outsideDate &&
        outsideTraveler
      ) {
        setActiveSelector(null);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const suggestionProps = {
    suggestions: airportSuggestions,
    isLoading: isSearchingAirports,
    query: airportQuery,
    onQueryChange: handleQueryChange,
    dropdownRef,
  };

  // ─── COMPACT VARIANT ─────────────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-2xl mx-auto overflow-visible">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TripTypeSelector
            tripType={tripType}
            onChange={handleTripTypeChange}
            size="compact"
          />

          {/* FROM */}
          <div
            className="relative airport-selector-trigger"
            ref={
              activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "origin"
                ? dropdownRef
                : null
            }
          >
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              FROM
            </label>
            <div
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 bg-white transition-colors"
              onClick={() =>
                handleSelectorChange({ sliceIndex: 0, field: "origin" })
              }
            >
              <p className="font-bold text-blue-900 text-base truncate">
                {slices[0].origin.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {slices[0].origin.code}, {slices[0].origin.airportName}
              </p>
            </div>
            {activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "origin" && (
                <SuggestionsList
                  {...suggestionProps}
                  onSelect={handleSelectAirport}
                  placeholder="Type to search airports"
                />
              )}
          </div>

          {/* TO */}
          <div
            className="relative airport-selector-trigger"
            ref={
              activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "destination"
                ? dropdownRef
                : null
            }
          >
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              TO
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute -top-6 right-4 p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 z-10 shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div
                className="p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() =>
                  handleSelectorChange({ sliceIndex: 0, field: "destination" })
                }
              >
                <p className="font-bold text-blue-900 text-base truncate">
                  {slices[0].destination.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {slices[0].destination.code},{" "}
                  {slices[0].destination.airportName}
                </p>
              </div>
            </div>
            {activeSelector?.sliceIndex === 0 &&
              activeSelector?.field === "destination" && (
                <SuggestionsList
                  {...suggestionProps}
                  onSelect={handleSelectAirport}
                  placeholder="Type to search airports"
                />
              )}
          </div>

          {/* DEPARTURE DATE */}
          <div className="date-picker-trigger relative z-50">
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              DEPARTURE DATE
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <DatePicker
                value={slices[0].departure_date}
                onChange={(date) => handleDateChange(0, date)}
                placeholder="Select date"
                minDate={new Date().toISOString().split("T")[0]}
                label="Select journey date"
                onOpen={() => setActiveSelector(null)}
              />
            </div>
          </div>

          {/* RETURN DATE */}
          <div className="date-picker-trigger relative z-50">
            <label className="block text-xs font-medium text-blue-600 mb-1 uppercase">
              RETURN DATE
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              {tripType === "round-trip" ? (
                <DatePicker
                  value={slices[1]?.departure_date || ""}
                  onChange={(date) => handleDateChange(1, date)}
                  placeholder="Select date"
                  minDate={
                    slices[0].departure_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  isDualMonth={true}
                  label="Select return date"
                  onOpen={() => setActiveSelector(null)}
                />
              ) : (
                <p className="text-gray-500 text-base">
                  Save more on return flight
                </p>
              )}
            </div>
          </div>

          {/* TRAVELER & CLASS */}
          <div className="traveler-selector-trigger relative z-50">
            <TravelerClassSelector
              passengers={passengers}
              onPassengersChange={setPassengers}
              cabinClass={cabinClass}
              onCabinClassChange={setCabinClass}
              variant="compact"
              onOpen={() => setActiveSelector(null)}
            />
          </div>

          {/* SEARCH BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-6 py-4 rounded-xl shadow-lg flex items-center justify-center transition-colors"
            >
              {isSearching ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── MAIN VARIANT ────────────────────────────────────────────────────────────────
  const renderSlicesUI = () => {
    if (tripType === "multi-city") {
      return (
        <div className="mb-6 space-y-4 overflow-visible">
          {slices.map((slice, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-4 items-center p-4 border border-gray-200 rounded-lg overflow-visible"
            >
              {/* ORIGIN */}
              <div
                className="relative airport-selector-trigger"
                ref={
                  activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "origin"
                    ? dropdownRef
                    : null
                }
              >
                <div
                  onClick={() =>
                    handleSelectorChange({ sliceIndex: idx, field: "origin" })
                  }
                  className="cursor-pointer"
                >
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">
                    FROM
                  </p>
                  <p className="font-bold text-blue-900 text-base truncate">
                    {slice.origin.name || "Select Origin"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {slice.origin.code}, {slice.origin.airportName}
                  </p>
                </div>
                {activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "origin" && (
                    <SuggestionsList
                      {...suggestionProps}
                      onSelect={handleSelectAirport}
                    />
                  )}
              </div>

              {/* DESTINATION */}
              <div
                className="relative airport-selector-trigger"
                ref={
                  activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "destination"
                    ? dropdownRef
                    : null
                }
              >
                <div
                  onClick={() =>
                    handleSelectorChange({
                      sliceIndex: idx,
                      field: "destination",
                    })
                  }
                  className="cursor-pointer"
                >
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">
                    TO
                  </p>
                  <p className="font-bold text-blue-900 text-base truncate">
                    {slice.destination.name || "Select Destination"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {slice.destination.code}, {slice.destination.airportName}
                  </p>
                </div>
                {activeSelector?.sliceIndex === idx &&
                  activeSelector?.field === "destination" && (
                    <SuggestionsList
                      {...suggestionProps}
                      onSelect={handleSelectAirport}
                    />
                  )}
              </div>

              {/* DATE */}
              <div className="date-picker-trigger relative z-50">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">
                  DEPARTURE DATE
                </p>
                <DatePicker
                  value={slice.departure_date}
                  onChange={(date) => handleDateChange(idx, date)}
                  placeholder="Select date"
                  minDate={new Date().toISOString().split("T")[0]}
                  label="Select journey date"
                  onOpen={() => setActiveSelector(null)}
                />
              </div>

              {/* REMOVE */}
              {slices.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlice(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    // ONE-WAY or ROUND-TRIP
    const one = slices[0];
    const ret = slices[1];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 border border-gray-200 rounded-2xl mb-8 bg-white overflow-visible">
        {/* FROM */}
        <div
          className="relative p-5 border-b lg:border-b-0 lg:border-r border-gray-200 airport-selector-trigger"
          ref={
            activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "origin"
              ? dropdownRef
              : null
          }
        >
          <div
            onClick={() =>
              handleSelectorChange({ sliceIndex: 0, field: "origin" })
            }
            className="cursor-pointer"
          >
            <p className="text-xs text-blue-600 uppercase font-medium mb-2">
              FROM
            </p>
            <p className="text-lg lg:text-xl font-bold text-blue-900 truncate">
              {one.origin.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {one.origin.code}, {one.origin.airportName}
            </p>
          </div>
          {activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "origin" && (
              <SuggestionsList
                {...suggestionProps}
                onSelect={handleSelectAirport}
              />
            )}
        </div>

        {/* TO */}
        <div
          className="relative p-5 border-b lg:border-b-0 lg:border-r border-gray-200 airport-selector-trigger"
          ref={
            activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "destination"
              ? dropdownRef
              : null
          }
        >
          <button
            type="button"
            onClick={handleSwapLocations}
            className="absolute left-0 top-1/2 -translate-x-1/2 p-2 bg-white rounded-full border border-gray-200 shadow-md hover:bg-gray-50 transition-colors z-10"
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div
            onClick={() =>
              handleSelectorChange({ sliceIndex: 0, field: "destination" })
            }
            className="cursor-pointer"
          >
            <p className="text-xs text-blue-600 uppercase font-medium mb-2">
              TO
            </p>
            <p className="text-lg lg:text-xl font-bold text-blue-900 truncate">
              {one.destination.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {one.destination.code}, {one.destination.airportName}
            </p>
          </div>
          {activeSelector?.sliceIndex === 0 &&
            activeSelector?.field === "destination" && (
              <SuggestionsList
                {...suggestionProps}
                onSelect={handleSelectAirport}
              />
            )}
        </div>

        {/* DEPARTURE */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-200 date-picker-trigger relative z-50">
          <p className="text-xs text-blue-600 uppercase font-medium mb-2">
            DEPARTURE DATE
          </p>
          <DatePicker
            value={one.departure_date}
            onChange={(date) => handleDateChange(0, date)}
            placeholder="Select date"
            minDate={new Date().toISOString().split("T")[0]}
            label="Select journey date"
            onOpen={() => setActiveSelector(null)}
          />
        </div>

        {/* RETURN */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-200 date-picker-trigger relative z-50">
          <p className="text-xs text-blue-600 uppercase font-medium mb-2">
            RETURN DATE
          </p>
          {tripType === "round-trip" ? (
            <DatePicker
              value={ret?.departure_date || ""}
              onChange={(date) => handleDateChange(1, date)}
              placeholder="Select date"
              minDate={one.departure_date}
              isDualMonth={true}
              label="Select return date"
              onOpen={() => setActiveSelector(null)}
            />
          ) : (
            <div className="pt-1">
              <p
                className="text-gray-500 text-base cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleTripTypeChange("round-trip")}
              >
                Save more on return flight
              </p>
            </div>
          )}
        </div>

        {/* PASSENGERS & CLASS */}
        <div className="p-5 traveler-selector-trigger relative z-50">
          <TravelerClassSelector
            passengers={passengers}
            onPassengersChange={setPassengers}
            cabinClass={cabinClass}
            onCabinClassChange={setCabinClass}
            variant="main"
            onOpen={() => setActiveSelector(null)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full relative z-20 pt-8 border border-gray-100 overflow-visible">
      <form onSubmit={handleSubmit} className="px-8 pb-20">
        <TripTypeSelector
          tripType={tripType}
          onChange={handleTripTypeChange}
          size="main"
        />

        {renderSlicesUI()}

        {tripType === "multi-city" && (
          <button
            type="button"
            onClick={handleAddSlice}
            className="flex items-center gap-2 text-blue-600 font-medium mb-6 hover:text-blue-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> Add Another Flight
          </button>
        )}
      </form>

      {/* Floating Search Button */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <button
          onClick={handleSubmit}
          disabled={isSearching}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-blue-900 font-bold text-lg px-16 py-4 rounded-2xl shadow-lg flex items-center justify-center transition-colors border-0"
        >
          {isSearching ? <Loader className="w-6 h-6 animate-spin" /> : "Search"}
        </button>
      </div>
    </div>
  );
}
