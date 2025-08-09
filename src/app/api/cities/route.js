import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");

  if (!keyword) {
    return NextResponse.json(
      { success: false, error: "Keyword is required." },
      { status: 400 }
    );
  }

  try {
    const response = await amadeus.referenceData.locations.cities.get({
      keyword: keyword,
      max: 5, // Get top 5 results
    });
    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Amadeus City Search Error:", error.description || error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch city data." },
      { status: 500 }
    );
  }
}
