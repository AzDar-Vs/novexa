<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
    header("Location: ../auth/auth.php");
    exit;
}

$seller_id = $_SESSION['user']['id'];

/* ======================
   STATISTIK SELLER
====================== */

// Total buku dijual
$stmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM buku 
    WHERE user_id = ?
");
$stmt->execute([$seller_id]);
$totalBuku = $stmt->fetchColumn();

// Total transaksi (pesanan masuk)
$stmt = $pdo->prepare("
    SELECT COUNT(DISTINCT t.id)
    FROM transaksi_item ti
    JOIN buku b ON b.id = ti.buku_id
    JOIN transaksi t ON t.id = ti.transaksi_id
    WHERE b.user_id = ? AND t.status = 'paid'
");
$stmt->execute([$seller_id]);
$totalPesanan = $stmt->fetchColumn();

// Total pendapatan
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(ti.harga),0)
    FROM transaksi_item ti
    JOIN buku b ON b.id = ti.buku_id
    JOIN transaksi t ON t.id = ti.transaksi_id
    WHERE b.user_id = ? AND t.status = 'paid'
");
$stmt->execute([$seller_id]);
$pendapatan = $stmt->fetchColumn();

// Buku terlaris (top 3)
$stmt = $pdo->prepare("
    SELECT b.judul, COUNT(ti.buku_id) as terjual
    FROM transaksi_item ti
    JOIN buku b ON b.id = ti.buku_id
    JOIN transaksi t ON t.id = ti.transaksi_id
    WHERE b.user_id = ? AND t.status = 'paid'
    GROUP BY ti.buku_id
    ORDER BY terjual DESC
    LIMIT 3
");
$stmt->execute([$seller_id]);
$bukuTerlaris = $stmt->fetchAll();

/* ======================
   DATA LIST
====================== */

// Buku seller
$stmt = $pdo->prepare("
    SELECT id, judul, harga, status, cover
    FROM buku
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 6
");
$stmt->execute([$seller_id]);
$bukuSeller = $stmt->fetchAll();

// Transaksi terbaru (pesanan masuk)
$stmt = $pdo->prepare("
    SELECT DISTINCT t.id, t.created_at, t.total_harga, u.nama as buyer_nama
    FROM transaksi_item ti
    JOIN buku b ON b.id = ti.buku_id
    JOIN transaksi t ON t.id = ti.transaksi_id
    JOIN users u ON u.id = t.user_id
    WHERE b.user_id = ? AND t.status='paid'
    ORDER BY t.created_at DESC
    LIMIT 5
");
$stmt->execute([$seller_id]);
$pesananMasuk = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Dashboard Seller - Novexa</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
    --primary: #0d6efd; /* Biru untuk seller */
    --primary-dark: #0a58ca;
    --secondary: #198754; /* Hijau untuk accent */
    --light: #f8f9fa;
    --white: #ffffff;
    --dark: #212529;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    min-height: 100vh;
}

/* Header */
.seller-header {
    background: linear-gradient(135deg, var(--primary) 0%, #3d8bfd 100%);
    border-radius: 16px;
    padding: 2rem;
    color: white;
    margin-bottom: 2rem;
    box-shadow: 0 5px 20px rgba(13, 110, 253, 0.15);
    position: relative;
    overflow: hidden;
}

.seller-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.seller-header h3 {
    font-weight: 700;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
}

.seller-header p {
    opacity: 0.9;
    font-size: 1rem;
}

.seller-badge {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 0.25rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Stats Cards */
.stats-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    transition: all 0.3s ease;
    height: 100%;
}

.stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.stats-book .stats-icon {
    background: linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(61, 139, 253, 0.1) 100%);
    color: var(--primary);
}

.stats-order .stats-icon {
    background: linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%);
    color: var(--secondary);
}

.stats-income .stats-icon {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(253, 126, 20, 0.1) 100%);
    color: #dc3545;
}

.stats-label {
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
}

.stats-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
}

.stats-trend {
    font-size: 0.8rem;
    margin-top: 0.5rem;
}

/* Content Cards */
.content-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    height: 100%;
    overflow: hidden;
}

.card-header-custom {
    background: var(--white);
    border-bottom: 2px solid #e9ecef;
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header-custom .btn-sm {
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
}

.card-body-custom {
    padding: 1.5rem;
}

/* Book List */
.book-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    background: var(--light);
    transition: all 0.2s ease;
    border-left: 4px solid var(--primary);
}

.book-item:hover {
    background: rgba(13, 110, 253, 0.05);
    transform: translateX(5px);
}

.book-item:last-child {
    margin-bottom: 0;
}

.book-cover {
    width: 50px;
    height: 65px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 1rem;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

.book-info {
    flex-grow: 1;
}

.book-title {
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.book-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.book-price {
    color: var(--secondary);
    font-weight: 600;
    font-size: 0.9rem;
}

/* Order List */
.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    background: var(--light);
    transition: all 0.2s ease;
}

.order-item:hover {
    background: rgba(13, 110, 253, 0.05);
}

.order-info {
    flex: 1;
}

.order-id {
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 0.25rem;
}

.order-buyer {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.order-date {
    font-size: 0.85rem;
    color: #6c757d;
}

.order-amount {
    font-weight: 600;
    color: var(--secondary);
    font-size: 1.1rem;
}

/* Best Seller */
.best-seller-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 10px;
    margin-bottom: 0.5rem;
    background: var(--light);
}

.best-seller-rank {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.8rem;
    margin-right: 1rem;
}

.best-seller-rank.rank-1 { background: #ffc107; }
.best-seller-rank.rank-2 { background: #6c757d; }
.best-seller-rank.rank-3 { background: #fd7e14; }

.best-seller-title {
    flex-grow: 1;
    font-size: 0.9rem;
    font-weight: 500;
}

.best-seller-sales {
    color: var(--secondary);
    font-weight: 600;
    font-size: 0.85rem;
}

/* Status Badge */
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-draft {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
}

.status-aktif {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
}

.status-nonaktif {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state h5 {
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.empty-state p {
    margin-bottom: 1.5rem;
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.quick-action-btn {
    background: var(--white);
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 1rem;
    text-decoration: none;
    color: var(--primary);
    text-align: center;
    transition: all 0.3s ease;
}

.quick-action-btn:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.2);
    border-color: var(--primary);
}

.quick-action-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    display: block;
}

/* Responsive */
@media (max-width: 768px) {
    .seller-header {
        padding: 1.5rem;
        text-align: center;
    }
    
    .seller-header h3 {
        font-size: 1.5rem;
    }
    
    .stats-card {
        padding: 1.25rem;
    }
    
    .stats-value {
        font-size: 1.5rem;
    }
    
    .book-cover {
        width: 40px;
        height: 52px;
        margin-right: 0.75rem;
    }
    
    .quick-actions {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<!-- HEADER -->
<div class="seller-header">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h3>
                <i class="fas fa-store me-2"></i>Halo, <?= htmlspecialchars($_SESSION['user']['nama']) ?>!
            </h3>
            <p>Selamat datang di dashboard penjual Novexa</p>
        </div>
        <div class="col-md-4 text-md-end">
            <span class="seller-badge">
                <i class="fas fa-crown me-1"></i>Penjual Terverifikasi
            </span>
        </div>
    </div>
</div>

<!-- QUICK ACTIONS -->
<div class="quick-actions mb-4">
    <a href="buku_add.php" class="quick-action-btn">
        <i class="fas fa-plus-circle quick-action-icon"></i>
        <span class="small fw-bold">Tambah Buku</span>
    </a>
    <a href="buku_edit.php" class="quick-action-btn">
        <i class="fas fa-book quick-action-icon"></i>
        <span class="small fw-bold">Kelola Buku</span>
    </a>
    <a href="pesanan.php" class="quick-action-btn">
        <i class="fas fa-shopping-bag quick-action-icon"></i>
        <span class="small fw-bold">Pesanan</span>
    </a>
    <a href="analisis.php" class="quick-action-btn">
        <i class="fas fa-chart-line quick-action-icon"></i>
        <span class="small fw-bold">Penghasilan</span>
    </a>
</div>

<!-- STATISTIK -->
<div class="row mb-4 g-3">
    <div class="col-lg-4 col-md-6">
        <div class="stats-card stats-book">
            <div class="stats-icon">
                <i class="fas fa-book"></i>
            </div>
            <span class="stats-label">Total Buku</span>
            <p class="stats-value"><?= number_format($totalBuku) ?></p>
            <div class="stats-trend">
                <i class="fas fa-chart-line text-success me-1"></i>
                <span class="text-success">+5% bulan ini</span>
            </div>
        </div>
    </div>

    <div class="col-lg-4 col-md-6">
        <div class="stats-card stats-order">
            <div class="stats-icon">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <span class="stats-label">Pesanan Masuk</span>
            <p class="stats-value"><?= number_format($totalPesanan) ?></p>
            <div class="stats-trend">
                <i class="fas fa-chart-line text-success me-1"></i>
                <span class="text-success">+12% bulan ini</span>
            </div>
        </div>
    </div>

    <div class="col-lg-4 col-md-6">
        <div class="stats-card stats-income">
            <div class="stats-icon">
                <i class="fas fa-wallet"></i>
            </div>
            <span class="stats-label">Total Pendapatan</span>
            <p class="stats-value text-success">
                Rp <?= number_format($pendapatan,0,',','.') ?>
            </p>
            <div class="stats-trend">
                <i class="fas fa-chart-line text-success me-1"></i>
                <span class="text-success">+18% bulan ini</span>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- BUKU SAYA -->
    <div class="col-lg-6">
        <div class="content-card">
            <div class="card-header-custom">
                <span>
                    <i class="fas fa-book me-2"></i>Buku Saya
                </span>
                <a href="buku.php" class="btn btn-sm btn-outline-primary">
                    Lihat Semua
                </a>
            </div>
            <div class="card-body-custom">
                <?php if($bukuSeller): ?>
                    <?php foreach($bukuSeller as $b): ?>
                        <div class="book-item">
                            <img src="../uploads/covers/<?= $b['cover'] ?: 'default.jpg' ?>" 
                                 class="book-cover"
                                 alt="<?= htmlspecialchars($b['judul']) ?>"
                                 onerror="this.src='https://via.placeholder.com/50x65/0d6efd/ffffff?text=NOVEXA'">
                            <div class="book-info">
                                <div class="book-title"><?= htmlspecialchars($b['judul']) ?></div>
                                <div class="book-meta">
                                    <span class="book-price">Rp <?= number_format($b['harga'],0,',','.') ?></span>
                                    <span class="status-badge status-<?= $b['status'] ?>">
                                        <?= strtoupper($b['status']) ?>
                                    </span>
                                </div>
                            </div>
                            <a href="buku_edit.php?id=<?= $b['id'] ?>" 
                               class="btn btn-sm btn-outline-primary"
                               title="Edit Buku">
                                <i class="fas fa-edit"></i>
                            </a>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <h5>Belum ada buku</h5>
                        <p>Mulai tambahkan buku pertama Anda</p>
                        <a href="buku_add.php" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>Tambah Buku
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- PESANAN TERBARU -->
    <div class="col-lg-6">
        <div class="content-card">
            <div class="card-header-custom">
                <span>
                    <i class="fas fa-shopping-bag me-2"></i>Pesanan Terbaru
                </span>
                <a href="pesanan.php" class="btn btn-sm btn-outline-primary">
                    Lihat Semua
                </a>
            </div>
            <div class="card-body-custom">
                <?php if($pesananMasuk): ?>
                    <?php foreach($pesananMasuk as $p): ?>
                        <div class="order-item">
                            <div class="order-info">
                                <div class="order-id">Transaksi #<?= str_pad($p['id'], 6, '0', STR_PAD_LEFT) ?></div>
                                <div class="order-buyer">Dari: <?= htmlspecialchars($p['buyer_nama']) ?></div>
                                <div class="order-date">
                                    <i class="far fa-clock me-1"></i><?= date('d M Y, H:i', strtotime($p['created_at'])) ?>
                                </div>
                            </div>
                            <div class="order-amount">
                                Rp <?= number_format($p['total_harga'],0,',','.') ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-shopping-bag"></i>
                        <h5>Belum ada pesanan</h5>
                        <p>Buku Anda masih menunggu pembeli</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- BUKU TERLARIS -->
    <?php if($bukuTerlaris): ?>
    <div class="col-12">
        <div class="content-card">
            <div class="card-header-custom">
                <span>
                    <i class="fas fa-fire me-2"></i>Buku Terlaris
                </span>
                <span class="text-success">
                    <i class="fas fa-chart-line me-1"></i>Top 3 Bulan Ini
                </span>
            </div>
            <div class="card-body-custom">
                <div class="row">
                    <?php foreach($bukuTerlaris as $index => $b): ?>
                    <div class="col-md-4">
                        <div class="best-seller-item">
                            <div class="best-seller-rank rank-<?= $index + 1 ?>">
                                <?= $index + 1 ?>
                            </div>
                            <div class="best-seller-title">
                                <?= htmlspecialchars($b['judul']) ?>
                            </div>
                            <div class="best-seller-sales">
                                <?= $b['terjual'] ?> terjual
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>
</div>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Add animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate stats cards
    const statsCards = document.querySelectorAll('.stats-card');
    statsCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate quick actions
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            btn.style.transition = 'all 0.3s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 300 + index * 50);
    });
});
</script>
</body>
</html>