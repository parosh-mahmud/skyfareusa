import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Fallback airports data in case the JSON file is not available
const FALLBACK_AIRPORTS = [
  {
    IATA: "DAC",
    ICAO: "VGHS",
    "Airport name": "Hazrat Shahjalal International Airport",
    Country: "Bangladesh",
    City: "Dhaka",
  },
  {
    IATA: "JSR",
    ICAO: "VGJR",
    "Airport name": "Jashore Airport",
    Country: "Bangladesh",
    City: "Jashore",
  },
  {
    IATA: "CXB",
    ICAO: "VGCB",
    "Airport name": "Cox's Bazar Airport",
    Country: "Bangladesh",
    City: "Cox's Bazar",
  },
  {
    IATA: "CCU",
    ICAO: "VECC",
    "Airport name": "Netaji Subhash Chandra Bose International Airport",
    Country: "India",
    City: "Kolkata",
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
];

let airportsData = [];

// Try to load airports from the JSON file
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
        console.log(
          `✅ Loaded ${airportsData.length} airports from JSON file.`
        );
        return;
      }
    }
    // If file is empty, invalid, or doesn't exist, use fallback
    throw new Error("JSON file not found or invalid.");
  } catch (error) {
    console.log(
      `⚠️ Could not load from JSON file: ${error.message}. Using fallback airports data.`
    );
    airportsData = FALLBACK_AIRPORTS;
  }
};

// Load data on module initialization
loadAirportsData();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit")) || 5;

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Query must be at least 2 characters.",
      });
    }

    const filteredAirports = airportsData
      .filter((airport) => {
        const searchFields = [
          airport["Airport name"]?.toLowerCase(),
          airport.IATA?.toLowerCase(),
          airport.City?.toLowerCase(),
          airport.Country?.toLowerCase(),
        ].join(" "); // Join fields for easier searching

        return searchFields.includes(query);
      })
      .slice(0, limit)
      .map((airport) => ({
        iata: airport.IATA,
        name: airport["Airport name"],
        city: airport.City,
        country: airport.Country,
        displayName: `${airport.City} (${airport.IATA})`,
      }));

    return NextResponse.json({
      success: true,
      data: filteredAirports,
    });
  } catch (error) {
    console.error("❌ Airport search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search airports.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
