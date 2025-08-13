import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

/**
 * Fetches detailed static information for one or more hotels by their IDs.
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response with the hotel details or an error.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hotelIds = searchParams.get("hotelIds"); // Expects a comma-separated string of IDs

  if (!hotelIds) {
    return NextResponse.json(
      { success: false, error: "The 'hotelIds' parameter is required." },
      { status: 400 }
    );
  }

  try {
    // This is the correct Amadeus SDK method to get detailed hotel information
    const response = await amadeus.referenceData.locations.hotels.byHotels.get({
      hotelIds: hotelIds,
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error(
      "❌ Amadeus Hotel Details Error:",
      error.description || error
    );
    const errorMessage =
      error.description?.detail ||
      "An error occurred while fetching hotel details.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
