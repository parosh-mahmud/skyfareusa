import { Duffel } from "@duffel/api";
import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      departure_date,
      return_date,
      passengers,
      cabin_class,
    } = body;

    // Create slices for the flight search
    const slices = [
      {
        origin,
        destination,
        departure_date,
      },
    ];

    // Add return slice if it's a round trip
    if (return_date) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: return_date,
      });
    }

    // Create offer request
    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers: passengers || [{ type: "adult" }],
      cabin_class: cabin_class || "economy",
      return_offers: true,
    });

    console.log("Offer Request Created:", offerRequest.data.id);

    // Get offers from the offer request
    const offers = await duffel.offers.list({
      offer_request_id: offerRequest.data.id,
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      offer_request_id: offerRequest.data.id,
      offers: offers.data,
      meta: offers.meta,
    });
  } catch (error) {
    console.error("Duffel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.response?.data || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Fallback airports data in case JSON file is not available
const FALLBACK_AIRPORTS = [
  {
    IATA: "DAC",
    ICAO: "VGHS",
    "Airport name": "Hazrat Shahjalal International Airport",
    Country: "Bangladesh",
    City: "Dhaka",
  },
  {
    IATA: "CCU",
    ICAO: "VECC",
    "Airport name": "Netaji Subhash Chandra Bose International Airport",
    Country: "India",
    City: "Kolkata",
  },
  {
    IATA: "CXB",
    ICAO: "VGCB",
    "Airport name": "Cox's Bazar Airport",
    Country: "Bangladesh",
    City: "Cox's Bazar",
  },
  {
    IATA: "JSR",
    ICAO: "VGJR",
    "Airport name": "Jessore Airport",
    Country: "Bangladesh",
    City: "Jessore",
  },
  {
    IATA: "BOM",
    ICAO: "VABB",
    "Airport name": "Chhatrapati Shivaji Maharaj International Airport",
    Country: "India",
    City: "Mumbai",
  },
  {
    IATA: "DEL",
    ICAO: "VIDP",
    "Airport name": "Indira Gandhi International Airport",
    Country: "India",
    City: "New Delhi",
  },
  {
    IATA: "DXB",
    ICAO: "OMDB",
    "Airport name": "Dubai International Airport",
    Country: "United Arab Emirates",
    City: "Dubai",
  },
  {
    IATA: "DOH",
    ICAO: "OTHH",
    "Airport name": "Hamad International Airport",
    Country: "Qatar",
    City: "Doha",
  },
  {
    IATA: "SIN",
    ICAO: "WSSS",
    "Airport name": "Singapore Changi Airport",
    Country: "Singapore",
    City: "Singapore",
  },
  {
    IATA: "KUL",
    ICAO: "WMKK",
    "Airport name": "Kuala Lumpur International Airport",
    Country: "Malaysia",
    City: "Kuala Lumpur",
  },
  {
    IATA: "BKK",
    ICAO: "VTBS",
    "Airport name": "Suvarnabhumi Airport",
    Country: "Thailand",
    City: "Bangkok",
  },
  {
    IATA: "LHR",
    ICAO: "EGLL",
    "Airport name": "Heathrow Airport",
    Country: "United Kingdom",
    City: "London",
  },
  {
    IATA: "JFK",
    ICAO: "KJFK",
    "Airport name": "John F. Kennedy International Airport",
    Country: "United States",
    City: "New York",
  },
  {
    IATA: "LAX",
    ICAO: "KLAX",
    "Airport name": "Los Angeles International Airport",
    Country: "United States",
    City: "Los Angeles",
  },
  {
    IATA: "CDG",
    ICAO: "LFPG",
    "Airport name": "Charles de Gaulle Airport",
    Country: "France",
    City: "Paris",
  },
  {
    IATA: "FRA",
    ICAO: "EDDF",
    "Airport name": "Frankfurt Airport",
    Country: "Germany",
    City: "Frankfurt",
  },
  {
    IATA: "AMS",
    ICAO: "EHAM",
    "Airport name": "Amsterdam Airport Schiphol",
    Country: "Netherlands",
    City: "Amsterdam",
  },
  {
    IATA: "IST",
    ICAO: "LTFM",
    "Airport name": "Istanbul Airport",
    Country: "Turkey",
    City: "Istanbul",
  },
  {
    IATA: "NRT",
    ICAO: "RJAA",
    "Airport name": "Narita International Airport",
    Country: "Japan",
    City: "Tokyo",
  },
  {
    IATA: "ICN",
    ICAO: "RKSI",
    "Airport name": "Incheon International Airport",
    Country: "South Korea",
    City: "Seoul",
  },
];

let airportsData = FALLBACK_AIRPORTS;

// Try to load from JSON file
const loadAirportsData = () => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "airports.json"
    );
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(fileContent);
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        airportsData = jsonData;
        console.log(`✅ Loaded ${airportsData.length} airports from JSON file`);
        return true;
      }
    }
  } catch (error) {
    console.log("⚠️ Using fallback airports data:", error.message);
  }
  return false;
};

// Load data on module initialization
loadAirportsData();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit")) || 5;

    console.log(`🔍 Airport search query: "${query}"`);

    if (!query || query.length < 2) {
      console.log("❌ Query too short, returning empty results");
      return NextResponse.json({
        success: true,
        data: [],
        message: "Query must be at least 2 characters",
        total: 0,
      });
    }

    const searchTerm = query.toLowerCase().trim();
    console.log(`🔎 Searching for: "${searchTerm}"`);

    const filteredAirports = airportsData
      .filter((airport) => {
        const searchFields = [
          airport["Airport name"]?.toLowerCase() || "",
          airport.IATA?.toLowerCase() || "",
          airport.ICAO?.toLowerCase() || "",
          airport.City?.toLowerCase() || "",
          airport.Country?.toLowerCase() || "",
        ];

        const matches = searchFields.some((field) =>
          field.includes(searchTerm)
        );

        if (matches) {
          console.log(
            `✅ Match found: ${airport.City} (${airport.IATA}) - ${airport["Airport name"]}`
          );
        }

        return matches;
      })
      .slice(0, limit)
      .map((airport) => ({
        iata: airport.IATA,
        icao: airport.ICAO,
        name: airport["Airport name"],
        city: airport.City,
        country: airport.Country,
        displayName: `${airport.City} (${airport.IATA})`,
        fullName: `${airport.IATA}, ${airport["Airport name"]}`,
        searchText: `${airport.City} ${airport.IATA} ${airport["Airport name"]} ${airport.Country}`,
      }));

    console.log(
      `📊 Found ${filteredAirports.length} airports matching "${query}"`
    );

    // Log the results
    filteredAirports.forEach((airport, index) => {
      console.log(`${index + 1}. ${airport.displayName} - ${airport.name}`);
    });

    return NextResponse.json({
      success: true,
      data: filteredAirports,
      total: filteredAirports.length,
      query: query,
      searchTerm: searchTerm,
    });
  } catch (error) {
    console.error("❌ Airport search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search airports",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
