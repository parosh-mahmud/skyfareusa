"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Internal Calendar UI Component (No changes needed, but included for completeness)
const CalendarPopover = ({
  onClose,
  selectedDate,
  onDateSelect,
  minDate,
  title,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate
      ? new Date(selectedDate.replace(/-/g, "/"))
      : new Date();
    const minDateObj = minDate
      ? new Date(minDate.replace(/-/g, "/"))
      : new Date(1970);
    return date < minDateObj ? minDateObj : date;
  });
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= lastDate; day++)
      days.push(new Date(year, month, day));
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const min = new Date(minDate.replace(/-/g, "/"));
    min.setHours(0, 0, 0, 0);
    return date < min;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    const selected = new Date(selectedDate.replace(/-/g, "/"));
    return date.toDateString() === selected.toDateString();
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(date.toISOString().split("T")[0]);
    onClose();
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
    );
  };

  const canGoToPrevMonth = () => {
    if (!minDate) return true;
    const prevMonthLastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    );
    const minDateFirstDay = new Date(
      new Date(minDate).getFullYear(),
      new Date(minDate).getMonth(),
      1
    );
    return prevMonthLastDay >= minDateFirstDay;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div
      ref={calendarRef}
      className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl p-4 z-50 w-80"
    >
      <h3 className="font-semibold text-center mb-2">{title}</h3>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          disabled={!canGoToPrevMonth()}
          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h4 className="font-semibold">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium">
        {weekDays.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <button
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                className={`w-full h-full text-sm rounded-full transition-colors ${
                  isDateSelected(date)
                    ? "bg-blue-600 text-white"
                    : isDateDisabled(date)
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main DateSelector Component ---
export default function DateSelector({
  departureDate,
  returnDate,
  onDepartureChange,
  onReturnChange,
  tripType,
  onTripTypeChange,
  variant = "main",
}) {
  const [activePicker, setActivePicker] = useState(null);

  // FIX: Use separate refs for each popover area to handle outside clicks correctly
  const departureRef = useRef(null);
  const returnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      // Close if click is outside both departure and return refs
      if (
        departureRef.current &&
        !departureRef.current.contains(event.target) &&
        returnRef.current &&
        !returnRef.current.contains(event.target)
      ) {
        setActivePicker(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = (dateString) => {
    if (!dateString)
      return {
        day: "DD",
        month: "MMM",
        year: "YY",
        dayName: "Day",
        full: "Select Date",
      };
    // FIX: Replace hyphens with slashes for reliable cross-browser date parsing
    const date = new Date(dateString.replace(/-/g, "/"));
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    return { day, month, year, dayName, full: `${day} ${month}'${year}` };
  };

  if (variant === "compact") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div ref={departureRef} className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
            DEPARTURE
          </label>
          <div
            onClick={() =>
              setActivePicker(activePicker === "departure" ? null : "departure")
            }
            className="p-3 border rounded-lg bg-white cursor-pointer h-[58px]"
          >
            <p className="font-bold text-blue-900">
              {formatDateDisplay(departureDate).full}
            </p>
            <p className="text-xs text-gray-400">
              {formatDateDisplay(departureDate).dayName}
            </p>
          </div>
          {activePicker === "departure" && (
            <CalendarPopover
              onClose={() => setActivePicker(null)}
              selectedDate={departureDate}
              onDateSelect={onDepartureChange}
              minDate={new Date().toISOString().split("T")[0]}
              title="Select Departure Date"
            />
          )}
        </div>
        <div ref={returnRef} className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">
            RETURN
          </label>
          <div
            onClick={() => {
              if (tripType === "round-trip")
                setActivePicker(activePicker === "return" ? null : "return");
              else onTripTypeChange("round-trip");
            }}
            className="p-3 border rounded-lg bg-white cursor-pointer h-[58px]"
          >
            {tripType === "round-trip" ? (
              returnDate ? (
                <>
                  <p className="font-bold text-blue-900">
                    {formatDateDisplay(returnDate).full}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateDisplay(returnDate).dayName}
                  </p>
                </>
              ) : (
                <p className="text-gray-400">Select date</p>
              )
            ) : (
              <p className="text-xs text-gray-500">Click to add return</p>
            )}
          </div>
          {activePicker === "return" && (
            <CalendarPopover
              onClose={() => setActivePicker(null)}
              selectedDate={returnDate}
              onDateSelect={onReturnChange}
              minDate={departureDate || new Date().toISOString().split("T")[0]}
              title="Select Return Date"
            />
          )}
        </div>
      </div>
    );
  }

  // Main variant
  return (
    <>
      <div
        ref={departureRef}
        className="p-5 border-b md:border-b-0 md:border-r relative"
      >
        <div
          onClick={() =>
            setActivePicker(activePicker === "departure" ? null : "departure")
          }
          className="cursor-pointer"
        >
          <p className="text-xs text-gray-500 uppercase font-medium mb-2">
            DEPARTURE DATE
          </p>
          <p className="text-blue-900 mb-1">
            <span className="text-xl font-bold">
              {formatDateDisplay(departureDate).day}
            </span>
            <span className="text-base font-semibold ml-1">
              {formatDateDisplay(departureDate).month}'
              {formatDateDisplay(departureDate).year}
            </span>
          </p>
          <p className="text-xs text-gray-400">
            {formatDateDisplay(departureDate).dayName}
          </p>
        </div>
        {activePicker === "departure" && (
          <CalendarPopover
            onClose={() => setActivePicker(null)}
            selectedDate={departureDate}
            onDateSelect={onDepartureChange}
            minDate={new Date().toISOString().split("T")[0]}
            title="Select Departure Date"
          />
        )}
      </div>

      <div
        ref={returnRef}
        className="p-5 border-b md:border-b-0 md:border-r relative"
      >
        <div
          onClick={() => {
            if (tripType === "round-trip")
              setActivePicker(activePicker === "return" ? null : "return");
            else onTripTypeChange("round-trip");
          }}
          className="cursor-pointer"
        >
          <p className="text-xs text-gray-500 uppercase font-medium mb-2">
            RETURN DATE
          </p>
          {tripType === "round-trip" ? (
            returnDate ? (
              <>
                <p className="text-blue-900 mb-1">
                  <span className="text-xl font-bold">
                    {formatDateDisplay(returnDate).day}
                  </span>
                  <span className="text-base font-semibold ml-1">
                    {formatDateDisplay(returnDate).month}'
                    {formatDateDisplay(returnDate).year}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  {formatDateDisplay(returnDate).dayName}
                </p>
              </>
            ) : (
              <p className="font-medium text-gray-500">Select Date</p>
            )
          ) : (
            <p className="text-xs text-gray-500 mt-3 leading-tight">
              Save more on return
            </p>
          )}
        </div>
        {activePicker === "return" && (
          <CalendarPopover
            onClose={() => setActivePicker(null)}
            selectedDate={returnDate}
            onDateSelect={onReturnChange}
            minDate={departureDate || new Date().toISOString().split("T")[0]}
            title="Select Return Date"
          />
        )}
      </div>
    </>
  );
}
