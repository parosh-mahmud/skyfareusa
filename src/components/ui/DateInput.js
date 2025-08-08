// =================================================================================
// FILE: src/app/components/ui/DateInput.js
// =================================================================================
const DateInput = ({ label, name, value, onChange, disabled }) => {
  return (
    <div className="flex-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-400 uppercase"
      >
        {label}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 block w-full bg-transparent outline-none text-gray-800 font-bold text-lg disabled:bg-gray-50 disabled:cursor-not-allowed"
        required={!disabled}
      />
    </div>
  );
};

export default DateInput;
