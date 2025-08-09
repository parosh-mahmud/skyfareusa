"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  BedDouble,
  Loader,
  AlertCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import HotelCard from "src/components/hotel-results/HotelCard";
import FilterSidebar from "src/components/hotel-results/FilterSidebar";

// API fetching function with pagination support
const fetchHotels = async ({ searchParams, pageParam = 1 }) => {
  const payload = {
    cityCode: searchParams.get("cityCode"),
    checkInDate: searchParams.get("checkInDate"),
    checkOutDate: searchParams.get("checkOutDate"),
    adults: searchParams.get("adults"),
    page: pageParam,
  };

  const res = await fetch("/api/hotels/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch hotels.");
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "An unknown error occurred.");
  }
  return result;
};

// --- Loading Skeleton Components ---
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse flex flex-col md:flex-row">
    <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200"></div>
    <div className="p-4 flex-grow flex flex-col">
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
      <div className="flex-grow space-y-2">
        <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-12 w-1/4 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <main className="space-y-4 min-w-0">
    {[...Array(5)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </main>
);

// --- Main Client Component ---
export default function ResultsClient() {
  const searchParams = useSearchParams();
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["hotels", searchParams.toString()],
    queryFn: ({ pageParam }) => fetchHotels({ searchParams, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
  });

  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 5000 },
    rating: [],
    amenities: [],
  });

  const allOffers = useMemo(
    () => data?.pages.flatMap((page) => page.offers) || [],
    [data]
  );

  const filteredOffers = useMemo(() => {
    return allOffers.filter((item) => {
      if (!item.hotel || !item.offers?.[0]?.price) return false;
      const price = parseFloat(item.offers[0].price.total);
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }
      if (
        filters.rating.length > 0 &&
        !filters.rating.includes(parseInt(item.hotel.rating))
      ) {
        return false;
      }
      return true;
    });
  }, [allOffers, filters]);

  useEffect(() => {
    if (allOffers.length > 0 && !isLoading) {
      const prices = allOffers.map((item) =>
        parseFloat(item.offers[0].price.total)
      );
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      if (filters.priceRange.min === 0 && filters.priceRange.max === 5000) {
        setFilters((prev) => ({ ...prev, priceRange: { min, max } }));
      }
    }
  }, [allOffers, isLoading, filters.priceRange.min, filters.priceRange.max]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-4">
          <div className="h-8 w-1/2 bg-blue-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden lg:block bg-white rounded-lg shadow-sm p-6 h-fit animate-pulse">
            <div className="h-6 w-2/3 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-100 rounded"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          </aside>
          <LoadingState />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Search Error</h2>
        <p className="text-red-600 bg-red-100 p-3 rounded-md max-w-lg">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-blue-800 text-white p-4 rounded-t-lg mb-4">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <BedDouble size={20} /> Hotels in {searchParams.get("cityCode")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden lg:block bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </aside>

          <main className="space-y-4 min-w-0">
            <div className="lg:hidden">
              <button
                onClick={() => setIsFilterSidebarOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white shadow-sm font-semibold text-gray-700 hover:bg-gray-50 border"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            {filteredOffers.length > 0 ? (
              <div className="space-y-4">
                {filteredOffers.map(({ hotel, offers }, index) => (
                  <HotelCard
                    key={`${hotel.hotelId}-${index}`}
                    hotel={hotel}
                    offer={offers[0]}
                    searchParamsString={searchParams.toString()}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">
                  No Hotels Found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search criteria.
                </p>
              </div>
            )}

            <div className="pt-4 text-center">
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isFetchingNextPage ? (
                    <Loader className="animate-spin w-5 h-5 mx-auto" />
                  ) : (
                    "Load More Hotels"
                  )}
                </button>
              )}
              {!isLoading && !hasNextPage && allOffers.length > 0 && (
                <p className="text-gray-500">
                  You&apos;ve reached the end of the list.
                </p>
              )}
            </div>
          </main>
        </div>
      </div>

      {isFilterSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsFilterSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed left-0 top-0 h-full w-full max-w-xs bg-gray-50 shadow-xl z-50 transform transition-transform lg:hidden ${
          isFilterSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h3 className="font-bold text-lg">Filters</h3>
          <button onClick={() => setIsFilterSidebarOpen(false)} className="p-2">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>
    </div>
  );
}
