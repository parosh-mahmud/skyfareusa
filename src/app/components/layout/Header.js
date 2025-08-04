// app/components/Header.js

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-2xl font-bold text-sky-600">
          SkyFareUSA
        </Link>
        {/* Navigation Menu */}
        <nav className="flex space-x-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-sky-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/flights"
            className="text-gray-600 hover:text-sky-600 transition-colors"
          >
            Flights
          </Link>
          <Link
            href="/about"
            className="text-gray-600 hover:text-sky-600 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-gray-600 hover:text-sky-600 transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
