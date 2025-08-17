export default function PriceDisplaySection({
  basePrice = 0,
  selectedServices = [],
  currency = "USD",
  passengers = 1,
}) {
  const servicesTotal = selectedServices.reduce((total, service) => {
    return total + (service.price || 0)
  }, 0)

  const subtotal = basePrice * passengers + servicesTotal
  const taxes = subtotal * 0.1 // 10% tax rate
  const total = subtotal + taxes

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <h3 className="font-semibold text-lg">Price Breakdown</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>
            Base Price ({passengers} passenger{passengers > 1 ? "s" : ""})
          </span>
          <span>${(basePrice * passengers).toFixed(2)}</span>
        </div>

        {selectedServices.length > 0 && (
          <div className="space-y-1">
            <div className="font-medium">Additional Services:</div>
            {selectedServices.map((service, index) => (
              <div key={index} className="flex justify-between text-sm pl-4">
                <span>{service.name}</span>
                <span>${service.price?.toFixed(2) || "0.00"}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxes & Fees</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t pt-2 font-semibold text-lg">
          <div className="flex justify-between">
            <span>Total</span>
            <span>
              ${total.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
