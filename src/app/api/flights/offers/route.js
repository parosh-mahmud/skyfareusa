import { Duffel } from "@duffel/api";
import { NextResponse } from "next/server";

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offer_request_id = searchParams.get("offer_request_id");
    const after = searchParams.get("after");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!offer_request_id) {
      return NextResponse.json(
        { success: false, error: "Offer Request ID is required" },
        { status: 400 }
      );
    }

    // Using .list() for manual pagination as shown in the documentation
    const response = await duffel.offers.list({
      offer_request_id,
      limit,
      after,
    });

    return NextResponse.json({
      success: true,
      offers: response.data,
      meta: response.meta, // Pass the pagination meta object to the client
    });
  } catch (error) {
    //
    // --- IMPROVEMENT BASED ON DOCUMENTATION ---
    //
    console.error("❌ Duffel API Error on List Offers:", {
      requestId: error.meta?.request_id,
      statusCode: error.meta?.status,
      errors: error.errors,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load more flight offers.",
        details: error.errors || [
          { message: "An unknown server error occurred." },
        ],
      },
      { status: error.meta?.status || 500 }
    );
  }
}
