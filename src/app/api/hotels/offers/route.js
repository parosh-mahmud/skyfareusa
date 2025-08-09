import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const adults = searchParams.get("adults");

  if (!hotelId || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameters for offer search.",
      },
      { status: 400 }
    );
  }

  try {
    // ✅ FIX: Use the 'hotelOffersSearch.get' method, which requires the full context.
    const response = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelId, // Pass the single hotelId to the plural 'hotelIds' parameter
      adults: adults || "1",
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
    });

    // Return the first available offer for this hotel
    return NextResponse.json({ success: true, data: response.data[0] });
  } catch (error) {
    console.error("❌ Amadeus Hotel Offer Error:", error.description || error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hotel offer details." },
      { status: 500 }
    );
  }
}
