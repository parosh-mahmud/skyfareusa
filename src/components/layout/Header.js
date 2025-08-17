// "use client";

// import { useState } from "react";
// import { Plane, Menu, X, User, LogIn } from "lucide-react";

// export default function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16 sm:h-20">
//           <div className="flex items-center space-x-2">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
//               <Plane className="w-6 h-6 text-white" />
//             </div>
//             <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               SkyFare USA
//             </span>
//           </div>

//           <nav className="hidden md:flex items-center space-x-8">
//             <a
//               href="/"
//               className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//             >
//               Home
//             </a>
//             <a
//               href="#"
//               className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//             >
//               Flights
//             </a>
//             <a
//               href="#"
//               className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//             >
//               Hotels
//             </a>
//             <a
//               href="#"
//               className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//             >
//               My Bookings
//             </a>
//             <a
//               href="#"
//               className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//             >
//               Support
//             </a>
//           </nav>

//           <div className="hidden md:flex items-center space-x-4">
//             <button className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors">
//               <LogIn className="w-4 h-4 mr-2" />
//               Sign In
//             </button>
//             <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md font-medium transition-all">
//               <User className="w-4 h-4 mr-2" />
//               Sign Up
//             </button>
//           </div>

//           <button
//             className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             {isMenuOpen ? (
//               <X className="w-6 h-6" />
//             ) : (
//               <Menu className="w-6 h-6" />
//             )}
//           </button>
//         </div>

//         {isMenuOpen && (
//           <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
//             <nav className="flex flex-col space-y-4">
//               <a
//                 href="#"
//                 className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//               >
//                 Flights
//               </a>
//               <a
//                 href="#"
//                 className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//               >
//                 Hotels
//               </a>
//               <a
//                 href="#"
//                 className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//               >
//                 My Bookings
//               </a>
//               <a
//                 href="#"
//                 className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//               >
//                 Support
//               </a>
//               <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
//                 <button className="inline-flex items-center justify-start px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors">
//                   <LogIn className="w-4 h-4 mr-2" />
//                   Sign In
//                 </button>
//                 <button className="inline-flex items-center justify-start px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md font-medium transition-all">
//                   <User className="w-4 h-4 mr-2" />
//                   Sign Up
//                 </button>
//               </div>
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Menu, X, User, LogIn } from "lucide-react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/flights", label: "Flights" },
    { href: "/hotels", label: "Hotels" },
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/support", label: "Support" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand Name */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SkyFare USA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button>
              <User className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="bg-primary p-2 rounded-lg">
                        <Plane className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <span className="text-xl font-bold">SkyFare USA</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <Separator />
                  <nav className="flex flex-col space-y-4 mt-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="text-lg text-foreground/80 hover:text-primary font-medium transition-colors"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <Separator className="my-4" />
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" className="justify-start text-lg">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </Button>
                    <Button className="justify-start text-lg">
                      <User className="w-5 h-5 mr-2" />
                      Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
