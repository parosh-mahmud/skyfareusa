// // src/app/api/flights/offers/seatmaps/route.js
// import { Duffel } from "@duffel/api";
// import Amadeus from "amadeus";
// import { NextResponse } from "next/server";

// const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
// const amadeus = new Amadeus({
//   clientId: process.env.AMADEUS_API_KEY,
//   clientSecret: process.env.AMADEUS_API_SECRET,
// });

// // --- NORMALIZATION FUNCTIONS ---
// // These translate the complex, different responses into one simple format.

// const normalizeDuffelSeatMap = (seatMap) => ({
//   segmentId: seatMap.segment_id,
//   cabins: seatMap.cabins.map((cabin) => ({
//     cabinClass: cabin.cabin_class,
//     rows: cabin.rows.map((row) => ({
//       rowNumber: row.row_number,
//       sections: row.sections.map((section) => ({
//         elements: section.elements.map((el) => {
//           const service = el.available_services?.[0];
//           return {
//             type: el.type,
//             designator: el.designator,
//             isAvailable: !!service,
//             price: service?.total_amount,
//             currency: service?.total_currency,
//             serviceId: service?.id, // Crucial for booking
//           };
//         }),
//       })),
//     })),
//   })),
// });

// const normalizeAmadeusSeatMap = (seatMap) => ({
//   segmentId: null, // Amadeus response doesn't tie map to a segment ID here
//   cabins: seatMap.decks.map((deck) => ({
//     cabinClass: deck.deckConfiguration?.cabin,
//     rows: seatMap.seats
//       .filter((s) => s.deck === deck.deckNumber)
//       .reduce((acc, seat) => {
//         let row = acc.find((r) => r.rowNumber === seat.number.slice(0, -1));
//         if (!row) {
//           row = {
//             rowNumber: seat.number.slice(0, -1),
//             sections: [{ elements: [] }],
//           };
//           acc.push(row);
//         }
//         const travelerPricing = seatMap.travelerPricing?.find(
//           (tp) => tp.seatNumber === seat.number
//         );
//         row.sections[0].elements.push({
//           type: "seat",
//           designator: seat.number,
//           isAvailable:
//             seat.travelerPricing?.[0]?.seatAvailabilityStatus === "AVAILABLE",
//           price: travelerPricing?.price?.total,
//           currency: travelerPricing?.price?.currency,
//           serviceId: null, // Amadeus books by designator, not service ID
//         });
//         return acc;
//       }, []),
//   })),
// });

// export async function POST(request) {
//   try {
//     const { offer } = await request.json();
//     if (!offer || !offer.sourceApi) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "A complete flight offer object with sourceApi is required.",
//         },
//         { status: 400 }
//       );
//     }

//     let normalizedSeatMaps = [];
//     switch (offer.sourceApi) {
//       case "duffel":
//         const duffelResponse = await duffel.seatMaps.get({
//           offer_id: offer.id,
//         });
//         normalizedSeatMaps = duffelResponse.data.map(normalizeDuffelSeatMap);
//         break;

//       case "amadeus":
//         const amadeusOffer = offer.rawOffer || offer;
//         const amadeusResponse = await amadeus.shopping.seatmaps.post(
//           JSON.stringify({ data: [amadeusOffer] })
//         );
//         normalizedSeatMaps = amadeusResponse.data.map(normalizeAmadeusSeatMap);
//         break;

//       default:
//         throw new Error("Unknown API source for seat maps.");
//     }

//     return NextResponse.json({ success: true, seatMaps: normalizedSeatMaps });
//   } catch (error) {
//     console.error(
//       "❌ API Error fetching seat maps:",
//       error.description || error.errors || error
//     );
//     return NextResponse.json({ success: false, seatMaps: [] });
//   }
// }

// src/app/api/flights/offers/seatmaps/route.js
// src/app/api/flights/offers/seatmaps/route.js
import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

// --- NORMALIZATION FUNCTIONS --- These translate the complex, different responses into one simple format.

const normalizeDuffelSeatMap = (seatMap) => ({
  segmentId: seatMap.segment_id,
  cabins: seatMap.cabins.map((cabin) => ({
    cabinClass: cabin.cabin_class,
    rows: cabin.rows.map((row) => ({
      rowNumber: row.row_number,
      sections: row.sections.map((section) => ({
        elements: section.elements.map((el) => {
          const service = el.available_services?.[0];
          return {
            type: el.type,
            designator: el.designator,
            isAvailable: !!service,
            price: service?.total_amount,
            currency: service?.total_currency,
            serviceId: service?.id, // Crucial for booking
          };
        }),
      })),
    })),
  })),
});

const normalizeAmadeusSeatMap = (seatMapData) => {
  console.log(
    "Raw Amadeus seatmap data:",
    JSON.stringify(seatMapData, null, 2)
  );

  // Amadeus returns seatmap objects with different possible structures
  const seatMap = seatMapData;

  // Handle case where decks might be at different levels in the response
  let decks = seatMap.decks || seatMap.data?.decks || [];
  let seats = seatMap.seats || seatMap.data?.seats || [];

  // If decks is not an array, try to extract from other possible locations
  if (!Array.isArray(decks)) {
    // Sometimes the structure is different - check for aircraft configuration
    if (seatMap.aircraftCabinAmenities || seatMap.aircraft) {
      // Create a default deck structure if none exists
      decks = [
        {
          deckNumber: 1,
          deckConfiguration: {
            width: 7, // Default aircraft width
            length: 50, // Default length
          },
        },
      ];
    } else {
      console.warn("Invalid Amadeus seatmap structure - no decks found");
      return {
        segmentId: seatMap.segmentId || seatMap.id || null,
        cabins: [],
      };
    }
  }

  // If seats array is empty, try to find seats in other locations
  if (!Array.isArray(seats) || seats.length === 0) {
    // Check if seats are nested within decks
    seats = decks.flatMap((deck) => deck.seats || []);

    // If still no seats, check for alternative structures
    if (seats.length === 0 && seatMap.elements) {
      seats = seatMap.elements.filter((el) => el.type === "seat");
    }
  }

  console.log(`Found ${decks.length} decks and ${seats.length} seats`);

  return {
    segmentId: seatMap.segmentId || seatMap.id || null,
    cabins: decks.map((deck, deckIndex) => {
      // Get seats for this specific deck
      const deckSeats = seats.filter((seat) => {
        // Match by deck number or assume all seats belong to first deck if no deck specified
        return (
          seat.deck === deck.deckNumber ||
          seat.deckNumber === deck.deckNumber ||
          (deckIndex === 0 &&
            (seat.deck === undefined || seat.deckNumber === undefined))
        );
      });

      console.log(
        `Deck ${deck.deckNumber || deckIndex}: ${deckSeats.length} seats`
      );

      // Group seats by row number (extract row from seat number like "12A" -> "12")
      const rowsMap = new Map();

      deckSeats.forEach((seat) => {
        // Handle different seat number formats
        const seatNumber = seat.number || seat.seatNumber || seat.designator;
        const rowNumber = seatNumber?.match(/^(\d+)/)?.[1];

        if (!rowNumber) {
          console.warn("Could not extract row number from seat:", seatNumber);
          return;
        }

        if (!rowsMap.has(rowNumber)) {
          rowsMap.set(rowNumber, {
            rowNumber,
            sections: [{ elements: [] }],
          });
        }

        // Find traveler pricing for this seat - handle different response structures
        const travelerPricing =
          seat.travelerPricing?.[0] || seat.pricing?.[0] || seat.price;
        const isAvailable =
          travelerPricing?.seatAvailabilityStatus === "AVAILABLE" ||
          seat.availabilityStatus === "AVAILABLE" ||
          seat.status === "AVAILABLE";

        // Extract price information from different possible locations
        let price = null;
        let currency = null;

        if (travelerPricing?.price) {
          price = travelerPricing.price.total || travelerPricing.price.amount;
          currency = travelerPricing.price.currency;
        } else if (seat.price) {
          price = seat.price.total || seat.price.amount || seat.price;
          currency = seat.price.currency || seat.currency;
        }

        rowsMap.get(rowNumber).sections[0].elements.push({
          type: "seat",
          designator: seatNumber,
          isAvailable,
          price: price,
          currency: currency,
          serviceId: seat.serviceId || null,
          characteristics:
            seat.characteristicsCodes || seat.characteristics || [],
          coordinates: seat.coordinates || null,
        });
      });

      // Convert map to array and sort by row number
      const rows = Array.from(rowsMap.values()).sort(
        (a, b) => Number.parseInt(a.rowNumber) - Number.parseInt(b.rowNumber)
      );

      // Sort seats within each row by letter (A, B, C, etc.)
      rows.forEach((row) => {
        row.sections[0].elements.sort((a, b) => {
          const letterA = a.designator?.slice(-1) || "";
          const letterB = b.designator?.slice(-1) || "";
          return letterA.localeCompare(letterB);
        });
      });

      console.log(
        `Deck ${deck.deckNumber || deckIndex} processed: ${rows.length} rows`
      );

      return {
        cabinClass: deck.deckConfiguration?.cabin || deck.cabin || "ECONOMY",
        deckNumber: deck.deckNumber || deckIndex + 1,
        rows,
      };
    }),
  };
};

export async function POST(request) {
  try {
    const { offer } = await request.json();
    if (!offer || !offer.sourceApi) {
      return NextResponse.json(
        {
          success: false,
          error: "A complete flight offer object with sourceApi is required.",
        },
        { status: 400 }
      );
    }

    let normalizedSeatMaps = [];
    switch (offer.sourceApi) {
      case "duffel":
        const duffelResponse = await duffel.seatMaps.get({
          offer_id: offer.id,
        });
        normalizedSeatMaps = duffelResponse.data.map(normalizeDuffelSeatMap);
        break;

      case "amadeus":
        try {
          const amadeusOffer = offer.rawOffer || offer;

          // Ensure the offer is in the correct format for Amadeus
          if (!amadeusOffer.type || amadeusOffer.type !== "flight-offer") {
            throw new Error(
              "Invalid Amadeus offer format - missing type field"
            );
          }

          // console.log(
          //   "Making Amadeus seatmap request for offer:",
          //   amadeusOffer.id
          // );

          const amadeusResponse = await amadeus.shopping.seatmaps.post(
            JSON.stringify({
              data: [amadeusOffer],
            }),
            {
              "Content-Type": "application/json",
            }
          );

          // console.log("Amadeus seatmap response received:", {
          //   statusCode: amadeusResponse.statusCode,
          //   dataLength: amadeusResponse.data?.length,
          // });

          // console.log(
          //   "Full Amadeus response structure:",
          //   JSON.stringify(amadeusResponse.data, null, 2)
          // );

          if (!amadeusResponse.data || !Array.isArray(amadeusResponse.data)) {
            throw new Error("Invalid Amadeus seatmap response format");
          }

          normalizedSeatMaps = amadeusResponse.data.map(
            normalizeAmadeusSeatMap
          );

          // console.log(
          //   "Normalized seatmaps:",
          //   JSON.stringify(normalizedSeatMaps, null, 2)
          // );
        } catch (amadeusError) {
          console.error("Amadeus seatmap API error:", {
            message: amadeusError.message,
            description: amadeusError.description,
            code: amadeusError.code,
            response: amadeusError.response?.data,
          });

          // Return empty seatmaps instead of failing completely
          return NextResponse.json({
            success: true,
            seatMaps: [],
            warning: "Seatmaps not available for this flight",
          });
        }
        break;

      default:
        throw new Error("Unknown API source for seat maps.");
    }

    return NextResponse.json({ success: true, seatMaps: normalizedSeatMaps });
  } catch (error) {
    console.error(
      "❌ API Error fetching seat maps:",
      error.description || error.errors || error.message || error
    );
    return NextResponse.json({
      success: false,
      seatMaps: [],
      error: error.message || "Failed to fetch seatmaps",
    });
  }
}
