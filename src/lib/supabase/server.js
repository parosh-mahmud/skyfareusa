// // This utility function creates a Supabase client that can be used in Next.js Server Components
// // or API routes. It correctly handles cookies to manage the user's session.
// //src/lib/supabase/server.js
// // We need to import the createServerClient function from the Supabase SSR library.
// import { createServerClient } from "@supabase/ssr";
// // The 'cookies' function from next/headers is used to access cookies on the server.
// import { cookies } from "next/headers";

// /**
//  * Creates a server-side Supabase client with cookie handling.
//  * This is the recommended way to interact with Supabase in Next.js Server Components and API routes.
//  * @returns {object} A Supabase client instance.
//  */
// export function createClient() {
//   // Get the cookie store from the incoming request.
//   const cookieStore = cookies();

//   // Return a new Supabase client instance.
//   // We pass the public URL and key from environment variables.
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         // The getAll() method is used to get all cookies for the Supabase client.
//         getAll() {
//           return cookieStore.getAll();
//         },
//         // The setAll() method is used to set cookies after a successful action (e.g., login).
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//             );
//           } catch {
//             // This is a catch-all for when `setAll` is called from a Server Component.
//             // This can be safely ignored if you have middleware refreshing user sessions.
//           }
//         },
//       },
//     }
//   );
// }
