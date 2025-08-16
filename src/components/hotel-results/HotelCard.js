// "use client";

// import { Star, MapPin } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";

// export default function HotelCard({ hotel, offer, searchParamsString }) {
//   if (!hotel || !offer) return null;

//   // Function to render the star rating based on the hotel's rating
//   const renderStars = (rating) => {
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star
//             key={i}
//             size={16}
//             className={
//               i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
//             }
//           />
//         ))}
//       </div>
//     );
//   };

//   // Use the hotel's city name if available, otherwise fallback to the IATA code.
//   const location = hotel.address?.cityName || hotel.iataCode || "Location";

//   // The Link now includes the full search context for the details page API call.
//   const detailsPageUrl = `/hotels/offers/${hotel.hotelId}?${searchParamsString}`;

//   return (
//     <Link
//       href={detailsPageUrl}
//       className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200"
//     >
//       <div className="flex flex-col md:flex-row h-full">
//         {/* Image Section */}
//         <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 flex-shrink-0 relative">
//           {/* <Image
//             src="https://placehold.co/400x400/EBF4FF/737373?text=Hotel" // A reliable placeholder image
//             alt={`Image of ${hotel.name}`}
//             fill
//             className="object-cover"
//           /> */}
//         </div>

//         {/* Details Section */}
//         <div className="p-4 flex-grow flex flex-col">
//           {hotel.rating && renderStars(parseInt(hotel.rating))}
//           <h3 className="text-xl font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">
//             {hotel.name}
//           </h3>

//           <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
//             <MapPin size={14} />
//             <span>{location}</span>
//           </div>

//           <p className="text-sm text-gray-600 flex-grow">
//             {offer.room?.description?.text?.split(". ")[0] ||
//               "Comfortable and well-equipped rooms."}
//           </p>

//           {/* Price and Action */}
//           <div className="flex justify-between items-end mt-4 pt-4 border-t">
//             <div>
//               <p className="text-sm text-gray-500">Starts from</p>
//               <p className="text-xl font-bold text-blue-600">
//                 {offer.price?.total} {offer.price?.currency}
//               </p>
//             </div>
//             <div className="bg-blue-100 text-blue-700 font-semibold px-6 py-2 rounded-lg text-sm">
//               View Deal
//             </div>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

"use client";

import { Star, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HotelCard({
  hotel,
  offer,
  searchParamsString,
  isHighlighted,
}) {
  if (!hotel || !offer) return null;

  // State to manage the image URL, defaulting to a placeholder
  const [imageUrl, setImageUrl] = useState("/images/hotel-placeholder.jpg");
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Effect to fetch the real image after the component renders
  // useEffect(() => {
  //   // This function is defined inside the effect to capture the correct hotel props
  //   const fetchImage = async () => {
  //     // Ensure we have the necessary data to fetch an image
  //     if (!hotel.name || !hotel.geoCode?.latitude) {
  //       setIsImageLoading(false);
  //       return;
  //     }

  //     try {
  //       const params = new URLSearchParams({
  //         hotelName: hotel.name,
  //         lat: hotel.geoCode.latitude,
  //         lng: hotel.geoCode.longitude,
  //       });

  //       const res = await fetch(`/api/hotels/image?${params.toString()}`);
  //       const data = await res.json();

  //       if (data.success && data.imageUrl) {
  //         setImageUrl(data.imageUrl); // Update state with the real image URL
  //       } else {
  //         // If the API call fails or finds no image, we stop loading and keep the placeholder.
  //         setIsImageLoading(false);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch hotel image:", error);
  //       setIsImageLoading(false); // Stop loading on error
  //     }
  //   };

  //   fetchImage();
  // }, [hotel.name, hotel.geoCode]); // Re-run the effect if the hotel prop changes

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  const location = hotel.address?.cityName || hotel.iataCode || "Location";
  const detailsPageUrl = `/hotels/offers/${hotel.hotelId}?${searchParamsString}`;

  return (
    <Link
      href={detailsPageUrl}
      className={`block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border ${
        isHighlighted
          ? "border-blue-500 ring-2 ring-blue-300"
          : "border-gray-200"
      }`}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Image Section */}
        <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 flex-shrink-0 relative">
          {/* Show a pulsing skeleton while the image is loading */}
          {isImageLoading && (
            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
          )}
          {/* <Image
            src={imageUrl}
            alt={`Image of ${hotel.name}`}
            fill
            className={`object-cover transition-opacity duration-500 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsImageLoading(false)} // Hide skeleton once the image is ready
            onError={() => {
              // If the real image fails to load, fall back to placeholder and stop loading
              setImageUrl("/images/hotel-placeholder.jpg");
              setIsImageLoading(false);
            }}
          /> */}
        </div>

        {/* Details Section */}
        <div className="p-4 flex-grow flex flex-col">
          {hotel.rating && renderStars(parseInt(hotel.rating))}
          <h3 className="text-xl font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">
            {hotel.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
            <MapPin size={14} />
            <span>{location}</span>
          </div>

          <p className="text-sm text-gray-600 flex-grow">
            {offer.room?.description?.text?.split(". ")[0] ||
              "Comfortable and well-equipped rooms."}
          </p>

          {/* Price and Action */}
          <div className="flex justify-between items-end mt-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Starts from</p>
              <p className="text-xl font-bold text-blue-600">
                {offer.price?.total} {offer.price?.currency}
              </p>
            </div>
            <div className="bg-blue-100 text-blue-700 font-semibold px-6 py-2 rounded-lg text-sm">
              View Deal
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
