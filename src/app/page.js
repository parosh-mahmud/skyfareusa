import FlightSearchTabs from "./components/feature/FlightSearchTabs";
import FlightSearchForm from "./components/feature/FlightSearchForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-200 to-cyan-300">
      {/* Flight Search Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 flex flex-col items-center">
        <FlightSearchTabs />
        <FlightSearchForm />
      </div>
    </div>
  );
}
