// src/app/flights/results/page.js
// NO "use client" here. This is the Server Component wrapper.

import { Suspense } from "react";
import ResultsClientComponent from "./ResultsClientComponent";
import { Plane, Loader } from "lucide-react";

// This is the loading UI that will be shown on the server while the
// client component and its data are being loaded.
const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* <Loader className="w-12 h-12 text-blue-600 animate-spin" /> */}
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Finding the best flights for you...
      </p>
      <p className="text-gray-500">
        This can take a moment, thank you for your patience.
      </p>
    </div>
  );
};

export default function FlightResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsClientComponent />
    </Suspense>
  );
}
