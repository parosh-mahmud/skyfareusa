"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Calendar,
  Users,
  Search,
  MapPin,
  Minus,
  Plus,
  Building,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

// --- Main Hotel Search Form Component ---
export default function HotelSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState({
    name: "Paris",
    code: "PAR",
    type: "city",
  });
  const [dates, setDates] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 5)),
  });
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [activeSelector, setActiveSelector] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setActiveSelector(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();

    // ✅ FIX: Intelligently add the correct parameter based on selection type
    if (destination.type === "hotel") {
      params.set("hotelId", destination.code);
    } else {
      params.set("cityCode", destination.code);
    }

    params.set("checkInDate", format(dates.from, "yyyy-MM-dd"));
    params.set("checkOutDate", format(dates.to, "yyyy-MM-dd"));
    params.set("adults", guests.adults);
    router.push(`/hotels/results?${params.toString()}`);
  };

  return (
    <div
      ref={formRef}
      className="bg-white rounded-xl shadow-lg p-4 md:p-6 relative"
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-2 md:gap-4 items-end"
      >
        <DestinationInput
          destination={destination}
          setDestination={setDestination}
          isActive={activeSelector === "destination"}
          setActive={() =>
            setActiveSelector(
              activeSelector === "destination" ? null : "destination"
            )
          }
        />
        <DateRangePicker
          dates={dates}
          setDates={setDates}
          isActive={activeSelector === "dates"}
          setActive={() =>
            setActiveSelector(activeSelector === "dates" ? null : "dates")
          }
        />
        <GuestSelector
          guests={guests}
          setGuests={setGuests}
          isActive={activeSelector === "guests"}
          setActive={() =>
            setActiveSelector(activeSelector === "guests" ? null : "guests")
          }
        />
        <button
          type="submit"
          disabled={isSearching}
          className="w-full bg-blue-600 text-white font-bold text-lg p-3 rounded-lg flex items-center justify-center h-[50px]"
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  );
}

// --- Sub-Components ---

const DestinationInput = ({
  destination,
  setDestination,
  isActive,
  setActive,
}) => {
  const [query, setQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const debounceTimeout = useRef(null);

  const searchLocations = async (q) => {
    if (q.length < 2) {
      setCitySuggestions([]);
      setHotelSuggestions([]);
      return;
    }
    const [cityRes, hotelRes] = await Promise.all([
      fetch(`/api/cities?keyword=${q}`),
      fetch(`/api/hotels/autocomplete?keyword=${q}`),
    ]);
    const cityData = await cityRes.json();
    const hotelData = await hotelRes.json();
    if (cityData.success) setCitySuggestions(cityData.data);
    if (hotelData.success) setHotelSuggestions(hotelData.data);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => searchLocations(val), 300);
  };

  const handleSelect = (item, type) => {
    setDestination({
      name: item.name,
      code: type === "city" ? item.iataCode : item.hotelId,
      type: type,
    });
    setActive(false);
  };

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-1">
        <BedDouble size={16} /> Going to
      </label>
      <div
        onClick={setActive}
        className="w-full p-3 border rounded-lg bg-gray-50 cursor-pointer h-[50px] flex items-center"
      >
        <span className="font-semibold truncate">{destination.name}</span>
      </div>
      {isActive && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 p-2 z-20">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="City or Hotel Name"
            className="w-full p-2 border rounded-md mb-2"
            autoFocus
          />
          <ul className="max-h-60 overflow-y-auto">
            {citySuggestions.length > 0 && (
              <li className="px-2 pt-2 text-xs font-bold text-gray-500">
                Cities
              </li>
            )}
            {/* ✅ FIX: Added unique key prop */}
            {citySuggestions.map((city) => (
              <li
                key={city.iataCode}
                onClick={() => handleSelect(city, "city")}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center gap-2"
              >
                <MapPin size={16} className="text-gray-400" />
                <div>
                  <p className="font-semibold">{city.name}</p>
                  <p className="text-xs text-gray-500">
                    {city.address.countryName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const DateRangePicker = ({ dates, setDates, isActive, setActive }) => {
  return (
    <div className="relative">
      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-1">
        <Calendar size={16} /> Dates
      </label>
      <div
        onClick={setActive}
        className="w-full p-3 border rounded-lg bg-gray-50 cursor-pointer h-[50px] flex items-center"
      >
        <span className="font-semibold text-sm">
          {format(dates.from, "dd MMM")} - {format(dates.to, "dd MMM")}
        </span>
      </div>
      {isActive && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 bg-white shadow-lg rounded-lg mt-2 z-20">
          <DayPicker
            mode="range"
            selected={dates}
            onSelect={setDates}
            numberOfMonths={2}
            fromDate={new Date()}
          />
        </div>
      )}
    </div>
  );
};

const GuestSelector = ({ guests, setGuests, isActive, setActive }) => {
  const updateGuests = (type, delta) => {
    setGuests((prev) => ({
      ...prev,
      [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + delta),
    }));
  };
  const totalGuests = guests.adults + guests.children;

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-1">
        <Users size={16} /> Guests
      </label>
      <div
        onClick={setActive}
        className="w-full p-3 border rounded-lg bg-gray-50 cursor-pointer h-[50px] flex items-center"
      >
        <span className="font-semibold">
          {totalGuests} guest{totalGuests > 1 ? "s" : ""}
        </span>
      </div>
      {isActive && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 w-full md:w-80 bg-white shadow-lg rounded-lg mt-2 p-4 z-20 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Adults</p>
              <p className="text-xs text-gray-500">Ages 13+</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateGuests("adults", -1)}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{guests.adults}</span>
              <button
                type="button"
                onClick={() => updateGuests("adults", 1)}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Children</p>
              <p className="text-xs text-gray-500">Ages 0-12</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateGuests("children", -1)}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">
                {guests.children}
              </span>
              <button
                type="button"
                onClick={() => updateGuests("children", 1)}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   BedDouble,
//   Calendar,
//   Users,
//   Search,
//   MapPin,
//   Minus,
//   Plus,
//   Building,
// } from "lucide-react";
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";
// import { format } from "date-fns";

// // --- Main Hotel Search Form Component ---
// export default function HotelSearchForm() {
//   const router = useRouter();
//   const [destination, setDestination] = useState({
//     name: "Paris",
//     code: "PAR",
//     type: "city",
//   });
//   const [dates, setDates] = useState({
//     from: new Date(),
//     to: new Date(new Date().setDate(new Date().getDate() + 5)),
//   });
//   const [guests, setGuests] = useState({ adults: 2, children: 0 });
//   const [activeSelector, setActiveSelector] = useState(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const formRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (formRef.current && !formRef.current.contains(event.target)) {
//         setActiveSelector(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!dates.from || !dates.to) {
//       alert("Please select both a check-in and check-out date.");
//       return;
//     }
//     setIsSearching(true);

//     const params = new URLSearchParams();
//     params.set("checkInDate", format(dates.from, "yyyy-MM-dd"));
//     params.set("checkOutDate", format(dates.to, "yyyy-MM-dd"));
//     params.set("adults", guests.adults);

//     if (destination.type === "hotel") {
//       // If a hotel was selected, its ID is in `destination.code`.
//       params.set("hotelId", destination.code);
//     } else {
//       // If a city was selected, its code is in `destination.code`.
//       params.set("cityCode", destination.code);
//     }

//     // Both search types go to the results page
//     router.push(`/hotels/results?${params.toString()}`);
//   };

//   return (
//     <div
//       ref={formRef}
//       className="bg-white rounded-xl shadow-lg p-4 md:p-6 relative"
//     >
//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-2 md:gap-4 items-end"
//       >
//         <DestinationInput
//           destination={destination}
//           setDestination={setDestination}
//           isActive={activeSelector === "destination"}
//           setActive={() =>
//             setActiveSelector(
//               activeSelector === "destination" ? null : "destination"
//             )
//           }
//         />
//         <DateRangePicker
//           dates={dates}
//           setDates={setDates}
//           isActive={activeSelector === "dates"}
//           setActive={() =>
//             setActiveSelector(activeSelector === "dates" ? null : "dates")
//           }
//         />
//         <GuestSelector
//           guests={guests}
//           setGuests={setGuests}
//           isActive={activeSelector === "guests"}
//           setActive={() =>
//             setActiveSelector(activeSelector === "guests" ? null : "guests")
//           }
//         />
//         <button
//           type="submit"
//           disabled={isSearching}
//           className="w-full bg-blue-600 text-white font-bold text-lg p-3 rounded-lg flex items-center justify-center h-[50px] hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//         >
//           {isSearching ? (
//             <Loader className="animate-spin" />
//           ) : (
//             <Search size={20} />
//           )}
//         </button>
//       </form>
//     </div>
//   );
// }

// // --- Sub-Components ---

// const DestinationInput = ({
//   destination,
//   setDestination,
//   isActive,
//   setActive,
// }) => {
//   const [query, setQuery] = useState("");
//   const [citySuggestions, setCitySuggestions] = useState([]);
//   const [hotelSuggestions, setHotelSuggestions] = useState([]);
//   const debounceTimeout = useRef(null);

//   const searchLocations = async (q) => {
//     if (q.length < 2) {
//       setCitySuggestions([]);
//       setHotelSuggestions([]);
//       return;
//     }
//     const [cityRes, hotelRes] = await Promise.all([
//       fetch(`/api/cities?keyword=${q}`),
//       fetch(`/api/hotels/autocomplete?keyword=${q}`),
//     ]);
//     const cityData = await cityRes.json();
//     const hotelData = await hotelRes.json();
//     if (cityData.success) setCitySuggestions(cityData.data);
//     if (hotelData.success) setHotelSuggestions(hotelData.data);
//   };

//   const handleQueryChange = (e) => {
//     const val = e.target.value;
//     setQuery(val);
//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
//     debounceTimeout.current = setTimeout(() => searchLocations(val), 300);
//   };

//   const handleSelect = (item, type) => {
//     setDestination({
//       name: item.name,
//       // ✅ FIX: Use the correct ID from the API response object for both types
//       code: type === "city" ? item.iataCode : item.hotelIds[0],
//       type: type,
//     });
//     setActive(false);
//   };

//   return (
//     <div className="relative">
//       <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-1">
//         <BedDouble size={16} /> Going to
//       </label>
//       <div
//         onClick={setActive}
//         className="w-full p-3 border rounded-lg bg-gray-50 cursor-pointer h-[50px] flex items-center"
//       >
//         <span className="font-semibold truncate">{destination.name}</span>
//       </div>
//       {isActive && (
//         <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 p-2 z-20">
//           <input
//             type="text"
//             value={query}
//             onChange={handleQueryChange}
//             placeholder="City or Hotel Name"
//             className="w-full p-2 border rounded-md mb-2"
//             autoFocus
//           />
//           <ul className="max-h-60 overflow-y-auto">
//             {hotelSuggestions.length > 0 && (
//               <li className="px-2 pt-2 text-xs font-bold text-gray-500">
//                 Hotels
//               </li>
//             )}
//             {hotelSuggestions.map((hotel) => (
//               <li
//                 key={hotel.id} // The top-level 'id' is unique for the list
//                 onClick={() => handleSelect(hotel, "hotel")}
//                 className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center gap-2"
//               >
//                 <Building size={16} className="text-gray-400" />
//                 <div>
//                   <p className="font-semibold">{hotel.name}</p>
//                 </div>
//               </li>
//             ))}
//             {citySuggestions.length > 0 && (
//               <li className="px-2 pt-2 text-xs font-bold text-gray-500">
//                 Cities
//               </li>
//             )}
//             {citySuggestions.map((city) => (
//               <li
//                 key={city.iataCode}
//                 onClick={() => handleSelect(city, "city")}
//                 className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center gap-2"
//               >
//                 <MapPin size={16} className="text-gray-400" />
//                 <div>
//                   <p className="font-semibold">{city.name}</p>
//                   <p className="text-xs text-gray-500">
//                     {city.address.countryName}
//                   </p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// const DateRangePicker = ({ dates, setDates, isActive, setActive }) => {
//   return (
//     <div className="relative">
//       <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-1">
//         <Calendar size={16} /> Dates
//       </label>
//       <div
//         onClick={setActive}
//         className="w-full p-3 border rounded-lg bg-gray-50 cursor-pointer h-[50px] flex items-center"
//       >
//         <span className="font-semibold text-sm">
//           {dates.from ? format(dates.from, "dd MMM") : "Check-in"} -{" "}
//           {dates.to ? format(dates.to, "dd MMM") : "Check-out"}
//         </span>
//       </div>
//       {isActive && (
//         <div className="absolute top-full left-0 md:left-auto md:right-0 bg-white shadow-lg rounded-lg mt-2 z-20">
//           <DayPicker
//             mode="range"
//             selected={dates}
//             onSelect={setDates}
//             numberOfMonths={2}
//             fromDate={new Date()}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// const GuestSelector = ({ guests, setGuests, isActive, setActive }) => {
//   const updateGuests = (type, delta) => {
//     setGuests((prev) => ({
//       ...prev,
//       [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + delta),
//     }));
//   };
//   const totalGuests = guests.adults + guests.children;

//   return (
//     <div className="relative">
//       <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-1">
//         <Users size={16} /> Guests
//       </label>
//       <div
//         onClick={setActive}
//         className="w-full p-3 border rounded-lg bg-gray-50 cursor-pointer h-[50px] flex items-center"
//       >
//         <span className="font-semibold">
//           {totalGuests} guest{totalGuests > 1 ? "s" : ""}
//         </span>
//       </div>
//       {isActive && (
//         <div className="absolute top-full left-0 md:left-auto md:right-0 w-full md:w-80 bg-white shadow-lg rounded-lg mt-2 p-4 z-20 space-y-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="font-semibold">Adults</p>
//               <p className="text-xs text-gray-500">Ages 13+</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => updateGuests("adults", -1)}
//                 className="p-2 rounded-full border hover:bg-gray-100"
//               >
//                 <Minus size={16} />
//               </button>
//               <span className="w-8 text-center font-bold">{guests.adults}</span>
//               <button
//                 type="button"
//                 onClick={() => updateGuests("adults", 1)}
//                 className="p-2 rounded-full border hover:bg-gray-100"
//               >
//                 <Plus size={16} />
//               </button>
//             </div>
//           </div>
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="font-semibold">Children</p>
//               <p className="text-xs text-gray-500">Ages 0-12</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => updateGuests("children", -1)}
//                 className="p-2 rounded-full border hover:bg-gray-100"
//               >
//                 <Minus size={16} />
//               </button>
//               <span className="w-8 text-center font-bold">
//                 {guests.children}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => updateGuests("children", 1)}
//                 className="p-2 rounded-full border hover:bg-gray-100"
//               >
//                 <Plus size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
