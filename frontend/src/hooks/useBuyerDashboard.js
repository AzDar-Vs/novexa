import { useEffect, useState } from 'react';
import transactionService from '../services/transactionService';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import reviewService from '../services/reviewService';

const useBuyerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    libraryCount: 0,
    libraryGrowth: 0,
    readingProgress: 0,
    cartItems: 0,
    cartTotal: 0,
    reviewCount: 0,
    avgRating: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // ⬇️ paralel fetch (lebih cepat)
        const [
          library,
          cartSummary,
          transactions,
          reviews,
        ] = await Promise.all([
          bookService.getUserLibrary({ limit: 4 }),
          cartService.getCartSummary(),
          transactionService.getTransactions({ limit: 5 }),
          reviewService.getUserReviews(null, { limit: 5 }),
        ]);

        // Stats
        setStats({
          libraryCount: library?.total || 0,
          libraryGrowth: library?.growth || 0,
          readingProgress: library?.progress || 0,
          cartItems: cartSummary?.items || 0,
          cartTotal: cartSummary?.total || 0,
          reviewCount: reviews?.total || 0,
          avgRating: reviews?.avgRating || 0,
        });

        // Recent activities (transaksi)
        setRecentActivities(
          (transactions?.data || []).map((trx) => ({
            id: trx.id,
            title: `Purchased "${trx.book_title}"`,
            time: trx.created_at_human,
            bookId: trx.book_id,
          }))
        );

        // Recent books
        setRecentBooks(
          (library?.data || []).map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            cover: book.cover_url,
          }))
        );
      } catch (error) {
        console.error('Failed to load buyer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return {
    loading,
    stats,
    recentActivities,
    recentBooks,
  };
};

export default useBuyerDashboard;
