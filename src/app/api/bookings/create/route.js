// // This file contains a Next.js API route to handle booking creation using Supabase.

// import { NextResponse } from "next/server";
// // Corrected import path using the '@/lib/supabase/server' alias.
// import { createClient } from "./lib/supabase/server";

// export async function POST(request) {
//   // TypeScript users would use "request: Request" but this is pure JavaScript.
//   try {
//     const bookingData = await request.json();

//     const supabase = createClient();
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     // Check if the user is authenticated.
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Generate a unique booking reference.
//     const bookingReference =
//       "BK" + Math.random().toString(36).substr(2, 8).toUpperCase();

//     // Check if the required fields are present to prevent errors.
//     if (!bookingData.flight || !bookingData.passengers) {
//       return NextResponse.json(
//         { error: "Missing required booking data." },
//         { status: 400 }
//       );
//     }

//     // Prepare the data for insertion. Postgres can handle JSONB directly, but it's
//     // good practice to ensure the data is formatted correctly as an object.
//     const insertData = {
//       id: bookingReference,
//       user_id: user.id,
//       flight_data: bookingData.flight,
//       passenger_details: bookingData.passengers,
//       baggage_selections: bookingData.baggage || {},
//       seat_selections: bookingData.seats || {},
//       additional_services: bookingData.services || {},
//       total_amount: bookingData.totalAmount,
//       currency: bookingData.flight.total_currency || "USD",
//       payment_option: bookingData.paymentOption,
//       status:
//         bookingData.paymentOption === "book-now-pay-later"
//           ? "pending_payment"
//           : "pending",
//       payment_status: "pending",
//       created_at: new Date().toISOString(),
//       payment_due_date:
//         bookingData.paymentOption === "book-now-pay-later"
//           ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
//           : null,
//     };

//     // Insert the booking record into the "bookings" table.
//     const { data: booking, error: bookingError } = await supabase
//       .from("bookings")
//       .insert(insertData)
//       .select()
//       .single();

//     if (bookingError) {
//       console.error("Booking creation error:", bookingError);
//       return NextResponse.json(
//         { error: "Failed to create booking" },
//         { status: 500 }
//       );
//     }

//     // Return the successful response.
//     return NextResponse.json({
//       success: true,
//       bookingReference,
//       booking,
//     });
//   } catch (error) {
//     console.error("Booking creation error:", error);
//     return NextResponse.json(
//       { error: "Failed to create booking" },
//       { status: 500 }
//     );
//   }
// }
