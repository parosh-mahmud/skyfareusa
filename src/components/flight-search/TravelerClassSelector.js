"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";

// This is the popover UI for selecting travelers and class
const TravelerPopover = ({
  passengers,
  onPassengersChange,
  cabinClass,
  onCabinClassChange,
  onClose,
}) => {
  const popoverRef = useRef(null);

  // This hook handles closing the popover when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const updatePassengerCount = (type, change) => {
    const newPassengers = [...passengers];
    const currentCount = newPassengers.filter((p) => p.type === type).length;
    const totalPassengers = newPassengers.length;
    const adults = newPassengers.filter((p) => p.type === "adult");

    if (change > 0 && totalPassengers < 9) {
      // Limit to 9 total passengers
      if (type === "infant" && adults.length === 0) {
        // Infants must travel with an adult, so do nothing if no adults
        return;
      }

      const passenger = {
        type: type === "infant" ? "infant_without_seat" : type,
        age: type === "adult" ? 30 : type === "child" ? 8 : 1,
        id: (totalPassengers + 1).toString(),
      };

      // Find the first adult to associate with the infant
      if (type === "infant") {
        const firstAdult = adults[0];
        if (firstAdult) {
          passenger.associatedAdultId = firstAdult.id;
        }
      }
      newPassengers.push(passenger);
    } else if (change < 0) {
      // Ensure at least one adult
      if (type === "adult" && currentCount <= 1) return;
      if (currentCount > 0) {
        const index = newPassengers.findIndex((p) => p.type === type);
        if (index !== -1) newPassengers.splice(index, 1);
      }
    }
    onPassengersChange(newPassengers);
  };

  const getPassengerCount = (type) =>
    passengers.filter(
      (p) => p.type === type || p.type === "infant_without_seat"
    ).length;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl z-[100] w-80 p-6 border"
    >
      <div className="space-y-4">
        {/* Passenger Counters */}
        {[
          { type: "adult", label: "Adults", desc: "12+ years" },
          { type: "child", label: "Children", desc: "2-11 years" },
          { type: "infant", label: "Infants", desc: "Below 2 years" },
        ].map((pax) => (
          <div key={pax.type} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{pax.label}</p>
              <p className="text-sm text-gray-500">{pax.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updatePassengerCount(pax.type, -1)}
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-lg">
                {getPassengerCount(pax.type)}
              </span>
              <button
                type="button"
                onClick={() => updatePassengerCount(pax.type, 1)}
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {/* Class Selection */}
        <div className="pt-4 border-t">
          <p className="font-semibold text-gray-800 mb-2">Cabin Class</p>
          <select
            value={cabinClass}
            onChange={(e) => onCabinClassChange(e.target.value)}
            className="w-full border-gray-200 border rounded-lg p-2 text-sm"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// This is the main component you will use in your form
export default function TravelerClassSelector({
  passengers,
  onPassengersChange,
  cabinClass,
  onCabinClassChange,
  variant = "main",
  onOpen,
  displayVariant = "default", // Add this prop
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // This closes the popover if you click outside the main component trigger
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleOpen = () => {
    onOpen?.(); // Close other selectors
    setIsOpen(!isOpen);
  };

  const totalPassengers = passengers.length;
  const passengerText = `${totalPassengers} Traveler${
    totalPassengers > 1 ? "s" : ""
  }`;
  const cabinClassText = cabinClass
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  if (variant === "compact") {
    return (
      <div ref={wrapperRef} className="relative">
        <div onClick={handleOpen} className="cursor-pointer">
          <p className="font-bold text-blue-900 text-lg">{passengerText}</p>
          <p className="text-sm text-gray-500">{cabinClassText}</p>
        </div>
        {isOpen && (
          <TravelerPopover
            onClose={() => setIsOpen(false)}
            passengers={passengers}
            onPassengersChange={onPassengersChange}
            cabinClass={cabinClass}
            onCabinClassChange={onCabinClassChange}
          />
        )}
      </div>
    );
  }

  // Main variant
  return (
    <div ref={wrapperRef} className="relative">
      <div onClick={handleOpen} className="cursor-pointer">
        <p className="text-xs text-blue-600 font-medium mb-2 uppercase">
          TRAVELER, CLASS
        </p>
        <div className="flex items-center gap-2">
          <div>
            <p
              className={`text-base sm:text-lg font-bold text-blue-900 ${
                displayVariant === "compact" ? "text-lg" : ""
              }`}
            >
              {passengerText}
            </p>
            <p
              className={`text-xs text-gray-400 ${
                displayVariant === "compact" ? "text-sm" : ""
              }`}
            >
              {cabinClassText}
            </p>
          </div>
        </div>
      </div>
      {isOpen && (
        <TravelerPopover
          onClose={() => setIsOpen(false)}
          passengers={passengers}
          onPassengersChange={onPassengersChange}
          cabinClass={cabinClass}
          onCabinClassChange={onCabinClassChange}
        />
      )}
    </div>
  );
}
