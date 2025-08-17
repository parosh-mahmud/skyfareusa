// This is a React component for a booking confirmation page, written in plain JavaScript.
// It uses React's Suspense feature to handle the loading state while fetching data.

// The BookingConfirmation component will be dynamically imported later.
import { Suspense } from "react";
// Import the component that will display the booking details.
import BookingConfirmation from "./BookingConfirmation";
// Import the Loader icon from lucide-react for the loading state.
import { Loader } from "lucide-react";

/**
 * Renders the booking confirmation page.
 * @param {object} props - The component properties.
 * @param {object} props.params - The parameters from the route.
 * @param {string} props.params.reference - The booking reference ID from the URL.
 */
export default function BookingConfirmationPage({ params }) {
  // Define a simple loading fallback component to be displayed while the main content loads.
  const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* The Loader icon from lucide-react, with a spinning animation. */}
      <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Loading Booking Details...
      </p>
    </div>
  );

  return (
    // The Suspense component wraps the part of the UI that might take time to load.
    // It shows the fallback UI (LoadingFallback) until the BookingConfirmation component is ready.
    <Suspense fallback={<LoadingFallback />}>
      {/* The BookingConfirmation component, which will fetch and display the data. */}
      {/* We pass the booking reference from the URL parameters as a prop. */}
      <BookingConfirmation reference={params.reference} />
    </Suspense>
  );
}
