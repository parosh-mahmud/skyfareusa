// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Plane, User, DollarSign } from "lucide-react";

// function SeatIcon(props) {
//   const seat = props.seat;
//   const isSelected = props.isSelected;
//   const onClick = props.onClick;

//   if (seat.type !== "seat") {
//     return (
//       <div className="w-8 h-8 flex items-center justify-center">
//         {seat.type === "bassinet" && (
//           <div className="w-6 h-4 bg-blue-100 border border-blue-300 rounded-sm" />
//         )}
//       </div>
//     );
//   }

//   function getSeatColor() {
//     if (isSelected) return "bg-blue-600 text-white border-blue-600";
//     if (!seat.isAvailable)
//       return "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed";
//     if (seat.price && Number.parseFloat(seat.price) > 0)
//       return "bg-green-50 text-green-700 border-green-300 hover:bg-green-100";
//     return "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100";
//   }

//   return (
//     <button
//       onClick={onClick}
//       disabled={!seat.isAvailable}
//       className={cn(
//         "w-8 h-8 rounded-md border-2 text-xs font-medium transition-colors flex items-center justify-center",
//         getSeatColor()
//       )}
//       title={`Seat ${seat.designator}${seat.price ? ` - $${seat.price}` : ""}`}
//     >
//       {seat.designator && seat.designator.slice(-1)}
//     </button>
//   );
// }

// function SeatMapVisualization(props) {
//   const seatMap = props.seatMap;
//   const onSeatSelect = props.onSeatSelect;
//   const selectedSeat = props.selectedSeat;

//   const cabin = seatMap.cabins[0];
//   if (!cabin || !cabin.rows.length) return null;

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2 text-sm text-gray-600">
//         <Plane className="w-4 h-4" />
//         <span>Flight Segment {seatMap.segmentId}</span>
//         <Badge variant="outline" className="text-xs">
//           {cabin.cabinClass}
//         </Badge>
//       </div>

//       <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
//         <div className="min-w-fit space-y-2">
//           <div className="flex justify-center mb-4">
//             <div className="w-16 h-8 bg-gray-300 rounded-t-full flex items-center justify-center">
//               <Plane className="w-4 h-4 text-gray-600" />
//             </div>
//           </div>

//           {cabin.rows.map((row, rowIndex) => {
//             const rowNumber = row.rowNumber || `${rowIndex + 1}`;

//             return (
//               <div key={rowIndex} className="flex items-center gap-2">
//                 <div className="w-8 text-center text-sm font-medium text-gray-500">
//                   {rowNumber}
//                 </div>

//                 <div className="flex gap-4">
//                   {row.sections.map((section, sectionIndex) => (
//                     <div key={sectionIndex} className="flex gap-1">
//                       {section.elements.map((seat, seatIndex) => (
//                         <SeatIcon
//                           key={seatIndex}
//                           seat={seat}
//                           isSelected={selectedSeat === seat.designator}
//                           onClick={() => {
//                             if (
//                               seat.isAvailable &&
//                               seat.designator &&
//                               onSeatSelect
//                             ) {
//                               onSeatSelect(
//                                 seat.designator,
//                                 seat.price || undefined,
//                                 seat.serviceId || undefined
//                               );
//                             }
//                           }}
//                         />
//                       ))}
//                     </div>
//                   ))}
//                 </div>

//                 <div className="w-8 text-center text-sm font-medium text-gray-500">
//                   {rowNumber}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="flex flex-wrap gap-4 text-xs text-gray-600">
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded-md" />
//           <span>Available (Free)</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded-md" />
//           <span>Available (Paid)</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-gray-300 border-2 border-gray-300 rounded-md" />
//           <span>Occupied</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded-md" />
//           <span>Selected</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function SeatMap(props) {
//   const seatMaps = props.seatMaps;
//   const onSeatSelect = props.onSeatSelect;
//   const selectedSeats = props.selectedSeats || {};

//   const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats);

//   function handleSeatSelect(segmentId, seatDesignator, price, serviceId) {
//     const newSelectedSeats = Object.assign({}, localSelectedSeats);

//     if (newSelectedSeats[segmentId] === seatDesignator) {
//       delete newSelectedSeats[segmentId];
//     } else {
//       newSelectedSeats[segmentId] = seatDesignator;
//     }

//     setLocalSelectedSeats(newSelectedSeats);
//     if (onSeatSelect) {
//       onSeatSelect(segmentId, seatDesignator, price, serviceId);
//     }
//   }

//   function getTotalPrice() {
//     let total = 0;
//     Object.entries(localSelectedSeats).forEach((entry) => {
//       const segmentId = entry[0];
//       const seatDesignator = entry[1];
//       const seatMap = seatMaps.find((sm) => sm.segmentId === segmentId);
//       if (seatMap) {
//         seatMap.cabins.forEach((cabin) => {
//           cabin.rows.forEach((row) => {
//             row.sections.forEach((section) => {
//               section.elements.forEach((seat) => {
//                 if (seat.designator === seatDesignator && seat.price) {
//                   total += Number.parseFloat(seat.price);
//                 }
//               });
//             });
//           });
//         });
//       }
//     });
//     return total;
//   }

//   const selectedSeatsCount = Object.keys(localSelectedSeats).length;
//   const totalPrice = getTotalPrice();

//   return (
//     <div className="space-y-6">
//       {selectedSeatsCount > 0 && (
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-lg flex items-center gap-2">
//               <User className="w-5 h-5" />
//               Selected Seats ({selectedSeatsCount})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {Object.entries(localSelectedSeats).map((entry) => {
//                 const segmentId = entry[0];
//                 const seatDesignator = entry[1];
//                 return (
//                   <div
//                     key={segmentId}
//                     className="flex justify-between items-center text-sm"
//                   >
//                     <span>
//                       Segment {segmentId}: Seat {seatDesignator}
//                     </span>
//                     {(() => {
//                       const seatMap = seatMaps.find(
//                         (sm) => sm.segmentId === segmentId
//                       );
//                       let seatPrice = null;
//                       if (seatMap) {
//                         seatMap.cabins.forEach((cabin) => {
//                           cabin.rows.forEach((row) => {
//                             row.sections.forEach((section) => {
//                               section.elements.forEach((seat) => {
//                                 if (
//                                   seat.designator === seatDesignator &&
//                                   seat.price
//                                 ) {
//                                   seatPrice = seat.price;
//                                 }
//                               });
//                             });
//                           });
//                         });
//                       }
//                       return seatPrice ? (
//                         <span className="font-medium text-green-600">
//                           ${seatPrice}
//                         </span>
//                       ) : (
//                         <span className="text-gray-500">Free</span>
//                       );
//                     })()}
//                   </div>
//                 );
//               })}
//               {totalPrice > 0 && (
//                 <div className="pt-2 border-t flex justify-between items-center font-semibold">
//                   <span>Total:</span>
//                   <span className="text-green-600 flex items-center gap-1">
//                     <DollarSign className="w-4 h-4" />
//                     {totalPrice.toFixed(2)}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="space-y-8">
//         {seatMaps.map((seatMap) => (
//           <Card key={seatMap.segmentId}>
//             <CardContent className="p-6">
//               <SeatMapVisualization
//                 seatMap={seatMap}
//                 onSeatSelect={(seatDesignator, price, serviceId) =>
//                   handleSeatSelect(
//                     seatMap.segmentId,
//                     seatDesignator,
//                     price,
//                     serviceId
//                   )
//                 }
//                 selectedSeat={localSelectedSeats[seatMap.segmentId]}
//               />
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
//         <p className="font-medium mb-2">How to select seats:</p>
//         <ul className="space-y-1 list-disc list-inside">
//           <li>Click on any available seat to select it</li>
//           <li>Green seats have additional fees, gray seats are free</li>
//           <li>Click a selected seat again to deselect it</li>
//           <li>You can select one seat per flight segment</li>
//         </ul>
//       </div>
//     </div>
//   );
// }
"use client";

import React from "react";

import { useState } from "react";

export default function SeatMap(props) {
  var seatMaps = props.seatMaps || [];
  var onSeatSelect = props.onSeatSelect;
  var selectedSeats = props.selectedSeats || {};

  var localSelectedSeats = useState(selectedSeats)[0];
  var setLocalSelectedSeats = useState(selectedSeats)[1];

  function handleSeatSelect(segmentId, seatDesignator, price, serviceId) {
    var newSelectedSeats = Object.assign({}, localSelectedSeats);

    if (newSelectedSeats[segmentId] === seatDesignator) {
      delete newSelectedSeats[segmentId];
    } else {
      newSelectedSeats[segmentId] = seatDesignator;
    }

    setLocalSelectedSeats(newSelectedSeats);
    if (onSeatSelect) {
      onSeatSelect(segmentId, seatDesignator, price, serviceId);
    }
  }

  function getTotalPrice() {
    var total = 0;
    Object.keys(localSelectedSeats).forEach((segmentId) => {
      var seatDesignator = localSelectedSeats[segmentId];
      var seatMap = seatMaps.find((sm) => sm.segmentId === segmentId);
      if (seatMap) {
        seatMap.cabins.forEach((cabin) => {
          cabin.rows.forEach((row) => {
            row.sections.forEach((section) => {
              section.elements.forEach((seat) => {
                if (seat.designator === seatDesignator && seat.price) {
                  total += Number.parseFloat(seat.price);
                }
              });
            });
          });
        });
      }
    });
    return total;
  }

  function SeatIcon(seat, isSelected, onClick) {
    if (seat.type !== "seat") {
      return React.createElement(
        "div",
        {
          style: {
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        seat.type === "bassinet"
          ? React.createElement("div", {
              style: {
                width: "24px",
                height: "16px",
                backgroundColor: "#dbeafe",
                border: "1px solid #93c5fd",
                borderRadius: "2px",
              },
            })
          : null
      );
    }

    var seatStyle = {
      width: "32px",
      height: "32px",
      borderRadius: "6px",
      border: "2px solid",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: seat.isAvailable ? "pointer" : "not-allowed",
    };

    if (isSelected) {
      seatStyle.backgroundColor = "#2563eb";
      seatStyle.color = "white";
      seatStyle.borderColor = "#2563eb";
    } else if (!seat.isAvailable) {
      seatStyle.backgroundColor = "#d1d5db";
      seatStyle.color = "#6b7280";
      seatStyle.borderColor = "#d1d5db";
    } else if (seat.price && Number.parseFloat(seat.price) > 0) {
      seatStyle.backgroundColor = "#f0fdf4";
      seatStyle.color = "#15803d";
      seatStyle.borderColor = "#bbf7d0";
    } else {
      seatStyle.backgroundColor = "#f9fafb";
      seatStyle.color = "#374151";
      seatStyle.borderColor = "#d1d5db";
    }

    var seatTitle = "Seat " + seat.designator;
    if (seat.price) {
      seatTitle = seatTitle + " - $" + seat.price;
    }

    return React.createElement(
      "button",
      {
        onClick: onClick,
        disabled: !seat.isAvailable,
        style: seatStyle,
        title: seatTitle,
      },
      seat.designator ? seat.designator.slice(-1) : ""
    );
  }

  function SeatMapVisualization(seatMap, selectedSeat) {
    var cabin = seatMap.cabins[0];
    if (!cabin || !cabin.rows.length) return null;

    return React.createElement("div", { style: { marginBottom: "24px" } }, [
      React.createElement(
        "div",
        {
          key: "header",
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "16px",
          },
        },
        [
          React.createElement("span", { key: "plane" }, "✈️"),
          React.createElement(
            "span",
            { key: "segment" },
            "Flight Segment " + seatMap.segmentId
          ),
          React.createElement(
            "span",
            {
              key: "cabin",
              style: {
                padding: "2px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "12px",
              },
            },
            cabin.cabinClass
          ),
        ]
      ),

      React.createElement(
        "div",
        {
          key: "seatmap",
          style: {
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "16px",
            overflowX: "auto",
          },
        },
        [
          React.createElement(
            "div",
            {
              key: "nose",
              style: {
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  width: "64px",
                  height: "32px",
                  backgroundColor: "#d1d5db",
                  borderTopLeftRadius: "50%",
                  borderTopRightRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              "✈️"
            )
          ),

          React.createElement(
            "div",
            {
              key: "rows",
              style: { display: "flex", flexDirection: "column", gap: "8px" },
            },
            cabin.rows.map((row, rowIndex) => {
              var rowNumber = row.rowNumber || String(rowIndex + 1);

              return React.createElement(
                "div",
                {
                  key: rowIndex,
                  style: { display: "flex", alignItems: "center", gap: "8px" },
                },
                [
                  React.createElement(
                    "div",
                    {
                      key: "row-left",
                      style: {
                        width: "32px",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#6b7280",
                      },
                    },
                    rowNumber
                  ),

                  React.createElement(
                    "div",
                    {
                      key: "sections",
                      style: { display: "flex", gap: "16px" },
                    },
                    row.sections.map((section, sectionIndex) =>
                      React.createElement(
                        "div",
                        {
                          key: sectionIndex,
                          style: { display: "flex", gap: "4px" },
                        },
                        section.elements.map((seat, seatIndex) =>
                          React.createElement(
                            "div",
                            {
                              key: seatIndex,
                            },
                            SeatIcon(
                              seat,
                              selectedSeat === seat.designator,
                              () => {
                                if (
                                  seat.isAvailable &&
                                  seat.designator &&
                                  onSeatSelect
                                ) {
                                  handleSeatSelect(
                                    seatMap.segmentId,
                                    seat.designator,
                                    seat.price || undefined,
                                    seat.serviceId || undefined
                                  );
                                }
                              }
                            )
                          )
                        )
                      )
                    )
                  ),

                  React.createElement(
                    "div",
                    {
                      key: "row-right",
                      style: {
                        width: "32px",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#6b7280",
                      },
                    },
                    rowNumber
                  ),
                ]
              );
            })
          ),
        ]
      ),

      React.createElement(
        "div",
        {
          key: "legend",
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "16px",
          },
        },
        [
          React.createElement(
            "div",
            {
              key: "free",
              style: { display: "flex", alignItems: "center", gap: "8px" },
            },
            [
              React.createElement("div", {
                key: "icon",
                style: {
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#f9fafb",
                  border: "2px solid #d1d5db",
                  borderRadius: "4px",
                },
              }),
              React.createElement("span", { key: "text" }, "Available (Free)"),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "paid",
              style: { display: "flex", alignItems: "center", gap: "8px" },
            },
            [
              React.createElement("div", {
                key: "icon",
                style: {
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#f0fdf4",
                  border: "2px solid #bbf7d0",
                  borderRadius: "4px",
                },
              }),
              React.createElement("span", { key: "text" }, "Available (Paid)"),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "occupied",
              style: { display: "flex", alignItems: "center", gap: "8px" },
            },
            [
              React.createElement("div", {
                key: "icon",
                style: {
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#d1d5db",
                  border: "2px solid #d1d5db",
                  borderRadius: "4px",
                },
              }),
              React.createElement("span", { key: "text" }, "Occupied"),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "selected",
              style: { display: "flex", alignItems: "center", gap: "8px" },
            },
            [
              React.createElement("div", {
                key: "icon",
                style: {
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#2563eb",
                  border: "2px solid #2563eb",
                  borderRadius: "4px",
                },
              }),
              React.createElement("span", { key: "text" }, "Selected"),
            ]
          ),
        ]
      ),
    ]);
  }

  var selectedSeatsCount = Object.keys(localSelectedSeats).length;
  var totalPrice = getTotalPrice();

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "24px" } },
    [
      selectedSeatsCount > 0
        ? React.createElement(
            "div",
            {
              key: "summary",
              style: {
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "white",
              },
            },
            [
              React.createElement(
                "div",
                {
                  key: "header",
                  style: {
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  },
                },
                [
                  React.createElement("span", { key: "icon" }, "👤"),
                  React.createElement(
                    "span",
                    { key: "text" },
                    "Selected Seats (" + selectedSeatsCount + ")"
                  ),
                ]
              ),
              React.createElement(
                "div",
                {
                  key: "content",
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  },
                },
                [
                  React.createElement(
                    "div",
                    {
                      key: "seats",
                    },
                    Object.keys(localSelectedSeats).map((segmentId) => {
                      var seatDesignator = localSelectedSeats[segmentId];
                      var seatMap = seatMaps.find(
                        (sm) => sm.segmentId === segmentId
                      );
                      var seatPrice = null;
                      if (seatMap) {
                        seatMap.cabins.forEach((cabin) => {
                          cabin.rows.forEach((row) => {
                            row.sections.forEach((section) => {
                              section.elements.forEach((seat) => {
                                if (
                                  seat.designator === seatDesignator &&
                                  seat.price
                                ) {
                                  seatPrice = seat.price;
                                }
                              });
                            });
                          });
                        });
                      }
                      return React.createElement(
                        "div",
                        {
                          key: segmentId,
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "14px",
                          },
                        },
                        [
                          React.createElement(
                            "span",
                            { key: "seat" },
                            "Segment " + segmentId + ": Seat " + seatDesignator
                          ),
                          seatPrice
                            ? React.createElement(
                                "span",
                                {
                                  key: "price",
                                  style: {
                                    fontWeight: "500",
                                    color: "#059669",
                                  },
                                },
                                "$" + seatPrice
                              )
                            : React.createElement(
                                "span",
                                {
                                  key: "free",
                                  style: { color: "#6b7280" },
                                },
                                "Free"
                              ),
                        ]
                      );
                    })
                  ),
                  totalPrice > 0
                    ? React.createElement(
                        "div",
                        {
                          key: "total",
                          style: {
                            paddingTop: "8px",
                            borderTop: "1px solid #e5e7eb",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "600",
                          },
                        },
                        [
                          React.createElement(
                            "span",
                            { key: "label" },
                            "Total:"
                          ),
                          React.createElement(
                            "span",
                            {
                              key: "amount",
                              style: {
                                color: "#059669",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              },
                            },
                            [
                              React.createElement(
                                "span",
                                { key: "symbol" },
                                "$"
                              ),
                              React.createElement(
                                "span",
                                { key: "value" },
                                totalPrice.toFixed(2)
                              ),
                            ]
                          ),
                        ]
                      )
                    : null,
                ]
              ),
            ]
          )
        : null,

      React.createElement(
        "div",
        {
          key: "seatmaps",
          style: { display: "flex", flexDirection: "column", gap: "32px" },
        },
        seatMaps.map((seatMap) =>
          React.createElement(
            "div",
            {
              key: seatMap.segmentId,
              style: {
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "24px",
                backgroundColor: "white",
              },
            },
            SeatMapVisualization(seatMap, localSelectedSeats[seatMap.segmentId])
          )
        )
      ),

      React.createElement(
        "div",
        {
          key: "instructions",
          style: {
            fontSize: "14px",
            color: "#6b7280",
            backgroundColor: "#eff6ff",
            padding: "16px",
            borderRadius: "8px",
          },
        },
        [
          React.createElement(
            "p",
            {
              key: "title",
              style: { fontWeight: "500", marginBottom: "8px" },
            },
            "How to select seats:"
          ),
          React.createElement(
            "ul",
            {
              key: "list",
              style: {
                listStyle: "disc",
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              },
            },
            [
              React.createElement(
                "li",
                { key: "1" },
                "Click on any available seat to select it"
              ),
              React.createElement(
                "li",
                { key: "2" },
                "Green seats have additional fees, gray seats are free"
              ),
              React.createElement(
                "li",
                { key: "3" },
                "Click a selected seat again to deselect it"
              ),
              React.createElement(
                "li",
                { key: "4" },
                "You can select one seat per flight segment"
              ),
            ]
          ),
        ]
      ),
    ]
  );
}
