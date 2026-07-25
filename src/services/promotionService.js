// Looks up promotion codes and calculates their discount in integer cents.
import promotions from '../data/promotions.json'
import { formatCurrency } from '../utils/pricing'

export async function getActivePromotions() {
  return promotions
    .filter((promotion) => promotion.isActive)
    .map((promotion) => ({
      id: promotion.id,
      code: promotion.code,
      description: promotion.description,
      minimumSubtotalCents: promotion.minimumSubtotalCents,
    }))
}

export async function validatePromotionCode(code, subtotalCents) {
  // Normalization makes codes case-insensitive and ignores surrounding spaces.
  const normalizedCode = code.trim().toUpperCase()

  if (!normalizedCode) {
    return {
      isValid: false,
      message: 'Enter a promotion code.',
    }
  }

  const promotion = promotions.find(
    (entry) =>
      entry.isActive &&
      entry.code.toUpperCase() === normalizedCode,
  )

  if (!promotion) {
    return {
      isValid: false,
      message: 'That promotion code is not valid.',
    }
  }

  if (subtotalCents < promotion.minimumSubtotalCents) {
    return {
      isValid: false,
      message: `This promotion requires a minimum subtotal of ${formatCurrency(
        promotion.minimumSubtotalCents,
      )}.`,
    }
  }

  return {
    isValid: true,
    promotion,
    message: `${promotion.code} was applied successfully.`,
  }
}

export function calculatePromotionDiscount(
  promotion,
  subtotalCents,
) {
  if (
    !promotion ||
    subtotalCents < promotion.minimumSubtotalCents
  ) {
    return 0
  }

  if (promotion.discountType === 'percentage') {
    return Math.round(
      subtotalCents * (promotion.discountValue / 100),
    )
  }

  if (promotion.discountType === 'fixed') {
    // Never discount more than the current subtotal.
    return Math.min(promotion.discountValue, subtotalCents)
  }

  return 0
}
