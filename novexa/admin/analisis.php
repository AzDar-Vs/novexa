<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
  header("Location: ../auth/auth.php");
  exit;
}

// Get statistics
$totalUser = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalSeller = $pdo->query("SELECT COUNT(*) FROM users WHERE role='seller'")->fetchColumn();
$totalBuyer = $pdo->query("SELECT COUNT(*) FROM users WHERE role='buyer'")->fetchColumn();
$totalBuku = $pdo->query("SELECT COUNT(*) FROM buku")->fetchColumn();
$pendapatan = $pdo->query("SELECT COALESCE(SUM(total_harga),0) FROM transaksi WHERE status='paid'")->fetchColumn();

// Get recent transactions
$recentTransactions = $pdo->query("
  SELECT t.id, t.total_harga, t.status, t.created_at, u.nama as buyer_name
  FROM transaksi t
  JOIN users u ON t.user_id = u.id
  ORDER BY t.created_at DESC
  LIMIT 5
")->fetchAll();

// Get platform growth (last 6 months)
$growthStats = $pdo->query("
  SELECT 
    DATE_FORMAT(created_at, '%M') as bulan,
    COUNT(*) as total_users
  FROM users
  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
  GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%M')
  ORDER BY DATE_FORMAT(created_at, '%Y-%m') DESC
  LIMIT 6
")->fetchAll();

// Prepare chart data
$chartLabels = [];
$chartData = [];
foreach (array_reverse($growthStats) as $stat) {
    $chartLabels[] = substr($stat['bulan'], 0, 3); // Short month name
    $chartData[] = $stat['total_users'];
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Analisis Platform - Admin</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
:root {
    --admin-red: #dc3545;
    --admin-red-dark: #c82333;
    --admin-red-light: #f8d7da;
    --admin-gray: #6c757d;
    --admin-light: #f8f9fa;
    --admin-white: #ffffff;
    --admin-dark: #212529;
    --admin-success: #198754;
    --admin-warning: #ffc107;
    --admin-info: #0dcaf0;
    --admin-purple: #6f42c1;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%);
    min-height: 100vh;
    color: var(--admin-dark);
    padding-bottom: 60px;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

/* HEADER */
.dashboard-header {
    background: linear-gradient(135deg, var(--admin-red) 0%, var(--admin-red-dark) 100%);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    color: white;
    margin: 1.5rem 0 2rem 0;
    box-shadow: 0 5px 20px rgba(220, 53, 69, 0.15);
    position: relative;
    overflow: hidden;
}

.dashboard-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.dashboard-header h3 {
    font-weight: 700;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
}

.dashboard-header p {
    opacity: 0.9;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
}

/* STATS CARDS */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.stat-card {
    background: var(--admin-white);
    border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(220, 53, 69, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    border-color: rgba(220, 53, 69, 0.3);
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(to bottom, var(--admin-red), var(--admin-red-dark));
}

.stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1rem;
}

.stat-icon {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    background: linear-gradient(135deg, var(--admin-red), var(--admin-red-dark));
    flex-shrink: 0;
}

.stat-title {
    font-size: 0.9rem;
    color: var(--admin-gray);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
}

.stat-value {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--admin-dark);
    line-height: 1;
}

.stat-subtitle {
    font-size: 0.85rem;
    color: var(--admin-gray);
    margin: 0;
}

/* Card specific colors */
.card-users .stat-icon {
    background: linear-gradient(135deg, #dc3545, #c82333);
}

.card-sellers .stat-icon {
    background: linear-gradient(135deg, #198754, #157347);
}

.card-buyers .stat-icon {
    background: linear-gradient(135deg, #0dcaf0, #0bacd0);
}

.card-books .stat-icon {
    background: linear-gradient(135deg, #6f42c1, #5936a3);
}

.card-revenue .stat-icon {
    background: linear-gradient(135deg, #ffc107, #e0a800);
}

/* CHART SECTION */
.chart-container {
    background: var(--admin-white);
    border-radius: 16px;
    padding: 1.75rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(220, 53, 69, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e9ecef;
}

.section-title {
    font-weight: 600;
    color: var(--admin-red);
    margin: 0;
    font-size: 1.1rem;
}

.section-subtitle {
    color: var(--admin-gray);
    font-size: 0.9rem;
    margin: 0;
}

.chart-wrapper {
    position: relative;
    height: 320px;
    width: 100%;
}

/* RECENT TRANSACTIONS */
.recent-transactions {
    background: var(--admin-white);
    border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(220, 53, 69, 0.1);
}

.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: var(--admin-light);
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
}

.transaction-item:hover {
    background: #e9ecef;
    transform: translateX(5px);
}

.transaction-info {
    flex: 1;
}

.transaction-id {
    font-weight: 600;
    color: var(--admin-dark);
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.transaction-details {
    display: flex;
    gap: 1.5rem;
    font-size: 0.85rem;
    color: var(--admin-gray);
}

.transaction-amount {
    font-weight: 700;
    color: var(--admin-success);
    font-size: 1.1rem;
    min-width: 120px;
    text-align: right;
}

.transaction-status {
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-paid {
    background: rgba(25, 135, 84, 0.12);
    color: var(--admin-success);
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.status-pending {
    background: rgba(255, 193, 7, 0.12);
    color: #d39e00;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

/* EMPTY STATE */
.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--admin-gray);
}

.empty-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
    color: var(--admin-red);
}

.empty-title {
    font-weight: 600;
    color: var(--admin-dark);
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
}

.empty-text {
    color: var(--admin-gray);
    margin-bottom: 1.5rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
}

/* QUICK LINKS */
.quick-links {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
    justify-content: center;
}

.quick-link {
    padding: 0.75rem 1.5rem;
    background: var(--admin-white);
    border-radius: 10px;
    text-decoration: none;
    color: var(--admin-red);
    font-weight: 500;
    transition: all 0.3s ease;
    border: 2px solid rgba(220, 53, 69, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.quick-link:hover {
    background: var(--admin-red);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2);
    text-decoration: none;
    border-color: var(--admin-red);
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .dashboard-header {
        padding: 1.25rem;
        text-align: center;
        margin: 1rem 0 1.5rem 0;
    }
    
    .dashboard-header h3 {
        font-size: 1.4rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .stat-card {
        padding: 1.5rem;
    }
    
    .stat-value {
        font-size: 1.8rem;
    }
    
    .chart-wrapper {
        height: 250px;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
    }
    
    .transaction-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .transaction-amount {
        text-align: left;
    }
}

@media (max-width: 576px) {
    .chart-wrapper {
        height: 220px;
    }
    
    .stat-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .quick-links {
        flex-direction: column;
        align-items: stretch;
    }
    
    .quick-link {
        justify-content: center;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_admin.php'; ?>

<div class="container">
    <!-- HEADER -->
    <div class="dashboard-header">
        <h3><i class="fas fa-chart-line me-2"></i>Analisis Platform</h3>
        <p>Tinjau performa keseluruhan platform NOVEXA</p>
    </div>

    <!-- STATISTICS -->
    <div class="stats-grid">
        <div class="stat-card card-users">
            <div class="stat-header">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div>
                    <h4 class="stat-title">Total Pengguna</h4>
                    <div class="stat-value"><?= number_format($totalUser) ?></div>
                    <p class="stat-subtitle">Terdaftar di platform</p>
                </div>
            </div>
        </div>
        
        <div class="stat-card card-sellers">
            <div class="stat-header">
                <div class="stat-icon">
                    <i class="fas fa-store"></i>
                </div>
                <div>
                    <h4 class="stat-title">Penjual</h4>
                    <div class="stat-value"><?= number_format($totalSeller) ?></div>
                    <p class="stat-subtitle">Seller aktif</p>
                </div>
            </div>
        </div>
        
        <div class="stat-card card-buyers">
            <div class="stat-header">
                <div class="stat-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div>
                    <h4 class="stat-title">Pembeli</h4>
                    <div class="stat-value"><?= number_format($totalBuyer) ?></div>
                    <p class="stat-subtitle">Buyer aktif</p>
                </div>
            </div>
        </div>
        
        <div class="stat-card card-books">
            <div class="stat-header">
                <div class="stat-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div>
                    <h4 class="stat-title">Total Buku</h4>
                    <div class="stat-value"><?= number_format($totalBuku) ?></div>
                    <p class="stat-subtitle">Dalam katalog</p>
                </div>
            </div>
        </div>
        
        <div class="stat-card card-revenue">
            <div class="stat-header">
                <div class="stat-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div>
                    <h4 class="stat-title">Pendapatan</h4>
                    <div class="stat-value">Rp <?= number_format($pendapatan, 0, ',', '.') ?></div>
                    <p class="stat-subtitle">Total platform</p>
                </div>
            </div>
        </div>
    </div>

    <!-- CHART -->
    <div class="chart-container">
        <div class="section-header">
            <div>
                <h5 class="section-title"><i class="fas fa-chart-bar me-2"></i>Pertumbuhan Pengguna</h5>
                <p class="section-subtitle">Statistik pendaftaran 6 bulan terakhir</p>
            </div>
            <div class="text-muted small">
                <i class="fas fa-calendar-alt me-1"></i>Bulanan
            </div>
        </div>
        <div class="chart-wrapper">
            <canvas id="growthChart"></canvas>
        </div>
    </div>

    <!-- RECENT TRANSACTIONS -->
    <div class="recent-transactions">
        <div class="section-header">
            <div>
                <h5 class="section-title"><i class="fas fa-exchange-alt me-2"></i>Transaksi Terbaru</h5>
                <p class="section-subtitle">5 transaksi terakhir di platform</p>
            </div>
            <div class="text-muted small">
                <i class="fas fa-history me-1"></i>Riwayat
            </div>
        </div>
        
        <?php if(!empty($recentTransactions)): ?>
        <div class="transaction-list">
            <?php foreach($recentTransactions as $transaction): ?>
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-id">
                        Transaksi #<?= str_pad($transaction['id'], 6, '0', STR_PAD_LEFT) ?>
                    </div>
                    <div class="transaction-details">
                        <span>
                            <i class="fas fa-user me-1"></i><?= htmlspecialchars($transaction['buyer_name']) ?>
                        </span>
                        <span>
                            <i class="fas fa-calendar me-1"></i><?= date('d M Y', strtotime($transaction['created_at'])) ?>
                        </span>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="transaction-amount">
                        Rp <?= number_format($transaction['total_harga'], 0, ',', '.') ?>
                    </div>
                    <span class="transaction-status status-<?= $transaction['status'] ?>">
                        <?= strtoupper($transaction['status']) ?>
                    </span>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-exchange-alt"></i>
            </div>
            <h5 class="empty-title">Belum Ada Transaksi</h5>
            <p class="empty-text">Belum ada transaksi yang tercatat di platform</p>
        </div>
        <?php endif; ?>
    </div>

    <!-- QUICK LINKS -->
    <div class="quick-links">
        <a href="akun.php" class="quick-link">
            <i class="fas fa-users-cog"></i> Kelola Akun
        </a>
        <a href="../buku/buku_list.php" class="quick-link">
            <i class="fas fa-book"></i> Kelola Buku
        </a>
        <a href="../transaksi/transaksi_admin.php" class="quick-link">
            <i class="fas fa-receipt"></i> Lihat Transaksi
        </a>
    </div>
</div>

<?php include '../partials/footer.php'; ?>

<script>
// Growth Chart
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    const growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: <?= json_encode($chartLabels) ?>,
            datasets: [{
                label: 'Pengguna Baru',
                data: <?= json_encode($chartData) ?>,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#dc3545',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Pengguna baru: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        precision: 0,
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

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

    // Animate transaction items
    const transactions = document.querySelectorAll('.transaction-item');
    transactions.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 500 + index * 100);
    });
});
</script>
</body>
</html>