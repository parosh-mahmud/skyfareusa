"use client";

import { useState, useMemo } from "react";
import { getData } from "country-list";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

// --- Helper Arrays for Date Dropdowns ---
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 100 }, (_, i) =>
  String(currentYear - i)
);
const expiryYears = Array.from({ length: 20 }, (_, i) =>
  String(currentYear + i)
);
const months = [
  { value: "01", name: "January" },
  { value: "02", name: "February" },
  { value: "03", name: "March" },
  { value: "04", name: "April" },
  { value: "05", name: "May" },
  { value: "06", name: "June" },
  { value: "07", name: "July" },
  { value: "08", name: "August" },
  { value: "09", name: "September" },
  { value: "10", name: "October" },
  { value: "11", name: "November" },
  { value: "12", name: "December" },
];
const days = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export default function TravellerDetailsStep({ onNext, passengers = [] }) {
  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
  });

  const [travellerData, setTravellerData] = useState(
    passengers.map(() => ({
      title: "",
      firstName: "",
      lastName: "",
      gender: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      passportNumber: "",
      issuingCountry: "",
      expiryDay: "",
      expiryMonth: "",
      expiryYear: "",
    }))
  );

  const [errors, setErrors] = useState({});
  const countryList = useMemo(() => getData(), []);

  const calculateAge = (year, month, day) => {
    if (!year || !month || !day) return 0;
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!contactDetails.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(contactDetails.email))
      newErrors.email = "Email is invalid";
    if (!contactDetails.phone) newErrors.phone = "Phone number is required";

    travellerData.forEach((traveller, index) => {
      const pId = `${index}`;
      if (!traveller.title) newErrors[`${pId}-title`] = "Required";
      if (!traveller.firstName) newErrors[`${pId}-firstName`] = "Required";
      if (!traveller.lastName) newErrors[`${pId}-lastName`] = "Required";
      if (!traveller.gender) newErrors[`${pId}-gender`] = "Required";
      if (
        !traveller.birthDay ||
        !traveller.birthMonth ||
        !traveller.birthYear
      ) {
        newErrors[`${pId}-dateOfBirth`] = "Complete date of birth is required";
      } else {
        const age = calculateAge(
          traveller.birthYear,
          traveller.birthMonth,
          traveller.birthDay
        );
        const pType = passengers[index]?.type;
        if (pType === "adult" && age < 12)
          newErrors[`${pId}-dateOfBirth`] = "Adults must be 12+ years old";
        if (pType === "child" && (age < 2 || age >= 12))
          newErrors[`${pId}-dateOfBirth`] = "Children must be 2-11 years old";
        if (pType?.startsWith("infant") && age >= 2)
          newErrors[`${pId}-dateOfBirth`] = "Infants must be under 2 years old";
      }

      const hasPassportInfo =
        traveller.passportNumber ||
        traveller.issuingCountry ||
        traveller.expiryYear;
      if (hasPassportInfo) {
        if (!traveller.passportNumber)
          newErrors[`${pId}-passportNumber`] = "Required";
        if (!traveller.issuingCountry)
          newErrors[`${pId}-issuingCountry`] = "Required";
        if (
          !traveller.expiryDay ||
          !traveller.expiryMonth ||
          !traveller.expiryYear
        ) {
          newErrors[`${pId}-passportExpiry`] =
            "Complete expiry date is required";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStateChange = (setter, index, field, value) => {
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    const errorKey = `${index}-${field}`;
    if (errors[errorKey])
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
  };

  const handleNext = () => {
    if (validateForm()) {
      const formattedData = travellerData.map((p) => ({
        ...p,
        dateOfBirth: `${p.birthYear}-${p.birthMonth}-${p.birthDay}`,
        passportExpiry: p.expiryYear
          ? `${p.expiryYear}-${p.expiryMonth}-${p.expiryDay}`
          : "",
      }));
      onNext({ contactDetails, travellerData: formattedData });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={contactDetails.email}
              onChange={(e) =>
                setContactDetails({ ...contactDetails, email: e.target.value })
              }
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 617 756 2626"
              value={contactDetails.phone}
              onChange={(e) =>
                setContactDetails({ ...contactDetails, phone: e.target.value })
              }
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Passengers</h2>
        {passengers.map((passenger, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                <Badge variant="secondary" className="capitalize">
                  {passenger.type.replace("_without_seat", "")} {index + 1}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Personal details</h3>
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="col-span-5 sm:col-span-1">
                    <Label>Title *</Label>
                    <Select
                      onValueChange={(v) =>
                        handleStateChange(setTravellerData, index, "title", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mr." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mr">Mr.</SelectItem>
                        <SelectItem value="mrs">Mrs.</SelectItem>
                        <SelectItem value="ms">Ms.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <Label>Given name *</Label>
                    <Input
                      value={travellerData[index].firstName}
                      onChange={(e) =>
                        handleStateChange(
                          setTravellerData,
                          index,
                          "firstName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <Label>Family name *</Label>
                    <Input
                      value={travellerData[index].lastName}
                      onChange={(e) =>
                        handleStateChange(
                          setTravellerData,
                          index,
                          "lastName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of birth *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        onValueChange={(v) =>
                          handleStateChange(
                            setTravellerData,
                            index,
                            "birthDay",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(v) =>
                          handleStateChange(
                            setTravellerData,
                            index,
                            "birthMonth",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(v) =>
                          handleStateChange(
                            setTravellerData,
                            index,
                            "birthYear",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {birthYears.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors[`${index}-dateOfBirth`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`${index}-dateOfBirth`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select
                      onValueChange={(v) =>
                        handleStateChange(setTravellerData, index, "gender", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Passport details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Country of issue</Label>
                    <Select
                      onValueChange={(v) =>
                        handleStateChange(
                          setTravellerData,
                          index,
                          "issuingCountry",
                          v
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country..." />
                      </SelectTrigger>
                      <SelectContent>
                        {countryList.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Passport number</Label>
                    <Input
                      value={travellerData[index].passportNumber}
                      onChange={(e) =>
                        handleStateChange(
                          setTravellerData,
                          index,
                          "passportNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Expiry date</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        onValueChange={(v) =>
                          handleStateChange(
                            setTravellerData,
                            index,
                            "expiryDay",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(v) =>
                          handleStateChange(
                            setTravellerData,
                            index,
                            "expiryMonth",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(v) =>
                          handleStateChange(
                            setTravellerData,
                            index,
                            "expiryYear",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {expiryYears.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
