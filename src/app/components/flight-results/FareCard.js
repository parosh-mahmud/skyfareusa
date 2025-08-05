"use client";

const formatPrice = (amount, currency = "USD") => {
  const numAmount = Number.parseFloat(amount);
  return new Intl.NumberFormat("en-US", {
    currency: currency,
    style: "currency",
    minimumFractionDigits: 0,
  }).format(numAmount);
};

const convertToUSD = (amount, currency) => {
  const numAmount = Number.parseFloat(amount);
  const rates = {
    GBP: 1.27,
    EUR: 1.08,
    USD: 1.0,
  };
  return Math.round(numAmount * (rates[currency] || 1));
};

export default function FareCard({ offer }) {
  if (!offer) return null;

  // Convert price to USD
  const priceInUSD = convertToUSD(offer.total_amount, offer.total_currency);
  const basePrice = convertToUSD(offer.base_amount, offer.base_currency);
  const taxAmount = offer.tax_amount
    ? convertToUSD(offer.tax_amount, offer.tax_currency)
    : 0;

  // Get cabin class info from the first passenger of first slice
  const firstSlice = offer.slices?.[0];
  const firstSegment = firstSlice?.segments?.[0];
  const passenger = firstSegment?.passengers?.[0];

  const cabinClass =
    passenger?.cabin_class_marketing_name ||
    passenger?.cabin?.marketing_name ||
    passenger?.cabin_class ||
    "Economy";

  // Get baggage info
  const baggages = passenger?.baggages || [];
  const checkedBags = baggages.filter((b) => b.type === "checked");
  const carryOnBags = baggages.filter((b) => b.type === "carry_on");

  // Get amenities
  const cabin = passenger?.cabin;
  const amenities = cabin?.amenities || {};

  // Build features list
  const features = [];

  // Baggage
  if (carryOnBags.length > 0) {
    features.push(
      `${carryOnBags.reduce(
        (sum, bag) => sum + (bag.quantity || 1),
        0
      )} Carry-on bag(s)`
    );
  } else {
    features.push("1 Carry-on bag"); // Default assumption
  }

  if (checkedBags.length > 0) {
    features.push(
      `${checkedBags.reduce(
        (sum, bag) => sum + (bag.quantity || 1),
        0
      )} Checked bag(s)`
    );
  }

  // Amenities
  if (amenities.wifi?.available === "true") {
    features.push(
      `WiFi ${amenities.wifi.cost === "free" ? "(Free)" : "(Paid)"}`
    );
  }

  if (amenities.seat?.type) {
    features.push(`${amenities.seat.type} seat`);
  }

  if (amenities.power?.available === "true") {
    features.push("Power outlets");
  }

  // Conditions
  if (offer.conditions?.change_before_departure?.allowed) {
    const penalty = offer.conditions.change_before_departure.penalty_amount;
    features.push(
      penalty && penalty !== "0.00"
        ? `Changes (${penalty} ${offer.conditions.change_before_departure.penalty_currency} fee)`
        : "Free changes"
    );
  }

  if (offer.conditions?.refund_before_departure?.allowed) {
    const penalty = offer.conditions.refund_before_departure.penalty_amount;
    features.push(
      penalty && penalty !== "0.00"
        ? `Refunds (${penalty} ${offer.conditions.refund_before_departure.penalty_currency} fee)`
        : "Free refunds"
    );
  }

  // Slice conditions
  if (firstSlice?.conditions?.advance_seat_selection === "true") {
    features.push("Advance seat selection");
  }

  if (firstSlice?.conditions?.priority_boarding === "true") {
    features.push("Priority boarding");
  }

  if (firstSlice?.conditions?.priority_check_in === "true") {
    features.push("Priority check-in");
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[280px] flex-shrink-0">
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-semibold text-gray-800">{cabinClass}</h5>
        {firstSlice?.fare_brand_name && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {firstSlice.fare_brand_name}
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-blue-600 mb-1">
        ${priceInUSD.toLocaleString()}
      </div>

      {/* Price breakdown */}
      <div className="text-xs text-gray-500 mb-3">
        Base: ${basePrice.toLocaleString()}
        {taxAmount > 0 && ` + Tax: $${taxAmount.toLocaleString()}`}
      </div>

      <ul className="text-sm text-gray-600 space-y-1 mb-4 max-h-32 overflow-y-auto">
        {features.slice(0, 6).map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
            <span className="leading-tight">{feature}</span>
          </li>
        ))}
        {features.length > 6 && (
          <li className="text-xs text-gray-400">
            +{features.length - 6} more features
          </li>
        )}
      </ul>

      {/* Emissions info */}
      {offer.total_emissions_kg && (
        <div className="text-xs text-green-600 mb-3 flex items-center gap-1">
          <span>🌱</span>
          <span>{offer.total_emissions_kg}kg CO₂ emissions</span>
        </div>
      )}

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        Select - ${priceInUSD.toLocaleString()}
      </button>
    </div>
  );
}
