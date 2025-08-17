// src/app/layout.js
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header"; // Using new path alias
import Footer from "@/components/layout/Footer"; // Using new path alias
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Sky Fare USA | Book Flights with Ease",
  description:
    "Find and book cheap flights with Sky Fare USA. Your ultimate flight booking solution.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      {/* The "font-sans" class now correctly applies the Inter font 
        because of our tailwind.config.js setup.
      */}
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Header />
        {/* The empty div for spacing is removed for a cleaner approach */}
        <main className="flex-grow pt-16 sm:pt-20 md:pt-20">
          {" "}
          {/* Add padding here instead */}
          <Providers>{children}</Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}
