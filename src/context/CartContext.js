// Defines the shared cart context and the hook used to access it.
import { createContext, useContext } from "react";

export const CartContext = createContext(null);

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return cart;
}
