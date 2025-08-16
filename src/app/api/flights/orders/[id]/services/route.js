// src/app/api/flights/orders/[id]/services/route.js
import { Duffel } from "@duffel/api";
import { NextResponse } from "next/server";

// --- 1. INITIALIZE API CLIENTS ---
const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });

/**
 * Normalizes a Duffel API response for available services.
 * @param {object} duffelResponse The raw Duffel API response.
 * @returns {object} A normalized response object with services.
 */
const normalizeDuffelServices = (duffelResponse) => {
  const { data } = duffelResponse;

  if (data.available_services) {
    return {
      success: true,
      services: data.available_services,
    };
  }

  return {
    success: false,
    error: "No available services found for this order.",
  };
};

// --- 2. MAIN API ROUTE HANDLER ---
export async function GET(request, { params }) {
  const orderId = params.id;

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Order ID is required." },
      { status: 400 }
    );
  }

  try {
    const duffelResponse = await duffel.orders.get(orderId);
    const result = normalizeDuffelServices(duffelResponse);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Duffel API error on getting services:", error);
    const errorMessage =
      error.errors?.[0]?.message ||
      error.message ||
      "An unexpected server error occurred.";
    const status = error.errors?.[0]?.status || 500;
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: status }
    );
  }
}
