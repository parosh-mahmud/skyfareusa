// =================================================================================
// FILE: src/app/components/ui/TravelerInput.js
// =================================================================================
const TravelerInput = ({ label, name, value, onChange }) => {
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
        value={value}
        onChange={onChange}
        className="mt-1 block w-full bg-transparent outline-none text-gray-800 font-bold text-lg"
      />
    </div>
  );
};

export default TravelerInput;
