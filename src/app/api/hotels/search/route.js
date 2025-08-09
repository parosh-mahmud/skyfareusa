import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function POST(request) {
  try {
    const { cityCode, checkInDate, checkOutDate, adults } =
      await request.json();

    if (!cityCode || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: cityCode, checkInDate, and checkOutDate are required.",
        },
        { status: 400 }
      );
    }

    // Step 1: Get a list of hotel IDs for the given city, as per the documentation.
    const hotelListResponse =
      await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: cityCode,
      });

    const hotelIds = hotelListResponse.data.map((hotel) => hotel.hotelId);

    if (hotelIds.length === 0) {
      return NextResponse.json({
        success: true,
        offers: [],
        meta: { hasNextPage: false },
      });
    }

    // Step 2: Use the hotel IDs to get real-time offers (prices and availability).
    // ✅ FIX: This now uses the correct `hotelOffersSearch.get` method.
    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.slice(0, 30).join(","), // Amadeus API is limited, search for the first 30 hotels
      adults: adults || "1",
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      paymentPolicy: "NONE",
      bestRateOnly: true,
    });

    return NextResponse.json({
      success: true,
      offers: offersResponse.data,
      meta: {
        // This API doesn't support pagination directly, so we indicate no more pages.
        hasNextPage: false,
      },
    });
  } catch (error) {
    // This will catch errors from either of the Amadeus API calls
    console.error("❌ Amadeus Hotel Search Error:", error.description || error);
    const errorMessage =
      error.description?.detail || "An error occurred with the hotel provider.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
