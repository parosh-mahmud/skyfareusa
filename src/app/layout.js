// src/app/layout.js
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Providers from "./providers";
// Configure Inter for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Configure Poppins for headings
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "SkyFareUSA | Book Flights with Ease",
  description:
    "Find and book cheap flights with SkyFareUSA. Your ultimate flight booking solution for secure and seamless reservations.",
};

export default function RootLayout({ children }) {
  return (
    // ✅ The fix is adding suppressHydrationWarning here
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen bg-sand text-neutral-800 font-sans">
        <Header />
        {/* Note: Corrected non-standard Tailwind class sm:h-18 to sm:h-20 */}
        <div className="h-16 sm:h-20 md:h-20"></div>
        <main className="flex-grow">
          <Providers>{children}</Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}
