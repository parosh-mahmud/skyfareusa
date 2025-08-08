"use client";

import { useMemo } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";

// Helper to format price
const formatPrice = (a, c) =>
  new Intl.NumberFormat("en-US", {
    currency: c || "BDT",
    style: "currency",
    minimumFractionDigits: 0,
  }).format(a);

export default function FilterSidebar({ offers, filters, onFiltersChange }) {
  // Derive filter options from the available flight offers
  const { airlines, minPrice, maxPrice } = useMemo(() => {
    if (!offers || offers.length === 0) {
      return { airlines: [], minPrice: 0, maxPrice: 0 };
    }

    const airlineSet = new Map();
    let min = Infinity;
    let max = -Infinity;

    offers.forEach((offerGroup) => {
      const offer = offerGroup[0]; // Use the cheapest offer for summary
      const carrier = offer.slices[0].segments[0].marketing_carrier;
      if (!airlineSet.has(carrier.iata_code)) {
        airlineSet.set(carrier.iata_code, {
          code: carrier.iata_code,
          name: carrier.name,
          logo_symbol_url: carrier.logo_symbol_url,
        });
      }

      const price = parseFloat(offer.total_amount);
      if (price < min) min = price;
      if (price > max) max = price;
    });

    return {
      airlines: Array.from(airlineSet.values()),
      minPrice: Math.floor(min),
      maxPrice: Math.ceil(max),
    };
  }, [offers]);

  const handleAirlineChange = (airlineCode, checked) => {
    const newAirlines = checked
      ? [...filters.airlines, airlineCode]
      : filters.airlines.filter((code) => code !== airlineCode);

    onFiltersChange({
      ...filters,
      airlines: newAirlines,
    });
  };

  const handleStopsChange = (stopsValue, checked) => {
    const newStops = checked
      ? [...filters.stops, stopsValue]
      : filters.stops.filter((stop) => stop !== stopsValue);

    onFiltersChange({
      ...filters,
      stops: newStops,
    });
  };

  const handleTimeSlotChange = (timeSlot, checked) => {
    const newTimeSlots = checked
      ? [...filters.departureTime, timeSlot]
      : filters.departureTime.filter((slot) => slot !== timeSlot);

    onFiltersChange({
      ...filters,
      departureTime: newTimeSlots,
    });
  };

  const handleLayoverChange = (layoverRange, checked) => {
    const newLayover = checked
      ? [...filters.layoverTime, layoverRange]
      : filters.layoverTime.filter((range) => range !== layoverRange);

    onFiltersChange({
      ...filters,
      layoverTime: newLayover,
    });
  };

  const handlePriceChange = (min, max) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max },
    });
  };

  return (
    <div className="space-y-6">
      {/* Airlines Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Airlines</h4>
        <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
          {airlines.map((airline) => (
            <label
              key={airline.code}
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={filters.airlines.includes(airline.code)}
                onChange={(e) =>
                  handleAirlineChange(airline.code, e.target.checked)
                }
              />
              <img
                src={airline.logo_symbol_url || "/placeholder.svg"}
                alt={airline.name}
                className="w-6 h-6 rounded-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="truncate">{airline.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stops Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Stops</h4>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={filters.stops.includes("direct")}
              onChange={(e) => handleStopsChange("direct", e.target.checked)}
            />
            <span>Non-Stop</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={filters.stops.includes("1-stop")}
              onChange={(e) => handleStopsChange("1-stop", e.target.checked)}
            />
            <span>1 Stop</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={filters.stops.includes("2-plus-stops")}
              onChange={(e) =>
                handleStopsChange("2-plus-stops", e.target.checked)
              }
            />
            <span>2+ Stops</span>
          </label>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-4">Price Range</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Min Price
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.priceRange.min}
                min={minPrice}
                max={maxPrice}
                onChange={(e) =>
                  handlePriceChange(
                    parseInt(e.target.value) || minPrice,
                    filters.priceRange.max
                  )
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Max Price
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.priceRange.max}
                min={minPrice}
                max={maxPrice}
                onChange={(e) =>
                  handlePriceChange(
                    filters.priceRange.min,
                    parseInt(e.target.value) || maxPrice
                  )
                }
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatPrice(minPrice)}</span>
            <span>{formatPrice(maxPrice)}</span>
          </div>
        </div>
      </div>

      {/* Departure Time Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">
          Flight Time{" "}
          <span className="text-xs text-gray-400 font-normal ml-1">
            Departure
          </span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { key: "early-morning", label: "00-06", icon: Sparkles },
            { key: "morning", label: "06-12", icon: Sun },
            { key: "afternoon", label: "12-18", icon: Sun },
            { key: "evening", label: "18-00", icon: Moon },
          ].map(({ key, label, icon: Icon }) => (
            <label key={key} className="cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={filters.departureTime.includes(key)}
                onChange={(e) => handleTimeSlotChange(key, e.target.checked)}
              />
              <div
                className={`flex flex-col items-center p-2 rounded border transition-colors ${
                  filters.departureTime.includes(key)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Layover Time Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Layover Time</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { key: "0-5h", label: "0h-5h" },
            { key: "5-10h", label: "5h-10h" },
            { key: "10-15h", label: "10h-15h" },
            { key: "15h-plus", label: "15h+" },
          ].map(({ key, label }) => (
            <label key={key} className="cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={filters.layoverTime.includes(key)}
                onChange={(e) => handleLayoverChange(key, e.target.checked)}
              />
              <div
                className={`p-2 rounded border text-center transition-colors ${
                  filters.layoverTime.includes(key)
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
                }`}
              >
                {label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="border-t pt-4">
        <button
          onClick={() =>
            onFiltersChange({
              airlines: [],
              stops: [],
              priceRange: { min: minPrice, max: maxPrice },
              departureTime: [],
              layoverTime: [],
            })
          }
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
