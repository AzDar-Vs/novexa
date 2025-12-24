<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
  header("Location: ../auth/auth.php");
  exit;
}

/* AMBIL BUKU AKTIF */
$stmt = $pdo->query("
  SELECT id, judul, cover, harga
  FROM buku
  WHERE status='aktif'
  ORDER BY created_at DESC
");
$buku = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Explore Buku - Novexa</title>
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

.page-header p {
    opacity: 0.9;
    margin: 0;
}

/* Search */
.search-container {
    background: var(--white);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
}

.search-input {
    border: 2px solid var(--primary-light);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

/* Book Card */
.book-card {
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    height: 100%;
    border: none;
}

.book-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.book-cover {
    height: 200px;
    object-fit: cover;
    width: 100%;
}

.price-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
    color: var(--white);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.book-title {
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.4;
    margin-bottom: 0.75rem;
    color: #333;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.btn-group {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.btn-detail {
    background: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn-detail:hover {
    background: rgba(25, 135, 84, 0.1);
}

.btn-cart {
    background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
    border: none;
    color: white;
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 1rem;
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

.empty-state p {
    margin-bottom: 1.5rem;
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
    
    .book-cover {
        height: 180px;
    }
    
    .btn-group {
        grid-template-columns: 1fr;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

<!-- HEADER -->
<div class="page-header">
    <h3><i class="fas fa-compass me-2"></i>Explore Buku</h3>
    <p>Temukan buku digital terbaik untuk koleksi Anda</p>
</div>

<!-- SEARCH -->
<div class="search-container">
    <div class="row align-items-center">
        <div class="col-md-6">
            <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-search text-muted"></i>
                </span>
                <input type="text" id="searchInput" class="form-control search-input border-start-0"
                       placeholder="Cari judul buku...">
            </div>
        </div>
        <div class="col-md-6 mt-2 mt-md-0 text-md-end">
            <small class="text-muted">
                <i class="fas fa-book me-1"></i><?= count($buku) ?> buku tersedia
            </small>
        </div>
    </div>
</div>

<!-- GRID BUKU -->
<div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4" id="bookList">
<?php foreach($buku as $b): ?>
    <div class="col book-item">
        <div class="book-card">
            <div class="position-relative">
                <img src="../uploads/covers/<?= $b['cover'] ?: 'default.jpg' ?>"
                     class="book-cover"
                     alt="<?= htmlspecialchars($b['judul']) ?>"
                     onerror="this.src='https://via.placeholder.com/300x200/198754/ffffff?text=NOVEXA'">
                <span class="price-badge">
                    Rp <?= number_format($b['harga'],0,',','.') ?>
                </span>
            </div>

            <div class="card-body">
                <h6 class="book-title">
                    <?= htmlspecialchars($b['judul']) ?>
                </h6>

                <div class="btn-group">
                    <a href="detail_buku.php?id=<?= $b['id'] ?>"
                       class="btn-detail text-decoration-none text-center">
                        <i class="fas fa-eye me-1"></i>Detail
                    </a>
                    <a href="keranjang.php?tambah=<?= $b['id'] ?>"
                       class="btn-cart text-decoration-none text-center">
                        <i class="fas fa-cart-plus me-1"></i>Keranjang
                    </a>
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>
</div>

<?php if(empty($buku)): ?>
<div class="card book-card">
    <div class="card-body">
        <div class="empty-state">
            <i class="fas fa-book-open"></i>
            <h5>Belum ada buku tersedia</h5>
            <p>Silakan kembali nanti untuk melihat koleksi buku terbaru.</p>
            <a href="dashboard.php" class="btn btn-success">
                <i class="fas fa-arrow-left me-1"></i>Kembali ke Dashboard
            </a>
        </div>
    </div>
</div>
<?php endif; ?>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
// SEARCH CLIENT SIDE
document.getElementById('searchInput').addEventListener('keyup', function() {
    const keyword = this.value.toLowerCase();
    const bookItems = document.querySelectorAll('.book-item');
    
    bookItems.forEach(item => {
        const title = item.innerText.toLowerCase();
        if (title.includes(keyword)) {
            item.style.display = '';
            item.style.animation = 'fadeIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show message if no results
    const visibleItems = document.querySelectorAll('.book-item[style=""]');
    if (visibleItems.length === 0 && keyword) {
        const noResults = document.createElement('div');
        noResults.className = 'col-12 text-center py-5';
        noResults.innerHTML = `
            <i class="fas fa-search fa-2x text-muted mb-3"></i>
            <h5 class="text-muted">Tidak ditemukan buku dengan kata "${keyword}"</h5>
            <p class="text-muted">Coba kata kunci lainnya</p>
        `;
        
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) existingMessage.remove();
        
        noResults.classList.add('no-results-message');
        document.getElementById('bookList').appendChild(noResults);
    } else {
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) existingMessage.remove();
    }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .book-item {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style);
</script>
</body>
</html>