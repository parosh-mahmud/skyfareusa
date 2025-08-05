import FlightSearchTabs from "./components/feature/FlightSearchTabs";
import FlightSearchForm from "./components/feature/FlightSearchForm";

export default function Page() {
  return (
    <div>
      {/* Hero Section (first 500px) */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-neutral-900/30"></div>
        {/* Centered search UI */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center h-full">
          <FlightSearchTabs />
          <FlightSearchForm />
        </div>
      </section>

      {/* Main Content */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-heading text-primary text-center mb-8">
            Explore Our Top Destinations
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-600 text-center">
            Discover amazing places and find the best deals for your next
            adventure.
          </p>
          {/* Add more sections below... */}
        </div>
      </section>
    </div>
  );
}
