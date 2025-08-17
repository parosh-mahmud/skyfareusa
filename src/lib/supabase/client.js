// // This utility function creates a Supabase client that can be used in Next.js Client Components.
// // It is specifically designed to work in the user's browser.

// // Import the `createBrowserClient` function from the Supabase SSR library.
// import { createBrowserClient } from "@supabase/ssr";

// /**
//  * Creates a browser-side Supabase client.
//  * This function should be used in React components that need to interact with Supabase
//  * from the browser (e.g., components with "use client" directive or that use React hooks).
//  * @returns {object} A Supabase client instance for the browser.
//  */
// export function createClient() {
//   // Return a new Supabase client instance.
//   // It automatically handles the storage of the user session in the browser's cookies.
//   // We pass the public URL and key from environment variables.
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//   );
// }
