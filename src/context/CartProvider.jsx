import { useMemo, useState } from 'react'
import { CartContext } from './CartContext'
import { calculatePromotionDiscount } from '../services/promotionService'

function createCartItemId(item) {
  const sizeId = item.size?.id ?? 'standard'
  const crustId = item.crust?.id ?? 'standard'

  const toppingIds = (item.toppings ?? [])
    .map((topping) => topping.id)
    .sort((first, second) => first - second)
    .join('-')

  return [
    item.menuItemId,
    sizeId,
    crustId,
    toppingIds,
  ].join(':')
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [appliedPromotion, setAppliedPromotion] = useState(null)

  function addItem(item) {
    const quantityToAdd =
      Number.isInteger(item.quantity) && item.quantity > 0
        ? item.quantity
        : 1
    const cartItemId = createCartItemId(item)

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.cartItemId === cartItemId,
      )

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.cartItemId === cartItemId
            ? {
              ...currentItem,
              quantity: currentItem.quantity + quantityToAdd,
            }
            : currentItem,
        )
      }

      return [
        ...currentItems,
        {
          ...item,
          cartItemId,
          quantity: quantityToAdd,
        },
      ]
    })
  }

  function updateQuantity(cartItemId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  function removeItem(cartItemId) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.cartItemId !== cartItemId,
      ),
    )
  }

  function clearCart() {
    setItems([])
    setAppliedPromotion(null)
  }

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const subtotalCents = items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  )

  const discountCents = calculatePromotionDiscount(
    appliedPromotion,
    subtotalCents,
  )

  function applyPromotion(promotion) {
    setAppliedPromotion(promotion)
  }

  function removePromotion() {
    setAppliedPromotion(null)
  }

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotalCents,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      appliedPromotion,
      discountCents,
      applyPromotion,
      removePromotion,
    }),
    [
      items,
      itemCount,
      subtotalCents,
      appliedPromotion,
      discountCents,
    ],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}