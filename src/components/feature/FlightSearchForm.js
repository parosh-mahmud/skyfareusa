"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRightLeft, Loader, X, PlusCircle } from "lucide-react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

import SuggestionsList from "./SuggestionsList";
import DatePicker from "../flight-search/DatePicker";
import TravelerClassSelector from "../flight-search/TravelerClassSelector";

// default state
const defaultInitialState = {
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

export default function FlightSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── State & Refs ─────────────────────────────────
  const [isSearching, setIsSearching] = useState(false);
  const [activeSelector, setActiveSelector] = useState(null);
  const [airportQuery, setAirportQuery] = useState("");
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [isSearchingAirports, setIsSearchingAirports] = useState(false);

  const [tripType, setTripType] = useState(defaultInitialState.tripType);
  const [slices, setSlices] = useState(defaultInitialState.slices);
  const [passengers, setPassengers] = useState(defaultInitialState.passengers);
  const [cabinClass, setCabinClass] = useState(defaultInitialState.cabinClass);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // ─── URL → State ─────────────────────────────────────
  const initializeStateFromURL = useCallback(() => {
    try {
      const t = searchParams.get("tripType");
      const c = searchParams.get("cabinClass");
      const s = searchParams.get("slices");
      const p = searchParams.get("passengers");
      if (t || c || s || p) {
        setTripType(t || defaultInitialState.tripType);
        setCabinClass(c || defaultInitialState.cabinClass);
        if (s) setSlices(JSON.parse(s));
        if (p) setPassengers(JSON.parse(p));
      }
    } catch {
      setTripType(defaultInitialState.tripType);
      setSlices(defaultInitialState.slices);
      setPassengers(defaultInitialState.passengers);
      setCabinClass(defaultInitialState.cabinClass);
    }
  }, [searchParams]);

  useEffect(() => {
    initializeStateFromURL();
  }, [initializeStateFromURL]);

  // ─── SEARCH AIRPORTS ───────────────────────────────────
  const searchAirports = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setAirportSuggestions([]);
      return;
    }
    setIsSearchingAirports(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?q=${q}&limit=5`);
        const json = await res.json();
        setAirportSuggestions(json.success ? json.data : []);
      } catch {}
      setIsSearchingAirports(false);
    }, 300);
  };

  const handleQueryChange = (value) => {
    setAirportQuery(value);
    searchAirports(value);
  };

  // ─── HANDLERS ─────────────────────────────────────────
  const handleSelectAirport = (airport) => {
    if (!activeSelector) return;
    const { sliceIndex, field } = activeSelector;
    const updated = [...slices];

    updated[sliceIndex][field] = {
      name: airport.city,
      code: airport.iata,
      airportName: airport.name,
    };

    if (tripType === "round-trip" && sliceIndex === 0) {
      if (field === "origin") updated[1].destination = updated[0].origin;
      if (field === "destination") updated[1].origin = updated[0].destination;
    }
    if (
      tripType === "multi-city" &&
      field === "destination" &&
      sliceIndex < updated.length - 1
    ) {
      updated[sliceIndex + 1].origin = updated[sliceIndex].destination;
    }

    setSlices(updated);
    setActiveSelector(null);
    setAirportQuery("");
  };

  const handleSwapLocations = () => {
    const updated = [...slices];
    const a = updated[0].origin;
    updated[0].origin = updated[0].destination;
    updated[0].destination = a;
    if (tripType === "round-trip" && updated[1]) {
      updated[1].origin = updated[0].destination;
      updated[1].destination = updated[0].origin;
    }
    setSlices(updated);
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    setActiveSelector(null);
    if (type === "one-way") {
      setSlices((p) => p.slice(0, 1));
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
    } else {
      setSlices((p) => [
        ...p,
        {
          origin: p[p.length - 1].destination,
          destination: { name: "", code: "", airportName: "" },
          departure_date: "",
        },
      ]);
    }
  };

  const handleAddSlice = () => {
    setSlices((p) => [
      ...p,
      {
        origin: p[p.length - 1].destination,
        destination: { name: "", code: "", airportName: "" },
        departure_date: "",
      },
    ]);
  };
  const handleRemoveSlice = (i) => {
    if (slices.length > 1) {
      setSlices((p) => p.filter((_, idx) => idx !== i));
    }
  };

  const handleDateChange = (i, date) => {
    const updated = [...slices];
    updated[i].departure_date = date;
    setSlices(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    params.set("tripType", tripType);
    params.set("cabinClass", cabinClass);
    params.set("slices", JSON.stringify(slices));
    params.set("passengers", JSON.stringify(passengers));
    router.push(`/flights/results?${params.toString()}`);
  };

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveSelector(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestionProps = {
    suggestions: airportSuggestions,
    isLoading: isSearchingAirports,
    query: airportQuery,
    onQueryChange: handleQueryChange,
    onSelect: handleSelectAirport,
    dropdownRef,
  };

  const renderSlicesUI = () => {
    if (tripType === "multi-city") {
      return (
        <div className="space-y-4">
          {slices.map((slice, idx) => (
            <Card key={idx} className="p-4 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
                <div className="relative">
                  <Label>From</Label>
                  <Button
                    type="button" // ✅ FIX: Prevents form submission
                    variant="outline"
                    className="w-full justify-start text-left h-auto"
                    onClick={() =>
                      setActiveSelector({ sliceIndex: idx, field: "origin" })
                    }
                  >
                    <div>
                      <p className="font-bold truncate">
                        {slice.origin.name || "Select Origin"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {slice.origin.code}, {slice.origin.airportName}
                      </p>
                    </div>
                  </Button>
                  {activeSelector?.sliceIndex === idx &&
                    activeSelector.field === "origin" && (
                      <SuggestionsList {...suggestionProps} />
                    )}
                </div>
                <div className="relative">
                  <Label>To</Label>
                  <Button
                    type="button" // ✅ FIX: Prevents form submission
                    variant="outline"
                    className="w-full justify-start text-left h-auto"
                    onClick={() =>
                      setActiveSelector({
                        sliceIndex: idx,
                        field: "destination",
                      })
                    }
                  >
                    <div>
                      <p className="font-bold truncate">
                        {slice.destination.name || "Select Destination"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {slice.destination.code},{" "}
                        {slice.destination.airportName}
                      </p>
                    </div>
                  </Button>
                  {activeSelector?.sliceIndex === idx &&
                    activeSelector.field === "destination" && (
                      <SuggestionsList {...suggestionProps} />
                    )}
                </div>
                <div>
                  <Label>Departure Date</Label>
                  <DatePicker
                    value={slice.departure_date}
                    onChange={(d) => handleDateChange(idx, d)}
                    onOpen={() => setActiveSelector(null)}
                  />
                </div>
                {slices.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSlice(idx)}
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    const one = slices[0];
    const ret = slices[1] || {};
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 border rounded-2xl mb-8 bg-background overflow-visible">
        <div className="relative p-5 border-b lg:border-b-0 lg:border-r">
          <div
            className="cursor-pointer h-full"
            onClick={() =>
              setActiveSelector({ sliceIndex: 0, field: "origin" })
            }
          >
            <p className="text-xs text-muted-foreground uppercase mb-2">From</p>
            <p className="text-lg font-bold truncate">{one.origin.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {one.origin.code}, {one.origin.airportName}
            </p>
          </div>
          {activeSelector?.sliceIndex === 0 &&
            activeSelector.field === "origin" && (
              <SuggestionsList {...suggestionProps} />
            )}
        </div>
        <div className="relative p-5 border-b lg:border-b-0 lg:border-r">
          <Button
            type="button" // ✅ FIX: Prevents form submission
            variant="outline"
            size="icon"
            onClick={handleSwapLocations}
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 lg:left-0 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 rounded-full z-10 bg-background"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
          <div
            className="cursor-pointer h-full"
            onClick={() =>
              setActiveSelector({ sliceIndex: 0, field: "destination" })
            }
          >
            <p className="text-xs text-muted-foreground uppercase mb-2">To</p>
            <p className="text-lg font-bold truncate">{one.destination.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {one.destination.code}, {one.destination.airportName}
            </p>
          </div>
          {activeSelector?.sliceIndex === 0 &&
            activeSelector.field === "destination" && (
              <SuggestionsList {...suggestionProps} />
            )}
        </div>
        <div className="p-5 border-b lg:border-b-0 lg:border-r">
          <p className="text-xs text-muted-foreground uppercase mb-2">
            Departure Date
          </p>
          <DatePicker
            value={one.departure_date}
            onChange={(d) => handleDateChange(0, d)}
            onOpen={() => setActiveSelector(null)}
          />
        </div>
        <div className="p-5 border-b lg:border-b-0 lg:border-r">
          <p className="text-xs text-muted-foreground uppercase mb-2">
            Return Date
          </p>
          {tripType === "round-trip" ? (
            <DatePicker
              value={ret.departure_date || ""}
              onChange={(d) => handleDateChange(1, d)}
              minDate={one.departure_date}
              onOpen={() => setActiveSelector(null)}
            />
          ) : (
            <div className="h-full flex items-center">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => handleTripTypeChange("round-trip")}
              >
                Add return flight
              </Button>
            </div>
          )}
        </div>
        <div className="p-5">
          <TravelerClassSelector
            passengers={passengers}
            onPassengersChange={setPassengers}
            cabinClass={cabinClass}
            onCabinClassChange={setCabinClass}
            onOpen={() => setActiveSelector(null)}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full relative z-50 overflow-visible pt-6">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs
            value={tripType}
            onValueChange={handleTripTypeChange}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="one-way">One Way</TabsTrigger>
              <TabsTrigger value="round-trip">Round Trip</TabsTrigger>
              <TabsTrigger value="multi-city">Multi-City</TabsTrigger>
            </TabsList>
          </Tabs>

          {renderSlicesUI()}

          <div className="flex justify-between items-center">
            <div>
              {tripType === "multi-city" && (
                <Button
                  type="button" // ✅ FIX: Prevents form submission
                  variant="ghost"
                  onClick={handleAddSlice}
                  className="text-primary"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Add Another Flight
                </Button>
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <Button
                type="submit"
                size="lg"
                disabled={isSearching}
                className="px-16 py-6 h-auto text-lg"
              >
                {isSearching && (
                  <Loader className="w-6 h-6 animate-spin mr-2" />
                )}
                Search Flights
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
