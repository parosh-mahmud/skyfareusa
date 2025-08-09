"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import {
  Star,
  MapPin,
  BedDouble,
  Users,
  Loader,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// This function fetches the details for a single hotel offer.
// It requires the hotelId and the original search context (dates, guests).
const fetchHotelOffer = async (hotelId, searchParamsString) => {
  if (!hotelId || !searchParamsString) return null;

  // Construct the API URL with all necessary parameters
  const res = await fetch(
    `/api/hotels/offers?hotelId=${hotelId}&${searchParamsString}`
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch hotel details.");
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Could not retrieve the hotel offer.");
  }
  return result.data;
};

export default function HotelOfferPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params.hotelId;

  const { data, isLoading, isError, error } = useQuery({
    // The query key includes all params to ensure uniqueness for caching
    queryKey: ["hotelOffer", hotelId, searchParams.toString()],
    queryFn: () => fetchHotelOffer(hotelId, searchParams.toString()),
    enabled: !!hotelId, // Only run the query if hotelId is present
    staleTime: 1000 * 60 * 10, // Cache data for 10 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Loading Hotel Details...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Failed to Load Offer
        </h2>
        <p className="text-red-600 bg-red-100 p-3 rounded-md max-w-lg">
          {error.message}
        </p>
      </div>
    );
  }

  const { hotel, offers } = data || {};
  const offer = offers?.[0];

  if (!hotel || !offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <BedDouble className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Offer Not Available
        </h2>
        <p className="text-gray-500 max-w-lg">
          This hotel offer may no longer be available. Please try searching
          again.
        </p>
      </div>
    );
  }

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={20}
          className={
            i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200 relative">
            {/* <Image
              src="https://placehold.co/800x400/EBF4FF/737373?text=Hotel+View"
              alt={`Image of ${hotel.name}`}
              fill
              className="object-cover"
            /> */}
          </div>
          <div className="p-6 md:p-8">
            {hotel.rating && renderStars(parseInt(hotel.rating))}
            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              {hotel.name}
            </h1>
            <div className="flex items-center gap-2 text-md text-gray-500 my-3">
              <MapPin size={16} />
              <span>
                {hotel.address?.lines[0]}, {hotel.address?.cityName}
              </span>
            </div>

            <div className="border-t border-b my-6 py-4">
              <h2 className="text-xl font-semibold mb-3">Your Offer Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-bold text-gray-800">{offer.checkInDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-bold text-gray-800">
                    {offer.checkOutDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-bold text-gray-800">
                    {offer.guests?.adults || 0} Adults
                  </p>
                </div>
              </div>
            </div>

            <div className="prose max-w-full">
              <h3 className="font-semibold">Description</h3>
              <p>{hotel.description?.text}</p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-blue-700">
                  {offer.price?.total} {offer.price?.currency}
                </p>
              </div>
              <Link
                href={`/hotels/book/${offer.id}?${searchParams.toString()}`}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 text-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
