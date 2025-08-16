// src/app/book/selected/PriceDisplaySection.js
import React from "react";
import { usePricingStore } from "src/lib/store";

const PriceDisplaySection = () => {
  const { pricingOffers, selectedOffer, loading, error } = usePricingStore(); // Helper function to get route information

  const getRouteInfo = (offer) => {
    const { pricedOffer } = offer;

    if (pricedOffer.sourceApi === "amadeus") {
      const segments = pricedOffer.slices[0].segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      const calculateDuration = () => {
        // Amadeus API's duration is a bit complex, but you can sum up segment durations
        // A simpler way is to calculate from first departure to last arrival
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
  }; // Helper function to get price information

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
      <div className="price-display-section loading">
                <div className="loading-spinner">Loading pricing data...</div> 
           {" "}
      </div>
    );
  }

  if (error) {
    return (
      <div className="price-display-section error">
                <div className="error-message">Error: {error}</div>     {" "}
      </div>
    );
  }

  if (!pricingOffers.length) {
    return (
      <div className="price-display-section empty">
                <div className="empty-message">No pricing data available</div> 
           {" "}
      </div>
    );
  }

  return (
    <div className="price-display-section">
            <h2>Flight Options</h2>     {" "}
      {pricingOffers.map((offer) => {
        const routeInfo = getRouteInfo(offer);
        const priceInfo = getPriceInfo(offer);

        return (
          <div key={offer.pricedOffer.id} className="price-card">
                        {/* Route Information */}           {" "}
            <div className="route-section">
                           {" "}
              <div className="route-header">
                               {" "}
                <span className="origin">{routeInfo.origin}</span>             
                  <span className="arrow">→</span>               {" "}
                <span className="destination">{routeInfo.destination}</span>   
                           {" "}
                <span className="api-badge">{priceInfo.sourceApi}</span>       
                     {" "}
              </div>
                           {" "}
              <div className="route-details">
                               {" "}
                <div className="time-info">
                                   {" "}
                  <span>
                    Departure:{" "}
                    {new Date(routeInfo.departureTime).toLocaleString()}
                  </span>
                                   {" "}
                  <span>
                    Arrival: {new Date(routeInfo.arrivalTime).toLocaleString()}
                  </span>
                                 {" "}
                </div>
                               {" "}
                <div className="flight-info">
                                    <span>Stops: {routeInfo.stops}</span>       
                            <span>Duration: {routeInfo.duration}</span>         
                         {" "}
                  {routeInfo.airline && (
                    <span>Airline: {routeInfo.airline}</span>
                  )}
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                        {/* Price Information */}           {" "}
            <div className="price-section">
                           {" "}
              <div className="total-price">
                               {" "}
                <span className="amount">
                  {priceInfo.currency} {priceInfo.total}
                </span>
                                <span className="label">Total</span>           
                 {" "}
              </div>
                           {" "}
              <div className="price-breakdown">
                               {" "}
                <div className="base-price">
                                    Base: {priceInfo.currency} {priceInfo.base} 
                               {" "}
                </div>
                               {" "}
                <div className="taxes">
                                    Taxes: {priceInfo.currency}{" "}
                  {typeof priceInfo.taxes === "object"
                    ? priceInfo.taxes
                        .reduce((sum, tax) => sum + parseFloat(tax.amount), 0)
                        .toFixed(2)
                    : priceInfo.taxes}
                                 {" "}
                </div>
                             {" "}
              </div>
                           {" "}
              <button
                className="select-button"
                onClick={() => setSelectedOffer(offer)}
              >
                                Select Flight              {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </div>
        );
      })}
         {" "}
    </div>
  );
};

export default PriceDisplaySection;
