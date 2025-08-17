"use client";

import { useState } from "react";
import { Plane, BedDouble, Globe, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import FlightSearchForm from "./FlightSearchForm";
import HotelSearchForm from "./HotelSearchForm";

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
        <TabsList className="h-auto bg-background/80 backdrop-blur-sm p-2 rounded-2xl">
          {services.map((service) => (
            <TabsTrigger
              key={service.id}
              value={service.id}
              className="px-6 py-4 text-sm md:text-base rounded-xl data-[state=active]:shadow-lg"
            >
              <service.icon size={20} className="mr-3" />
              {service.label}
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
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tour Packages</h3>
              <p className="text-muted-foreground">
                Coming soon! Discover amazing tour packages.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visa">
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visa Services</h3>
              <p className="text-muted-foreground">
                Coming soon! Get help with your visa applications.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
