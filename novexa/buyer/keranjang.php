<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
    header("Location: ../auth/auth.php");
    exit;
}

$user_id = $_SESSION['user']['id'];

/* ======================
   AMBIL / BUAT KERANJANG
====================== */
$stmt = $pdo->prepare("SELECT id FROM keranjang WHERE user_id = ?");
$stmt->execute([$user_id]);
$keranjang = $stmt->fetch();

if (!$keranjang) {
    $pdo->prepare("INSERT INTO keranjang (user_id) VALUES (?)")
        ->execute([$user_id]);
    $keranjang_id = $pdo->lastInsertId();
} else {
    $keranjang_id = $keranjang['id'];
}

/* ======================
   TAMBAH ITEM
====================== */
if (isset($_GET['tambah'])) {
    $buku_id = (int) $_GET['tambah'];

    // ambil harga buku
    $harga = $pdo->prepare("SELECT harga FROM buku WHERE id = ?");
    $harga->execute([$buku_id]);
    $harga = $harga->fetchColumn();

    if ($harga) {
        $pdo->prepare("
            INSERT INTO detail_item (keranjang_id, buku_id, harga)
            VALUES (?,?,?)
        ")->execute([$keranjang_id, $buku_id, $harga]);
    }

    header("Location: keranjang.php");
    exit;
}

/* ======================
   HAPUS ITEM
====================== */
if (isset($_GET['hapus'])) {
    $id = (int) $_GET['hapus'];
    $pdo->prepare("
        DELETE FROM detail_item 
        WHERE id = ? AND keranjang_id = ?
    ")->execute([$id, $keranjang_id]);

    header("Location: keranjang.php");
    exit;
}

/* ======================
   AMBIL ITEM KERANJANG
====================== */
$stmt = $pdo->prepare("
    SELECT di.id, b.judul, b.cover, di.harga
    FROM detail_item di
    JOIN buku b ON b.id = di.buku_id
    WHERE di.keranjang_id = ?
");
$stmt->execute([$keranjang_id]);
$items = $stmt->fetchAll();

$total = array_sum(array_column($items, 'harga'));
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Keranjang - Novexa</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
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

/* Header */
.page-header {
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    color: white;
    margin-bottom: 2rem;
    box-shadow: 0 5px 20px rgba(25, 135, 84, 0.15);
}

.page-header h3 {
    font-weight: 700;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
}

/* Cart Card */
.cart-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.table {
    margin-bottom: 0;
}

.table thead th {
    background-color: #f8f9fa;
    border-bottom: 2px solid var(--primary-light);
    font-weight: 600;
    color: var(--primary);
    padding: 1rem 1.25rem;
}

.table tbody td {
    padding: 1.25rem;
    vertical-align: middle;
    border-bottom: 1px solid #eee;
}

.book-cover {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

/* Summary Card */
.summary-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
}

.summary-item:last-child {
    border-bottom: none;
    font-size: 1.1rem;
    font-weight: 600;
}

.btn-checkout {
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
    border: none;
    padding: 0.75rem;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 1rem;
}

.btn-checkout:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(25, 135, 84, 0.3);
}

.btn-remove {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.btn-remove:hover {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}

.empty-state i {
    font-size: 3.5rem;
    color: #dee2e6;
    margin-bottom: 1.5rem;
}

.empty-state h5 {
    font-weight: 500;
    color: var(--secondary);
    margin-bottom: 1rem;
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
}
</style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

<div class="page-header">
    <h3><i class="fas fa-shopping-cart me-2"></i>Keranjang Saya</h3>
    <p>Kelola buku yang ingin Anda beli</p>
</div>

<?php if($items): ?>
<div class="row">
    <div class="col-lg-8 mb-4">
        <div class="cart-card">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Buku</th>
                            <th>Harga</th>
                            <th width="60">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach($items as $i): ?>
                        <tr>
                            <td data-label="Buku">
                                <div class="d-flex align-items-center gap-3">
                                    <img src="../uploads/covers/<?= $i['cover'] ?: 'default.jpg' ?>" 
                                         class="book-cover"
                                         onerror="this.src='https://via.placeholder.com/60x80/198754/ffffff?text=NOVEXA'">
                                    <div>
                                        <strong class="d-block"><?= htmlspecialchars($i['judul']) ?></strong>
                                        <small class="text-muted">Digital</small>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Harga">
                                <strong class="text-success">
                                    Rp <?= number_format($i['harga'],0,',','.') ?>
                                </strong>
                            </td>
                            <td data-label="Aksi">
                                <a href="?hapus=<?= $i['id'] ?>"
                                   class="btn btn-remove btn-outline-danger btn-sm"
                                   onclick="return confirm('Hapus buku ini dari keranjang?')"
                                   title="Hapus">
                                   <i class="fas fa-trash-alt"></i>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- RINGKASAN -->
    <div class="col-lg-4">
        <div class="summary-card sticky-top" style="top: 20px;">
            <h6 class="fw-bold mb-3 text-primary">
                <i class="fas fa-receipt me-2"></i>Ringkasan Belanja
            </h6>
            
            <div class="summary-item">
                <span>Total Item</span>
                <strong><?= count($items) ?></strong>
            </div>
            
            <div class="summary-item">
                <span>Total Harga</span>
                <strong class="text-success fs-5">
                    Rp <?= number_format($total,0,',','.') ?>
                </strong>
            </div>
            
            <button class="btn btn-checkout" data-bs-toggle="modal" data-bs-target="#checkoutModal">
                <i class="fas fa-shopping-bag me-2"></i>Checkout Sekarang
            </button>
            
            <div class="text-center mt-3">
                <a href="explore.php" class="text-decoration-none text-primary small">
                    <i class="fas fa-plus me-1"></i>Tambah Buku Lain
                </a>
            </div>
        </div>
    </div>
</div>

<?php else: ?>
<div class="cart-card">
    <div class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <h5>Keranjang Anda masih kosong</h5>
        <p class="text-muted mb-4">Mulai tambahkan buku favorit Anda</p>
        <a href="explore.php" class="btn btn-success px-4">
            <i class="fas fa-compass me-2"></i>Jelajahi Buku
        </a>
    </div>
</div>
<?php endif; ?>

</div>

<!-- Checkout Modal -->
<div class="modal fade" id="checkoutModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold text-primary">
                    <i class="fas fa-shopping-bag me-2"></i>Konfirmasi Checkout
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Anda akan melakukan pembelian <?= count($items) ?> buku dengan total 
                    <strong>Rp <?= number_format($total,0,',','.') ?></strong>
                </div>
                <form action="checkout_process.php" method="POST">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Metode Pembayaran</label>
                        <select class="form-select" name="payment_method" required>
                            <option value="">Pilih metode...</option>
                            <option value="saldo">Saldo Novexa</option>
                            <option value="transfer">Transfer Bank</option>
                            <option value="ewallet">E-Wallet</option>
                        </select>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-check me-2"></i>Konfirmasi Pembayaran
                        </button>
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Update cart count
function updateCartCount(count) {
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
        badge.textContent = count;
    });
}

// Initial cart count
updateCartCount(<?= count($items) ?>);
</script>
</body>
</html>