// The context and access hook belong together because they define one API.
import { createContext, useContext } from 'react'

export const CartContext = createContext(null)

export function useCart() {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('useCart must be used within a CartProvider.')
  }

  return cart
}
