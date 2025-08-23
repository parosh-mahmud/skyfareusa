//src/components/bookingv2/traveller-details-step.js
"use client";

import { useState } from "react";
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

export default function TravellerDetailsStep({ onNext, passengers = [] }) {
  const [travellerData, setTravellerData] = useState(
    passengers.map(() => ({
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      phone: "",
    }))
  );

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    travellerData.forEach((traveller, index) => {
      if (!traveller.firstName)
        newErrors[`${index}-firstName`] = "First name is required";
      if (!traveller.lastName)
        newErrors[`${index}-lastName`] = "Last name is required";
      if (!traveller.dateOfBirth)
        newErrors[`${index}-dateOfBirth`] = "Date of birth is required";
      if (!traveller.gender)
        newErrors[`${index}-gender`] = "Gender is required";
      if (index === 0) {
        if (!traveller.email) newErrors[`${index}-email`] = "Email is required";
        if (!traveller.phone) newErrors[`${index}-phone`] = "Phone is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (index, field, value) => {
    setTravellerData((prev) =>
      prev.map((traveller, i) =>
        i === index ? { ...traveller, [field]: value } : traveller
      )
    );

    // Clear error when user starts typing
    if (errors[`${index}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-${field}`];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(travellerData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Traveller Details</h2>
        <p className="text-gray-600">
          Please provide details for all passengers
        </p>
      </div>

      {travellerData.map((traveller, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">
            {index === 0 ? "Primary Contact" : `Passenger ${index + 1}`}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`title-${index}`}>Title</Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange(index, "title", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr</SelectItem>
                  <SelectItem value="mrs">Mrs</SelectItem>
                  <SelectItem value="ms">Ms</SelectItem>
                  <SelectItem value="dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`firstName-${index}`}>First Name *</Label>
              <Input
                id={`firstName-${index}`}
                value={traveller.firstName}
                onChange={(e) =>
                  handleInputChange(index, "firstName", e.target.value)
                }
                className={errors[`${index}-firstName`] ? "border-red-500" : ""}
              />
              {errors[`${index}-firstName`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`${index}-firstName`]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
              <Input
                id={`lastName-${index}`}
                value={traveller.lastName}
                onChange={(e) =>
                  handleInputChange(index, "lastName", e.target.value)
                }
                className={errors[`${index}-lastName`] ? "border-red-500" : ""}
              />
              {errors[`${index}-lastName`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`${index}-lastName`]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth *</Label>
              <Input
                id={`dateOfBirth-${index}`}
                type="date"
                value={traveller.dateOfBirth}
                onChange={(e) =>
                  handleInputChange(index, "dateOfBirth", e.target.value)
                }
                className={
                  errors[`${index}-dateOfBirth`] ? "border-red-500" : ""
                }
              />
              {errors[`${index}-dateOfBirth`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`${index}-dateOfBirth`]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`gender-${index}`}>Gender *</Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange(index, "gender", value)
                }
              >
                <SelectTrigger
                  className={errors[`${index}-gender`] ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors[`${index}-gender`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`${index}-gender`]}
                </p>
              )}
            </div>

            {index === 0 && (
              <>
                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={traveller.email}
                    onChange={(e) =>
                      handleInputChange(index, "email", e.target.value)
                    }
                    className={errors[`${index}-email`] ? "border-red-500" : ""}
                  />
                  {errors[`${index}-email`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`${index}-email`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`phone-${index}`}>Phone *</Label>
                  <Input
                    id={`phone-${index}`}
                    type="tel"
                    value={traveller.phone}
                    onChange={(e) =>
                      handleInputChange(index, "phone", e.target.value)
                    }
                    className={errors[`${index}-phone`] ? "border-red-500" : ""}
                  />
                  {errors[`${index}-phone`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`${index}-phone`]}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleNext} className="px-8">
          Continue to Extra Services
        </Button>
      </div>
    </div>
  );
}
