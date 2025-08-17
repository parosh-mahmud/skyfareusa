"use client";

import { Plane, BedDouble, Globe, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import FlightSearchForm from "./FlightSearchForm";
import HotelSearchForm from "./HotelSearchForm";

// A reusable placeholder component for upcoming features
const ComingSoonPlaceholder = ({ icon: Icon, title, description }) => (
  <Card className="w-full rounded-t-none md:rounded-t-2xl border-t-0">
    <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        <div className="p-3 bg-primary/20 rounded-full">
          <Icon className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </CardContent>
  </Card>
);

export default function SearchTabs() {
  const services = [
    { id: "flight", label: "Flight", icon: Plane },
    { id: "hotel", label: "Hotel", icon: BedDouble },
    { id: "tour", label: "Tour", icon: Globe },
    { id: "visa", label: "Visa", icon: FileText },
  ];

  return (
    <Tabs defaultValue="flight" className="w-full">
      <div className="w-full flex justify-center relative z-10">
        <TabsList className="h-auto bg-background p-1 rounded-2xl shadow-lg">
          {services.map((service) => (
            <TabsTrigger
              key={service.id}
              value={service.id}
              className="px-4 sm:px-6 py-3 text-sm md:text-base rounded-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold relative"
            >
              <service.icon size={16} className="mr-2 sm:mr-3" />
              {service.label}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full transition-transform scale-x-0 data-[state=active]:scale-x-100" />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="relative -mt-4">
        <TabsContent value="flight">
          <FlightSearchForm />
        </TabsContent>
        <TabsContent value="hotel">
          <HotelSearchForm />
        </TabsContent>
        <TabsContent value="tour">
          <ComingSoonPlaceholder
            icon={Globe}
            title="Tour Packages"
            description="Coming soon! Discover amazing, curated tour packages for your next adventure."
          />
        </TabsContent>
        <TabsContent value="visa">
          <ComingSoonPlaceholder
            icon={FileText}
            title="Visa Services"
            description="Coming soon! Let us help you with your visa applications for a hassle-free travel experience."
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
