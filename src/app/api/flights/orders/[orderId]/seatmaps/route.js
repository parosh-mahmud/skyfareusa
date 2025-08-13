import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function GET(request, { params }) {
  const { orderId } = params;

  // In a real app, you would first look up your internal order by `orderId`
  // to get the provider's order ID and the `sourceApi`.
  // For this example, we assume the orderId is the provider's ID.

  // TODO: Replace this with your database lookup logic.
  // For now, we'll guess the source based on the ID format.
  const sourceApi = orderId.startsWith("ord_") ? "duffel" : "amadeus";

  try {
    let seatMaps;
    switch (sourceApi) {
      case "duffel":
        const duffelSeatMaps = await duffel.seatMaps.get({ order_id: orderId });
        seatMaps = duffelSeatMaps.data;
        break;

      case "amadeus":
        // Amadeus uses the flight-orderId to get the seatmap
        const amadeusSeatMaps = await amadeus.shopping.seatmaps.get({
          "flight-orderId": orderId,
        });
        seatMaps = amadeusSeatMaps.data;
        break;

      default:
        throw new Error("Unknown API source");
    }

    // You can add a normalization step here if their structures are different
    return NextResponse.json({ success: true, seatMaps });
  } catch (error) {
    console.error(
      "❌ API Error fetching seat maps:",
      error.description || error.errors || error
    );
    return NextResponse.json({ success: false, seatMaps: [] });
  }
}
