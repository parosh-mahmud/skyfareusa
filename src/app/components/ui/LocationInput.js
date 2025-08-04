// =================================================================================
// FILE: src/app/components/ui/LocationInput.js
// =================================================================================
import React from "react";

const LocationInput = ({ label, placeholder, name, value, onChange }) => {
  return (
    <div className="flex-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-400 uppercase"
      >
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full bg-transparent outline-none text-gray-800 font-bold text-lg"
        required
      />
    </div>
  );
};

export default LocationInput;
