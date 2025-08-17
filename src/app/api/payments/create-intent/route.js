// // src/app/api/stripe/create-payment-intent/route.js
// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

// export async function POST(request) {
//   try {
//     const { amount, currency = "usd", bookingData } = await request.json();

//     if (!amount || amount <= 0) {
//       return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
//     }

//     const amountInCents = Math.round(amount * 100); // Create payment intent with Stripe

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: currency.toLowerCase(),
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });

//     // In a real app, you would create the booking record here
//     // based on the bookingData, and store the paymentIntent.id
//     // to link the payment to the order.

//     return NextResponse.json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     console.error("Payment intent creation error:", error);
//     return NextResponse.json(
//       { error: "Failed to create payment intent" },
//       { status: 500 }
//     );
//   }
// }
