"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  isDualMonth = false,
  label = "Select date",
  onClose,
  onOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });
  const dropdownRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateObj = minDate ? new Date(minDate) : today;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleOpen = () => {
    onOpen?.(); // Close other selectors
    setIsOpen(!isOpen);
  };

  const formatDate = (dateString) => {
    if (!dateString) return { full: "", dayName: "" };
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear().toString().slice(-2);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    return { full: `${day} ${month}'${year}`, dayName };
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < minDateObj;
  };

  const isDateSelected = (date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === selectedDate.getTime();
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    onChange(dateString);
    setIsOpen(false);
    onClose?.();
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = (monthDate, isSecondMonth = false) => {
    const days = getDaysInMonth(monthDate);
    const monthName = monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {!isSecondMonth && (
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1 hover:bg-gray-100 rounded-full"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h3 className="text-lg font-medium text-gray-700 flex-1 text-center">
            {monthName}
          </h3>
          {(!isDualMonth || isSecondMonth) && (
            <button
              onClick={() => navigateMonth("next")}
              className="p-1 hover:bg-gray-100 rounded-full"
              type="button"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {isSecondMonth && <div className="w-7" />}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-10" />;
            }

            const isDisabled = isDateDisabled(date);
            const isSelected = isDateSelected(date);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={isDisabled}
                className={`
                  h-10 w-10 rounded-lg text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
                type="button"
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(currentMonth.getMonth() + 1);

  return (
    <div className="relative">
      <div onClick={handleOpen} className="cursor-pointer">
        {value ? (
          <>
            <p className="font-bold text-blue-900 text-base sm:text-lg">
              {formatDate(value).full}
            </p>
            <p className="text-xs text-gray-400">{formatDate(value).dayName}</p>
          </>
        ) : (
          <p className="text-gray-400 text-base">{placeholder}</p>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] min-w-max"
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-700 text-center">
              {label}
            </h2>
          </div>

          <div
            className={`flex ${isDualMonth ? "divide-x divide-gray-200" : ""}`}
          >
            {renderCalendar(currentMonth)}
            {isDualMonth && renderCalendar(nextMonth, true)}
          </div>
        </div>
      )}
    </div>
  );
}
