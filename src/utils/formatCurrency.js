export function formatCurrency(cents) {
  if (!Number.isInteger(cents) || cents < 0) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}