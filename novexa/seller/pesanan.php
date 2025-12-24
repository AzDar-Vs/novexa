<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];

/* ======================
   PESANAN MASUK SELLER
====================== */
$stmt = $pdo->prepare("
  SELECT 
    t.id AS transaksi_id,
    t.created_at,
    t.user_id AS buyer_id,
    u.nama AS buyer_nama,
    u.email AS buyer_email,
    b.judul,
    b.cover,
    ti.harga,
    t.status
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  JOIN users u ON u.id = t.user_id
  WHERE b.user_id = ?
  ORDER BY t.created_at DESC
");
$stmt->execute([$seller_id]);
$pesanan = $stmt->fetchAll();

// Hitung statistik
$totalPesanan = count($pesanan);
$pesananSelesai = array_filter($pesanan, fn($p) => $p['status'] === 'paid');
$totalPendapatan = array_sum(array_column($pesananSelesai, 'harga'));
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Pesanan Masuk - Seller</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
    --primary: #0d6efd;
    --primary-dark: #0a58ca;
    --secondary: #198754;
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
.page-header {
    background: linear-gradient(135deg, var(--primary) 0%, #3d8bfd 100%);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    color: white;
    margin-bottom: 2rem;
    box-shadow: 0 5px 20px rgba(13, 110, 253, 0.15);
}

.page-header h3 {
    font-weight: 700;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
}

/* Stats Cards */
.order-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--white);
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.25rem;
}

.stat-total .stat-icon {
    background: rgba(13, 110, 253, 0.1);
    color: var(--primary);
}

.stat-completed .stat-icon {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
}

.stat-income .stat-icon {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-label {
    color: #6c757d;
    font-size: 0.85rem;
    margin: 0;
}

/* Order Table */
.order-table-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.table-header {
    background-color: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    color: var(--primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table {
    margin-bottom: 0;
}

.table thead th {
    background-color: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
    font-weight: 600;
    color: var(--primary);
    padding: 1rem 1.25rem;
    white-space: nowrap;
}

.table tbody td {
    padding: 1.25rem;
    vertical-align: middle;
    border-bottom: 1px solid #eee;
}

/* Order Cover */
.order-cover {
    width: 50px;
    height: 65px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

/* Status Badge */
.order-status {
    padding: 0.4rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-pending {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.status-paid {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
}

.status-cancel {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Buyer Info */
.buyer-info {
    display: flex;
    flex-direction: column;
}

.buyer-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.buyer-email {
    font-size: 0.85rem;
    color: #6c757d;
}

/* Filter Tabs */
.filter-tabs {
    background: var(--white);
    border-radius: 12px;
    padding: 0.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.filter-tabs .nav-link {
    color: #6c757d;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.filter-tabs .nav-link.active {
    background: linear-gradient(135deg, var(--primary) 0%, #3d8bfd 100%);
    color: white;
}

.filter-tabs .nav-link:hover:not(.active) {
    background-color: rgba(13, 110, 253, 0.1);
    color: var(--primary);
}

/* Action Buttons */
.btn-action {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s ease;
}

.btn-action:hover {
    transform: translateY(-2px);
}

.btn-view {
    background: rgba(13, 110, 253, 0.1);
    color: var(--primary);
    border: 1px solid rgba(13, 110, 253, 0.2);
}

.btn-view:hover {
    background: var(--primary);
    color: white;
}

.btn-email {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.btn-email:hover {
    background: var(--secondary);
    color: white;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
}

.empty-state i {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
}

.empty-state h5 {
    font-weight: 500;
    margin-bottom: 1rem;
}

/* Search Box */
.search-box {
    background: var(--white);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.search-input {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        padding: 1.25rem;
        text-align: center;
    }
    
    .page-header h3 {
        font-size: 1.4rem;
    }
    
    .order-stats {
        grid-template-columns: 1fr;
    }
    
    .table-responsive {
        border-radius: 12px;
        overflow: hidden;
    }
    
    .table thead {
        display: none;
    }
    
    .table tbody tr {
        display: block;
        margin-bottom: 1rem;
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    }
    
    .table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .table tbody td:before {
        content: attr(data-label);
        font-weight: 600;
        color: var(--primary);
        margin-right: 1rem;
    }
    
    .filter-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<!-- HEADER -->
<div class="page-header">
    <h3><i class="fas fa-shopping-bag me-2"></i>Pesanan Masuk</h3>
    <p>Kelola semua pesanan dari pembeli</p>
</div>

<!-- STATISTIK -->
<div class="order-stats">
    <div class="stat-card stat-total">
        <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-value"><?= number_format($totalPesanan) ?></div>
        <p class="stat-label">Total Pesanan</p>
    </div>
    
    <div class="stat-card stat-completed">
        <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-value"><?= number_format(count($pesananSelesai)) ?></div>
        <p class="stat-label">Pesanan Selesai</p>
    </div>
    
    <div class="stat-card stat-income">
        <div class="stat-icon">
            <i class="fas fa-wallet"></i>
        </div>
        <div class="stat-value">Rp <?= number_format($totalPendapatan,0,',','.') ?></div>
        <p class="stat-label">Total Pendapatan</p>
    </div>
</div>

<!-- FILTER TABS -->
<div class="filter-tabs">
    <ul class="nav nav-pills justify-content-center">
        <li class="nav-item">
            <a class="nav-link active" href="#" onclick="filterOrders('all')">
                Semua
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="filterOrders('pending')">
                Pending
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="filterOrders('paid')">
                Berhasil
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="filterOrders('cancel')">
                Dibatalkan
            </a>
        </li>
    </ul>
</div>

<!-- SEARCH -->
<div class="search-box">
    <div class="input-group">
        <span class="input-group-text bg-white border-end-0">
            <i class="fas fa-search text-muted"></i>
        </span>
        <input type="text" id="searchInput" class="form-control search-input border-start-0" 
               placeholder="Cari berdasarkan nama pembeli atau judul buku...">
    </div>
</div>

<?php if($pesanan): ?>
<div class="order-table-card">
    <div class="table-header">
        <span>Daftar Pesanan</span>
        <span class="text-muted small">
            <i class="fas fa-filter me-1"></i><?= count($pesanan) ?> pesanan ditemukan
        </span>
    </div>
    <div class="table-responsive">
        <table class="table" id="orderTable">
            <thead>
                <tr>
                    <th width="60">Buku</th>
                    <th>Pembeli</th>
                    <th width="100">Harga</th>
                    <th width="120">Tanggal</th>
                    <th width="100">Status</th>
                    <th width="80">Aksi</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach($pesanan as $p): ?>
                <tr class="order-row" data-status="<?= $p['status'] ?>">
                    <td data-label="Buku">
                        <div class="d-flex align-items-center gap-2">
                            <img src="../uploads/covers/<?= $p['cover'] ?: 'default.jpg' ?>" 
                                 class="order-cover"
                                 alt="<?= htmlspecialchars($p['judul']) ?>"
                                 onerror="this.src='https://via.placeholder.com/50x65/0d6efd/ffffff?text=NOVEXA'">
                            <span class="small fw-bold"><?= htmlspecialchars($p['judul']) ?></span>
                        </div>
                    </td>
                    <td data-label="Pembeli">
                        <div class="buyer-info">
                            <span class="buyer-name"><?= htmlspecialchars($p['buyer_nama']) ?></span>
                            <span class="buyer-email"><?= $p['buyer_email'] ?></span>
                        </div>
                    </td>
                    <td data-label="Harga">
                        <span class="fw-bold text-success">
                            Rp <?= number_format($p['harga'],0,',','.') ?>
                        </span>
                    </td>
                    <td data-label="Tanggal">
                        <small class="text-muted">
                            <?= date('d M Y', strtotime($p['created_at'])) ?>
                            <br>
                            <?= date('H:i', strtotime($p['created_at'])) ?>
                        </small>
                    </td>
                    <td data-label="Status">
                        <span class="order-status status-<?= $p['status'] ?>">
                            <?= strtoupper($p['status']) ?>
                        </span>
                    </td>
                    <td data-label="Aksi">
                        <div class="d-flex gap-2">
                            <a href="#" 
                               class="btn-action btn-view"
                               title="Lihat Detail"
                               onclick="viewOrder(<?= $p['transaksi_id'] ?>)">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="mailto:<?= $p['buyer_email'] ?>" 
                               class="btn-action btn-email"
                               title="Kirim Email">
                                <i class="fas fa-envelope"></i>
                            </a>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php else: ?>
<div class="order-table-card">
    <div class="empty-state">
        <i class="fas fa-shopping-bag"></i>
        <h5>Belum ada pesanan</h5>
        <p class="mb-4">Buku Anda masih menunggu pembeli pertama</p>
        <div class="d-flex gap-2 justify-content-center">
            <a href="buku.php" class="btn btn-outline-primary">
                <i class="fas fa-book me-2"></i>Kelola Buku
            </a>
            <a href="dashboard.php" class="btn btn-primary">
                <i class="fas fa-chart-line me-2"></i>Lihat Dashboard
            </a>
        </div>
    </div>
</div>
<?php endif; ?>

</div>

<!-- Order Detail Modal -->
<div class="modal fade" id="orderDetailModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">
                    <i class="fas fa-file-invoice me-2"></i>Detail Pesanan
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="orderDetailContent">
                <!-- Content will be loaded via AJAX -->
            </div>
        </div>
    </div>
</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Filter orders
function filterOrders(status) {
    const rows = document.querySelectorAll('.order-row');
    const tabs = document.querySelectorAll('.filter-tabs .nav-link');
    
    // Update active tab
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim().toLowerCase() === status || 
            (status === 'all' && tab.textContent.trim().toLowerCase() === 'semua')) {
            tab.classList.add('active');
        }
    });
    
    // Show/hide rows
    rows.forEach(row => {
        if (status === 'all' || row.dataset.status === status) {
            row.style.display = '';
            row.style.animation = 'fadeIn 0.3s ease';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update count
    const visibleRows = document.querySelectorAll('.order-row[style=""]');
    document.querySelector('.table-header .text-muted').innerHTML = 
        `<i class="fas fa-filter me-1"></i>${visibleRows.length} pesanan ditemukan`;
}

// Search functionality
document.getElementById('searchInput').addEventListener('keyup', function() {
    const keyword = this.value.toLowerCase();
    const rows = document.querySelectorAll('.order-row[style=""]');
    
    rows.forEach(row => {
        const buyerName = row.querySelector('.buyer-name').textContent.toLowerCase();
        const bookTitle = row.querySelector('td[data-label="Buku"] span').textContent.toLowerCase();
        
        if (buyerName.includes(keyword) || bookTitle.includes(keyword)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update count
    const visibleRows = document.querySelectorAll('.order-row[style=""]');
    document.querySelector('.table-header .text-muted').innerHTML = 
        `<i class="fas fa-filter me-1"></i>${visibleRows.length} pesanan ditemukan`;
});

// View order details
function viewOrder(orderId) {
    // In a real app, you would fetch order details via AJAX
    // For now, show a simple alert
    alert(`Detail pesanan #${orderId} akan ditampilkan di sini.`);
    
    // Example AJAX call:
    /*
    fetch(`get_order_detail.php?id=${orderId}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('orderDetailContent').innerHTML = html;
            new bootstrap.Modal(document.getElementById('orderDetailModal')).show();
        });
    */
}

// Add animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate table rows
    const rows = document.querySelectorAll('.order-row');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 300 + index * 50);
    });
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .order-row {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style);
</script>
</body>
</html>