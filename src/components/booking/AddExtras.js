// src/components/booking/AddExtras.js
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Loader,
  Armchair,
  Luggage,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { useState } from "react";
import SeatMap from "./seat-map"; // Import the new SeatMap component

// --- API Calling Functions ---

const fetchSeatMaps = async (offer) => {
  if (!offer) return null;
  const res = await fetch(`/api/flights/offers/seatmaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer }),
  });
  if (!res.ok) throw new Error("Could not load seat map.");
  return (await res.json()).seatMaps;
};

const fetchBaggage = async (offer) => {
  if (!offer) return [];
  const res = await fetch(`/api/flights/offers/ancillaries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer }),
  });
  if (!res.ok) throw new Error("Could not load baggage options.");
  return (await res.json()).ancillaryOffers;
};

// --- Sub-Components ---

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

const SeatSelector = ({ offer }) => {
  const { data: seatMaps, isLoading } = useQuery({
    queryKey: ["seatmap", offer?.id],
    queryFn: () => fetchSeatMaps(offer),
    enabled: !!offer,
  });

  const [selectedSeats, setSelectedSeats] = useState({});

  const handleSeatSelect = (segmentId, seatDesignator, price, serviceId) => {
    setSelectedSeats((prev) => {
      const newSelection = { ...prev };
      if (newSelection[segmentId] === seatDesignator) {
        delete newSelection[segmentId];
      } else {
        newSelection[segmentId] = seatDesignator;
      }
      return newSelection;
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin" />
      </div>
    );
  if (!seatMaps || seatMaps.length === 0) return null;

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Select your preferred seats for each flight segment. Additional fees may
        apply for premium seats.
      </p>
      <SeatMap
        seatMaps={seatMaps}
        onSeatSelect={handleSeatSelect}
        selectedSeats={selectedSeats}
      />
    </div>
  );
};

const BaggageSelector = ({ offer }) => {
  const { data: baggageOffers, isLoading } = useQuery({
    queryKey: ["baggage", offer?.id],
    queryFn: () => fetchBaggage(offer),
    enabled: !!offer && offer.sourceApi === "duffel",
  });

  const [selectedBaggage, setSelectedBaggage] = useState({});

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-20">
        <Loader className="animate-spin" />
      </div>
    );
  if (!baggageOffers || baggageOffers.length === 0) return null;

  const baggage = baggageOffers[0];
  const quantity = selectedBaggage[baggage.id] || 0;

  const handleUpdate = (newQuantity) => {
    setSelectedBaggage((prev) => ({
      ...prev,
      [baggage.id]: Math.max(0, newQuantity),
    }));
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">
          {baggage.metadata.name || "Extra Checked Bag"}
        </p>
        <p className="text-sm text-blue-600 font-bold">
          ${Number.parseFloat(baggage.total_amount).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleUpdate(quantity - 1)}
          disabled={quantity === 0}
          className="p-1 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
        >
          <MinusCircle size={20} />
        </button>
        <span className="font-bold text-lg w-6 text-center">{quantity}</span>
        <button
          onClick={() => handleUpdate(quantity + 1)}
          className="p-1 rounded-full bg-gray-200 text-gray-600"
        >
          <PlusCircle size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Main AddExtras Component ---

export default function AddExtras({ offer }) {
  const { data: seatMaps, isLoading: isLoadingSeats } = useQuery({
    queryKey: ["seatmap", offer?.id],
    queryFn: () => fetchSeatMaps(offer),
    enabled: !!offer,
    retry: false,
  });

  const { data: baggageOffers, isLoading: isLoadingBaggage } = useQuery({
    queryKey: ["baggage", offer?.id],
    queryFn: () => fetchBaggage(offer),
    enabled: !!offer,
    retry: false,
  });

  const hasSeats = seatMaps && seatMaps.length > 0;
  const hasBaggage =
    offer?.sourceApi === "duffel" && baggageOffers && baggageOffers.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Add Extras to Your Trip
      </h2>

      <ServiceRow
        icon={Luggage}
        title="Extra Baggage"
        description="Add any extra baggage you need for your trip"
        isLoading={isLoadingBaggage}
        isAvailable={hasBaggage}
      >
        <BaggageSelector offer={offer} />
      </ServiceRow>

      <ServiceRow
        icon={Armchair}
        title="Seat Selection"
        description="Specify where on the plane you'd like to sit"
        isLoading={isLoadingSeats}
        isAvailable={hasSeats}
      >
        <SeatSelector offer={offer} />
      </ServiceRow>
    </div>
  );
}
