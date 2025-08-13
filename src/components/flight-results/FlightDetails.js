"use client";

import Image from "next/image";
import { Plane, Clock, Hourglass, Paperclip } from "lucide-react";

// --- Helper Functions ---

const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (dt) =>
  new Date(dt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatDuration = (d) => {
  if (!d) return "";
  const match = d.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return "";
  const hours = match[1]?.replace("H", "h") || "";
  const minutes = match[2]?.replace("M", "m") || "";
  return `${hours} ${minutes}`.trim();
};

const calculateDuration = (start, end) => {
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

// --- Sub-Components for a Cleaner Structure ---

const LayoverInfo = ({ currentSegment, nextSegment }) => {
  const layoverDuration = calculateDuration(
    currentSegment.arriving_at,
    nextSegment.departing_at
  );

  return (
    <div className="relative pl-12 py-4">
      <div className="absolute left-[18px] top-0 h-full w-px bg-blue-200 border-l-2 border-dashed border-blue-200"></div>
      <div className="flex items-center gap-3 text-sm text-blue-800 bg-blue-100/80 rounded-lg p-2 pr-3">
        <Hourglass className="w-4 h-4 flex-shrink-0" />
        <span className="font-semibold">
          {layoverDuration} layover in {currentSegment.destination.city_name} (
          {currentSegment.destination.iata_code})
        </span>
      </div>
    </div>
  );
};

const SegmentDetails = ({ segment }) => {
  const airline = segment.marketing_carrier || segment.carrier;
  const airlineLogoUrl = `https://images.kiwi.com/airlines/64/${airline.iata_code}.png`;

  return (
    <div className="relative pl-12">
      {/* Timeline Vertical Line */}
      <div className="absolute left-[18px] top-5 h-full w-px bg-blue-500"></div>

      {/* Departure Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
          <Plane size={20} className="text-blue-500" />
        </div>
        <div>
          <p className="font-bold text-lg text-gray-900">
            {formatTime(segment.departing_at)}
          </p>
          <p className="font-semibold text-gray-700">
            {formatDate(segment.departing_at)}
          </p>
          <p className="text-sm text-gray-500">
            {segment.origin.name} ({segment.origin.iata_code})
          </p>
        </div>
      </div>

      {/* Flight Info Card */}
      <div className="bg-white border rounded-lg p-4 my-4 grid md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={airlineLogoUrl}
            alt={airline.name}
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
          <div>
            <p className="font-semibold text-gray-800">{airline.name}</p>
            <p className="text-xs text-gray-500">
              Flight {airline.iata_code}{" "}
              {segment.marketing_carrier_flight_number || segment.flight_number}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="flex items-center gap-2 text-gray-500">
              <Clock size={14} /> Duration
            </p>
            <p className="font-semibold text-gray-800">
              {formatDuration(segment.duration)}
            </p>
          </div>
          {segment.aircraft?.name && (
            <div>
              <p className="flex items-center gap-2 text-gray-500">
                <Paperclip size={14} /> Aircraft
              </p>
              <p className="font-semibold text-gray-800">
                {segment.aircraft.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Arrival Info */}
      <div className="flex items-start gap-4">
        <div className="absolute left-0 bottom-0 w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
          <Plane size={20} className="text-white transform -rotate-45" />
        </div>
        <div>
          <p className="font-bold text-lg text-gray-900">
            {formatTime(segment.arriving_at)}
          </p>
          <p className="font-semibold text-gray-700">
            {formatDate(segment.arriving_at)}
          </p>
          <p className="text-sm text-gray-500">
            {segment.destination.name} ({segment.destination.iata_code})
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function FlightDetails({ offer }) {
  if (!offer || !offer.slices) return null;

  return (
    <div className="bg-gray-100 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 border-t">
      {offer.slices.map((slice, sliceIndex) => (
        <div
          key={sliceIndex}
          className={
            sliceIndex > 0
              ? "mt-8 pt-6 border-t-2 border-dashed border-gray-300"
              : ""
          }
        >
          {/* Outbound/Return Header */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 tracking-wide uppercase">
              {offer.slices.length > 1 &&
                (sliceIndex === 0 ? "Outbound Flight" : "Return Flight")}
            </h3>
            <p className="text-sm text-gray-500">
              {slice.origin.city_name} to {slice.destination.city_name}
            </p>
          </div>

          {/* Segments and Layovers */}
          {slice.segments.map((segment, segmentIndex) => (
            <div key={segment.id || segmentIndex}>
              <SegmentDetails segment={segment} />
              {segmentIndex < slice.segments.length - 1 && (
                <LayoverInfo
                  currentSegment={segment}
                  nextSegment={slice.segments[segmentIndex + 1]}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
