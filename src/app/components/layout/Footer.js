// app/components/Footer.js

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-8 text-center mt-auto">
      <div className="container mx-auto">
        <p className="text-sm">&copy; 2025 SkyFareUSA. All rights reserved.</p>
        <nav className="mt-4 space-x-4">
          <Link
            href="/privacy-policy"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
