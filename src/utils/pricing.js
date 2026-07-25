// Shared pricing helpers keep every screen's totals consistent.
export const TAX_RATE = 0.08

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatCurrency(cents) {
  if (!Number.isInteger(cents)) {
    return '$0.00'
  }

  return currencyFormatter.format(cents / 100)
}

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

export function calculateOrderTotals(subtotalCents, discountCents = 0) {
  const discountedSubtotalCents = Math.max(
    subtotalCents - discountCents,
    0,
  )
  const taxCents = Math.round(discountedSubtotalCents * TAX_RATE)

  return {
    discountedSubtotalCents,
    taxCents,
    totalCents: discountedSubtotalCents + taxCents,
  }
}
