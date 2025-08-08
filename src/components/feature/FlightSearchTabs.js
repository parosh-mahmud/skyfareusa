"use client";
import { useState } from "react";
import { Plane, Building, Globe, FileText } from "lucide-react";

export default function FlightSearchTabs() {
  const [activeService, setActiveService] = useState("flight");

  const services = [
    { id: "flight", label: "Flight", icon: <Plane size={18} /> },
    { id: "hotel", label: "Hotel", icon: <Building size={18} /> },
    { id: "tour", label: "Tour", icon: <Globe size={18} /> },
    { id: "visa", label: "Visa", icon: <FileText size={18} /> },
  ];

  return (
    <div className="w-full flex justify-center relative z-30 mb-[-20px]">
      <div className="bg-white rounded-3xl shadow-lg inline-flex relative px-2 py-2">
        {services.map((service, index) => (
          <button
            key={service.id}
            onClick={() => setActiveService(service.id)}
            className={`flex items-center gap-2 px-6 py-3 transition-all duration-300 relative rounded-2xl ${
              activeService === service.id
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {service.icon}
            <span className="text-base">{service.label}</span>
            {activeService === service.id && (
              <div className="absolute bottom-1 left-4 right-4 h-1 bg-yellow-400 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
