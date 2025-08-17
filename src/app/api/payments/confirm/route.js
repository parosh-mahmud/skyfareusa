// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

// export async function POST(request) {
//   try {
//     const { paymentIntentId, bookingId } = await request.json();

//     if (!paymentIntentId || !bookingId) {
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     // Retrieve payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     const supabase = createClient();
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Update booking status based on payment status
//     const bookingStatus =
//       paymentIntent.status === "succeeded" ? "confirmed" : "pending";
//     const paymentStatus =
//       paymentIntent.status === "succeeded" ? "completed" : "pending";

//     const { error: bookingError } = await supabase
//       .from("bookings")
//       .update({
//         status: bookingStatus,
//         payment_status: paymentStatus,
//         payment_method: paymentIntent.payment_method_types?.[0] || "card",
//         payment_completed_at:
//           paymentIntent.status === "succeeded"
//             ? new Date().toISOString()
//             : null,
//       })
//       .eq("id", bookingId)
//       .eq("user_id", user.id);

//     if (bookingError) {
//       console.error("Booking update error:", bookingError);
//       return NextResponse.json(
//         { error: "Failed to update booking" },
//         { status: 500 }
//       );
//     }

//     // Update payment transaction
//     await supabase
//       .from("payment_transactions")
//       .update({
//         status: paymentIntent.status,
//         payment_method_type: paymentIntent.payment_method_types?.[0] || "card",
//         failure_reason: paymentIntent.last_payment_error?.message || null,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("stripe_payment_intent_id", paymentIntentId);

//     return NextResponse.json({
//       success: true,
//       status: paymentIntent.status,
//       bookingStatus,
//     });
//   } catch (error) {
//     console.error("Payment confirmation error:", error);
//     return NextResponse.json(
//       { error: "Failed to confirm payment" },
//       { status: 500 }
//     );
//   }
// }
