<?php
session_start();
require_once '../config/database.php';

if (!isset($_GET['id'])) {
    header("Location: explore.php");
    exit;
}

$book_id = $_GET['id'];

// Get book details
$stmt = $pdo->prepare("
    SELECT b.*, u.nama as penulis
    FROM buku b 
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
");
$stmt->execute([$book_id]);
$book = $stmt->fetch();

if (!$book) {
    header("Location: explore.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($book['judul']) ?> - Novexa</title>
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

    /* Book Header */
    .book-header {
        background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
        border-radius: 16px;
        color: white;
        margin-bottom: 2rem;
        box-shadow: 0 5px 20px rgba(25, 135, 84, 0.15);
        overflow: hidden;
    }

    .book-header-content {
        padding: 2rem;
        position: relative;
        z-index: 1;
    }

    .book-header::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -30%;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        z-index: 0;
    }

    .book-cover-large {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    /* Book Info */
    .book-price-tag {
        background: white;
        color: var(--primary);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 1.2rem;
        display: inline-block;
        margin-bottom: 1rem;
    }

    .book-meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.9);
    }

    /* Content Section */
    .content-card {
        background: var(--white);
        border-radius: 16px;
        border: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        margin-bottom: 2rem;
    }

    .content-card-header {
        background-color: #f8f9fa;
        border-bottom: 2px solid var(--primary-light);
        padding: 1.25rem 1.5rem;
        font-weight: 600;
        color: var(--primary);
    }

    .content-card-body {
        padding: 1.5rem;
    }

    /* Action Buttons */
    .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s ease;
        border: 2px solid;
    }

    .btn-buy {
        background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
        border-color: var(--primary);
        color: white;
    }

    .btn-buy:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(25, 135, 84, 0.3);
        color: white;
    }

    .btn-wishlist {
        background: white;
        border-color: #dc3545;
        color: #dc3545;
    }

    .btn-wishlist:hover {
        background: #dc3545;
        color: white;
        transform: translateY(-2px);
    }

    /* Related Books */
    .related-book {
        text-decoration: none;
        color: inherit;
        transition: transform 0.3s ease;
    }

    .related-book:hover {
        transform: translateY(-5px);
    }

    .related-cover {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .book-header-content {
            padding: 1.5rem;
            text-align: center;
        }
        
        .book-cover-large {
            height: 250px;
            margin-bottom: 1.5rem;
        }
        
        .book-meta {
            justify-content: center;
        }
        
        .action-buttons {
            grid-template-columns: 1fr;
        }
    }
    </style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

<!-- Book Header -->
<div class="book-header">
    <div class="row align-items-center">
        <div class="col-lg-4">
            <div class="p-3 p-lg-4">
                <img src="../uploads/covers/<?= $book['cover'] ?: 'default.jpg' ?>" 
                     class="book-cover-large"
                     alt="<?= htmlspecialchars($book['judul']) ?>"
                     onerror="this.src='https://via.placeholder.com/300x300/198754/ffffff?text=NOVEXA'">
            </div>
        </div>
        <div class="col-lg-8">
            <div class="book-header-content">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h1 class="h2 fw-bold mb-2"><?= htmlspecialchars($book['judul']) ?></h1>
                        <p class="mb-0">
                            <i class="fas fa-user me-2"></i>
                            <?= htmlspecialchars($book['penulis'] ?? 'Penulis') ?>
                        </p>
                    </div>
                    <span class="book-price-tag">
                        Rp <?= number_format($book['harga'], 0, ',', '.') ?>
                    </span>
                </div>
                
                <div class="book-meta">
                    <span class="meta-item">
                        <i class="fas fa-book"></i>
                        <span><?= $book['jumlah_halaman'] ?? '0' ?> halaman</span>
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-language"></i>
                        <span><?= $book['bahasa'] ?? 'Indonesia' ?></span>
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span><?= $book['genre'] ?? 'Umum' ?></span>
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span><?= date('d M Y', strtotime($book['created_at'])) ?></span>
                    </span>
                </div>
                
                <p class="mb-0 opacity-90">
                    <?= htmlspecialchars($book['deskripsi'] ?? 'Tidak ada deskripsi tersedia.') ?>
                </p>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Main Content -->
    <div class="col-lg-8">
        <!-- Action Buttons -->
        <div class="action-buttons mb-4">
            <?php
            // Check if user already owns this book
            $user_id = $_SESSION['user']['id'] ?? null;
            $ownsBook = false;
            
            if ($user_id) {
                $checkOwn = $pdo->prepare("
                    SELECT 1 FROM detail_item di
                    JOIN keranjang k ON k.id = di.keranjang_id
                    WHERE di.buku_id = ? AND k.user_id = ?
                ");
                $checkOwn->execute([$book_id, $user_id]);
                $ownsBook = $checkOwn->fetch() ? true : false;
            }
            ?>
            
            <?php if($ownsBook): ?>
            <a href="baca_buku.php?id=<?= $book_id ?>" class="action-btn btn-buy">
                <i class="fas fa-book-open me-2"></i>Baca Buku
            </a>
            <?php else: ?>
            <a href="keranjang.php?tambah=<?= $book_id ?>" class="action-btn btn-buy">
                <i class="fas fa-cart-plus me-2"></i>Beli Sekarang
            </a>
            <?php endif; ?>
            
            <button class="action-btn btn-wishlist" onclick="addToWishlist(<?= $book_id ?>)">
                <i class="fas fa-heart me-2"></i>Wishlist
            </button>
        </div>

        <!-- Book Details -->
        <div class="content-card">
            <div class="content-card-header">
                <i class="fas fa-info-circle me-2"></i>Detail Buku
            </div>
            <div class="content-card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <h6 class="fw-bold text-primary">Status</h6>
                        <span class="badge bg-<?= $book['status'] == 'aktif' ? 'success' : 'secondary' ?>">
                            <?= strtoupper($book['status']) ?>
                        </span>
                    </div>
                    <div class="col-md-6 mb-3">
                        <h6 class="fw-bold text-primary">Format</h6>
                        <span>Digital (eBook)</span>
                    </div>
                    <div class="col-md-6 mb-3">
                        <h6 class="fw-bold text-primary">Bahasa</h6>
                        <span><?= $book['bahasa'] ?? 'Indonesia' ?></span>
                    </div>
                    <div class="col-md-6 mb-3">
                        <h6 class="fw-bold text-primary">Halaman</h6>
                        <span><?= $book['jumlah_halaman'] ?? '0' ?> halaman</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reviews (Optional) -->
        <div class="content-card">
            <div class="content-card-header">
                <i class="fas fa-star me-2"></i>Ulasan Pembaca
            </div>
            <div class="content-card-body">
                <div class="text-center py-4">
                    <i class="fas fa-comment-alt fa-2x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Belum ada ulasan untuk buku ini</p>
                    <a href="#" class="btn btn-outline-primary btn-sm mt-2">
                        <i class="fas fa-pen me-1"></i>Tulis Ulasan Pertama
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="col-lg-4">
        <!-- Author Info -->
        <div class="content-card mb-4">
            <div class="content-card-header">
                <i class="fas fa-user me-2"></i>Tentang Penulis
            </div>
            <div class="content-card-body">
                <div class="text-center">
                    <div class="mb-3">
                        <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                             style="width: 80px; height: 80px; font-size: 1.5rem; font-weight: 600;">
                            <?= strtoupper(substr($book['penulis'] ?? 'P', 0, 1)) ?>
                        </div>
                    </div>
                    <h6 class="fw-bold mb-2"><?= htmlspecialchars($book['penulis'] ?? 'Penulis') ?></h6>
                    <p class="text-muted small mb-0">
                        Penulis aktif di platform Novexa dengan karya-karya berkualitas.
                    </p>
                </div>
            </div>
        </div>

        <!-- Related Books -->
        <?php
        $related = $pdo->prepare("
            SELECT id, judul, cover, harga
            FROM buku 
            WHERE status='aktif' AND id != ? 
            ORDER BY RAND() 
            LIMIT 3
        ");
        $related->execute([$book_id]);
        $relatedBooks = $related->fetchAll();
        ?>
        
        <?php if($relatedBooks): ?>
        <div class="content-card">
            <div class="content-card-header">
                <i class="fas fa-book-open me-2"></i>Buku Lainnya
            </div>
            <div class="content-card-body">
                <?php foreach($relatedBooks as $related): ?>
                <a href="detail_buku.php?id=<?= $related['id'] ?>" class="related-book d-flex align-items-center mb-3">
                    <div class="flex-shrink-0">
                        <img src="../uploads/covers/<?= $related['cover'] ?: 'default.jpg' ?>" 
                             class="related-cover"
                             alt="<?= htmlspecialchars($related['judul']) ?>"
                             style="width: 60px; height: 80px; object-fit: cover;">
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="fw-bold mb-1 small"><?= htmlspecialchars($related['judul']) ?></h6>
                        <p class="text-success mb-0 small fw-bold">
                            Rp <?= number_format($related['harga'], 0, ',', '.') ?>
                        </p>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- Quick Info -->
        <div class="content-card">
            <div class="content-card-header">
                <i class="fas fa-shield-alt me-2"></i>Informasi
            </div>
            <div class="content-card-body">
                <div class="d-flex align-items-center mb-3">
                    <div class="flex-shrink-0 text-success">
                        <i class="fas fa-check-circle fa-lg"></i>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <small class="text-muted">Akses Selamanya</small>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-3">
                    <div class="flex-shrink-0 text-success">
                        <i class="fas fa-mobile-alt fa-lg"></i>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <small class="text-muted">Baca di Perangkat Apapun</small>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0 text-success">
                        <i class="fas fa-download fa-lg"></i>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <small class="text-muted">Download PDF Tersedia</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Add to wishlist function
function addToWishlist(bookId) {
    fetch('add_to_wishlist.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'book_id=' + bookId
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Berhasil ditambahkan ke wishlist!');
        } else {
            alert(data.message || 'Gagal menambahkan ke wishlist.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menambahkan ke wishlist.');
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
</script>
</body>
</html>