<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];

/* TOTAL BUKU */
$totalBuku = $pdo->prepare("SELECT COUNT(*) FROM buku WHERE user_id=?");
$totalBuku->execute([$seller_id]);
$totalBuku = $totalBuku->fetchColumn();

/* TOTAL TERJUAL */
$totalTerjual = $pdo->prepare("
  SELECT COUNT(*)
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  WHERE b.user_id = ? AND t.status='paid'
");
$totalTerjual->execute([$seller_id]);
$totalTerjual = $totalTerjual->fetchColumn();

/* TOTAL PENDAPATAN */
$pendapatan = $pdo->prepare("
  SELECT COALESCE(SUM(ti.harga),0)
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  WHERE b.user_id = ? AND t.status='paid'
");
$pendapatan->execute([$seller_id]);
$pendapatan = $pendapatan->fetchColumn();

/* BUKU TERLARIS (5 buku) */
$bukuTerlaris = $pdo->prepare("
  SELECT 
    b.judul,
    b.cover,
    COUNT(ti.id) as total_terjual,
    SUM(ti.harga) as total_pendapatan
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  WHERE b.user_id = ? AND t.status='paid'
  GROUP BY b.id
  ORDER BY total_terjual DESC
  LIMIT 5
");
$bukuTerlaris->execute([$seller_id]);
$bukuTerlaris = $bukuTerlaris->fetchAll();

/* PENDAPATAN PER BULAN (6 bulan terakhir) */
$pendapatanBulanan = $pdo->prepare("
  SELECT 
    DATE_FORMAT(t.created_at, '%M') as bulan,
    DATE_FORMAT(t.created_at, '%Y-%m') as bulan_tahun,
    COALESCE(SUM(ti.harga),0) as total
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  WHERE b.user_id = ? 
    AND t.status='paid'
    AND t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
  GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), DATE_FORMAT(t.created_at, '%M')
  ORDER BY DATE_FORMAT(t.created_at, '%Y-%m') DESC
");
$pendapatanBulanan->execute([$seller_id]);
$pendapatanBulanan = $pendapatanBulanan->fetchAll();

// Siapkan data untuk chart
$chartLabels = [];
$chartData = [];
foreach ($pendapatanBulanan as $data) {
    $chartLabels[] = $data['bulan'];
    $chartData[] = $data['total'];
}

// Reverse array untuk urutan kronologis
$chartLabels = array_reverse($chartLabels);
$chartData = array_reverse($chartData);

// Jika tidak ada data
if (empty($chartLabels)) {
    $bulanTerakhir = [];
    for ($i = 5; $i >= 0; $i--) {
        $bulan = date('F', strtotime("-$i months"));
        $chartLabels[] = $bulan;
        $chartData[] = 0;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Analisis Penjualan - Seller</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
:root {
    --primary: #0d6efd;
    --primary-dark: #0a58ca;
    --secondary: #198754;
    --light: #f8f9fa;
    --white: #ffffff;
    --dark: #212529;
    --orange: #fd7e14;
    --purple: #6f42c1;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    min-height: 100vh;
}

/* HEADER */
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

/* STATS CARDS */
.analytics-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.analytic-card {
    background: var(--white);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 3px 15px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.analytic-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.analytic-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.analytic-info {
    flex: 1;
}

.analytic-title {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
    font-weight: 500;
}

.analytic-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    line-height: 1;
}

.analytic-subtitle {
    font-size: 0.85rem;
    color: #6c757d;
    margin: 0;
}

/* Card Colors */
.card-total {
    border-left: 4px solid var(--primary);
}

.card-total .analytic-icon {
    background: rgba(13, 110, 253, 0.1);
    color: var(--primary);
}

.card-sold {
    border-left: 4px solid var(--secondary);
}

.card-sold .analytic-icon {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
}

.card-income {
    border-left: 4px solid var(--orange);
}

.card-income .analytic-icon {
    background: rgba(253, 126, 20, 0.1);
    color: var(--orange);
}

.card-avg {
    border-left: 4px solid var(--purple);
}

.card-avg .analytic-icon {
    background: rgba(111, 66, 193, 0.1);
    color: var(--purple);
}

/* CHART SECTION */
.chart-section {
    background: var(--white);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 3px 15px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e9ecef;
}

.section-title {
    font-weight: 600;
    color: var(--primary);
    margin: 0;
    font-size: 1.1rem;
}

.section-subtitle {
    color: #6c757d;
    font-size: 0.9rem;
    margin: 0;
}

.chart-container {
    position: relative;
    height: 300px;
    width: 100%;
}

/* BESTSELLER SECTION */
.bestseller-section {
    background: var(--white);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 3px 15px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
}

.bestseller-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.bestseller-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--light);
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
}

.bestseller-item:hover {
    background: #e9ecef;
    transform: translateX(5px);
}

.bestseller-rank {
    width: 36px;
    height: 36px;
    background: var(--primary);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.bestseller-cover {
    width: 50px;
    height: 65px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    flex-shrink: 0;
}

.bestseller-info {
    flex: 1;
}

.bestseller-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: var(--dark);
}

.bestseller-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
}

.bestseller-sales {
    color: var(--secondary);
    font-weight: 500;
}

.bestseller-revenue {
    color: var(--orange);
    font-weight: 500;
}

.empty-bestseller {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
}

.empty-bestseller i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-bestseller p {
    margin: 0;
}

/* INFO CARDS */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.info-card {
    background: var(--white);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 3px 15px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
}

.info-card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e9ecef;
}

.info-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
}

.icon-blue {
    background: linear-gradient(135deg, var(--primary) 0%, #3d8bfd 100%);
}

.icon-green {
    background: linear-gradient(135deg, var(--secondary) 0%, #20c997 100%);
}

.info-card-title {
    font-weight: 600;
    color: var(--dark);
    margin: 0;
    font-size: 1rem;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--light);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.info-item:hover {
    background: #e9ecef;
}

.info-label {
    font-size: 0.9rem;
    color: #6c757d;
}

.info-value {
    font-weight: 600;
    color: var(--dark);
}

/* EMPTY STATE */
.empty-analytics {
    background: var(--white);
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 3px 15px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
}

.empty-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2.5rem;
    color: var(--primary);
}

.empty-title {
    font-weight: 600;
    color: var(--dark);
    margin-bottom: 0.75rem;
}

.empty-text {
    color: #6c757d;
    margin-bottom: 1.5rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .page-header {
        padding: 1.25rem;
        text-align: center;
    }
    
    .page-header h3 {
        font-size: 1.4rem;
    }
    
    .analytics-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .analytic-card {
        padding: 1.25rem;
    }
    
    .analytic-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
    }
    
    .analytic-value {
        font-size: 1.5rem;
    }
    
    .chart-container {
        height: 250px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

@media (max-width: 576px) {
    .chart-container {
        height: 200px;
    }
    
    .bestseller-stats {
        flex-direction: column;
        gap: 0.25rem;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<!-- HEADER -->
<div class="page-header">
    <h3><i class="fas fa-chart-line me-2"></i>Analisis Penjualan</h3>
    <p>Tinjau performa dan statistik penjualan buku Anda</p>
</div>

<!-- STATISTIK UTAMA -->
<div class="analytics-stats">
    <div class="analytic-card card-total">
        <div class="analytic-icon">
            <i class="fas fa-book"></i>
        </div>
        <div class="analytic-info">
            <div class="analytic-title">Total Buku</div>
            <div class="analytic-value"><?= number_format($totalBuku) ?></div>
            <p class="analytic-subtitle">Dalam katalog</p>
        </div>
    </div>
    
    <div class="analytic-card card-sold">
        <div class="analytic-icon">
            <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="analytic-info">
            <div class="analytic-title">Total Terjual</div>
            <div class="analytic-value"><?= number_format($totalTerjual) ?></div>
            <p class="analytic-subtitle">Eksemplar terjual</p>
        </div>
    </div>
    
    <div class="analytic-card card-income">
        <div class="analytic-icon">
            <i class="fas fa-wallet"></i>
        </div>
        <div class="analytic-info">
            <div class="analytic-title">Total Pendapatan</div>
            <div class="analytic-value">Rp <?= number_format($pendapatan, 0, ',', '.') ?></div>
            <p class="analytic-subtitle">Penghasilan bersih</p>
        </div>
    </div>
    
    <div class="analytic-card card-avg">
        <div class="analytic-icon">
            <i class="fas fa-tag"></i>
        </div>
        <div class="analytic-info">
            <div class="analytic-title">Rata-rata Harga</div>
            <div class="analytic-value">
                <?php 
                $avgPrice = $totalTerjual > 0 ? $pendapatan / $totalTerjual : 0;
                echo 'Rp ' . number_format($avgPrice, 0, ',', '.');
                ?>
            </div>
            <p class="analytic-subtitle">Per eksemplar</p>
        </div>
    </div>
</div>

<?php if($totalBuku > 0): ?>
<!-- GRAFIK PENDAPATAN -->
<div class="chart-section">
    <div class="section-header">
        <div>
            <h5 class="section-title"><i class="fas fa-chart-bar me-2"></i>Pendapatan 6 Bulan Terakhir</h5>
            <p class="section-subtitle">Perkembangan pendapatan dari waktu ke waktu</p>
        </div>
        <div class="text-muted small">
            <i class="fas fa-calendar me-1"></i><?= date('F Y') ?>
        </div>
    </div>
    <div class="chart-container">
        <canvas id="revenueChart"></canvas>
    </div>
</div>

<!-- BUKU TERLARIS -->
<div class="bestseller-section">
    <div class="section-header">
        <div>
            <h5 class="section-title"><i class="fas fa-crown me-2"></i>Buku Terlaris</h5>
            <p class="section-subtitle">5 buku dengan penjualan tertinggi</p>
        </div>
        <div class="text-muted small">
            <i class="fas fa-trophy me-1"></i>Top Performers
        </div>
    </div>
    
    <?php if(!empty($bukuTerlaris)): ?>
    <div class="bestseller-list">
        <?php foreach($bukuTerlaris as $index => $buku): ?>
        <div class="bestseller-item">
            <div class="bestseller-rank">#<?= $index + 1 ?></div>
            <img src="../uploads/covers/<?= $buku['cover'] ?: 'default.jpg' ?>" 
                 class="bestseller-cover" 
                 alt="<?= htmlspecialchars($buku['judul']) ?>"
                 onerror="this.src='https://via.placeholder.com/50x65/0d6efd/ffffff?text=NOVEXA'">
            <div class="bestseller-info">
                <div class="bestseller-title"><?= htmlspecialchars($buku['judul']) ?></div>
                <div class="bestseller-stats">
                    <span class="bestseller-sales">
                        <i class="fas fa-shopping-cart me-1"></i>
                        <?= number_format($buku['total_terjual']) ?> terjual
                    </span>
                    <span class="bestseller-revenue">
                        <i class="fas fa-money-bill-wave me-1"></i>
                        Rp <?= number_format($buku['total_pendapatan'], 0, ',', '.') ?>
                    </span>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php else: ?>
    <div class="empty-bestseller">
        <i class="fas fa-book-open"></i>
        <p>Belum ada data penjualan untuk buku terlaris</p>
    </div>
    <?php endif; ?>
</div>

<!-- INFO TAMBAHAN -->
<div class="info-grid">
    <div class="info-card">
        <div class="info-card-header">
            <div class="info-card-icon icon-blue">
                <i class="fas fa-chart-pie"></i>
            </div>
            <h5 class="info-card-title">Analisis Penjualan</h5>
        </div>
        <div class="info-list">
            <div class="info-item">
                <span class="info-label">Rasio Penjualan</span>
                <span class="info-value">
                    <?php 
                    $sellRatio = $totalBuku > 0 ? ($totalTerjual / $totalBuku) * 100 : 0;
                    echo number_format($sellRatio, 1) . '%';
                    ?>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Pendapatan/Buku</span>
                <span class="info-value">
                    <?php 
                    $revenuePerBook = $totalBuku > 0 ? $pendapatan / $totalBuku : 0;
                    echo 'Rp ' . number_format($revenuePerBook, 0, ',', '.');
                    ?>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Penjualan/Bulan</span>
                <span class="info-value">
                    <?php 
                    $salesPerMonth = $totalTerjual > 0 ? $totalTerjual / 12 : 0;
                    echo number_format($salesPerMonth, 1);
                    ?>
                </span>
            </div>
        </div>
    </div>
    
    <div class="info-card">
        <div class="info-card-header">
            <div class="info-card-icon icon-green">
                <i class="fas fa-lightbulb"></i>
            </div>
            <h5 class="info-card-title">Rekomendasi</h5>
        </div>
        <div class="info-list">
            <div class="info-item">
                <span class="info-label">Status Katalog</span>
                <span class="info-value <?= $totalBuku >= 10 ? 'text-success' : 'text-warning' ?>">
                    <?= $totalBuku >= 10 ? 'Optimal' : 'Perlu Tambah' ?>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Harga Rata-rata</span>
                <span class="info-value <?= $avgPrice >= 50000 ? 'text-success' : 'text-warning' ?>">
                    <?= $avgPrice >= 50000 ? 'Kompetitif' : 'Perlu Review' ?>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Rekomendasi Aksi</span>
                <span class="info-value">
                    <?= $totalTerjual == 0 ? 'Promosi' : 'Pertahankan' ?>
                </span>
            </div>
        </div>
    </div>
</div>

<?php else: ?>
<!-- EMPTY STATE -->
<div class="empty-analytics">
    <div class="empty-icon">
        <i class="fas fa-chart-line"></i>
    </div>
    <h4 class="empty-title">Belum Ada Data Analisis</h4>
    <p class="empty-text">Mulai tambahkan buku ke katalog Anda untuk melihat analisis penjualan yang detail dan statistik performa.</p>
    <div class="d-flex gap-2 justify-content-center">
        <a href="tambah_buku.php" class="btn btn-primary">
            <i class="fas fa-plus-circle me-2"></i>Tambah Buku Pertama
        </a>
        <a href="dashboard.php" class="btn btn-outline-primary">
            <i class="fas fa-home me-2"></i>Kembali ke Dashboard
        </a>
    </div>
</div>
<?php endif; ?>

</div>

<?php include '../partials/footer.php'; ?>

<script>
// Grafik Pendapatan
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    const revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: <?= json_encode($chartLabels) ?>,
            datasets: [{
                label: 'Pendapatan (Rupiah)',
                data: <?= json_encode($chartData) ?>,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0d6efd',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
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
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return 'Rp ' + (value / 1000000).toFixed(1) + 'Jt';
                            } else if (value >= 1000) {
                                return 'Rp ' + (value / 1000).toFixed(0) + 'K';
                            }
                            return 'Rp ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
    
    // Animasi untuk cards
    const cards = document.querySelectorAll('.analytic-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animasi untuk bestseller items
    const bestsellers = document.querySelectorAll('.bestseller-item');
    bestsellers.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300 + index * 100);
    });
});
</script>
</body>
</html>