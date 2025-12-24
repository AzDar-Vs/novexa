<?php
session_start();
require_once '../config/database.php';
{
$totalUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalBuku  = $pdo->query("SELECT COUNT(*) FROM buku")->fetchColumn();
$totalTrx   = $pdo->query("SELECT COUNT(*) FROM transaksi WHERE status='paid'")->fetchColumn();
$pendapatan = $pdo->query("
  SELECT COALESCE(SUM(total_harga),0)
  FROM transaksi
  WHERE status='paid'
")->fetchColumn();

}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Admin Dashboard</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<style>
:root {
  --primary-red: #dc3545;
  --dark-red: #c82333;
  --light-red: #f8d7da;
  --soft-bg: #fff5f5;
}

body {
  background: var(--soft-bg);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar-admin {
  background: linear-gradient(135deg, var(--primary-red) 0%, var(--dark-red) 100%);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.sidebar {
  background: white;
  border-right: 1px solid #f0f0f0;
  min-height: calc(100vh - 72px);
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
}

.sidebar .nav-link {
  color: #555;
  padding: 12px 20px;
  border-radius: 8px;
  margin: 4px 10px;
  transition: all 0.3s;
}

.sidebar .nav-link:hover {
  background: var(--light-red);
  color: var(--primary-red);
}

.sidebar .nav-link.active {
  background: var(--primary-red);
  color: white;
  font-weight: 500;
}

.card-stat {
  border: none;
  border-radius: 16px;
  box-shadow: 0 6px 15px rgba(220, 53, 69, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  position: relative;
}

.card-stat:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(220, 53, 69, 0.15);
}

.card-stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
}

.card-user::before {
  background: linear-gradient(to bottom, #4e54c8, #8f94fb);
}

.card-books::before {
  background: linear-gradient(to bottom, #ff7e5f, #feb47b);
}

.card-transactions::before {
  background: linear-gradient(to bottom, #36d1dc, #5b86e5);
}

.card-revenue::before {
  background: linear-gradient(to bottom, #56ab2f, #a8e063);
}

.card-stat .icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 15px;
}

.icon-user {
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
}

.icon-books {
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
}

.icon-transactions {
  background: linear-gradient(135deg, #36d1dc, #5b86e5);
}

.icon-revenue {
  background: linear-gradient(135deg, #56ab2f, #a8e063);
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 10px 0;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.revenue-text {
  color: #28a745;
  font-weight: 700;
}

.dashboard-header {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border-left: 5px solid var(--primary-red);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.brand-logo {
  color: var(--primary-red);
  font-weight: 700;
}

.welcome-text {
  color: #666;
  margin-bottom: 0;
}
</style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-admin navbar-expand-lg navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="#">
      <i class="fas fa-book me-2"></i>BookStore Admin
    </a>
    <div class="d-flex align-items-center">
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="fas fa-user-circle me-2"></i>
          <?= htmlspecialchars($_SESSION['user']['nama'] ?? 'Admin') ?>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="../auth/logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
</nav>

<div class="container-fluid">
  <div class="row">
    <!-- Sidebar -->
    <div class="col-md-2 col-lg-2 d-md-block sidebar collapse">
      <div class="position-sticky pt-3">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link active" href="dashboard.php">
              <i class="fas fa-tachometer-alt me-2"></i> Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="buku.php">
              <i class="fas fa-book me-2"></i> Manajemen Buku
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="notifikasi.php">
              <i class="fas fa-bell me-2"></i> Notifikasi
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="akun.php">
              <i class="fas fa-users me-2"></i> Manajemen User
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="analisis.php">
              <i class="fas fa-chart-bar me-2"></i> Laporan
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <i class="fas fa-cog me-2"></i> Pengaturan
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <main class="col-md-10 col-lg-10 ms-sm-auto px-md-4 py-4">
      <div class="dashboard-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1 brand-logo">Dashboard Admin</h1>
            <p class="welcome-text">Selamat datang, <?= htmlspecialchars($_SESSION['user']['nama'] ?? 'Admin') ?>!</p>
          </div>
          <div class="text-end">
            <span class="badge bg-danger"><?= date('d F Y') ?></span>
          </div>
        </div>
      </div>

      <!-- Statistik Cards -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card card-stat card-user h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="icon icon-user">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="stat-number"><?= $totalUsers ?></div>
                  <div class="stat-label">Total User</div>
                </div>
                <div class="text-muted">
                  <i class="fas fa-chevron-up text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card card-stat card-books h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="icon icon-books">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="stat-number"><?= $totalBuku ?></div>
                  <div class="stat-label">Total Buku</div>
                </div>
                <div class="text-muted">
                  <i class="fas fa-chevron-up text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card card-stat card-transactions h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="icon icon-transactions">
                    <i class="fas fa-exchange-alt"></i>
                  </div>
                  <div class="stat-number"><?= $totalTrx ?></div>
                  <div class="stat-label">Transaksi Paid</div>
                </div>
                <div class="text-muted">
                  <i class="fas fa-chevron-up text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card card-stat card-revenue h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="icon icon-revenue">
                    <i class="fas fa-wallet"></i>
                  </div>
                  <div class="stat-number revenue-text">
                    Rp <?= number_format($pendapatan,0,',','.') ?>
                  </div>
                  <div class="stat-label">Total Pendapatan</div>
                </div>
                <div class="text-muted">
                  <i class="fas fa-chevron-up text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3">
              <h5 class="mb-0"><i class="fas fa-bolt text-warning me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <a href="buku.php" class="btn btn-danger btn-lg w-100 d-flex flex-column align-items-center justify-content-center p-3">
                    <i class="fas fa-book fa-2x mb-2"></i>
                    <span>Kelola Buku</span>
                  </a>
                </div>
                <div class="col-md-3">
                  <a href="notifikasi.php" class="btn btn-outline-danger btn-lg w-100 d-flex flex-column align-items-center justify-content-center p-3">
                    <i class="fas fa-bell fa-2x mb-2"></i>
                    <span>Lihat Notifikasi</span>
                  </a>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-danger btn-lg w-100 d-flex flex-column align-items-center justify-content-center p-3">
                    <i class="fas fa-chart-line fa-2x mb-2"></i>
                    <span>Lihat Laporan</span>
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-danger btn-lg w-100 d-flex flex-column align-items-center justify-content-center p-3">
                    <i class="fas fa-user-plus fa-2x mb-2"></i>
                    <span>Tambah User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>