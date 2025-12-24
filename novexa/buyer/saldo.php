<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
    header("Location: ../auth/auth.php");
    exit;
}

$user_id = $_SESSION['user']['id'];

/* HITUNG SALDO (TOTAL TRANSAKSI PAID) */
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(total_harga),0)
    FROM transaksi
    WHERE user_id = ? AND status = 'paid'
");
$stmt->execute([$user_id]);
$saldo = $stmt->fetchColumn();

/* RIWAYAT SALDO = TRANSAKSI */
$stmt = $pdo->prepare("
    SELECT id, total_harga, created_at
    FROM transaksi
    WHERE user_id = ? AND status = 'paid'
    ORDER BY created_at DESC
");
$stmt->execute([$user_id]);
$riwayat = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Saldo - Novexa</title>
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

/* Balance Card */
.balance-card {
    background: var(--white);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
    border: none;
    position: relative;
    overflow: hidden;
}

.balance-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
}

.balance-label {
    color: var(--secondary);
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.balance-amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin: 0;
    line-height: 1.2;
}

/* Action Buttons */
.action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.action-btn {
    background: var(--white);
    border: 2px solid var(--primary-light);
    border-radius: 12px;
    padding: 1rem;
    text-decoration: none;
    color: var(--primary);
    font-weight: 500;
    transition: all 0.3s ease;
    text-align: center;
}

.action-btn:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.1);
    color: var(--primary);
}

.action-btn i {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    display: block;
}

/* History Card */
.history-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.history-header {
    background-color: #f8f9fa;
    border-bottom: 2px solid var(--primary-light);
    padding: 1rem 1.5rem;
    font-weight: 600;
    color: var(--primary);
}

.history-list {
    padding: 0;
    margin: 0;
    list-style: none;
}

.history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
}

.history-item:hover {
    background-color: rgba(25, 135, 84, 0.03);
}

.history-item:last-child {
    border-bottom: none;
}

.history-info {
    display: flex;
    flex-direction: column;
}

.history-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
}

.history-date {
    font-size: 0.85rem;
    color: var(--secondary);
}

.history-amount {
    font-weight: 600;
    color: var(--primary);
    font-size: 1.1rem;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--secondary);
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

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        padding: 1.25rem;
        text-align: center;
    }
    
    .page-header h3 {
        font-size: 1.4rem;
    }
    
    .balance-card {
        padding: 1.5rem;
    }
    
    .balance-amount {
        font-size: 2rem;
    }
    
    .action-buttons {
        grid-template-columns: 1fr;
    }
    
    .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .history-amount {
        align-self: flex-end;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

<div class="page-header">
    <h3><i class="fas fa-wallet me-2"></i>Saldo Saya</h3>
    <p>Kelola dan pantau saldo Anda</p>
</div>

<!-- SALDO UTAMA -->
<div class="balance-card">
    <div class="balance-label">Saldo Tersedia</div>
    <p class="balance-amount">Rp <?= number_format($saldo,0,',','.') ?></p>
    <small class="text-muted">Dapat digunakan untuk membeli buku</small>
</div>

<!-- ACTION BUTTONS -->
<div class="action-buttons">
    <a href="#" class="action-btn" data-bs-toggle="modal" data-bs-target="#topupModal">
        <i class="fas fa-plus-circle"></i>
        Top Up Saldo
    </a>
    <a href="transaksi.php" class="action-btn">
        <i class="fas fa-history"></i>
        Riwayat Transaksi
    </a>
    <a href="explore.php" class="action-btn">
        <i class="fas fa-shopping-cart"></i>
        Belanja Buku
    </a>
</div>

<!-- RIWAYAT SALDO -->
<div class="history-card">
    <div class="history-header">
        <i class="fas fa-list me-2"></i>Riwayat Saldo
    </div>
    
    <?php if($riwayat): ?>
    <ul class="history-list">
        <?php foreach($riwayat as $r): ?>
        <li class="history-item">
            <div class="history-info">
                <span class="history-title">Transaksi #<?= str_pad($r['id'], 6, '0', STR_PAD_LEFT) ?></span>
                <span class="history-date">
                    <?= date('d M Y, H:i', strtotime($r['created_at'])) ?>
                </span>
            </div>
            <div class="history-amount">
                + Rp <?= number_format($r['total_harga'],0,',','.') ?>
            </div>
        </li>
        <?php endforeach; ?>
    </ul>
    <?php else: ?>
    <div class="empty-state">
        <i class="fas fa-coins"></i>
        <h5>Belum ada riwayat saldo</h5>
        <p class="text-muted mb-3">Lakukan pembelian buku pertama Anda</p>
        <a href="explore.php" class="btn btn-success btn-sm">
            <i class="fas fa-shopping-cart me-1"></i>Mulai Belanja
        </a>
    </div>
    <?php endif; ?>
</div>

</div>

<!-- Top Up Modal -->
<div class="modal fade" id="topupModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold text-primary">
                    <i class="fas fa-plus-circle me-2"></i>Top Up Saldo
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="topupForm">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Nominal Top Up</label>
                        <select class="form-select" id="topupAmount" required>
                            <option value="">Pilih nominal...</option>
                            <option value="50000">Rp 50.000</option>
                            <option value="100000">Rp 100.000</option>
                            <option value="200000">Rp 200.000</option>
                            <option value="500000">Rp 500.000</option>
                            <option value="custom">Nominal Lainnya</option>
                        </select>
                    </div>
                    <div class="mb-3" id="customAmountField" style="display: none;">
                        <label class="form-label">Masukkan Nominal</label>
                        <input type="number" class="form-control" placeholder="Contoh: 75000" min="10000">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Metode Pembayaran</label>
                        <div class="d-flex flex-wrap gap-2">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="paymentMethod" value="bank" checked>
                                <label class="form-check-label small">Transfer Bank</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="paymentMethod" value="ewallet">
                                <label class="form-check-label small">E-Wallet</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="paymentMethod" value="virtual">
                                <label class="form-check-label small">Virtual Account</label>
                            </div>
                        </div>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-check me-2"></i>Lanjutkan Pembayaran
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
// Custom amount field toggle
document.getElementById('topupAmount').addEventListener('change', function() {
    const customField = document.getElementById('customAmountField');
    if (this.value === 'custom') {
        customField.style.display = 'block';
        customField.querySelector('input').focus();
    } else {
        customField.style.display = 'none';
    }
});

// Top up form submission
document.getElementById('topupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amountSelect = document.getElementById('topupAmount');
    let amount = amountSelect.value;
    
    if (amount === 'custom') {
        const customInput = document.querySelector('#customAmountField input');
        amount = customInput.value;
        
        if (!amount || amount < 10000) {
            alert('Minimum top up Rp 10.000');
            customInput.focus();
            return;
        }
    }
    
    if (!amount) {
        alert('Pilih nominal top up terlebih dahulu');
        return;
    }
    
    // Simulate API call
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memproses...';
    btn.disabled = true;
    
    setTimeout(() => {
        alert('Pembayaran berhasil! Saldo akan ditambahkan setelah pembayaran dikonfirmasi.');
        const modal = bootstrap.Modal.getInstance(document.getElementById('topupModal'));
        modal.hide();
        
        // Reset form
        this.reset();
        document.getElementById('customAmountField').style.display = 'none';
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
});
</script>
</body>
</html>