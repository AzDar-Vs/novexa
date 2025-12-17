import { useEffect, useState } from 'react';
import cartService from '../services/cartService';

const useCart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.get();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const add = async (bookId) => {
    await cartService.add(bookId);
    fetchCart();
  };

  const remove = async (bookId) => {
    await cartService.remove(bookId);
    fetchCart();
  };

  const clear = async () => {
    await cartService.clear();
    setItems([]);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    items,
    loading,
    add,
    remove,
    clear,
    refetch: fetchCart,
  };
};

export default useCart;
