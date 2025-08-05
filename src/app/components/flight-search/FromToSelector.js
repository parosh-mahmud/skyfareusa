"use client";
import { ArrowRightLeft } from "lucide-react";
import AirportSelector from "./AirportSelector";

export default function FromToSelector({
  fromValue,
  toValue,
  onFromSelect,
  onToSelect,
  onSwap,
  activeSelector,
  onActivateSelector,
  suggestions,
  isLoading,
  query,
  onQueryChange,
  variant = "main",
}) {
  if (variant === "compact") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <AirportSelector
          label="FROM"
          value={fromValue}
          onSelect={onFromSelect}
          isActive={activeSelector === "from"}
          onActivate={() => onActivateSelector("from")}
          suggestions={suggestions}
          isLoading={isLoading}
          query={query}
          onQueryChange={onQueryChange}
          variant="compact"
          className="airport-selector-trigger"
        />
        <div className="relative">
          <button
            type="button"
            onClick={onSwap}
            className="absolute -left-3 top-8 z-10 p-1.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-3 h-3 text-gray-600" />
          </button>
          <AirportSelector
            label="TO"
            value={toValue}
            onSelect={onToSelect}
            isActive={activeSelector === "to"}
            onActivate={() => onActivateSelector("to")}
            suggestions={suggestions}
            isLoading={isLoading}
            query={query}
            onQueryChange={onQueryChange}
            variant="compact"
            className="airport-selector-trigger"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border-b md:border-b-0 md:border-r airport-selector-trigger bg-blue-50">
        <AirportSelector
          label="FROM"
          value={fromValue}
          onSelect={onFromSelect}
          isActive={activeSelector === "from"}
          onActivate={() => onActivateSelector("from")}
          suggestions={suggestions}
          isLoading={isLoading}
          query={query}
          onQueryChange={onQueryChange}
        />
      </div>
      <div className="relative p-5 border-b md:border-b-0 md:border-r airport-selector-trigger bg-white">
        <button
          type="button"
          onClick={onSwap}
          className="absolute left-0 top-1/2 -translate-x-1/2 p-2 bg-white rounded-full border border-gray-200 shadow-md hover:bg-gray-50 transition-colors z-10"
        >
          <ArrowRightLeft className="w-4 h-4 text-gray-600" />
        </button>
        <AirportSelector
          label="TO"
          value={toValue}
          onSelect={onToSelect}
          isActive={activeSelector === "to"}
          onActivate={() => onActivateSelector("to")}
          suggestions={suggestions}
          isLoading={isLoading}
          query={query}
          onQueryChange={onQueryChange}
        />
      </div>
    </>
  );
}
