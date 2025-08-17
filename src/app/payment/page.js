import { Suspense } from "react";
import PaymentClientComponent from "./PaymentClientComponent";
import { Loader } from "lucide-react";

export default function PaymentPage() {
  const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Loading Payment Page...
      </p>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentClientComponent />
    </Suspense>
  );
}
