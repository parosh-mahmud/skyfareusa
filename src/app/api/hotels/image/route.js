import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hotelName = searchParams.get("hotelName");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!hotelName) {
    return NextResponse.json({
      success: false,
      error: "Hotel name is required.",
    });
  }

  // 1. Use Google Places Text Search to find the hotel and get its 'place_id'
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    hotelName
  )}&location=${lat},${lng}&key=${process.env.Maps_API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  const place = searchData.results?.[0];
  if (!place || !place.photos?.[0]?.photo_reference) {
    return NextResponse.json({ success: false, error: "No photo found." });
  }

  // 2. Use the 'photo_reference' to construct the final image URL
  const photoReference = place.photos[0].photo_reference;
  const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.Maps_API_KEY}`;

  return NextResponse.json({ success: true, imageUrl: imageUrl });
}
