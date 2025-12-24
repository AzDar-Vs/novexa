<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
    header("Location: ../auth/auth.php");
    exit;
}

$user_id = $_SESSION['user']['id'];

/* AMBIL TRANSAKSI USER */
$stmt = $pdo->prepare("
    SELECT id, total_harga, status, created_at
    FROM transaksi
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->execute([$user_id]);
$transaksi = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Riwayat Transaksi - Novexa</title>
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

/* Transaction Card */
.transaction-card {
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

.status-badge {
    padding: 0.4rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.btn-detail {
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    transition: all 0.3s ease;
}

.btn-detail:hover {
    background-color: rgba(25, 135, 84, 0.1);
    transform: translateY(-1px);
}

/* Filter Tabs */
.filter-tabs {
    background: var(--white);
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.filter-tabs .nav-link {
    color: var(--secondary);
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    font-weight: 500;
}

.filter-tabs .nav-link.active {
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
    color: white;
}

.filter-tabs .nav-link:hover:not(.active) {
    background-color: var(--primary-light);
    color: var(--primary);
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
    
    .filter-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
    }
    
    .table-responsive {
        border-radius: 12px;
        overflow: hidden;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

<div class="page-header">
    <h3><i class="fas fa-receipt me-2"></i>Riwayat Transaksi</h3>
    <p>Lihat semua transaksi pembelian Anda</p>
</div>

<!-- Filter Tabs -->
<div class="filter-tabs">
    <ul class="nav nav-pills">
        <li class="nav-item">
            <a class="nav-link active" href="#" onclick="filterTransactions('all')">
                Semua
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="filterTransactions('paid')">
                Berhasil
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="filterTransactions('pending')">
                Pending
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="filterTransactions('cancel')">
                Dibatalkan
            </a>
        </li>
    </ul>
</div>

<?php if($transaksi): ?>
<div class="transaction-card">
    <div class="table-responsive">
        <table class="table" id="transactionTable">
            <thead>
                <tr>
                    <th>ID Transaksi</th>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th width="120">Aksi</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach($transaksi as $t): ?>
                <tr class="transaction-row" data-status="<?= $t['status'] ?>">
                    <td>
                        <strong class="text-primary">#<?= str_pad($t['id'], 6, '0', STR_PAD_LEFT) ?></strong>
                    </td>
                    <td>
                        <?= date('d M Y', strtotime($t['created_at'])) ?>
                        <br>
                        <small class="text-muted"><?= date('H:i', strtotime($t['created_at'])) ?></small>
                    </td>
                    <td>
                        <strong class="text-success">
                            Rp <?= number_format($t['total_harga'],0,',','.') ?>
                        </strong>
                    </td>
                    <td>
                        <?php 
                        $badgeClass = '';
                        if ($t['status'] == 'paid') $badgeClass = 'bg-success';
                        elseif ($t['status'] == 'pending') $badgeClass = 'bg-warning';
                        else $badgeClass = 'bg-secondary';
                        ?>
                        <span class="badge <?= $badgeClass ?> status-badge">
                            <?= strtoupper($t['status']) ?>
                        </span>
                    </td>
                    <td>
                        <a href="transaksi_detail.php?id=<?= $t['id'] ?>"
                           class="btn btn-outline-primary btn-detail">
                           <i class="fas fa-eye me-1"></i>Detail
                        </a>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php else: ?>
<div class="transaction-card">
    <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <h5>Belum ada transaksi</h5>
        <p class="text-muted mb-4">Mulai belanja buku favorit Anda</p>
        <a href="explore.php" class="btn btn-success px-4">
            <i class="fas fa-shopping-cart me-2"></i>Mulai Belanja
        </a>
    </div>
</div>
<?php endif; ?>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Filter transactions
function filterTransactions(status) {
    const rows = document.querySelectorAll('.transaction-row');
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
    
    // Show empty message if no results
    const visibleRows = document.querySelectorAll('.transaction-row[style=""]');
    let emptyMessage = document.querySelector('.no-transactions-message');
    
    if (visibleRows.length === 0 && status !== 'all') {
        if (!emptyMessage) {
            emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state no-transactions-message';
            emptyMessage.innerHTML = `
                <i class="fas fa-search"></i>
                <h5>Tidak ada transaksi "${status}"</h5>
                <p class="text-muted">Coba filter lainnya</p>
            `;
            document.querySelector('#transactionTable tbody').appendChild(emptyMessage);
        }
    } else if (emptyMessage) {
        emptyMessage.remove();
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .transaction-row {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style);
</script>
</body>
</html>