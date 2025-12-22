const db = require('../config/database');

exports.dashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;

    /* ===== STATS - QUERY YANG BENAR ===== */
    // Query 1: Untuk produk (dari tabel buku)
    const [[productStats]] = await db.query(`
      SELECT
        COUNT(b.ID_BUKU) AS totalProducts,
        SUM(CASE WHEN b.STATUS = 'published' THEN 1 ELSE 0 END) AS activeProducts
      FROM buku b
      WHERE b.ID_USER = ?
    `, [sellerId]);

    // Query 2: Untuk penjualan (dari tabel transaksi) - YANG BENAR
    const [[salesStats]] = await db.query(`
      SELECT
        COUNT(DISTINCT t.ID_TRANSAKSI) AS totalSales,
        COALESCE(SUM(CASE WHEN t.STATUS_PEMBAYARAN = 'paid' THEN t.TOTAL_HARGA ELSE 0 END), 0) AS totalRevenue,
        SUM(CASE WHEN t.STATUS_PEMBAYARAN = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
        COUNT(DISTINCT t.ID_USER) AS customerCount
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      JOIN buku b ON ti.ID_BUKU = b.ID_BUKU
      WHERE b.ID_USER = ?
    `, [sellerId]);

    // Query 3: Untuk rating (dari tabel review)
    const [[ratingStats]] = await db.query(`
      SELECT
        COALESCE(AVG(r.RATING), 0) AS rating
      FROM review r
      JOIN buku b ON r.ID_BUKU = b.ID_BUKU
      WHERE b.ID_USER = ?
    `, [sellerId]);

    /* ===== TOP PRODUCTS ===== */
    const [topProducts] = await db.query(`
      SELECT 
        b.ID_BUKU as id,
        b.JUDUL as title,
        COUNT(ti.ID_ITEM) as sales
      FROM buku b
      LEFT JOIN transaksi_item ti ON b.ID_BUKU = ti.ID_BUKU
      LEFT JOIN transaksi t ON ti.ID_TRANSAKSI = t.ID_TRANSAKSI
      WHERE b.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'paid'
      GROUP BY b.ID_BUKU, b.JUDUL
      ORDER BY sales DESC
      LIMIT 5
    `, [sellerId]);

    /* ===== PENDING ORDERS ===== */
    const [pendingOrders] = await db.query(`
      SELECT 
        t.ID_TRANSAKSI as id,
        t.NO_INVOICE as invoice,
        DATE(t.CREATED_AT) as date,
        u.NAMA as customerName
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      JOIN buku b ON ti.ID_BUKU = b.ID_BUKU
      JOIN user u ON t.ID_USER = u.ID_USER
      WHERE b.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'pending'
      GROUP BY t.ID_TRANSAKSI
      ORDER BY t.CREATED_AT DESC
      LIMIT 5
    `, [sellerId]);

    /* ===== RECENT ACTIVITIES ===== */
    const [recentActivities] = await db.query(`
      (SELECT 
        t.ID_TRANSAKSI as id,
        CONCAT('New Order #', t.NO_INVOICE) as title,
        t.CREATED_AT as time,
        'order' as type
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      JOIN buku b ON ti.ID_BUKU = b.ID_BUKU
      WHERE b.ID_USER = ?
      ORDER BY t.CREATED_AT DESC
      LIMIT 3)
      
      UNION ALL
      
      (SELECT 
        r.ID_REVIEW as id,
        CONCAT('New Review: ', SUBSTRING(r.KOMENTAR, 1, 20), '...') as title,
        r.CREATED_AT as time,
        'review' as type
      FROM review r
      JOIN buku b ON r.ID_BUKU = b.ID_BUKU
      WHERE b.ID_USER = ?
      ORDER BY r.CREATED_AT DESC
      LIMIT 2)
      
      ORDER BY time DESC
      LIMIT 5
    `, [sellerId, sellerId]);

    // Format response sesuai dengan yang diharapkan frontend
    res.json({
      success: true,
      data: {
        stats: {
          totalSales: salesStats.totalSales || 0,
          salesGrowth: 0, // Bisa dihitung dari bulan sebelumnya
          totalProducts: productStats.totalProducts || 0,
          activeProducts: productStats.activeProducts || 0,
          pendingOrders: salesStats.pendingOrders || 0,
          totalRevenue: salesStats.totalRevenue || 0,
          customerCount: salesStats.customerCount || 0,
          rating: parseFloat(ratingStats.rating || 0).toFixed(1)
        },
        topProducts: topProducts.map(product => ({
          id: product.id,
          title: product.title,
          sales: product.sales || 0
        })),
        pendingOrders: pendingOrders.map(order => ({
          id: order.id,
          invoice: order.invoice,
          customerName: order.customerName,
          date: order.date
        })),
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          title: activity.title,
          time: new Date(activity.time).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};