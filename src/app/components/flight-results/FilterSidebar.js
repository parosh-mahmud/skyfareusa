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

export default function FilterSidebar({ offers }) {
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

  return (
    <aside className="mb-6 lg:mb-0">
      <div className="bg-white p-5 rounded-xl border space-y-6 sticky top-24">
        <h3 className="font-bold text-xl">Filters</h3>

        {/* Airlines Filter */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Airlines</h4>
          <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
            {airlines.map((airline) => (
              <label
                key={airline.name}
                className="flex items-center gap-2 p-1 rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <img
                  src={airline.logo_symbol_url}
                  alt={airline.name}
                  className="w-6 h-6 rounded-full"
                />
                <span>{airline.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stops Filter */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Stops</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Non-Stop
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> 1 Stop
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> 2+ Stops
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-4">Price Range</h4>
          {/* Visual representation of a range slider */}
          <div className="relative h-1 bg-gray-200 rounded-full">
            <div
              className="absolute h-1 bg-blue-500 rounded-full"
              style={{ left: "0%", right: "0%" }}
            ></div>
            <div
              className="absolute w-4 h-4 -mt-1.5 bg-white border-2 border-blue-500 rounded-full"
              style={{ left: "0%" }}
            ></div>
            <div
              className="absolute w-4 h-4 -mt-1.5 bg-white border-2 border-blue-500 rounded-full"
              style={{ right: "0%" }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>
              Min<p className="font-semibold">{formatPrice(minPrice)}</p>
            </span>
            <span className="text-right">
              Max<p className="font-semibold">{formatPrice(maxPrice)}</p>
            </span>
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
          <div className="flex justify-between text-center text-xs text-gray-600 border rounded-lg p-1">
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-600 focus:text-white">
              {" "}
              <Sparkles className="mx-auto mb-1" /> 00-06{" "}
            </button>
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-600 focus:text-white">
              {" "}
              <Sun className="mx-auto mb-1" /> 06-12{" "}
            </button>
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-600 focus:text-white">
              {" "}
              <Sun className="mx-auto mb-1 text-yellow-500" /> 12-18{" "}
            </button>
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-600 focus:text-white">
              {" "}
              <Moon className="mx-auto mb-1" /> 18-00{" "}
            </button>
          </div>
        </div>

        {/* Layover Time Filter */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Layover Time</h4>
          <div className="flex justify-between text-center text-xs text-gray-600 border rounded-lg p-1">
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-100">
              0h-5h
            </button>
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-100">
              5h-10h
            </button>
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-100">
              10h-15h
            </button>
            <button className="flex-1 p-2 rounded hover:bg-blue-50 focus:bg-blue-100">
              15h+
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
