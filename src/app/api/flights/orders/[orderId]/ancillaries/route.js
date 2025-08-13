import { Duffel } from "@duffel/api";
import { NextResponse } from "next/server";

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });

export async function GET(request, { params }) {
  const { orderId } = params;

  // This flow is well-defined for Duffel. Amadeus handles ancillaries
  // differently, often requiring them to be priced with the offer.
  const sourceApi = orderId.startsWith("ord_") ? "duffel" : "amadeus";

  try {
    let ancillaryOffers = [];
    if (sourceApi === "duffel") {
      const ancillaryOfferRequest = await duffel.ancillaryOfferRequests.create({
        order_id: orderId,
      });
      ancillaryOffers = ancillaryOfferRequest.data.offers;
    }

    return NextResponse.json({ success: true, ancillaryOffers });
  } catch (error) {
    console.error("❌ API Error fetching ancillaries:", error.errors || error);
    return NextResponse.json({ success: false, ancillaryOffers: [] });
  }
}
