"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "src/lib/store";

// Import Lucide icons
import {
  Star,
  Luggage,
  Armchair,
  Wifi,
  Coffee,
  RefreshCw,
  Shield,
  X,
  Info,
  Crown,
} from "lucide-react";

// Import shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Feature Item Component
const FeatureItem = ({
  icon: Icon,
  text,
  available = true,
  isHighlight = false,
}) => (
  <div
    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
      isHighlight ? "bg-primary/10" : ""
    } ${!available ? "opacity-50" : ""}`}
  >
    <Icon
      size={18}
      className={`flex-shrink-0 ${
        available
          ? isHighlight
            ? "text-primary"
            : "text-green-600"
          : "text-muted-foreground"
      }`}
    />
    <span
      className={`text-sm ${
        available ? "text-foreground" : "text-muted-foreground line-through"
      }`}
    >
      {text}
    </span>
  </div>
);

// Fare Details Modal
const FareDetailsModal = ({ offer, features, fareName, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{fareName} Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          {Object.entries(features).map(
            ([category, items]) =>
              items.length > 0 && (
                <div key={category}>
                  <h3 className="text-lg font-semibold capitalize mb-2 pb-2 border-b">
                    {category}
                  </h3>
                  <div className="grid gap-2">
                    {items.map((feature, idx) => (
                      <FeatureItem key={idx} {...feature} />
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main FareCard Component
export default function FareCard({ offer, isRecommended = false, onSelect }) {
  const router = useRouter();
  const setSelectedOffer = useBookingStore((state) => state.setSelectedOffer);

  const fareDetails = useMemo(() => {
    if (!offer) {
      return {
        features: { baggage: [], comfort: [], flexibility: [] },
        fareName: "Standard",
        airline: "",
      };
    }

    const isAmadeus = offer.sourceApi === "amadeus";
    const features = { baggage: [], comfort: [], flexibility: [] };
    let fareName = "Standard";
    let airline = "";

    if (isAmadeus) {
      const travelerPricing = offer.rawOffer?.travelerPricings?.[0];
      const fareSegment = travelerPricing?.fareDetailsBySegment?.[0];
      fareName =
        fareSegment?.brandedFareLabel || fareSegment?.cabin || "Economy";
      airline = offer.rawOffer?.validatingAirlineCodes?.[0] || "";

      if (fareSegment?.includedCheckedBags) {
        const { weight, weightUnit = "KG" } = fareSegment.includedCheckedBags;
        features.baggage.push({
          icon: Luggage,
          text: `${weight}${weightUnit} Checked Bag`,
          available: true,
          isHighlight: weight >= 25,
        });
      } else {
        features.baggage.push({
          icon: Luggage,
          text: "No Checked Bag",
          available: false,
        });
      }

      features.comfort.push({
        icon: Armchair,
        text: `${fareSegment?.cabin || "Economy"} Class`,
        available: true,
        isHighlight: fareSegment?.cabin !== "ECONOMY",
      });
    } else {
      // Handle Duffel API response structure
      const baggageAllowance =
        offer.passengers?.[0]?.baggages?.[0]?.quantity || 0;
      fareName = "Duffel Standard";
      airline = offer.slices?.[0]?.segments?.[0]?.carrier?.name || "";

      if (baggageAllowance > 0) {
        features.baggage.push({
          icon: Luggage,
          text: `${baggageAllowance} Checked Bag(s)`,
          available: true,
          isHighlight: baggageAllowance > 1,
        });
      } else {
        features.baggage.push({
          icon: Luggage,
          text: "No Checked Bag",
          available: false,
        });
      }

      const isRefundable =
        offer.conditions?.refund_before_departure?.allowed || false;
      const isChangeable =
        offer.conditions?.change_before_departure?.allowed || false;

      features.flexibility.push({
        icon: RefreshCw,
        text: isChangeable ? "Changes Allowed" : "Change Fees Apply",
        available: isChangeable,
        isHighlight: isChangeable,
      });

      features.flexibility.push({
        icon: Shield,
        text: isRefundable ? "Refundable" : "Non-refundable",
        available: isRefundable,
        isHighlight: isRefundable,
      });
    }

    return { features, fareName, airline };
  }, [offer]);

  if (!offer) return null;

  const price = Math.round(Number.parseFloat(offer.total_amount));
  const currency = offer.total_currency || "USD";
  const { features, fareName, airline } = fareDetails;

  const allFeatures = [
    ...features.baggage,
    ...features.comfort,
    ...features.flexibility,
  ];
  const displayFeatures = allFeatures.slice(0, 4);

  const handleSelect = () => {
    setSelectedOffer(offer);
    if (onSelect) {
      onSelect(offer);
    } else {
      router.push("/book/selected");
    }
  };

  return (
    <Card
      className={`relative flex flex-col min-h-[400px] transition-all duration-300 hover:border-primary hover:-translate-y-1 ${
        isRecommended ? "border-primary border-2" : ""
      }`}
    >
      {isRecommended && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Star className="w-3 h-3 mr-1" />
          Most Popular
        </Badge>
      )}

      <CardHeader>
        <CardTitle>{fareName}</CardTitle>
        {airline && <CardDescription>{airline} Airlines</CardDescription>}
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {currency === "USD" ? "$" : currency}
              {price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/ person</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          {displayFeatures.map((feature, idx) => (
            <FeatureItem key={idx} {...feature} />
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4">
        {allFeatures.length > 4 && (
          <FareDetailsModal
            offer={offer}
            features={features}
            fareName={fareName}
          >
            <Button variant="link" className="p-0 h-auto">
              <Info className="w-4 h-4 mr-2" />
              View all features ({allFeatures.length})
            </Button>
          </FareDetailsModal>
        )}
        <Button onClick={handleSelect} className="w-full" size="lg">
          Select This Fare
        </Button>
      </CardFooter>
    </Card>
  );
}
