"use client";

import { useMemo } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import Image from "next/image";

// Import shadcn/ui components
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// AirlineLogo Component
const AirlineLogo = ({ airline, size = 6 }) => (
  <Image
    src={`https://images.kiwi.com/airlines/64/${airline.code}.png`}
    alt={airline.name}
    width={size * 4}
    height={size * 4}
    className={`w-${size} h-${size} rounded-full object-contain bg-background`}
    unoptimized
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = "https://placehold.co/24x24/FFFFFF/000000?text=??";
    }}
  />
);

// Price Formatter
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
  const handleMultiSelectChange = (filterName, value) => {
    const currentFilter = filters[filterName] || [];
    const newFilter = currentFilter.includes(value)
      ? currentFilter.filter((item) => item !== value)
      : [...currentFilter, value];
    onFiltersChange({ ...filters, [filterName]: newFilter });
  };

  const handlePriceChange = (newPriceRange) => {
    onFiltersChange({
      ...filters,
      priceRange: { min: newPriceRange[0], max: newPriceRange[1] },
    });
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
          <Slider
            min={minPrice}
            max={maxPrice}
            step={10}
            value={[filters.priceRange.min, filters.priceRange.max]}
            onValueChange={handlePriceChange}
            minStepsBetweenThumbs={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPrice(filters.priceRange.min)}</span>
            <span>{formatPrice(filters.priceRange.max)}</span>
          </div>
        </div>
      </div>
      <Separator />

      {/* Airlines Filter */}
      <div>
        <h4 className="font-semibold mb-3">Airlines</h4>
        <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
          {airlines.map((airline) => (
            <div key={airline.code} className="flex items-center space-x-2">
              <Checkbox
                id={`airline-${airline.code}`}
                checked={filters.airlines.includes(airline.code)}
                onCheckedChange={() =>
                  handleMultiSelectChange("airlines", airline.code)
                }
              />
              <Label
                htmlFor={`airline-${airline.code}`}
                className="flex items-center gap-2 font-normal cursor-pointer"
              >
                <AirlineLogo airline={airline} />
                <span className="truncate">{airline.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Stops Filter */}
      <div>
        <h4 className="font-semibold mb-2">Stops</h4>
        <div className="space-y-2 text-sm">
          {[
            { label: "Non-Stop", value: 0 },
            { label: "1 Stop", value: 1 },
            { label: "2+ Stops", value: 2 },
          ].map(({ label, value }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`stops-${value}`}
                checked={filters.stops.includes(value)}
                onCheckedChange={() => handleMultiSelectChange("stops", value)}
              />
              <Label
                htmlFor={`stops-${value}`}
                className="font-normal cursor-pointer"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Departure Time Filter */}
      <div>
        <h4 className="font-semibold mb-3">Departure Time</h4>
        <ToggleGroup
          type="multiple"
          value={filters.departureTime}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, departureTime: value })
          }
          className="grid grid-cols-2 gap-2"
        >
          {timeSlots.map(({ key, label, icon: Icon }) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="flex-col h-auto p-2"
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-xs">{label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Separator />

      {/* Clear Filters Button */}
      <div>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
