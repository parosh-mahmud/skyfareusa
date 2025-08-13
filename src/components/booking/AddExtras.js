"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader, Armchair, Luggage } from "lucide-react";

// API calling functions
const fetchSeatMaps = async (offer) => {
  if (!offer) return null;
  const res = await fetch(`/api/orders/${offer.id}/seatmaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flightOffer: offer.rawOffer || offer,
      sourceApi: offer.sourceApi,
    }),
  });
  if (!res.ok) throw new Error("Could not load seat map.");
  return (await res.json()).seatMaps;
};

const fetchBaggage = async (offer) => {
  if (!offer || !offer.id.startsWith("ord_")) return []; // Only Duffel supported for now
  const res = await fetch(`/api/orders/${offer.id}/ancillaries`);
  if (!res.ok) throw new Error("Could not load baggage options.");
  return (await res.json()).ancillaryOffers;
};

const ServiceRow = ({
  icon: Icon,
  title,
  description,
  children,
  isLoading,
  isAvailable,
}) => (
  <div
    className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 ${
      !isAvailable && !isLoading ? "opacity-60" : ""
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
      {isLoading ? (
        <Loader className="w-5 h-5 text-gray-400 animate-spin" />
      ) : !isAvailable ? (
        <div className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">
          Not Available
        </div>
      ) : null}
    </div>
    {isAvailable && children && (
      <div className="mt-4 pt-4 border-t">{children}</div>
    )}
  </div>
);

export default function AddExtras({ offer }) {
  const { data: seatMaps, isLoading: isLoadingSeats } = useQuery({
    queryKey: ["seatmap", offer?.id],
    queryFn: () => fetchSeatMaps(offer),
    enabled: !!offer,
  });

  const { data: baggageOffers, isLoading: isLoadingBaggage } = useQuery({
    queryKey: ["baggage", offer?.id],
    queryFn: () => fetchBaggage(offer),
    enabled: !!offer,
  });

  const hasSeats = seatMaps && seatMaps.length > 0;
  const hasBaggage = baggageOffers && baggageOffers.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Add Extras to Your Trip
      </h2>

      <ServiceRow
        icon={Luggage}
        title="Extra Baggage"
        description="Add any extra baggage you need for your trip"
        isLoading={isLoadingBaggage}
        isAvailable={hasBaggage}
      >
        {/* UI for selecting baggage would go here */}
        <p>Baggage options would be displayed here.</p>
      </ServiceRow>

      <ServiceRow
        icon={Armchair}
        title="Seat Selection"
        description="Specify where on the plane you'd like to sit"
        isLoading={isLoadingSeats}
        isAvailable={hasSeats}
      >
        {/* UI for the seat map would go here */}
        <p>Seat map would be rendered here.</p>
      </ServiceRow>
    </div>
  );
}
