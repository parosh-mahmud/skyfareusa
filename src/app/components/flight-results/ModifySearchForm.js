"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import TripTypeSelector from "../feature/TripTypeSelector";
import SuggestionsList from "../feature/SuggestionsList";
import DatePicker from "../flight-search/DatePicker";
import TravelerClassSelector from "../flight-search/TravelerClassSelector";

export default function ModifySearchForm({ initialState, onSearch }) {
  // ─── State ────────────────────────────────────────────────────────
  const [tripType, setTripType] = useState(initialState.tripType || "one-way");
  const [slices, setSlices] = useState(initialState.slices);
  const [passengers, setPassengers] = useState(initialState.passengers);
  const [cabinClass, setCabinClass] = useState(initialState.cabinClass);
  const [activeSelector, setActiveSelector] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // ─── Airport Lookup ───────────────────────────────────────────────
  function fetchAirports(q) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) return setSuggestions([]);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?q=${q}&limit=5`);
        const json = await res.json();
        setSuggestions(json.success ? json.data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function onQueryChange(e) {
    setQuery(e.target.value);
    fetchAirports(e.target.value);
  }

  function onSelectAirport(airport) {
    if (!activeSelector) return;
    const { sliceIndex, field } = activeSelector;
    const copy = [...slices];
    copy[sliceIndex][field] = {
      name: airport.city,
      code: airport.iata,
      airportName: airport.name,
    };
    setSlices(copy);
    setActiveSelector(null);
    setQuery("");
  }

  // ─── Handle selector change (close others) ────────────────────────
  const handleSelectorChange = (newSelector) => {
    setActiveSelector(newSelector);
    setQuery("");
  };

  // ─── Swap origin/dest ─────────────────────────────────────────────
  function swap() {
    const copy = [...slices];
    const temp = copy[0].origin;
    copy[0].origin = copy[0].destination;
    copy[0].destination = temp;
    setSlices(copy);
  }

  // ─── Trip type change ─────────────────────────────────────────────
  const handleTripTypeChange = (type) => {
    setTripType(type);
    setActiveSelector(null); // Close any open selectors

    if (type === "round-trip" && slices.length === 1) {
      const copy = [...slices];
      copy.push({
        origin: copy[0].destination,
        destination: copy[0].origin,
        departure_date: "",
      });
      setSlices(copy);
    } else if (type === "one-way" && slices.length > 1) {
      setSlices([slices[0]]);
    }
  };

  // ─── Submit handler ───────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    onSearch({ tripType, slices, passengers, cabinClass });
  }

  // ─── Close dropdown on outside click ─────────────────────────────
  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        ![...document.querySelectorAll(".airport-selector-trigger")].some(
          (el) => el.contains(e.target)
        )
      ) {
        setActiveSelector(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Trip Type Selector */}
      <div className="mb-4">
        <TripTypeSelector
          tripType={tripType}
          onChange={handleTripTypeChange}
          size="compact"
        />
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-end">
          {/* FROM */}
          <div
            className="relative airport-selector-trigger"
            ref={
              activeSelector?.sliceIndex === 0 &&
              activeSelector.field === "origin"
                ? dropdownRef
                : null
            }
          >
            <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">
              FROM
            </label>
            <div
              className="border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-400 cursor-pointer bg-white transition-colors min-h-[50px] flex flex-col justify-center"
              onClick={() =>
                handleSelectorChange({ sliceIndex: 0, field: "origin" })
              }
            >
              <p className="font-bold text-blue-900 text-lg truncate">
                {slices[0].origin.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {slices[0].origin.code}, {slices[0].origin.airportName}
              </p>
            </div>
            {activeSelector?.sliceIndex === 0 &&
              activeSelector.field === "origin" && (
                <SuggestionsList
                  suggestions={suggestions}
                  isLoading={loading}
                  query={query}
                  onQueryChange={onQueryChange}
                  onSelect={onSelectAirport}
                  placeholder="Type to search airports"
                  dropdownRef={dropdownRef}
                />
              )}
          </div>

          {/* TO */}
          <div
            className="relative airport-selector-trigger"
            ref={
              activeSelector?.sliceIndex === 0 &&
              activeSelector.field === "destination"
                ? dropdownRef
                : null
            }
          >
            <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">
              TO
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={swap}
                className="absolute -left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 z-10 transition-colors"
              >
                <ArrowRightLeft className="w-3 h-3 text-gray-600" />
              </button>
              <div
                className="border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-400 cursor-pointer bg-white transition-colors min-h-[50px] flex flex-col justify-center"
                onClick={() =>
                  handleSelectorChange({ sliceIndex: 0, field: "destination" })
                }
              >
                <p className="font-bold text-blue-900 text-lg truncate">
                  {slices[0].destination.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {slices[0].destination.code},{" "}
                  {slices[0].destination.airportName}
                </p>
              </div>
            </div>
            {activeSelector?.sliceIndex === 0 &&
              activeSelector.field === "destination" && (
                <SuggestionsList
                  suggestions={suggestions}
                  isLoading={loading}
                  query={query}
                  onQueryChange={onQueryChange}
                  onSelect={onSelectAirport}
                  placeholder="Type to search airports"
                  dropdownRef={dropdownRef}
                />
              )}
          </div>

          {/* DEPARTURE DATE */}
          <div className="date-picker-trigger">
            <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">
              DEPARTURE DATE
            </label>
            <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white min-h-[50px] flex flex-col justify-center">
              <DatePicker
                value={slices[0].departure_date}
                onChange={(d) => {
                  const c = [...slices];
                  c[0].departure_date = d;
                  setSlices(c);
                }}
                placeholder="Select date"
                minDate={new Date().toISOString().split("T")[0]}
                label="Select departure date"
                onOpen={() => setActiveSelector(null)}
                displayVariant="compact"
              />
            </div>
          </div>

          {/* RETURN DATE */}
          <div className="date-picker-trigger">
            <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">
              RETURN DATE
            </label>
            <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white min-h-[50px] flex flex-col justify-center">
              {tripType === "round-trip" ? (
                <DatePicker
                  value={slices[1]?.departure_date || ""}
                  onChange={(d) => {
                    const c = [...slices];
                    if (c[1]) c[1].departure_date = d;
                    setSlices(c);
                  }}
                  placeholder="Select date"
                  minDate={
                    slices[0].departure_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  isDualMonth={true}
                  label="Select return date"
                  onOpen={() => setActiveSelector(null)}
                  displayVariant="compact"
                />
              ) : (
                <p className="text-sm text-gray-500">
                  Save more on return flight
                </p>
              )}
            </div>
          </div>

          {/* TRAVELER & CLASS */}
          <div className="traveler-selector-trigger">
            <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">
              TRAVELER, CLASS
            </label>
            <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white min-h-[50px] flex flex-col justify-center">
              <TravelerClassSelector
                passengers={passengers}
                onPassengersChange={setPassengers}
                cabinClass={cabinClass}
                onCabinClassChange={setCabinClass}
                variant="compact"
                onOpen={() => setActiveSelector(null)}
                displayVariant="compact"
              />
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <div>
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-base px-4 py-3 rounded-lg shadow-lg transition-colors min-h-[50px] flex items-center justify-center"
            >
              Modify
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
