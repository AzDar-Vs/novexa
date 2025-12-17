import { createContext, useContext, useEffect, useState } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setItems(res.items || []);
      setSummary(res.summary || null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId) => {
    await cartService.addToCart(bookId);
    loadCart();
  };

  const removeFromCart = async (bookId) => {
    await cartService.removeFromCart(bookId);
    loadCart();
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setItems([]);
    setSummary(null);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        loadCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
