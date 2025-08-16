// src/app/book/selected/SelectedClientComponent.js
"use client";

import { useBookingStore, usePricingStore } from "src/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DuffelAddServices from "./DuffelAddServices";

const useTimeRemaining = (initialMinutes = 25) => {
  const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return formatTime(timeRemaining);
};

const BookingProgress = ({ timeRemaining, currentStep, setCurrentStep }) => {
  const steps = [
    {
      id: 1,
      name: "Booking Details",
      status:
        currentStep === 1
          ? "current"
          : currentStep > 1
          ? "completed"
          : "upcoming",
    },
    {
      id: 2,
      name: "Baggage & Seat",
      status:
        currentStep === 2
          ? "current"
          : currentStep > 2
          ? "completed"
          : "upcoming",
    },
    {
      id: 3,
      name: "Review & Payment",
      status: currentStep === 3 ? "current" : "upcoming",
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-600">
            Time Remaining
          </span>
        </div>
        <div className="text-xl font-bold text-blue-500">{timeRemaining}</div>
      </div>

      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.status === "current"
                    ? "bg-orange-500 text-white"
                    : step.status === "completed"
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.status === "completed" ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  step.status === "current"
                    ? "text-orange-600"
                    : step.status === "completed"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-8">
                <div
                  className={`h-0.5 ${
                    step.status === "completed" ? "bg-green-300" : "bg-gray-200"
                  }`}
                  style={{ minWidth: "100px" }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingDetailsStep = () => {
  const { setSelectedOffer: setBookingSelectedOffer } = useBookingStore();
  const { selectedOffer } = usePricingStore();

  const handleProceed = () => {
    if (selectedOffer) {
      setBookingSelectedOffer(selectedOffer);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Booking Details
      </h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Please review your flight selection and proceed to add any additional
          services or continue to traveller details.
        </p>
      </div>
      <button
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        onClick={handleProceed}
      >
        Proceed to traveller details
      </button>
    </div>
  );
};

const ExtraBaggagesStep = ({ onNext }) => {
  const { pricedOffer, passengerDetails, setSelectedServices } =
    useBookingStore();
  console.log("Priced Offer:", pricedOffer.id);
  const handlePayloadReady = (payload) => {
    // This function will be called by DuffelAddServices when the user
    // confirms their selections.
    setSelectedServices(payload.services);
    // Move to the next step
    onNext();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Baggage & Seat Selection
      </h2>
      {pricedOffer?.sourceApi === "duffel" ? (
        <DuffelAddServices
          offer={pricedOffer}
          passengers={passengerDetails}
          onPayloadReady={handlePayloadReady}
        />
      ) : (
        <div className="text-center p-6 text-gray-500">
          Ancillary services are not available for this airline.
          <button
            onClick={onNext}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewPaymentStep = ({
  offer,
  passengerData,
  selectedServices,
  onBack,
  currency,
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showFlightDetails, setShowFlightDetails] = useState(false);

  const isAmadeusOffer =
    offer?.sourceApi === "amadeus" ||
    (offer?.slices && offer?.passengers && offer?.rawOffer && !offer?.owner);
  const isDuffelOffer =
    offer?.sourceApi === "duffel" ||
    (offer?.total_amount &&
      offer?.base_amount &&
      offer?.tax_amount &&
      !offer?.passengers);

  let flightData = {
    route: "DAC → DXB",
    airline: "Default Airways",
    airlineCode: "XX",
    departureTime: "10:00 AM",
    arrivalTime: "6:00 PM",
    date: "5 Dec, Thursday",
    duration: "8hr 00min",
    stops: "Non-Stop",
    aircraft: "Aircraft",
  };

  if (isAmadeusOffer) {
    const segments = offer.slices?.[0]?.segments;

    if (segments && segments.length > 0) {
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      const getAirlineName = (carrierCode) => {
        const airlineMap = {
          QR: "Qatar Airways",
          AI: "Air India",
          OD: "Batik Air Malaysia",
          EK: "Emirates",
          SQ: "Singapore Airlines",
        };
        return airlineMap[carrierCode] || carrierCode;
      };

      flightData = {
        route: `${firstSegment.departure?.iataCode} → ${lastSegment.arrival?.iataCode}`,
        airline: getAirlineName(firstSegment.carrierCode),
        airlineCode: firstSegment.carrierCode,
        departureTime: new Date(firstSegment.departure.at).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        ),
        arrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        ),
        date: new Date(firstSegment.departure.at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          weekday: "long",
        }),
        duration: segments.length > 1 ? "10hr 10min" : "6hr 15min",
        stops: segments.length > 1 ? `${segments.length - 1} Stop` : "Non-Stop",
        aircraft: firstSegment.aircraft?.code || "Aircraft",
      };
    }
  } else if (isDuffelOffer) {
    const firstSlice = offer.slices?.[0];
    const lastSlice = offer.slices?.[offer.slices.length - 1];
    const firstSegment = firstSlice?.segments?.[0];
    const lastSegment = firstSlice?.segments?.[firstSlice.segments.length - 1];

    if (firstSlice && lastSlice && firstSegment) {
      const calculateDuration = (departing, arriving) => {
        const dep = new Date(departing);
        const arr = new Date(arriving);
        const diffMs = arr - dep;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}hr ${minutes.toString().padStart(2, "0")}min`;
      };

      flightData = {
        route: `${firstSlice.origin?.iata_code} → ${lastSlice.destination?.iata_code}`,
        airline: firstSegment.marketing_carrier?.name || "Duffel Airways",
        airlineCode: firstSegment.marketing_carrier?.iata_code || "ZZ",
        departureTime: new Date(firstSegment.departing_at).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        ),
        arrivalTime: new Date(
          (lastSegment || firstSegment).arriving_at
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        date: new Date(firstSegment.departing_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          weekday: "long",
        }),
        duration: calculateDuration(
          firstSegment.departing_at,
          (lastSegment || firstSegment).arriving_at
        ),
        stops:
          firstSlice.segments.length > 1
            ? `${firstSlice.segments.length - 1} Stop`
            : "Non-Stop",
        aircraft: firstSegment.aircraft?.name || "Aircraft",
      };
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          Review & Payment
        </h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">
                {flightData.airlineCode}
              </span>
            </div>
            <div>
              <div className="font-semibold">{flightData.route}</div>
              <div className="text-sm text-gray-600">{flightData.airline}</div>
              <div className="text-sm text-gray-500">{flightData.duration}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{flightData.departureTime}</div>
            <div className="text-sm text-gray-600">{flightData.date}</div>
            <div className="text-sm text-gray-500">Hazrat Shahjalal...</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{flightData.arrivalTime}</div>
            <div className="text-sm text-gray-600">{flightData.date}</div>
            <div className="text-sm text-gray-500">Netaji S. Chandra...</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{flightData.stops}</div>
            <div className="text-sm text-gray-600">BOM</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600">Partially Refundable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-600">4</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-blue-600">Pay Later</span>
          </div>
          <button
            onClick={() => setShowFlightDetails(!showFlightDetails)}
            className="text-blue-600 hover:text-blue-700 ml-auto"
          >
            View Detail
            <svg
              className={`w-4 h-4 inline ml-1 transition-transform ${
                showFlightDetails ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {showFlightDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Aircraft Type</span>
                <div className="font-medium">{flightData.aircraft}</div>
              </div>
              <div>
                <span className="text-gray-600">Flight Number</span>
                <div className="font-medium">QR-2184, QR-783</div>
              </div>
              <div>
                <span className="text-gray-600">Baggage Allowance</span>
                <div className="font-medium">30kg Check-in, 7kg Cabin</div>
              </div>
              <div>
                <span className="text-gray-600">Seat Selection</span>
                <div className="font-medium">Available for fee</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {passengerData.firstName || "sdfdsfdsfs"}{" "}
          {passengerData.lastName || "fdfdfsf"} Adult
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Date of Birth</span>
            <div className="font-medium">
              {passengerData.dateOfBirth || "16 Aug, 2013"}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Gender</span>
            <div className="font-medium">{passengerData.gender || "Male"}</div>
          </div>
          <div>
            <span className="text-gray-600">Nationality</span>
            <div className="font-medium">
              {passengerData.nationality || "BD"}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Phone No.</span>
            <div className="font-medium">01934630381</div>
          </div>
          <div>
            <span className="text-gray-600">Email</span>
            <div className="font-medium">prparosh@gmail.com</div>
          </div>
          <div>
            <span className="text-gray-600">Freq. Flyer No.</span>
            <div className="font-medium">-</div>
          </div>
          <div>
            <span className="text-gray-600">Passport</span>
            <div className="font-medium">Not Taken</div>
          </div>
          <div>
            <span className="text-gray-600">Expire Date</span>
            <div className="font-medium">17 Feb, 2026</div>
          </div>
          <div>
            <span className="text-gray-600">Passport</span>
            <div className="font-medium">Not Taken</div>
          </div>
          <div>
            <span className="text-gray-600">VISA</span>
            <div className="font-medium">Not Taken</div>
          </div>
          <div>
            <span className="text-gray-600">Meal Type</span>
            <div className="font-medium">{passengerData.mealType || "-"}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Addons</h3>
        <div className="space-y-2 text-sm">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-gray-600">{service.name}</span>
              </div>
              <span className="text-gray-900">
                {service.price.toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
          />
          <span className="text-sm text-gray-700">
            I agree to the{" "}
            <button className="text-blue-600 hover:underline">Terms</button> and{" "}
            <button className="text-blue-600 hover:underline">
              Privacy Policy
            </button>
          </span>
        </label>
      </div>

      <div className="space-y-3">
        <button
          disabled={!agreedToTerms}
          className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Pay Now
        </button>
        <button className="w-full bg-orange-100 text-orange-600 py-4 rounded-lg font-semibold hover:bg-orange-200 transition-colors">
          Book Now Pay Later
        </button>
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
          </svg>
          Pay with Stripe
        </div>
      </div>
    </div>
  );
};

const PriceBreakdown = ({ offer, selectedServices = [] }) => {
  let baseAmount,
    taxAmount,
    totalAmount,
    route,
    flightDate,
    currency,
    airlineName,
    airlineCode;

  const isAmadeusOffer =
    offer?.sourceApi === "amadeus" ||
    (offer?.slices && offer?.passengers && offer?.rawOffer && !offer?.owner);
  const isDuffelOffer =
    offer?.sourceApi === "duffel" ||
    (offer?.total_amount &&
      offer?.base_amount &&
      offer?.tax_amount &&
      !offer?.passengers);

  if (isAmadeusOffer) {
    totalAmount = Number.parseFloat(
      offer.total_amount || offer.rawOffer?.price?.total || 0
    );
    currency = offer.total_currency || offer.rawOffer?.price?.currency || "USD";

    if (offer.rawOffer?.price) {
      baseAmount = Number.parseFloat(offer.rawOffer.price.base || 0);
      taxAmount = totalAmount - baseAmount;
    } else {
      baseAmount = totalAmount * 0.615;
      taxAmount = totalAmount - baseAmount;
    }

    const firstSlice = offer.slices?.[0];
    if (firstSlice?.segments && firstSlice.segments.length > 0) {
      const firstSegment = firstSlice.segments[0];
      const lastSegment = firstSlice.segments[firstSlice.segments.length - 1];

      route = `${
        firstSegment.origin?.iata_code || firstSegment.departure?.iataCode
      } → ${
        lastSegment.destination?.iata_code || lastSegment.arrival?.iataCode
      }`;

      airlineCode =
        firstSegment.carrier?.iata_code || firstSegment.carrierCode || "OD";

      const getAirlineName = (code) => {
        const names = {
          OD: "Batik Air Malaysia",
          QR: "Qatar Airways",
          AI: "Air India",
          EK: "Emirates",
        };
        return names[code] || code;
      };
      airlineName = firstSegment.carrier?.name || getAirlineName(airlineCode);

      const departureTime =
        firstSegment.departing_at || firstSegment.departure?.at;
      flightDate = departureTime
        ? new Date(departureTime).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          })
        : "25 Aug";
    } else {
      route = "DAC → DEL";
      airlineCode = "OD";
      airlineName = "Batik Air Malaysia";
      flightDate = "25 Aug";
    }
  } else if (isDuffelOffer) {
    totalAmount = Number.parseFloat(offer.total_amount || 0);
    baseAmount = Number.parseFloat(offer.base_amount || 0);
    taxAmount = Number.parseFloat(offer.tax_amount || 0);
    currency = offer.total_currency || "USD";

    const firstSlice = offer.slices?.[0];
    const lastSlice = offer.slices?.[offer.slices.length - 1];
    const originCode = firstSlice?.origin?.iata_code || "DAC";
    const destinationCode = lastSlice?.destination?.iata_code || "DXB";
    route = `${originCode} → ${destinationCode}`;

    const firstSegment = firstSlice?.segments?.[0];
    flightDate = firstSegment?.departing_at
      ? new Date(firstSegment.departing_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        })
      : "5 Dec";

    airlineCode = firstSegment?.marketing_carrier?.iata_code || "ZZ";
    airlineName = firstSegment?.marketing_carrier?.name || "Duffel Airways";
  } else {
    totalAmount = 726.67;
    baseAmount = 615.82;
    taxAmount = 110.85;
    currency = "USD";
    route = "DAC → DXB";
    flightDate = "5 Dec";
    airlineCode = "ZZ";
    airlineName = "Duffel Airways";
  }

  const convenienceFee = offer?.convenience_fee || 0;
  const discountAmount = offer?.discount_amount || 0;

  const servicesTotal = selectedServices.reduce((total, service) => {
    return total + (service.price || 0);
  }, 0);

  const finalTotal = totalAmount + servicesTotal;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">{airlineCode}</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{route}</div>
            <div className="text-sm text-gray-500">One-Way • {flightDate}</div>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
          Details
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span className="font-medium text-gray-900">Air Fare</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">
            {totalAmount.toFixed(2)} {currency}
          </span>
        </div>

        <div className="ml-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">1 x BaseFare (Adult)</span>
            <span className="text-gray-900">
              {baseAmount.toFixed(2)} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">1 x Tax (Adult)</span>
            <span className="text-gray-900">
              {taxAmount.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="space-y-2 mb-4">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-gray-600">{service.name}</span>
              </div>
              <span className="text-gray-900">
                {service.price.toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {discountAmount > 0 && (
        <div className="flex items-center justify-between py-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.549-1.165 2.30-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-orange-600">
              Discount Availed
            </span>
          </div>
          <span className="font-semibold text-orange-600">
            - {discountAmount.toFixed(2)} {currency}
          </span>
        </div>
      )}

      {convenienceFee > 0 && (
        <div className="flex items-center justify-between py-3 mb-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-gray-600">Convenience Fee</span>
            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-2 h-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <span className="font-semibold text-gray-900">
            + {convenienceFee.toFixed(2)} {currency}
          </span>
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Total Price
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {finalTotal.toFixed(2)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
};

const TravellerDetailsStep = ({ passengerData, setPassengerData, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setPassengerData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passengerData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!passengerData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Provide Traveller Details
        </h2>
        <span className="text-sm text-gray-500">0 of 1 validated</span>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <span className="font-medium text-blue-900">Primary Traveller</span>
        </div>
      </div>

      <div className="mb-6">
        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500">
          <option>Select from Favourite Travellers</option>
        </select>
      </div>

      <div className="text-center text-gray-500 text-sm mb-6">
        Or, Enter Traveller Details below
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Given Name
          </label>
          <input
            type="text"
            value={passengerData.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter given name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={passengerData.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="Enter surname"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={passengerData.gender || ""}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.gender ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Nationality <span className="text-red-500">*</span>
          </label>
          <select
            value={passengerData.nationality || "Bangladesh"}
            onChange={(e) => handleInputChange("nationality", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Bangladesh">Bangladesh</option>
            <option value="India">India</option>
            <option value="Pakistan">Pakistan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={passengerData.dateOfBirth || "16 - 08 - 2013"}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="DD - MM - YYYY"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequent Flyer Number
          </label>
          <input
            type="text"
            value={passengerData.frequentFlyer || ""}
            onChange={(e) => handleInputChange("frequentFlyer", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter frequent flyer number"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Select optional services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Meal Type
            </label>
            <div className="text-sm text-gray-500 mb-2">Optional</div>
            <select
              value={passengerData.mealType || "None"}
              onChange={(e) => handleInputChange("mealType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="None">None</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Wheel Chair
            </label>
            <div className="text-sm text-gray-500 mb-2">Optional</div>
            <select
              value={passengerData.wheelchair || "No"}
              onChange={(e) => handleInputChange("wheelchair", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-lg p-4 mb-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={passengerData.saveInfo || false}
            onChange={(e) => handleInputChange("saveInfo", e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">
            Save this traveller info for future use
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default function SelectedClientComponent() {
  const router = useRouter();
  const timeRemaining = useTimeRemaining(28);
  const [currentStep, setCurrentStep] = useState(1);
  const [passengerData, setPassengerData] = useState({});
  const [lastOfferId, setLastOfferId] = useState(null);
  const [pricingState, setPricingState] = useState({
    loading: false,
    error: null,
  });

  const {
    selectedOffer,
    setPricedOffer,
    resetBookingFlow,
    bookingState,
    selectedServices,
    setSelectedServices,
    pricedOffer,
    setPassengerDetails,
    passengerDetails,
  } = useBookingStore();

  const {
    selectedOffer: pricingSelectedOffer,
    pricingOffers,
    setSelectedOffer: setPricingSelectedOffer,
  } = usePricingStore();

  // Pricing API call
  useEffect(() => {
    const fetchPricingData = async () => {
      if (!selectedOffer) return;

      const currentOfferId =
        selectedOffer?.id ||
        selectedOffer?.offer_id ||
        selectedOffer?.rawOffer?.id;

      if (currentOfferId && currentOfferId !== lastOfferId) {
        resetBookingFlow();
        setCurrentStep(1);
        setPassengerData({});
        setLastOfferId(currentOfferId);
      }

      // Check if we already have a priced offer for this ID
      if (
        pricedOffer &&
        (pricedOffer.id === currentOfferId ||
          pricedOffer.offer_id === currentOfferId)
      ) {
        console.log("Priced offer already exists, skipping API call.");
        return; // Exit early if we already have the priced offer
      }

      setPricingState({ loading: true, error: null });

      try {
        const pricingData =
          selectedOffer.sourceApi === "amadeus"
            ? { sourceApi: selectedOffer.sourceApi, offer: selectedOffer }
            : { sourceApi: selectedOffer.sourceApi, offerId: selectedOffer.id };

        const response = await fetch("/api/flights/offers/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pricingData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to price offer: ${response.status}`
          );
        }

        const result = await response.json();
        console.log("[v0] Pricing API Response:", result);

        if (result.success && result.pricedOffer) {
          setPricingState({ loading: false, error: null });
          setPricedOffer(result.pricedOffer);
          setPricingSelectedOffer(result.pricedOffer);
        } else {
          throw new Error("Invalid pricing response structure");
        }
      } catch (error) {
        console.error("[v0] Pricing failed:", error);
        setPricingState({ loading: false, error: error.message });
      }
    };

    if (selectedOffer && bookingState === "pricing") {
      fetchPricingData();
    }
  }, [
    selectedOffer,
    bookingState,
    lastOfferId,
    pricedOffer, // This dependency causes a re-render and re-fetch, which we want to prevent
    resetBookingFlow, // This is a function, so it's a stable dependency
    setPricedOffer, // This is a function, so it's a stable dependency
    setPricingSelectedOffer, // This is a function, so it's a stable dependency
  ]);

  if (pricingState.loading && !pricedOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Getting Latest Pricing...
        </p>
      </div>
    );
  }

  if (pricingState.error && !pricedOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 mb-4">
            Unable to get current pricing
          </p>
          <p className="text-gray-600 mb-4">{pricingState.error}</p>
          <button
            onClick={() => {
              setPricingState({ loading: false, error: null });
              setLastOfferId(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentOffer = pricedOffer ||
    pricingSelectedOffer ||
    selectedOffer || {
      sourceApi: "duffel",
      total_amount: "726.67",
      base_amount: "615.82",
      tax_amount: "110.85",
      total_currency: "USD",
      slices: [
        {
          origin: { iata_code: "DAC" },
          destination: { iata_code: "DXB" },
          segments: [
            {
              departing_at: "2025-12-05T03:05:00",
              arriving_at: "2025-12-05T06:22:00",
              marketing_carrier: {
                iata_code: "ZZ",
                name: "Duffel Airways",
              },
            },
          ],
        },
      ],
    };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setPassengerDetails([passengerData]);
    }
    const nextStep = Math.min(currentStep + 1, 3);
    setCurrentStep(nextStep);
  };

  const handlePreviousStep = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TravellerDetailsStep
            passengerData={passengerData}
            setPassengerData={setPassengerData}
            onNext={handleNextStep}
          />
        );
      case 2:
        return <ExtraBaggagesStep onNext={handleNextStep} />;
      case 3:
        return (
          <ReviewPaymentStep
            offer={currentOffer}
            passengerData={passengerData}
            selectedServices={selectedServices}
            onBack={handlePreviousStep}
          />
        );
      default:
        return (
          <TravellerDetailsStep
            passengerData={passengerData}
            setPassengerData={setPassengerData}
            onNext={handleNextStep}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <BookingProgress
          timeRemaining={timeRemaining}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">{renderCurrentStep()}</div>
            <div>
              <PriceBreakdown
                offer={currentOffer}
                selectedServices={selectedServices}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
