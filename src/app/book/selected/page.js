// // src/app/book/selected/page.js
// import { Suspense } from "react";
// import SelectedClientComponent from "./SelectedClientComponent";
// import { Loader } from "lucide-react";

// export default function ReviewPage() {
//   const LoadingFallback = () => (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//       <Loader className="w-12 h-12 text-blue-600 animate-spin" />
//       <p className="mt-4 text-lg font-semibold text-gray-700">
//         Loading Your Selection...
//       </p>
//     </div>
//   );

//   return (
//     <Suspense fallback={<LoadingFallback />}>
//       <SelectedClientComponent />
//     </Suspense>
//   );
// }

// src/app/book/selected/page.js
import { Suspense } from "react";
import SelectedClientComponent from "src/components/bookingv2/selected-client-component";
import { Loader } from "lucide-react";

export default function ReviewPage() {
  const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Loading Your Selection...
      </p>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SelectedClientComponent />
    </Suspense>
  );
}
