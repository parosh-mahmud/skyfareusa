// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { usePricingStore, useBookingStore } from "../../lib/store";
// import PriceDisplaySection from "../../components/payment/PriceDisplaySection";
// import StripePaymentForm from "../../../components/StripePaymentForm";
// import { ArrowLeft, Shield, CreditCard, CheckCircle } from "lucide-react";

// export default function PaymentClientComponent() {
//   const router = useRouter();
//   const { pricedOffer, selectedServices, passengerDetails } = useBookingStore();
//   const [paymentStep, setPaymentStep] = useState("payment");
//   const [bookingReference, setBookingReference] = useState("");

//   useEffect(() => {
//     if (!pricedOffer) {
//       router.push("/");
//       return;
//     }
//   }, [pricedOffer, router]);

//   const calculateTotalPrice = () => {
//     if (!pricedOffer) return 0;

//     const basePrice = Number.parseFloat(pricedOffer.total_amount || 0);
//     const servicesPrice =
//       selectedServices?.reduce((total, service) => {
//         return (
//           total + Number.parseFloat(service.price || service.total_amount || 0)
//         );
//       }, 0) || 0;

//     return basePrice + servicesPrice;
//   };

//   const handlePaymentSuccess = (orderId) => {
//     console.log("[v0] Payment successful! Order ID:", orderId);
//     setPaymentStep("success");
//     setBookingReference(orderId);

//     // Redirect to confirmation page after a delay
//     setTimeout(() => {
//       router.push(`/flights/confirmation?booking=${orderId}`);
//     }, 3000);
//   };

//   if (!pricedOffer) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 mb-4">No flight selected</p>
//           <button
//             onClick={() => router.push("/")}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//           >
//             Search Flights
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (paymentStep === "success") {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
//           <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Payment Successful!
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Your booking has been confirmed. Reference:{" "}
//             <strong>{bookingReference}</strong>
//           </p>
//           <p className="text-sm text-gray-500">
//             Redirecting to confirmation page...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const paymentDetails = {
//     amount: calculateTotalPrice(),
//     currency: pricedOffer.total_currency || "USD",
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <button
//               onClick={() => router.back()}
//               className="flex items-center text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="w-5 h-5 mr-2" />
//               Back
//             </button>
//             <h1 className="text-xl font-semibold text-gray-900">
//               Complete Payment
//             </h1>
//             <div className="w-20"></div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-1">
//             <PriceDisplaySection />

//             <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
//                 <div className="text-sm">
//                   <p className="font-medium text-blue-900 mb-1">
//                     Secure Payment
//                   </p>
//                   <p className="text-blue-700">
//                     Your payment is protected by 256-bit SSL encryption and
//                     processed securely through Stripe.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
//               <div className="flex items-center mb-6">
//                 <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   Payment Details
//                 </h2>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-medium text-gray-900">
//                     Total Amount
//                   </span>
//                   <span className="text-2xl font-bold text-blue-600">
//                     {paymentDetails.currency} {paymentDetails.amount.toFixed(2)}
//                   </span>
//                 </div>
//                 {selectedServices && selectedServices.length > 0 && (
//                   <div className="mt-2 text-sm text-gray-600">
//                     <p>
//                       Includes {selectedServices.length} additional service
//                       {selectedServices.length > 1 ? "s" : ""}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <StripePaymentForm
//                 offer={pricedOffer}
//                 passengers={passengerDetails}
//                 selectedServices={selectedServices}
//                 payment={paymentDetails}
//                 onSuccess={handlePaymentSuccess}
//               />

//               <div className="mt-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
//                 <p>
//                   By completing this payment, you agree to our{" "}
//                   <a href="/terms" className="text-blue-600 hover:underline">
//                     Terms of Service
//                   </a>{" "}
//                   and{" "}
//                   <a href="/privacy" className="text-blue-600 hover:underline">
//                     Privacy Policy
//                   </a>
//                   . Your booking is subject to the airline's terms and
//                   conditions.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
