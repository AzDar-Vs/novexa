<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Notifikasi Admin</title>
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

.notification-header {
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

.notification-item {
  border: none;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid var(--primary-red);
}

.notification-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.notification-item.new {
  background: linear-gradient(135deg, #fff, #fff5f5);
  border-left: 4px solid #28a745;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-red), var(--dark-red));
  color: white;
  font-size: 20px;
}

.time-badge {
  background: #f8f9fa;
  color: #666;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #eaeaea;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #ddd;
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.btn-mark-read {
  background: #e9ecef;
  border: none;
  color: #666;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-mark-read:hover {
  background: var(--primary-red);
  color: white;
}

.filter-buttons .btn {
  border-radius: 20px;
  padding: 8px 20px;
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
            <a class="nav-link" href="buku.php">
              <i class="fas fa-book me-2"></i> Manajemen Buku
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="notifikasi.php">
              <i class="fas fa-bell me-2"></i> Notifikasi
              <span class="badge bg-danger float-end mt-1"><?= count($data) ?></span>
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
      <div class="notification-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1 brand-logo"><i class="fas fa-bell me-2"></i>Notifikasi Akun Baru</h1>
            <p class="text-muted mb-0">Monitor pendaftaran user terbaru di sistem</p>
          </div>
          <div class="d-flex gap-2">
            <span class="badge bg-danger fs-6"><?= count($data) ?> Notifikasi</span>
          </div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex gap-2 filter-buttons">
            <button class="btn btn-danger">Semua</button>
            <button class="btn btn-outline-danger">Hari Ini</button>
            <button class="btn btn-outline-danger">Minggu Ini</button>
            <button class="btn btn-outline-danger">Bulan Ini</button>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Daftar Notifikasi</h5>
                <button class="btn btn-sm btn-outline-danger">
                  <i class="fas fa-check-double me-1"></i> Tandai Semua Terbaca
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <?php if (count($data) > 0): ?>
                <?php foreach($data as $index => $d): ?>
                  <div class="notification-item <?= $index < 2 ? 'new' : '' ?> p-4">
                    <div class="d-flex align-items-center">
                      <div class="notification-icon me-3">
                        <i class="fas fa-user-plus"></i>
                      </div>
                      <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold">Akun Baru Terdaftar</h6>
                        <p class="mb-1">
                          <strong><?= htmlspecialchars($d['nama']) ?></strong>
                          (<span class="text-primary"><?= htmlspecialchars($d['email']) ?></span>)
                          telah bergabung di platform.
                        </p>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                          <span class="time-badge">
                            <i class="far fa-clock me-1"></i>
                            <?= date('d M Y, H:i', strtotime($d['created_at'])) ?>
                          </span>
                          <div class="notification-actions">
                            <button class="btn-mark-read btn-sm">
                              <i class="fas fa-check me-1"></i> Tandai Terbaca
                            </button>
                            <button class="btn btn-sm btn-outline-danger">
                              <i class="fas fa-eye me-1"></i> Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                <?php endforeach; ?>
              <?php else: ?>
                <div class="empty-state">
                  <i class="fas fa-bell-slash"></i>
                  <h4 class="mb-2">Tidak Ada Notifikasi</h4>
                  <p class="text-muted">Belum ada notifikasi akun baru saat ini.</p>
                </div>
              <?php endif; ?>
            </div>
            <div class="card-footer bg-white border-0 py-3">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Menampilkan <?= count($data) ?> dari 100+ notifikasi</small>
                <button class="btn btn-danger">
                  <i class="fas fa-sync-alt me-1"></i> Muat Ulang
                </button>
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