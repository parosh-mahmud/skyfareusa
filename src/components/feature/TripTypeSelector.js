"use client";

export default function TripTypeSelector({ tripType, onChange }) {
  const options = [
    { value: "one-way", label: "One Way" },
    { value: "round-trip", label: "Round Trip" },
    { value: "multi-city", label: "Multi-City" },
  ];

  return (
    // ✅ The gap and margin are now responsive.
    <div className="flex flex-row items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
      {options.map((option) => (
        <label
          key={option.value}
          // ✅ The gap inside the label is responsive.
          className="flex items-center cursor-pointer gap-2 sm:gap-3"
        >
          <input
            type="radio"
            name="tripType"
            value={option.value}
            checked={tripType === option.value}
            onChange={(e) => onChange(e.target.value)}
            // ✅ The radio button size is responsive.
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span
            className={`font-medium transition-colors ${
              tripType === option.value ? "text-blue-900" : "text-gray-600"
            }
            text-sm sm:text-base`} // ✅ The font size is responsive.
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
