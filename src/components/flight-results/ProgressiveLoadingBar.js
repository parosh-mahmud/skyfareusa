"use client";
import { Plane, Zap, DollarSign } from "lucide-react";

const ProgressiveLoadingBar = ({
  progress,
  currentPhase,
  totalFlights,
  loadedFlights,
  isComplete,
}) => {
  const phases = [
    {
      id: "instant",
      label: "Instant Results",
      icon: Zap,
      color: "bg-green-500",
    },
    {
      id: "cheapest",
      label: "Cheapest Flights",
      icon: DollarSign,
      color: "bg-blue-500",
    },
    { id: "best", label: "Best Value", icon: Plane, color: "bg-purple-500" },
    { id: "all", label: "All Options", icon: Plane, color: "bg-gray-500" },
  ];

  const currentPhaseData =
    phases.find((p) => p.id === currentPhase) || phases[0];

  if (isComplete) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <Plane className="w-5 h-5" />
            <span className="font-semibold">Search Complete</span>
          </div>
          <span className="text-sm text-gray-600">
            {loadedFlights} flights found
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <currentPhaseData.icon className="w-5 h-5 text-blue-600 animate-pulse" />
          <span className="font-semibold text-gray-800">
            Loading {currentPhaseData.label}...
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {loadedFlights} of {totalFlights}+ flights
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${currentPhaseData.color}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={`flex items-center gap-1 ${
              phase.id === currentPhase ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <phase.icon className="w-3 h-3" />
            <span>{phase.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressiveLoadingBar;
