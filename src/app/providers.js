"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Theme Context for dark/light mode (future enhancement)
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

// Search Context for managing search state across components
const SearchContext = createContext({
  searchHistory: [],
  addToHistory: () => {},
  clearHistory: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useSearch() {
  return useContext(SearchContext);
}

export default function Providers({ children }) {
  const [theme, setTheme] = useState("light");
  const [searchHistory, setSearchHistory] = useState([]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("sky-fare-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("sky-fare-search-history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse search history:", error);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("sky-fare-theme", newTheme);
  };

  const addToHistory = (searchParams) => {
    const newHistory = [searchParams, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(newHistory);
    localStorage.setItem("sky-fare-search-history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("sky-fare-search-history");
  };

  const themeValue = {
    theme,
    toggleTheme,
  };

  const searchValue = {
    searchHistory,
    addToHistory,
    clearHistory,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <SearchContext.Provider value={searchValue}>
        <div className={theme === "dark" ? "dark" : ""}>{children}</div>
      </SearchContext.Provider>
    </ThemeContext.Provider>
  );
}
