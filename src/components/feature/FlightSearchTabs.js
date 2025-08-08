"use client";
import { useState } from "react";
import { Plane, Building, Globe, FileText } from "lucide-react";

export default function FlightSearchTabs() {
  const [activeService, setActiveService] = useState("flight");

  const services = [
    { id: "flight", label: "Flight", icon: <Plane size={16} /> }, // Slightly smaller icon for mobile
    { id: "hotel", label: "Hotel", icon: <Building size={16} /> },
    { id: "tour", label: "Tour", icon: <Globe size={16} /> },
    { id: "visa", label: "Visa", icon: <FileText size={16} /> },
  ];

  return (
    <div className="w-full flex justify-center relative z-30 mb-[-20px]">
      {/* ✅ Container is now horizontally scrollable if content overflows */}
      <div className="bg-white rounded-3xl shadow-lg flex p-1 overflow-x-auto whitespace-nowrap">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveService(service.id)}
            // ✅ Padding and gap are now responsive
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 transition-all duration-300 relative rounded-2xl ${
              activeService === service.id
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {service.icon}
            <span
              // ✅ Font size is now responsive
              className="text-xs sm:text-sm md:text-base"
            >
              {service.label}
            </span>
            {activeService === service.id && (
              // ✅ Underline is responsive
              <div className="absolute bottom-0.5 left-3 right-3 sm:left-4 sm:right-4 h-1 bg-yellow-400 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
