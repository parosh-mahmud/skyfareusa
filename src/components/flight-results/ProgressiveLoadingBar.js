//src/app/flight-results/ProgressiveLoadingBar.js
"use client";
import { Plane, Zap, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const ProgressiveLoadingBar = ({
  progress,
  currentPhase,
  loadedFlights,
  isComplete,
}) => {
  const phases = [
    { id: "instant", label: "Instant Results", icon: Zap },
    { id: "cheapest", label: "Cheapest Flights", icon: DollarSign },
    { id: "best", label: "Best Value", icon: Plane },
  ];

  const currentPhaseData =
    phases.find((p) => p.id === currentPhase) || phases[0];

  if (isComplete) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Search Complete</span>
            </div>
            <Badge variant="secondary">{loadedFlights} flights found</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <currentPhaseData.icon className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-semibold text-foreground">
              Loading {currentPhaseData.label}...
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {loadedFlights}+ flights found
          </span>
        </div>

        <Progress value={progress} className="h-2 mb-2" />

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`flex items-center gap-1 ${
                phase.id === currentPhase ? "text-primary font-semibold" : ""
              }`}
            >
              <phase.icon className="w-3 h-3" />
              <span>{phase.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressiveLoadingBar;
