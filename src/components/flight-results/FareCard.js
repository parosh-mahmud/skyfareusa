"use client";

import { X, CheckCircle, Info } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

// --- Helper Functions ---
const formatPrice = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.parseFloat(amount));

const convertToUSD = (amount, currency) => {
  const numAmount = Number.parseFloat(amount);
  const rates = { GBP: 1.27, EUR: 1.08, USD: 1.0, BDT: 0.0085 };
  return Math.round(numAmount * (rates[currency] || 1));
};

// --- Sub-Component: Fare Details Sidebar ---
const FareDetailsSidebar = ({ isOpen, onClose, offer, features }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!offer) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {offer.name || "Standard Fare"} Includes:
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20 p-6 space-y-6">
          {Object.entries(features).map(
            ([category, items]) =>
              items.length > 0 && (
                <div key={category}>
                  <h4 className="font-bold text-gray-700 mb-2 capitalize">
                    {category}
                  </h4>
                  <ul className="space-y-2">
                    {items.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
};

// --- Main FareCard Component ---
export default function FareCard({ offer }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const allFeatures = useMemo(() => {
    if (!offer) return {};
    const features = { baggage: [], flexibility: [], comfort: [] };
    const passenger = offer.passengers?.[0]; // Use the top-level passenger array
    if (!passenger) return features;

    // Baggage from top-level passenger object
    const carryOn = passenger.baggages?.find((b) => b.type === "carry_on");
    const checked = passenger.baggages?.find((b) => b.type === "checked");
    features.baggage.push(
      carryOn ? `${carryOn.quantity}x Carry-on Bag` : "1x Carry-on Bag"
    );
    if (checked) features.baggage.push(`${checked.quantity}x Checked Bag`);
    else features.baggage.push("No Checked Bag");

    // Flexibility from top-level conditions
    if (offer.conditions?.change_before_departure?.allowed) {
      const fee = offer.conditions.change_before_departure.penalty_amount;
      features.flexibility.push(
        fee && parseFloat(fee) > 0 ? `Changes with fee` : "Free changes"
      );
    } else {
      features.flexibility.push("Non-changeable");
    }
    if (offer.conditions?.refund_before_departure?.allowed) {
      const fee = offer.conditions.refund_before_departure.penalty_amount;
      features.flexibility.push(
        fee && parseFloat(fee) > 0 ? `Refundable with fee` : "Free refunds"
      );
    } else {
      features.flexibility.push("Non-refundable");
    }

    return features;
  }, [offer]);

  if (!offer) return null;

  const priceInUSD = convertToUSD(offer.total_amount, offer.total_currency);
  const displayFeatures = [
    ...allFeatures.baggage,
    ...allFeatures.flexibility,
    ...allFeatures.comfort,
  ];
  const totalFeatureCount = displayFeatures.length;

  return (
    <>
      <div className="flex-shrink-0 w-full bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col hover:border-blue-500 transition-colors duration-200">
        <div className="flex justify-between items-start">
          <h5 className="font-bold text-lg text-gray-800">
            {offer.name || "Economy"}
          </h5>
          {offer.fare_brand_name && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
              {offer.fare_brand_name}
            </span>
          )}
        </div>

        <p className="text-3xl font-bold text-blue-600 my-2">
          ${priceInUSD.toLocaleString()}
        </p>

        <ul className="text-sm text-gray-600 space-y-2 mb-4 flex-grow border-t pt-4">
          {displayFeatures.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {totalFeatureCount > 3 && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-sm text-blue-600 font-semibold hover:underline mb-4 flex items-center gap-1 self-start"
          >
            <Info size={14} /> View all {totalFeatureCount} features
          </button>
        )}

        <button className="w-full mt-auto bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          Select
        </button>
      </div>

      <FareDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        offer={offer}
        features={allFeatures}
      />
    </>
  );
}
