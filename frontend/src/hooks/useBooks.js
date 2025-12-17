import { useEffect, useState } from 'react';
import bookService from '../services/bookService';

const useBooks = (params = {}) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAll(params);
      setBooks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [JSON.stringify(params)]);

  return {
    books,
    loading,
    refetch: fetchBooks,
  };
};

export default useBooks;
