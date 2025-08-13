// src/app/api/flights/orders/[orderId]/ancillaries/route.js
import { Duffel } from "@duffel/api";
import { NextResponse } from "next/server";

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });

export async function GET(request, { params }) {
  const { orderId } = params;

  // This flow is primarily for Duffel. Amadeus ancillaries are often part of the main offer.
  const sourceApi = orderId.startsWith("ord_") ? "duffel" : "amadeus";

  try {
    let ancillaryOffers = [];
    if (sourceApi === "duffel") {
      const ancillaryOfferRequest = await duffel.ancillaryOfferRequests.create({
        order_id: orderId,
      });
      // We are only interested in extra baggage for now
      ancillaryOffers = ancillaryOfferRequest.data.offers.filter(
        (o) => o.metadata.type === "baggage"
      );
    }

    return NextResponse.json({ success: true, ancillaryOffers });
  } catch (error) {
    console.error("❌ API Error fetching ancillaries:", error.errors || error);
    return NextResponse.json({ success: false, ancillaryOffers: [] });
  }
}
