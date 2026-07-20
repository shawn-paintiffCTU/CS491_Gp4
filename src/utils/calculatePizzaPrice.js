export function calculatePizzaPrice({
  basePriceCents,
  size,
  crust,
  toppings,
  includedToppingIds = [],
}) {
  const sizePrice = size?.priceAdjustmentCents ?? 0
  const crustPrice = crust?.priceAdjustmentCents ?? 0

  const addedToppingsPrice = toppings
    .filter((topping) => !includedToppingIds.includes(topping.id))
    .reduce((total, topping) => total + topping.priceCents, 0)

  return basePriceCents + sizePrice + crustPrice + addedToppingsPrice
}