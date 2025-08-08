// =================================================================================
// FILE: src/app/components/ui/SearchButton.js
// =================================================================================
const SearchButton = ({ children }) => {
  return (
    <button
      type="submit"
      className="w-full lg:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold text-lg py-4 px-8 rounded-lg shadow-md transition-colors duration-300"
    >
      {children}
    </button>
  );
};

export default SearchButton;
