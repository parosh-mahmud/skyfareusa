import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

// --- NORMALIZATION FUNCTIONS ---
// These translate the complex, different responses into one simple format.

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

const normalizeAmadeusSeatMap = (seatMap) => ({
  segmentId: null, // Amadeus response doesn't tie map to a segment ID here
  cabins: seatMap.decks.map((deck) => ({
    cabinClass: deck.deckConfiguration?.cabin,
    rows: seatMap.seats
      .filter((s) => s.deck === deck.deckNumber)
      .reduce((acc, seat) => {
        let row = acc.find((r) => r.rowNumber === seat.number.slice(0, -1));
        if (!row) {
          row = {
            rowNumber: seat.number.slice(0, -1),
            sections: [{ elements: [] }],
          };
          acc.push(row);
        }
        const travelerPricing = seatMap.travelerPricing?.find(
          (tp) => tp.seatNumber === seat.number
        );
        row.sections[0].elements.push({
          type: "seat",
          designator: seat.number,
          isAvailable:
            seat.travelerPricing?.[0]?.seatAvailabilityStatus === "AVAILABLE",
          price: travelerPricing?.price?.total,
          currency: travelerPricing?.price?.currency,
          serviceId: null, // Amadeus books by designator, not service ID
        });
        return acc;
      }, []),
  })),
});

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
        const amadeusOffer = offer.rawOffer || offer;
        const amadeusResponse = await amadeus.shopping.seatmaps.post(
          JSON.stringify({ data: [amadeusOffer] })
        );
        normalizedSeatMaps = amadeusResponse.data.map(normalizeAmadeusSeatMap);
        break;

      default:
        throw new Error("Unknown API source for seat maps.");
    }

    return NextResponse.json({ success: true, seatMaps: normalizedSeatMaps });
  } catch (error) {
    console.error(
      "❌ API Error fetching seat maps:",
      error.description || error.errors || error
    );
    return NextResponse.json({ success: false, seatMaps: [] });
  }
}
