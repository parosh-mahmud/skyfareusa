import { useBookingStore, usePricingStore } from "src/lib/store";

const PriceDisplaySection = ({ offer, selectedServices = [] }) => {
  const { setSelectedOffer } = useBookingStore();
  const pricingStore = usePricingStore();
  const displayOffer = offer || pricingStore.selectedOffer;

  if (!displayOffer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="text-center text-gray-500">No flight selected</div>
      </div>
    );
  }

  const getRouteInfo = (offer) => {
    // Handle Amadeus format from console log
    if (offer?.sourceApi === "amadeus" && offer?.slices) {
      const slice = offer.slices[0];
      const segments = slice?.segments || [];

      if (segments.length === 0) return null;

      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      return {
        origin: firstSegment.origin?.iata_code || slice.origin?.iata_code,
        destination:
          lastSegment.destination?.iata_code || slice.destination?.iata_code,
        departureTime: firstSegment.departing_at,
        arrivalTime: lastSegment.arriving_at,
        stops: segments.length - 1,
        duration: slice.duration,
        airline: firstSegment.carrier?.name || firstSegment.carrier?.iata_code,
        airlineCode: firstSegment.carrier?.iata_code,
      };
    }

    // Handle Duffel format
    const isDuffelOffer =
      offer?.sourceApi === "duffel" ||
      (offer?.total_amount &&
        offer?.base_amount &&
        offer?.tax_amount &&
        !offer?.passengers);

    if (isDuffelOffer) {
      const slice = offer.slices?.[0];
      const segments = slice?.segments || [];

      if (segments.length === 0) return null;

      return {
        origin: slice.origin?.iata_code,
        destination: slice.destination?.iata_code,
        departureTime: segments[0].departing_at,
        arrivalTime: segments[segments.length - 1].arriving_at,
        stops: segments.length - 1,
        duration: slice.duration,
        airline: segments[0].marketing_carrier?.name,
        airlineCode: segments[0].marketing_carrier?.iata_code,
      };
    }

    return null;
  };

  const getPriceInfo = (offer) => {
    // Use the store helper function for consistent price extraction
    const priceData = pricingStore.getOfferPrice(offer);

    // Handle Amadeus format from console log
    if (offer?.sourceApi === "amadeus" && offer?.total_amount) {
      return {
        total: Number.parseFloat(offer.total_amount),
        currency: offer.total_currency || "USD",
        base: Number.parseFloat(offer.total_amount) * 0.85, // Estimate base fare
        taxes: Number.parseFloat(offer.total_amount) * 0.15, // Estimate taxes
        sourceApi: "amadeus",
      };
    }

    // Handle Duffel format
    if (offer?.sourceApi === "duffel") {
      return {
        total: Number.parseFloat(offer.total_amount || 0),
        currency: offer.total_currency || "USD",
        base: Number.parseFloat(offer.base_amount || 0),
        taxes: Number.parseFloat(offer.tax_amount || 0),
        sourceApi: "duffel",
      };
    }

    // Fallback to store helper
    return {
      total: priceData.amount,
      currency: priceData.currency,
      base: priceData.amount * 0.85,
      taxes: priceData.amount * 0.15,
      sourceApi: "default",
    };
  };

  const routeInfo = getRouteInfo(displayOffer);
  const priceInfo = getPriceInfo(displayOffer);

  const servicesTotal = selectedServices.reduce((total, service) => {
    return total + (Number.parseFloat(service.price) || 0);
  }, 0);

  const finalTotal = Number.parseFloat(priceInfo.total) + servicesTotal;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {routeInfo?.airlineCode || "XX"}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {routeInfo
                ? `${routeInfo.origin} → ${routeInfo.destination}`
                : "Flight Route"}
            </div>
            <div className="text-sm text-gray-500">
              One-Way •{" "}
              {routeInfo
                ? new Date(routeInfo.departureTime).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )
                : "Date"}
            </div>
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
          </div>
          <span className="font-semibold text-gray-900">
            {Number.parseFloat(priceInfo.total).toFixed(2)} {priceInfo.currency}
          </span>
        </div>

        <div className="ml-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">1 x BaseFare (Adult)</span>
            <span className="text-gray-900">
              {Number.parseFloat(priceInfo.base).toFixed(2)}{" "}
              {priceInfo.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">1 x Tax (Adult)</span>
            <span className="text-gray-900">
              {Number.parseFloat(priceInfo.taxes).toFixed(2)}{" "}
              {priceInfo.currency}
            </span>
          </div>
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="space-y-2 mb-4">
          {selectedServices.map((service, index) => (
            <div
              key={service.id || index}
              className="flex items-center justify-between"
            >
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
                {Number.parseFloat(service.price || 0).toFixed(2)}{" "}
                {priceInfo.currency}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Total Price
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {finalTotal.toFixed(2)} {priceInfo.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceDisplaySection;
