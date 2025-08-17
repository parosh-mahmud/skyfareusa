// src/components/flight-search/TravelerClassSelector.js
"use client";

import { Plus, Minus } from "lucide-react";

// Import your custom UI components

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";

// Helper component for the popover content to keep the main component clean
const TravelerPopoverContent = ({
  passengers,
  onPassengersChange,
  cabinClass,
  onCabinClassChange,
}) => {
  const updatePassengerCount = (type, change) => {
    const newPassengers = [...passengers];
    const totalPassengers = newPassengers.length;

    // --- Start of Addition Logic ---
    if (change > 0) {
      if (totalPassengers >= 9) return; // Max 9 passengers

      // Infants must be associated with an adult
      const adults = newPassengers.filter((p) => p.type === "adult");
      if (type === "infant" && adults.length === 0) {
        // You could show a toast notification here
        console.warn("An infant must travel with an adult.");
        return;
      }

      // Infants cannot outnumber adults
      const infants = newPassengers.filter(
        (p) => p.type === "infant_without_seat"
      );
      if (type === "infant" && infants.length >= adults.length) {
        console.warn("Number of infants cannot exceed the number of adults.");
        return;
      }

      const passenger = {
        type: type === "infant" ? "infant_without_seat" : type,
        age: type === "adult" ? 30 : type === "child" ? 8 : 1,
        id: `passenger_${totalPassengers + 1}`, // More robust ID
      };

      if (type === "infant") {
        passenger.associatedAdultId = adults[0].id;
      }
      newPassengers.push(passenger);
    }
    // --- End of Addition Logic ---

    // --- Start of Subtraction Logic ---
    else if (change < 0) {
      const currentCount = newPassengers.filter(
        (p) =>
          p.type === type ||
          (type === "infant" && p.type === "infant_without_seat")
      ).length;

      // Must have at least one adult
      if (type === "adult" && currentCount <= 1) return;

      if (currentCount > 0) {
        const indexToRemove = newPassengers.findLastIndex(
          (p) =>
            p.type === type ||
            (type === "infant" && p.type === "infant_without_seat")
        );
        if (indexToRemove !== -1) {
          const removedPassenger = newPassengers[indexToRemove];
          newPassengers.splice(indexToRemove, 1);

          // If an adult is removed, re-associate their infant if necessary
          if (removedPassenger.type === "adult") {
            const associatedInfantIndex = newPassengers.findIndex(
              (p) => p.associatedAdultId === removedPassenger.id
            );
            if (associatedInfantIndex !== -1) {
              const firstAdult = newPassengers.find((p) => p.type === "adult");
              if (firstAdult) {
                newPassengers[associatedInfantIndex].associatedAdultId =
                  firstAdult.id;
              } else {
                // This case should be handled, maybe remove the infant too
                newPassengers.splice(associatedInfantIndex, 1);
              }
            }
          }
        }
      }
    }
    // --- End of Subtraction Logic ---
    onPassengersChange(newPassengers);
  };

  const getPassengerCount = (type) =>
    passengers.filter(
      (p) =>
        p.type === type ||
        (type === "infant" && p.type === "infant_without_seat")
    ).length;

  return (
    <PopoverContent className="w-80" align="end">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Travelers</h4>
          <p className="text-sm text-muted-foreground">
            Select the number of passengers.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            { type: "adult", label: "Adults", desc: "12+ years" },
            { type: "child", label: "Children", desc: "2-11 years" },
            { type: "infant", label: "Infants", desc: "Below 2 years" },
          ].map((pax) => (
            <div key={pax.type} className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1">
                {pax.label}
                <p className="font-light text-xs text-muted-foreground">
                  {pax.desc}
                </p>
              </Label>
              <div className="flex items-center justify-end gap-2 col-span-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updatePassengerCount(pax.type, -1)}
                  disabled={
                    getPassengerCount(pax.type) ===
                    (pax.type === "adult" ? 1 : 0)
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg">
                  {getPassengerCount(pax.type)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updatePassengerCount(pax.type, 1)}
                  disabled={passengers.length >= 9}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="grid gap-2">
          <Label>Cabin Class</Label>
          <Select value={cabinClass} onValueChange={onCabinClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium_economy">Premium Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </PopoverContent>
  );
};

// This is the main component you will use in your form
export default function TravelerClassSelector({
  passengers,
  onPassengersChange,
  cabinClass,
  onCabinClassChange,
  variant = "main", // "main" or "compact"
}) {
  const totalPassengers = passengers.length;
  const passengerText = `${totalPassengers} Traveler${
    totalPassengers > 1 ? "s" : ""
  }`;
  const cabinClassText = cabinClass
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const triggerContent =
    variant === "compact" ? (
      <div>
        <p className="font-bold text-lg">{passengerText}</p>
        <p className="text-sm text-muted-foreground">{cabinClassText}</p>
      </div>
    ) : (
      <div>
        <p className="text-xs uppercase tracking-wider">Traveler, Class</p>
        <p className="text-base sm:text-lg font-bold text-foreground">
          {passengerText}
        </p>
        <p className="text-xs text-muted-foreground">{cabinClassText}</p>
      </div>
    );

  return (
    <Popover>
      <PopoverTrigger className="text-left w-full cursor-pointer">
        {triggerContent}
      </PopoverTrigger>
      <TravelerPopoverContent
        passengers={passengers}
        onPassengersChange={onPassengersChange}
        cabinClass={cabinClass}
        onCabinClassChange={onCabinClassChange}
      />
    </Popover>
  );
}
