"use client";

import { Loader, Plane } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
} from "@/components/ui/command";
import { Card } from "@/components/ui/card";

export default function SuggestionsList({
  suggestions,
  isLoading,
  query,
  onQueryChange,
  onSelect,
  dropdownRef,
  placeholder = "Type to search airports",
}) {
  const emptyMessage =
    query.length < 2
      ? "Type at least 2 characters to search"
      : `No airports found for "${query}"`;

  return (
    <Card
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-[100] mt-1"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={onQueryChange} // Command uses onValueChange, passing the string value directly
          placeholder={placeholder}
          autoFocus
        />
        <CommandList>
          {isLoading ? (
            <CommandLoading>
              <div className="flex items-center justify-start p-4 text-muted-foreground">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            </CommandLoading>
          ) : (
            <>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((airport) => (
                    <CommandItem
                      key={airport.iata}
                      value={`${airport.city} ${airport.iata} ${airport.name}`} // Value used for accessibility and internal logic
                      onSelect={() => onSelect(airport)}
                      className="flex flex-col items-start"
                    >
                      <div className="font-medium text-sm">
                        {airport.city} ({airport.iata})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {airport.name}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        {airport.country}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </Card>
  );
}
