<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];

/* ======================
   AMBIL BUKU SELLER
====================== */
$stmt = $pdo->prepare("
  SELECT id, judul, harga, status, cover, created_at
  FROM buku
  WHERE user_id = ?
  ORDER BY created_at DESC
");
$stmt->execute([$seller_id]);
$buku = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Buku Saya - Seller</title>
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

/* Book Table */
.book-table-card {
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

/* Book Cover */
.book-cover-small {
    width: 50px;
    height: 65px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

/* Status Badge */
.status-badge {
    padding: 0.4rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-draft {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
}

.status-aktif {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
}

.status-nonaktif {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
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

.btn-edit {
    background: rgba(13, 110, 253, 0.1);
    color: var(--primary);
    border: 1px solid rgba(13, 110, 253, 0.2);
}

.btn-edit:hover {
    background: var(--primary);
    color: white;
}

.btn-view {
    background: rgba(25, 135, 84, 0.1);
    color: var(--secondary);
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.btn-view:hover {
    background: var(--secondary);
    color: white;
}

.btn-delete {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.btn-delete:hover {
    background: #dc3545;
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

/* Search & Filter */
.search-filter {
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

.filter-select {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 0.75rem;
    background-color: white;
}

.filter-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Add Button */
.btn-add {
    background: linear-gradient(135deg, var(--primary) 0%, #3d8bfd 100%);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
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
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<!-- HEADER -->
<div class="page-header">
    <h3><i class="fas fa-book me-2"></i>Buku Saya</h3>
    <p>Kelola semua buku yang Anda jual</p>
</div>

<!-- SEARCH & FILTER -->
<div class="search-filter">
    <div class="row g-3">
        <div class="col-md-6">
            <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-search text-muted"></i>
                </span>
                <input type="text" id="searchInput" class="form-control search-input border-start-0" 
                       placeholder="Cari judul buku...">
            </div>
        </div>
        <div class="col-md-4">
            <select class="form-select filter-select" id="statusFilter">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
            </select>
        </div>
        <div class="col-md-2 text-end">
            <a href="buku_add.php" class="btn btn-add">
                <i class="fas fa-plus me-2"></i>Tambah
            </a>
        </div>
    </div>
</div>

<?php if($buku): ?>
<div class="book-table-card">
    <div class="table-responsive">
        <table class="table" id="bookTable">
            <thead>
                <tr>
                    <th width="60">Cover</th>
                    <th>Judul</th>
                    <th width="120">Harga</th>
                    <th width="100">Status</th>
                    <th width="120">Tanggal</th>
                    <th width="140">Aksi</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach($buku as $b): ?>
                <tr class="book-row" data-status="<?= $b['status'] ?>">
                    <td data-label="Cover">
                        <img src="../uploads/covers/<?= $b['cover'] ?: 'default.jpg' ?>" 
                             class="book-cover-small"
                             alt="<?= htmlspecialchars($b['judul']) ?>"
                             onerror="this.src='https://via.placeholder.com/50x65/0d6efd/ffffff?text=NOVEXA'">
                    </td>
                    <td data-label="Judul">
                        <strong><?= htmlspecialchars($b['judul']) ?></strong>
                    </td>
                    <td data-label="Harga">
                        <span class="fw-bold text-success">
                            Rp <?= number_format($b['harga'],0,',','.') ?>
                        </span>
                    </td>
                    <td data-label="Status">
                        <span class="status-badge status-<?= $b['status'] ?>">
                            <?= strtoupper($b['status']) ?>
                        </span>
                    </td>
                    <td data-label="Tanggal">
                        <small class="text-muted">
                            <?= date('d M Y', strtotime($b['created_at'])) ?>
                        </small>
                    </td>
                    <td data-label="Aksi">
                        <div class="d-flex gap-2">
                            <a href="buku_edit.php?id=<?= $b['id'] ?>" 
                               class="btn-action btn-edit"
                               title="Edit Buku">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="../buyer/detail_buku.php?id=<?= $b['id'] ?>" 
                               target="_blank"
                               class="btn-action btn-view"
                               title="Lihat Preview">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="#" 
                               class="btn-action btn-delete"
                               onclick="confirmDelete(<?= $b['id'] ?>)"
                               title="Hapus Buku">
                                <i class="fas fa-trash"></i>
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
<div class="book-table-card">
    <div class="empty-state">
        <i class="fas fa-book"></i>
        <h5>Belum ada buku</h5>
        <p class="mb-4">Mulai jual buku pertama Anda di Novexa</p>
        <a href="buku_add.php" class="btn btn-add px-4">
            <i class="fas fa-plus me-2"></i>Tambah Buku Pertama
        </a>
    </div>
</div>
<?php endif; ?>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Search functionality
document.getElementById('searchInput').addEventListener('keyup', function() {
    const keyword = this.value.toLowerCase();
    const rows = document.querySelectorAll('.book-row');
    
    rows.forEach(row => {
        const title = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        if (title.includes(keyword)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Filter by status
document.getElementById('statusFilter').addEventListener('change', function() {
    const status = this.value;
    const rows = document.querySelectorAll('.book-row');
    
    rows.forEach(row => {
        const rowStatus = row.dataset.status;
        if (!status || rowStatus === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Delete confirmation
function confirmDelete(bookId) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
        // In a real app, you would make an AJAX call here
        // window.location.href = `buku_delete.php?id=${bookId}`;
        alert('Fitur hapus akan diimplementasikan nanti!');
    }
}

// Add animation to table rows
document.addEventListener('DOMContentLoaded', function() {
    const rows = document.querySelectorAll('.book-row');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
    });
});
</script>
</body>
</html>