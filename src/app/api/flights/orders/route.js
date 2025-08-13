import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

// Initialize API Clients
const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function POST(request) {
  try {
    const { pricedOffer, passengers, sourceApi } = await request.json();

    if (!pricedOffer || !passengers?.length || !sourceApi) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters." },
        { status: 400 }
      );
    }

    let createdOrder;

    switch (sourceApi) {
      case "duffel":
        console.log(`🛒 Creating Duffel order for offer: ${pricedOffer.id}`);
        // Format passengers for Duffel
        const duffelPassengers = passengers.map((p) => ({
          id: p.id, // Include ID if updating an existing passenger
          given_name: p.firstName,
          family_name: p.lastName,
          gender: p.gender,
          born_on: p.dateOfBirth,
          phone_number: p.contact.phone,
          email: p.contact.email,
        }));

        const duffelOrder = await duffel.orders.create({
          selected_offers: [pricedOffer.id],
          passengers: duffelPassengers,
          // You can add payments here for a single-step booking, or handle it later
        });
        createdOrder = duffelOrder.data;
        break;

      case "amadeus":
        console.log(`🛒 Creating Amadeus order for offer: ${pricedOffer.id}`);
        // Amadeus needs the raw offer from the pricing step
        const amadeusPricedOffer = pricedOffer.rawOffer || pricedOffer;

        // Format travelers for Amadeus
        const amadeusTravelers = passengers.map((p, index) => ({
          id: (index + 1).toString(),
          dateOfBirth: p.dateOfBirth,
          name: { firstName: p.firstName, lastName: p.lastName },
          gender: p.gender.toUpperCase(),
          contact: {
            emailAddress: p.contact.email,
            phones: [
              {
                deviceType: "MOBILE",
                countryCallingCode: "880",
                number: p.contact.phone,
              },
            ],
          },
          // Document info can be added here if required
        }));

        const amadeusOrder = await amadeus.booking.flightOrders.post(
          JSON.stringify({
            data: {
              type: "flight-order",
              flightOffers: [amadeusPricedOffer],
              travelers: amadeusTravelers,
            },
          })
        );
        createdOrder = amadeusOrder.data;
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown source API." },
          { status: 400 }
        );
    }

    // IMPORTANT: In a real app, save the `createdOrder` to your database now
    // with a status like "pending_payment" and return your own internal order ID.

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (error) {
    const errorDetails = error.description || error.errors || error;
    console.error(
      "❌ API Error on Order Creation:",
      JSON.stringify(errorDetails, null, 2)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create flight order.",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
