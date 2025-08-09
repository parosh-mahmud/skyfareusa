// src/app/page.js
// NO "use client" here - this is a Server Component

import { Suspense } from "react";
import SearchTabs from "src/components/feature/SearchTabs"; // The only import needed
import { Loader } from "lucide-react";

const FormSkeleton = () => {
  return (
    <div className="bg-white/80 rounded-3xl shadow-xl w-full pt-8 border border-gray-100 flex items-center justify-center h-[450px]">
      <div className="text-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="mt-4 text-neutral-600">
          Loading your search experience...
        </p>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-[650px] bg-cover bg-center pt-5"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-neutral-900/30"></div>
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start h-full pt-16">
          <div className="w-full max-w-6xl">
            {/* ✅ FIX: Wrap only the SearchTabs component in Suspense */}
            <Suspense fallback={<FormSkeleton />}>
              <SearchTabs />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-heading text-primary text-center mb-8">
            Explore Our Top Destinations
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-600 text-center">
            Discover amazing places and find the best deals for your next
            adventure.
          </p>
        </div>
      </section>
    </div>
  );
}
