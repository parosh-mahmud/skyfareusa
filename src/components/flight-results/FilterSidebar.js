"use client";

import { useMemo } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import Image from "next/image";

// ✅ Component to safely render airline logos
const AirlineLogo = ({ airline, size = 6 }) => (
  <Image
    src={`https://images.kiwi.com/airlines/64/${airline.code}.png`}
    alt={airline.name}
    width={size * 4}
    height={size * 4}
    className={`w-${size} h-${size} rounded-full object-contain bg-white`}
    unoptimized
  />
);

// ✅ Price formatter now defaults to USD
const formatPrice = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export default function FilterSidebar({ offers, filters, onFiltersChange }) {
  const { airlines, minPrice, maxPrice } = useMemo(() => {
    if (!offers || offers.length === 0) {
      return { airlines: [], minPrice: 0, maxPrice: 10000 };
    }
    const airlineSet = new Map();
    let min = Infinity;
    let max = -Infinity;
    offers.forEach((group) => {
      const offer = group[0];
      const carrier = offer?.slices?.[0]?.segments?.[0]?.carrier;
      if (carrier?.iata_code && !airlineSet.has(carrier.iata_code)) {
        airlineSet.set(carrier.iata_code, {
          code: carrier.iata_code,
          name: carrier.name || "Unknown Airline",
        });
      }
      const price = parseFloat(offer.total_amount);
      if (!isNaN(price)) {
        if (price < min) min = price;
        if (price > max) max = price;
      }
    });
    return {
      airlines: Array.from(airlineSet.values()),
      minPrice: Math.floor(min),
      maxPrice: Math.ceil(max),
    };
  }, [offers]);

  // --- Handlers ---
  const handleFilterChange = (filterName, value, isChecked) => {
    const currentFilter = filters[filterName];
    const newFilter = isChecked
      ? [...currentFilter, value]
      : currentFilter.filter((item) => item !== value);
    onFiltersChange({ ...filters, [filterName]: newFilter });
  };

  const handlePriceChange = (newPriceRange) => {
    onFiltersChange({ ...filters, priceRange: newPriceRange });
  };

  const clearFilters = () => {
    onFiltersChange({
      airlines: [],
      stops: [],
      departureTime: [],
      priceRange: { min: minPrice, max: maxPrice },
    });
  };

  const timeSlots = [
    { key: "early-morning", label: "00-06", icon: Sparkles },
    { key: "morning", label: "06-12", icon: Sun },
    { key: "afternoon", label: "12-18", icon: Sun },
    { key: "evening", label: "18-00", icon: Moon },
  ];

  return (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="relative h-8">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange.min}
              onChange={(e) =>
                handlePriceChange({
                  ...filters.priceRange,
                  min: Math.min(
                    parseInt(e.target.value),
                    filters.priceRange.max - 1
                  ),
                })
              }
              className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-0 z-20"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange.max}
              onChange={(e) =>
                handlePriceChange({
                  ...filters.priceRange,
                  max: Math.max(
                    parseInt(e.target.value),
                    filters.priceRange.min + 1
                  ),
                })
              }
              className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-0 z-20"
            />
            <div className="relative h-1 top-0">
              <div className="absolute z-10 w-full h-1 bg-gray-200 rounded-full top-0"></div>
              <div
                className="absolute z-10 h-1 bg-blue-600 rounded-full top-0"
                style={{
                  left: `${
                    ((filters.priceRange.min - minPrice) /
                      (maxPrice - minPrice)) *
                    100
                  }%`,
                  right: `${
                    100 -
                    ((filters.priceRange.max - minPrice) /
                      (maxPrice - minPrice)) *
                      100
                  }%`,
                }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatPrice(filters.priceRange.min)}</span>
            <span>{formatPrice(filters.priceRange.max)}</span>
          </div>
        </div>
      </div>

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
                  handleFilterChange("airlines", airline.code, e.target.checked)
                }
              />
              <AirlineLogo airline={airline} />
              <span className="truncate">{airline.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stops Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Stops</h4>
        <div className="space-y-2 text-sm">
          {[
            { label: "Non-Stop", value: 0 },
            { label: "1 Stop", value: 1 },
            { label: "2+ Stops", value: 2 },
          ].map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                checked={filters.stops.includes(value)}
                onChange={(e) =>
                  handleFilterChange("stops", value, e.target.checked)
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ✅ COMPLETE Departure Time Filter */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Departure Time</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {timeSlots.map(({ key, label, icon: Icon }) => (
            <label key={key} className="cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={filters.departureTime.includes(key)}
                onChange={(e) =>
                  handleFilterChange("departureTime", key, e.target.checked)
                }
              />
              <div
                className={`flex flex-col items-center p-2 rounded-md border transition-colors ${
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

      {/* Clear Filters Button */}
      <div className="border-t pt-4">
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
