// import { Suspense } from "react";
// import SearchTabs from "src/components/feature/SearchTabs";
// import {
//   Loader,
//   Plane,
//   Shield,
//   Clock,
//   Award,
//   Star,
//   MapPin,
// } from "lucide-react";

// const FormSkeleton = () => {
//   return (
//     <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full pt-8 border border-gray-100 flex items-center justify-center h-[450px]">
//       <div className="text-center">
//         <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
//         <p className="mt-4 text-gray-600">Loading your search experience...</p>
//       </div>
//     </div>
//   );
// };

// export default function Page() {
//   const popularDestinations = [
//     {
//       city: "New York",
//       image:
//         "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
//       price: "From $299",
//     },
//     {
//       city: "Los Angeles",
//       image:
//         "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
//       price: "From $249",
//     },
//     {
//       city: "Miami",
//       image:
//         "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
//       price: "From $199",
//     },
//     {
//       city: "Las Vegas",
//       image:
//         "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
//       price: "From $179",
//     },
//     {
//       city: "Chicago",
//       image:
//         "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
//       price: "From $229",
//     },
//     {
//       city: "San Francisco",
//       image:
//         "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
//       price: "From $279",
//     },
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Johnson",
//       location: "Denver, CO",
//       rating: 5,
//       comment:
//         "Found amazing deals for my family vacation. The booking process was seamless and customer service was excellent!",
//     },
//     {
//       name: "Michael Chen",
//       location: "Seattle, WA",
//       rating: 5,
//       comment:
//         "Sky Fare USA consistently offers the best prices. I've saved hundreds on my business trips this year.",
//     },
//     {
//       name: "Emily Rodriguez",
//       location: "Austin, TX",
//       rating: 5,
//       comment:
//         "User-friendly interface and great flight options. My go-to site for all travel bookings now.",
//     },
//   ];

//   return (
//     <div className="min-h-screen">
//       <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
//         <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-10"></div>
//         <div className="relative z-10 container mx-auto px-4 py-20">
//           <div className="text-center mb-12">
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               Sky Fare USA
//             </h1>
//             <p className="text-xl md:text-2xl text-blue-100 mb-2">
//               Find the Best Flight Deals
//             </p>
//             {/* <p className="text-lg text-blue-200">
//               Compare prices from top airlines and save up to 60% on your next
//               trip
//             </p> */}
//           </div>

//           <div className="max-w-6xl mx-auto">
//             <Suspense fallback={<FormSkeleton />}>
//               <SearchTabs />
//             </Suspense>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 bg-gray-50 ">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Popular Destinations
//             </h2>
//             <p className="text-lg text-gray-600">
//               Discover amazing places across the United States
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {popularDestinations.map((destination, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:scale-105"
//               >
//                 <div className="relative">
//                   <img
//                     src={destination.image || "/placeholder.svg"}
//                     alt={destination.city}
//                     className="w-full h-48 object-cover"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                   <div className="absolute bottom-4 left-4 text-white">
//                     <h3 className="text-xl font-semibold mb-1">
//                       {destination.city}
//                     </h3>
//                     <p className="text-sm text-gray-200">{destination.price}</p>
//                   </div>
//                 </div>
//                 <div className="p-4">
//                   <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg border border-blue-500 hover:border-blue-600 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
//                     <MapPin className="w-4 h-4 mr-2" />
//                     View Flights
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Why Choose Sky Fare USA?
//             </h2>
//             <p className="text-lg text-gray-600">
//               We make flight booking simple, secure, and affordable
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className="text-center">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Plane className="w-8 h-8 text-blue-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
//               <p className="text-gray-600">
//                 Compare prices from 500+ airlines to find the best deals
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Shield className="w-8 h-8 text-green-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
//               <p className="text-gray-600">
//                 Your personal and payment information is always protected
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Clock className="w-8 h-8 text-orange-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
//               <p className="text-gray-600">
//                 Get help anytime with our round-the-clock customer service
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Award className="w-8 h-8 text-purple-600" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">
//                 Trusted by Millions
//               </h3>
//               <p className="text-gray-600">
//                 Join over 2 million satisfied customers who trust us
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               What Our Customers Say
//             </h2>
//             <p className="text-lg text-gray-600">
//               Real reviews from real travelers
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
//               >
//                 <div className="flex mb-4">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className="w-5 h-5 text-yellow-400 fill-current"
//                     />
//                   ))}
//                 </div>
//                 <p className="text-gray-600 mb-4 italic">
//                   "{testimonial.comment}"
//                 </p>
//                 <div>
//                   <p className="font-semibold text-gray-900">
//                     {testimonial.name}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {testimonial.location}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4">
//             Never Miss a Deal
//           </h2>
//           <p className="text-xl text-blue-100 mb-8">
//             Subscribe to get exclusive flight deals and travel tips delivered to
//             your inbox
//           </p>

//           <div className="max-w-md mx-auto flex gap-4">
//             <input
//               type="email"
//               placeholder="Enter your email address"
//               className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 border-2 border-white/20 focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none transition-all duration-200"
//             />
//             <button className="whitespace-nowrap bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg border-2 border-white hover:border-gray-200 transition-all duration-200 shadow-md hover:shadow-lg">
//               Subscribe
//             </button>
//           </div>

//           <p className="text-sm text-blue-200 mt-4">
//             No spam, unsubscribe anytime. We respect your privacy.
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { Suspense, use } from "react";
import SearchTabs from "src/components/feature/SearchTabs";
import {
  Loader,
  Plane,
  Shield,
  Clock,
  Award,
  Star,
  MapPin,
} from "lucide-react";

// Import shadcn/ui components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const FormSkeleton = () => {
  return (
    <Card className="w-full h-[450px] flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">
          Loading your search experience...
        </p>
      </div>
    </Card>
  );
};

export default function Page() {
  const popularDestinations = [
    {
      city: "New York",
      image:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      price: "From $299",
    },
    {
      city: "Los Angeles",
      image:
        "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      price: "From $249",
    },
    {
      city: "Miami",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      price: "From $199",
    },
    {
      city: "Las Vegas",
      image:
        "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      price: "From $179",
    },
    {
      city: "Chicago",
      image:
        "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      price: "From $229",
    },
    {
      city: "San Francisco",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      price: "From $279",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Denver, CO",
      rating: 5,
      comment:
        "Found amazing deals for my family vacation. The booking process was seamless and customer service was excellent!",
    },
    {
      name: "Michael Chen",
      location: "Seattle, WA",
      rating: 5,
      comment:
        "Sky Fare USA consistently offers the best prices. I've saved hundreds on my business trips this year.",
    },
    {
      name: "Emily Rodriguez",
      location: "Austin, TX",
      rating: 5,
      comment:
        "User-friendly interface and great flight options. My go-to site for all travel bookings now.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Sky Fare USA
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80">
              Find the Best Flight Deals
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<FormSkeleton />}>
              <SearchTabs />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover amazing places across the United States
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x250/000000/FFFFFF?text=Image+Not+Found";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">
                      {destination.city}
                    </h3>
                    <p className="text-sm text-primary-foreground/80">
                      {destination.price}
                    </p>
                  </div>
                </div>
                <CardFooter className="p-4">
                  <Button className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Flights
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Sky Fare USA?
            </h2>
            <p className="text-lg text-muted-foreground">
              We make flight booking simple, secure, and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-muted-foreground">
                Compare prices from 500+ airlines to find the best deals
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
              <p className="text-muted-foreground">
                Your personal and payment information is always protected
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                Get help anytime with our round-the-clock customer service
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Trusted by Millions
              </h3>
              <p className="text-muted-foreground">
                Join over 2 million satisfied customers who trust us
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real reviews from real travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Subscribe to get exclusive flight deals and travel tips delivered to
            your inbox
          </p>

          <div className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-1"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>

          <p className="text-sm text-primary-foreground/60 mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>
    </div>
  );
}
