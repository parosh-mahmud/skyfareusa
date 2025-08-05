"use client";
import { useRef, useEffect } from "react";
import { Search, Loader } from "lucide-react";

const SuggestionsList = ({
  suggestions,
  isLoading,
  onSelect,
  dropdownRef,
  query,
  onQueryChange,
  placeholder,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] max-h-80 flex flex-col"
    >
      <div className="p-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={onQueryChange}
            placeholder={placeholder || "Type to search"}
            className="w-full bg-gray-50 border border-gray-200 rounded-md py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-blue-300 text-sm text-gray-600"
          />
        </div>
      </div>
      <div className="overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((airport) => (
            <div
              key={airport.iata}
              onClick={() => onSelect(airport)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-900 text-sm truncate">
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {airport.name}
                  </p>
                </div>
                <p className="font-mono text-sm text-gray-400 font-medium ml-3 flex-shrink-0">
                  {airport.iata}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">
              {query.length >= 2
                ? "No airports found."
                : "Type to search airports"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AirportSelector({
  label,
  value,
  onSelect,
  isActive,
  onActivate,
  suggestions,
  isLoading,
  query,
  onQueryChange,
  variant = "main",
  className = "",
}) {
  const dropdownRef = useRef(null);

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
          {label}
        </label>
        <div
          onClick={onActivate}
          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 bg-white transition-colors"
        >
          <p className="font-bold text-blue-900 truncate">
            {value?.name || "Select"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {value?.code ? `${value.code}, ${value.airportName}` : ""}
          </p>
        </div>
        {isActive && (
          <SuggestionsList
            suggestions={suggestions}
            isLoading={isLoading}
            onSelect={onSelect}
            dropdownRef={dropdownRef}
            query={query}
            onQueryChange={onQueryChange}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div onClick={onActivate} className="cursor-pointer">
        <p className="text-xs text-gray-500 uppercase font-medium mb-2">
          {label}
        </p>
        <p className="text-xl font-bold text-blue-900 truncate">
          {value?.name || "Select"}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {value?.airportName || ""}
        </p>
      </div>
      {isActive && (
        <SuggestionsList
          suggestions={suggestions}
          isLoading={isLoading}
          onSelect={onSelect}
          dropdownRef={dropdownRef}
          query={query}
          onQueryChange={onQueryChange}
        />
      )}
    </div>
  );
}
