<?php
session_start();
require_once '../config/database.php';

$totalBuku  = $pdo->query("SELECT COUNT(*) FROM buku")->fetchColumn();
$stmt = $pdo->prepare("
  SELECT * FROM buku 
  WHERE status = 'aktif'
");
$stmt->execute();
$bukuAktif = $stmt->fetchAll();

$buku = []; // INISIALISASI SEBELUM DIGUNAKAN
$search = $_GET['search'] ?? '';
$page = $_GET['page'] ?? 1;
$limit = 10;
$offset = ($page - 1) * $limit;

try {
    // ==================== QUERY DATABASE ====================
    $sql = "SELECT 
                b.*, 
                u.nama as seller,
                u.email as seller_email,
                COUNT(r.id) as total_review,
                AVG(r.rating) as avg_rating
            FROM buku b 
            LEFT JOIN users u ON b.user_id = u.id 
            LEFT JOIN review r ON b.id = r.buku_id 
            WHERE 1=1";
    
    // Filter pencarian
    if (!empty($search)) {
        $sql .= " AND (b.judul LIKE :search OR b.deskripsi LIKE :search OR u.nama LIKE :search)";
    }
    
    // Filter status (opsional)
    $status_filter = $_GET['status'] ?? '';
    if ($status_filter && in_array($status_filter, ['draft', 'aktif', 'nonaktif'])) {
        $sql .= " AND b.status = :status";
    }
    
    $sql .= " GROUP BY b.id";
    $sql .= " ORDER BY b.created_at DESC";
    $sql .= " LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind parameter
    if (!empty($search)) {
        $stmt->bindValue(':search', "%$search%");
    }
    if ($status_filter && in_array($status_filter, ['draft', 'aktif', 'nonaktif'])) {
        $stmt->bindValue(':status', $status_filter);
    }
    
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $buku = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $count_sql = "SELECT COUNT(*) as total FROM buku b WHERE 1=1";
    if (!empty($search)) {
        $count_sql .= " AND (b.judul LIKE :search OR b.deskripsi LIKE :search)";
    }
    if ($status_filter && in_array($status_filter, ['draft', 'aktif', 'nonaktif'])) {
        $count_sql .= " AND b.status = :status";
    }
    
    $count_stmt = $pdo->prepare($count_sql);
    if (!empty($search)) {
        $count_stmt->bindValue(':search', "%$search%");
    }
    if ($status_filter && in_array($status_filter, ['draft', 'aktif', 'nonaktif'])) {
        $count_stmt->bindValue(':status', $status_filter);
    }
    $count_stmt->execute();
    $total_data = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    $total_pages = ceil($total_data / $limit);
    
} catch (PDOException $e) {
    
    $_SESSION['error'] = "Gagal mengambil data buku. Silakan coba lagi.";
    $buku = [];
    $total_pages = 1;
}
try {
    $query = "SELECT b.*, u.nama as penulis 
              FROM buku b 
              LEFT JOIN users u ON b.user_id = u.id 
              ORDER BY b.created_at DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $buku = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $buku = [];
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Manajemen Buku</title>
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

.books-header {
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

.book-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.book-table thead {
  background: linear-gradient(135deg, var(--primary-red), var(--dark-red));
  color: white;
}

.book-table th {
  border: none;
  padding: 16px 20px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.book-table tbody tr {
  transition: all 0.2s;
}

.book-table tbody tr:hover {
  background-color: rgba(220, 53, 69, 0.05);
}

.book-table td {
  padding: 16px 20px;
  vertical-align: middle;
  border-color: #f0f0f0;
}

.status-badge {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  transition: all 0.2s;
}

.btn-edit {
  background: #e3f2fd;
  color: #0d6efd;
}

.btn-edit:hover {
  background: #0d6efd;
  color: white;
}

.btn-toggle {
  background: #fff3cd;
  color: #ffc107;
}

.btn-toggle:hover {
  background: #ffc107;
  color: white;
}

.btn-delete {
  background: #f8d7da;
  color: #dc3545;
}

.btn-delete:hover {
  background: #dc3545;
  color: white;
}

.search-box {
  position: relative;
  max-width: 300px;
}

.search-box input {
  padding-left: 40px;
  border-radius: 25px;
  border: 1px solid #ddd;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border-top: 4px solid var(--primary-red);
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stats-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-admin navbar-expand-lg navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="dashboard.php">
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
            <a class="nav-link" href="dashboard.php">
              <i class="fas fa-tachometer-alt me-2"></i> Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="buku.php">
              <i class="fas fa-book me-2"></i> Manajemen Buku
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="notifikasi.php">
              <i class="fas fa-bell me-2"></i> Notifikasi
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <i class="fas fa-users me-2"></i> Manajemen User
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
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
      <div class="books-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1 brand-logo"><i class="fas fa-book me-2"></i>Manajemen Buku</h1>
            <p class="text-muted mb-0">Kelola koleksi buku di toko Anda</p>
          </div>
          <button class="btn btn-danger">
            <i class="fas fa-plus me-2"></i>Tambah Buku
          </button>
        </div>
      </div>

      <!-- Stats and Search -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="stats-card">
                <div class="stats-number"><?= $totalBuku ?></div>
                <div class="stats-label">Total Buku</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stats-card">
                <div class="stats-number">
                  <?= count(array_filter($buku, fn($b) => $b['status'] === 'aktif')) ?>
                </div>
                <div class="stats-label">Buku Aktif</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stats-card">
                <div class="stats-number">
                  <?= count(array_filter($buku, fn($b) => $b['status'] === 'nonaktif')) ?>
                </div>
                <div class="stats-label">Buku Nonaktif</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="h-100 d-flex align-items-center justify-content-end">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" class="form-control" placeholder="Cari buku...">
            </div>
          </div>
        </div>
      </div>

      <!-- Books Table -->
      <div class="row">
        <div class="col-12">
          <div class="book-table">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Judul Buku</th>
                  <th>Penjual</th>
                  <th>Status</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach($buku as $b): ?>
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="me-3">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white;">
                          <i class="fas fa-book"></i>
                        </div>
                      </div>
                      <div>
                        <strong><?= htmlspecialchars($b['judul']) ?></strong>
                        <div class="text-muted small">ID: BUK-<?= str_pad($b['id'], 4, '0', STR_PAD_LEFT) ?></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="me-2">
                        <div style="width: 32px; height: 32px; background: #e9ecef; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #666;">
                          <i class="fas fa-user"></i>
                        </div>
                      </div>
                      <span><?= htmlspecialchars($b['seller']) ?></span>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge <?= $b['status'] === 'aktif' ? 'status-active' : 'status-inactive' ?>">
                      <i class="fas fa-circle me-1" style="font-size: 8px;"></i>
                      <?= strtoupper($b['status']) ?>
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="action-buttons justify-content-center">
                      <button class="btn-action btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <a href="?toggle=<?= $b['id'] ?>" class="btn-action btn-toggle" title="Toggle Status">
                        <i class="fas fa-power-off"></i>
                      </a>
                      <button class="btn-action btn-delete" title="Hapus">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
              Menampilkan <?= count($buku) ?> dari <?= count($buku) ?> buku
            </div>
            <nav aria-label="Page navigation">
              <ul class="pagination mb-0">
                <li class="page-item disabled">
                  <a class="page-link" href="#" tabindex="-1">
                    <i class="fas fa-chevron-left"></i>
                  </a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item">
                  <a class="page-link" href="#">
                    <i class="fas fa-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>