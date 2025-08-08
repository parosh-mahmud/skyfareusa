"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, User, UserPlus } from "lucide-react";

export default function Header({ transparent = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setMobileOpen(false); // Close mobile menu when scrolling back to top
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out
        ${
          isScrolled
            ? "bg-blue-900 shadow-lg border-b border-blue-800"
            : transparent
            ? "bg-blue-900"
            : transparent
        }
      `}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="block relative z-10 ">
          <Image
            src="/next.svg"
            alt="SkyFareUSA Logo"
            width={120}
            height={48}
            priority
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation - Only visible when scrolled */}
        <nav
          className={`hidden lg:flex items-center space-x-8 transition-all duration-500 ${
            isScrolled
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {["Home", "Flights", "About Us", "Contact"].map((label) => (
            <Link
              key={label}
              href={
                label === "Home"
                  ? "/"
                  : `/${label.toLowerCase().replace(/ /g, "")}`
              }
              className="font-sans text-base font-medium text-white hover:text-accent-light transition-colors duration-300 relative group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Always visible with icons */}
        <div className="flex items-center space-x-3 z-10">
          <Link href="/signin">
            <button
              className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "border-white text-white hover:bg-white hover:text-accent"
                  : transparent
                  ? "border-white text-white hover:bg-white hover:text-primary"
                  : "border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              <User size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          </Link>
          <Link href="/signup">
            <button
              className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg ${
                isScrolled
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-accent text-white hover:bg-accent-dark"
              }`}
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Sign Up</span>
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button - Only visible when scrolled */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className={`lg:hidden p-2 rounded-md transition-all duration-300 ${
            isScrolled
              ? "opacity-100 translate-y-0 text-white hover:bg-white/10"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu - Only when scrolled */}
      {mobileOpen && isScrolled && (
        <div className="bg-accent/95 backdrop-blur-md shadow-md lg:hidden border-b border-accent-light/20">
          <nav className="flex flex-col space-y-2 py-6 px-4 sm:px-6">
            {["Home", "Flights", "About Us", "Contact"].map((label) => (
              <Link
                key={label}
                href={
                  label === "Home"
                    ? "/"
                    : `/${label.toLowerCase().replace(/ /g, "")}`
                }
                onClick={() => setMobileOpen(false)}
                className="py-3 text-white hover:text-accent-light transition-colors duration-300 font-medium"
              >
                {label}
              </Link>
            ))}
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-3 pt-4 border-t border-white/20">
              <Link href="/signin" onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-white border-2 border-white rounded-full hover:bg-white hover:text-accent transition-all duration-300 font-medium">
                  <User size={18} />
                  <span>Sign In</span>
                </button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 font-medium">
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
