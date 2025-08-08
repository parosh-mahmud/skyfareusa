"use client";

import { Loader } from "lucide-react";

export default function SuggestionsList({
  suggestions,
  isLoading,
  query,
  onQueryChange,
  onSelect,
  dropdownRef,
  placeholder = "Type to search airports",
}) {
  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl z-[100] mt-1"
    >
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          value={query}
          onChange={onQueryChange}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-sm"
          autoFocus
        />
      </div>

      <div className="max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-start p-4 text-gray-500">
            <Loader className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Searching...</span>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((airport, idx) => (
            <div
              key={idx}
              onClick={() => onSelect(airport)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900 text-sm">
                {airport.city} ({airport.iata})
              </div>
              <div className="text-xs text-gray-500">{airport.name}</div>
              <div className="text-xs text-gray-400">{airport.country}</div>
            </div>
          ))
        ) : query.length >= 2 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {`No airports found for "${query}"`} {/* Corrected this line */}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Type at least 2 characters to search
          </div>
        )}
      </div>
    </div>
  );
}
