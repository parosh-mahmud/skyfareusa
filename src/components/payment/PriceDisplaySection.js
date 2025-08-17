import { usePricingStore } from "../../lib/store";

const PriceDisplaySection = () => {
  const { pricingOffers, selectedOffer, loading, error } = usePricingStore();

  // Helper function to get route information
  const getRouteInfo = (offer) => {
    const { pricedOffer } = offer;

    if (pricedOffer.sourceApi === "amadeus") {
      const segments = pricedOffer.slices[0].segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      const calculateDuration = () => {
        const departure = new Date(firstSegment.departure.at);
        const arrival = new Date(lastSegment.arrival.at);
        const diffMs = arrival.getTime() - departure.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}hr ${minutes}min`;
      };

      return {
        origin: firstSegment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        stops: segments.length - 1,
        duration: calculateDuration(),
        airline: pricedOffer.slices[0].segments[0].carrierCode,
      };
    } else if (pricedOffer.sourceApi === "duffel") {
      const slice = pricedOffer.slices[0];
      const segments = slice.segments;

      return {
        origin: slice.origin.iata_code,
        destination: slice.destination.iata_code,
        departureTime: segments[0].departing_at,
        arrivalTime: segments[segments.length - 1].arriving_at,
        stops: segments.length - 1,
        duration: slice.duration,
        airline: segments[0].marketing_carrier.name,
      };
    }
  };

  // Helper function to get price information
  const getPriceInfo = (offer) => {
    const { pricedOffer } = offer;

    return {
      total: pricedOffer.total_amount,
      currency: pricedOffer.total_currency,
      base:
        pricedOffer.sourceApi === "amadeus"
          ? pricedOffer.passengers[0].price.base
          : pricedOffer.base_amount,
      taxes:
        pricedOffer.sourceApi === "amadeus"
          ? pricedOffer.passengers[0].price.taxes
          : pricedOffer.tax_amount,
      sourceApi: pricedOffer.sourceApi,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pricing data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-red-600 text-center py-4">
          <p className="font-medium">Error loading pricing data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedOffer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="text-gray-500 text-center py-8">
          <p>No flight selected</p>
        </div>
      </div>
    );
  }

  const routeInfo = getRouteInfo({ pricedOffer: selectedOffer });
  const priceInfo = getPriceInfo({ pricedOffer: selectedOffer });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Flight Details
      </h2>

      {/* Route Information */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-gray-900">
              {routeInfo.origin}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-lg font-medium text-gray-900">
              {routeInfo.destination}
            </span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {priceInfo.sourceApi}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium">Departure</p>
            <p>{new Date(routeInfo.departureTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Arrival</p>
            <p>{new Date(routeInfo.arrivalTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Duration</p>
            <p>{routeInfo.duration}</p>
          </div>
          <div>
            <p className="font-medium">Stops</p>
            <p>
              {routeInfo.stops === 0
                ? "Non-stop"
                : `${routeInfo.stops} stop${routeInfo.stops > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {routeInfo.airline && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Airline:</span> {routeInfo.airline}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Price Breakdown</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Fare</span>
            <span className="text-gray-900">
              {priceInfo.currency} {priceInfo.base}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="text-gray-900">
              {priceInfo.currency}{" "}
              {typeof priceInfo.taxes === "object"
                ? priceInfo.taxes
                    .reduce(
                      (sum, tax) => sum + Number.parseFloat(tax.amount),
                      0
                    )
                    .toFixed(2)
                : priceInfo.taxes}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-lg">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">
              {priceInfo.currency} {priceInfo.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDisplaySection;
