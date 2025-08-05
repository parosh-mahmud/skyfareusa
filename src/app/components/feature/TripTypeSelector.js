"use client";

export default function TripTypeSelector({
  tripType,
  onChange,
  size = "main",
}) {
  const options = [
    { value: "one-way", label: "One Way" },
    { value: "round-trip", label: "Round Way" },
    { value: "multi-city", label: "Multi City" },
  ];

  if (size === "compact") {
    return (
      <div className="flex gap-6 mb-6">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="tripType"
              value={option.value}
              checked={tripType === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span
              className={`text-sm font-medium ${
                tripType === option.value ? "text-blue-900" : "text-gray-600"
              }`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-8 mb-8">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-3 cursor-pointer"
        >
          <input
            type="radio"
            name="tripType"
            value={option.value}
            checked={tripType === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span
            className={`text-base font-medium ${
              tripType === option.value ? "text-blue-900" : "text-gray-600"
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
