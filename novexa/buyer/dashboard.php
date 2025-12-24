<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
    header("Location: ../auth/auth.php");
    exit;
}

$user_id = $_SESSION['user']['id'];

/* ======================
   STATISTIK UTAMA
====================== */

// Total transaksi
$stmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM transaksi 
    WHERE user_id = ?
");
$stmt->execute([$user_id]);
$totalTransaksi = $stmt->fetchColumn();

// Saldo (total transaksi PAID)
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(total_harga),0) 
    FROM transaksi 
    WHERE user_id = ? AND status = 'paid'
");
$stmt->execute([$user_id]);
$saldo = $stmt->fetchColumn();

// Jumlah buku dimiliki (dari keranjang yang sudah dibayar)
$stmt = $pdo->prepare("
    SELECT COUNT(DISTINCT di.buku_id) 
    FROM detail_item di
    JOIN keranjang k ON k.id = di.keranjang_id
    WHERE k.user_id = ?
");
$stmt->execute([$user_id]);
$totalBuku = $stmt->fetchColumn();

/* ======================
   DATA LIST
====================== */

// Transaksi terakhir (5)
$stmt = $pdo->prepare("
    SELECT id, total_harga, status, created_at
    FROM transaksi
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
");
$stmt->execute([$user_id]);
$lastTransaksi = $stmt->fetchAll();

// Buku terakhir dibeli (6) - dari detail_item yang ada di keranjang user
$stmt = $pdo->prepare("
    SELECT DISTINCT b.id, b.judul, b.cover, b.harga
    FROM detail_item di
    JOIN buku b ON b.id = di.buku_id
    JOIN keranjang k ON k.id = di.keranjang_id
    WHERE k.user_id = ?
    ORDER BY di.id DESC
    LIMIT 6
");
$stmt->execute([$user_id]);
$lastBooks = $stmt->fetchAll();

// Cek apakah user memiliki keranjang, jika tidak buat
$stmt = $pdo->prepare("SELECT id FROM keranjang WHERE user_id = ?");
$stmt->execute([$user_id]);
$keranjang = $stmt->fetch();

if (!$keranjang) {
    $stmt = $pdo->prepare("INSERT INTO keranjang (user_id) VALUES (?)");
    $stmt->execute([$user_id]);
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Dashboard Buyer - Novexa</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="../assets/css/dashboard.css" rel="stylesheet">
<style>
:root {
    --primary: #198754;
    --primary-light: #d1e7dd;
    --secondary: #6c757d;
    --light: #f8f9fa;
    --white: #ffffff;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, #f7f3eb 0%, #f0f7ff 100%);
    min-height: 100vh;
}

/* Welcome Header */
.welcome-header {
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
    border-radius: 18px;
    padding: 2rem;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(25, 135, 84, 0.2);
}

.welcome-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.welcome-header h3 {
    font-weight: 700;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
}

.welcome-header p {
    opacity: 0.9;
    font-size: 1rem;
}

/* Stat Cards */
.stat-card {
    border: none;
    border-radius: 16px;
    background: var(--white);
    padding: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    height: 100%;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.stat-card:nth-child(1) .stat-icon {
    background: rgba(25, 135, 84, 0.1);
    color: var(--primary);
}

.stat-card:nth-child(2) .stat-icon {
    background: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
}

.stat-card:nth-child(3) .stat-icon {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.stat-card small {
    color: var(--secondary);
    font-weight: 500;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.5rem;
}

.stat-card h4 {
    font-weight: 700;
    font-size: 1.8rem;
    margin: 0;
}

/* Content Cards */
.content-card {
    border: none;
    border-radius: 16px;
    background: var(--white);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    height: 100%;
    overflow: hidden;
}

.content-card .card-header {
    background: var(--white);
    border-bottom: 2px solid var(--primary-light);
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--primary);
}

.content-card .card-body {
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
    background: var(--primary-light);
    transform: translateX(5px);
}

.book-item:last-child {
    margin-bottom: 0;
}

.book-cover {
    width: 50px;
    height: 65px;
    object-fit: cover;
    border-radius: 6px;
    margin-right: 1rem;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.book-info {
    flex-grow: 1;
}

.book-title {
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.book-price {
    font-size: 0.85rem;
    color: var(--primary);
    font-weight: 600;
}

/* Transaction List */
.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    background: var(--light);
    transition: all 0.2s ease;
}

.transaction-item:hover {
    background: var(--primary-light);
}

.transaction-info {
    flex: 1;
}

.transaction-id {
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 0.25rem;
}

.transaction-date {
    font-size: 0.85rem;
    color: var(--secondary);
    margin: 0;
}

.transaction-amount {
    font-weight: 600;
    color: var(--primary);
    font-size: 1.1rem;
}

.transaction-status {
    font-size: 0.8rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 500;
}

.status-paid {
    background: rgba(25, 135, 84, 0.1);
    color: var(--primary);
}

.status-pending {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.status-cancel {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--secondary);
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state p {
    margin: 0;
    font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
    .welcome-header {
        padding: 1.5rem;
        text-align: center;
    }
    
    .welcome-header h3 {
        font-size: 1.5rem;
    }
    
    .stat-card {
        padding: 1.25rem;
    }
    
    .stat-card h4 {
        font-size: 1.5rem;
    }
    
    .book-cover {
        width: 40px;
        height: 52px;
        margin-right: 0.75rem;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

  <!-- HEADER -->
  <div class="welcome-header mb-4">
    <h3>
      Halo, <?= htmlspecialchars($_SESSION['user']['nama']) ?>! 👋
    </h3>
    <p>
      Selamat membaca di Novexa - Platform Buku Digital Terbaik
    </p>
  </div>

  <!-- STATISTIK -->
  <div class="row mb-4 g-3">
    <div class="col-md-4">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-wallet fa-lg"></i>
        </div>
        <small>Total Belanja</small>
        <h4 class="text-success">
          Rp <?= number_format($saldo,0,',','.') ?>
        </h4>
      </div>
    </div>

    <div class="col-md-4">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-book fa-lg"></i>
        </div>
        <small>Buku Dimiliki</small>
        <h4 class="text-primary"><?= $totalBuku ?></h4>
      </div>
    </div>

    <div class="col-md-4">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-receipt fa-lg"></i>
        </div>
        <small>Total Transaksi</small>
        <h4 class="text-warning"><?= $totalTransaksi ?></h4>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <!-- BUKU TERAKHIR -->
    <div class="col-md-6">
      <div class="content-card">
        <div class="card-header">
          <i class="fas fa-bookmark me-2"></i>Buku dalam Keranjang
        </div>
        <div class="card-body">
          <?php if($lastBooks): ?>
            <?php foreach($lastBooks as $b): ?>
              <div class="book-item">
                <?php if($b['cover']): ?>
                <img src="../assets/covers/<?= htmlspecialchars($b['cover']) ?>" 
                     alt="<?= htmlspecialchars($b['judul']) ?>"
                     class="book-cover">
                <?php else: ?>
                <div class="book-cover bg-light d-flex align-items-center justify-content-center">
                  <i class="fas fa-book text-secondary"></i>
                </div>
                <?php endif; ?>
                <div class="book-info">
                  <div class="book-title"><?= htmlspecialchars($b['judul']) ?></div>
                  <div class="book-price">Rp <?= number_format($b['harga'],0,',','.') ?></div>
                </div>
                <a href="baca_buku.php?id=<?= $b['id'] ?>"
                   class="btn btn-sm btn-success px-3">
                   <i class="fas fa-book-open me-1"></i>Baca
                </a>
              </div>
            <?php endforeach; ?>
          <?php else: ?>
            <div class="empty-state">
              <i class="fas fa-book-open"></i>
              <p>Belum ada buku di keranjang</p>
              <a href="../buyer/explore.php" class="btn btn-outline-success btn-sm mt-2">
                <i class="fas fa-store me-1"></i>Jelajahi Buku
              </a>
            </div>
          <?php endif; ?>
        </div>
      </div>
    </div>

    <!-- TRANSAKSI TERAKHIR -->
    <div class="col-md-6">
      <div class="content-card">
        <div class="card-header">
          <i class="fas fa-history me-2"></i>Transaksi Terakhir
        </div>
        <div class="card-body">
          <?php if($lastTransaksi): ?>
            <?php foreach($lastTransaksi as $t): ?>
              <div class="transaction-item">
                <div class="transaction-info">
                  <div class="transaction-id">Transaksi #<?= $t['id'] ?></div>
                  <p class="transaction-date">
                    <?= date('d M Y, H:i', strtotime($t['created_at'])) ?>
                  </p>
                </div>
                <div class="d-flex flex-column align-items-end gap-1">
                  <span class="transaction-amount">
                    Rp <?= number_format($t['total_harga'],0,',','.') ?>
                  </span>
                  <div class="d-flex gap-2">
                    <span class="transaction-status status-<?= $t['status'] ?>">
                      <?= ucfirst($t['status']) ?>
                    </span>
                    <a href="transaksi_detail.php?id=<?= $t['id'] ?>"
                       class="btn btn-sm btn-outline-success">
                       <i class="fas fa-eye"></i>
                    </a>
                  </div>
                </div>
              </div>
            <?php endforeach; ?>
          <?php else: ?>
            <div class="empty-state">
              <i class="fas fa-receipt"></i>
              <p>Belum ada transaksi</p>
              <a href="../buyer/explore.php" class="btn btn-outline-success btn-sm mt-2">
                <i class="fas fa-shopping-cart me-1"></i>Belanja Sekarang
              </a>
            </div>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </div>
</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Add subtle animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate cards on load
    const cards = document.querySelectorAll('.stat-card, .content-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
</script>
</body>
</html>