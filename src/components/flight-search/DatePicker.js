"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  isDualMonth = false,
  onOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date) => {
    // date-fns format will convert the date object to 'YYYY-MM-DD' string
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const fromDate = minDate ? new Date(minDate) : new Date();
  const selectedDate = value ? new Date(value) : null;

  const formatDate = (dateString) => {
    if (!dateString) return { full: "", dayName: "" };
    const d = new Date(dateString);
    // Adjust for timezone offset to prevent date shifting
    const adjustedDate = new Date(d.valueOf() + d.getTimezoneOffset() * 60000);
    const day = adjustedDate.getDate();
    const month = adjustedDate.toLocaleDateString("en-US", { month: "short" });
    const year = adjustedDate.getFullYear().toString().slice(-2);
    const dayName = adjustedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    return { full: `${day} ${month}'${year}`, dayName };
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) onOpen?.();
      }}
    >
      <PopoverTrigger asChild>
        <div className="cursor-pointer w-full">
          {value ? (
            <>
              <p className="font-bold text-foreground text-base sm:text-lg">
                {formatDate(value).full}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(value).dayName}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-base">{placeholder}</p>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          fromDate={fromDate}
          numberOfMonths={isDualMonth ? 2 : 1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
