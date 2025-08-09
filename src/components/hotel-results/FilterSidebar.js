import { Star } from "lucide-react";

export default function FilterSidebar({ filters, onFiltersChange }) {
  const handleRatingChange = (rating) => {
    const newRatings = filters.rating.includes(rating)
      ? filters.rating.filter((r) => r !== rating)
      : [...filters.rating, rating];
    onFiltersChange({ ...filters, rating: newRatings });
  };

  return (
    <div className="space-y-6">
      {/* Price Range (can be enhanced with a slider) */}
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Star Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                checked={filters.rating.includes(star)}
                onChange={() => handleRatingChange(star)}
              />
              <div className="flex">
                {[...Array(star)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
