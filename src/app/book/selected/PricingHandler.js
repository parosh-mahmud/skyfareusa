// src/app/book/selected/PricingHandler.js
import { useEffect } from "react";
import { usePricingStore } from "src/lib/store";

const PricingHandler = ({ apiResponse }) => {
  const { setPricingOffers, setLoading, setError } = usePricingStore();

  useEffect(() => {
    if (apiResponse) {
      try {
        setLoading(true);

        // Handle both Amadeus and Duffel responses
        const normalizedOffers = Array.isArray(apiResponse)
          ? apiResponse
          : [apiResponse];

        setPricingOffers(normalizedOffers);

        // Log for debugging
        console.log("Pricing API Response processed:", normalizedOffers);
      } catch (error) {
        console.error("Error processing pricing response:", error);
        setError("Failed to process pricing data");
      }
    }
  }, [apiResponse, setPricingOffers, setLoading, setError]);

  return null; // This is a data handler component
};

export default PricingHandler;
