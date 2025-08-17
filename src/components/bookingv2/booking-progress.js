import { Check } from "lucide-react"

export default function BookingProgress({ currentStep }) {
  const steps = [
    { id: 1, name: "Traveller Details", completed: currentStep > 1 },
    { id: 2, name: "Extra Services", completed: currentStep > 2 },
    { id: 3, name: "Review & Payment", completed: currentStep > 3 },
  ]

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : currentStep === step.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }
              `}
              >
                {step.completed ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${currentStep === step.id ? "text-blue-600" : "text-gray-500"}`}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${step.completed ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
