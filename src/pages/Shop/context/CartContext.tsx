import React, { createContext, useContext, useState } from "react";
import { Product } from "../Eshop";

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product, quantity?: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product, quantity = 1) => {
    const items = Array(quantity).fill(product);
    setCart((prev) => [...prev, ...items]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartContext not found");
  return context;
};
