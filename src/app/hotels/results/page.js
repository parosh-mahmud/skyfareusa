//src/app/hotels/results/page.js
import { Suspense } from "react";
import ResultsClient from "./ResultsClient";
import { Loader } from "lucide-react";

// The initial loading UI shown while the main component loads
const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Finding the best hotels for you...
      </p>
    </div>
  );
};

export default function HotelResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsClient />
    </Suspense>
  );
}
