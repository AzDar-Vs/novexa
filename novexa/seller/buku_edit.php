<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];
$buku_id = $_GET['id'] ?? null;

if (!$buku_id) {
  header("Location: buku_list.php");
  exit;
}

/* ======================
   AMBIL BUKU (OWNERSHIP)
====================== */
$stmt = $pdo->prepare("
  SELECT * FROM buku 
  WHERE id = ? AND user_id = ?
");
$stmt->execute([$buku_id, $seller_id]);
$buku = $stmt->fetch();

if (!$buku) {
  header("Location: buku_list.php");
  exit;
}

/* ======================
   AMBIL GENRE TERPILIH
====================== */
$stmt = $pdo->prepare("
  SELECT g.id
  FROM kategori k
  JOIN genre g ON g.id = k.genre_id
  WHERE k.buku_id = ?
  LIMIT 1
");
$stmt->execute([$buku_id]);
$bukuGenreId = $stmt->fetchColumn();

/* ======================
   AMBIL SEMUA GENRE
====================== */
$genres = $pdo->query("SELECT id, nama_genre FROM genre ORDER BY nama_genre ASC")->fetchAll();

$error = '';
$success = '';

/* ======================
   SUBMIT FORM
====================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  $judul     = trim($_POST['judul']);
  $deskripsi = trim($_POST['deskripsi']);
  $harga     = (int) $_POST['harga'];
  $status    = $_POST['status'];
  $kategori  = (int) ($_POST['kategori'] ?? 0);

  $coverName = $buku['cover'];

  /* ===== UPLOAD COVER ===== */
  if (!empty($_FILES['cover']['name'])) {
    $ext = strtolower(pathinfo($_FILES['cover']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png','webp'];

    if (!in_array($ext, $allowed)) {
      $error = "Cover harus JPG, PNG, atau WebP";
    } elseif ($_FILES['cover']['size'] > 5 * 1024 * 1024) {
      $error = "Ukuran cover maksimal 5MB";
    } else {
      if ($buku['cover'] && file_exists('../uploads/covers/' . $buku['cover'])) {
        unlink('../uploads/covers/' . $buku['cover']);
      }

      $coverName = 'cover_' . $seller_id . '_' . time() . '.' . $ext;
      move_uploaded_file(
        $_FILES['cover']['tmp_name'],
        '../uploads/covers/' . $coverName
      );
    }
  }

  if (!$error && $judul && $deskripsi && $harga > 0 && in_array($status, ['draft','aktif','nonaktif'])) {
    try {
      $pdo->beginTransaction();

      /* UPDATE BUKU */
      $stmt = $pdo->prepare("
        UPDATE buku
        SET judul = ?, deskripsi = ?, harga = ?, status = ?, cover = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      ");
      $stmt->execute([
        $judul,
        $deskripsi,
        $harga,
        $status,
        $coverName,
        $buku_id,
        $seller_id
      ]);

      /* UPDATE KATEGORI */
      $pdo->prepare("DELETE FROM kategori WHERE buku_id = ?")
          ->execute([$buku_id]);

      if ($kategori > 0) {
        $pdo->prepare("
          INSERT INTO kategori (buku_id, genre_id)
          VALUES (?, ?)
        ")->execute([$buku_id, $kategori]);
      }

      $pdo->commit();
      $success = "Buku berhasil diperbarui";

    } catch (Exception $e) {
      $pdo->rollBack();
      $error = "Terjadi kesalahan sistem";
    }
  } else {
    if (!$error) {
      $error = "Data tidak valid";
    }
  }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Edit Buku - Seller</title>
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

/* Form Card */
.form-card {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 2rem;
}

.form-header {
    background-color: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.form-body {
    padding: 1.5rem;
}

/* Form Elements */
.form-label {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-label i {
    color: var(--primary);
    font-size: 0.9rem;
}

.form-control, .form-select {
    border: 2px solid #e9ecef;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.form-control:focus, .form-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-control.is-invalid, .form-select.is-invalid {
    border-color: #dc3545;
}

textarea.form-control {
    min-height: 120px;
    resize: vertical;
}

/* File Upload */
.file-upload {
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background: #f8f9fa;
    cursor: pointer;
}

.file-upload:hover {
    border-color: var(--primary);
    background: rgba(13, 110, 253, 0.05);
}

.file-upload input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.file-preview {
    max-width: 200px;
    max-height: 250px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
}

.file-info {
    color: #6c757d;
    font-size: 0.9rem;
}

/* Book Preview */
.book-preview {
    background: var(--white);
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    margin-top: 2rem;
}

.preview-cover {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
}

.preview-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #333;
}

.preview-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
}

.preview-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--secondary);
}

.preview-status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-draft { background: #e9ecef; color: #6c757d; }
.status-aktif { background: #d1e7dd; color: var(--secondary); }
.status-nonaktif { background: #f8d7da; color: #dc3545; }

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #dee2e6;
}

.btn-save {
    background: linear-gradient(135deg, var(--primary) 0%, #3d8bfd 100%);
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
}

.btn-cancel {
    background: #6c757d;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-cancel:hover {
    background: #5a6268;
    transform: translateY(-2px);
}

/* Alert */
.alert-custom {
    border-radius: 12px;
    border: none;
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
}

.alert-custom i {
    margin-right: 0.5rem;
}

/* Character Counter */
.char-counter {
    font-size: 0.8rem;
    color: #6c757d;
    text-align: right;
    margin-top: 0.25rem;
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
    
    .form-body {
        padding: 1.25rem;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .btn-save, .btn-cancel {
        width: 100%;
    }
}

@media (max-width: 576px) {
    .form-body {
        padding: 1rem;
    }
    
    .file-upload {
        padding: 1.5rem;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<!-- HEADER -->
<div class="page-header">
    <h3><i class="fas fa-edit me-2"></i>Edit Buku</h3>
    <p>Perbarui informasi buku Anda</p>
</div>

<?php if($error): ?>
<div class="alert alert-danger"><?= $error ?></div>
<?php endif; ?>

<?php if($success): ?>
<div class="alert alert-success"><?= $success ?></div>
<?php endif; ?>

<div class="row">
    <!-- FORM EDIT -->
    <div class="col-lg-8">
        <div class="form-card">
            <div class="form-header">
                <i class="fas fa-book"></i>
                <span>Informasi Buku</span>
            </div>
            <div class="form-body">
                <form method="POST" enctype="multipart/form-data">
                    <div class="row">
                        <div class="mb-3">
                            <label class="form-label">Judul Buku</label>
                            <input type="text" name="judul" class="form-control"
                            value="<?= htmlspecialchars($buku['judul']) ?>" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Kategori</label>
                            <select name="kategori" class="form-select">
                                <option value="">Pilih Kategori</option>
                                <?php foreach($genres as $g): ?>
                                    <option value="<?= $g['id'] ?>"
                                    <?= ($g['id'] == $bukuGenreId) ? 'selected' : '' ?>>
                                    <?= htmlspecialchars($g['nama_genre']) ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">
                                <i class="fas fa-money-bill-wave"></i>Harga (Rp)
                            </label>
                            <div class="input-group">
                                <span class="input-group-text bg-light">Rp</span>
                                <input type="number" name="harga" class="form-control" 
                                       value="<?= $buku['harga'] ?>" 
                                       required min="1000" max="10000000">
                            </div>
                            <small class="text-muted">Harga antara 1.000 - 10.000.000</small>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">
                                <i class="fas fa-chart-line"></i>Status
                            </label>
                            <select name="status" class="form-select" required>
                                <option value="draft" <?= $buku['status']=='draft'?'selected':'' ?>>
                                    Draft (Tidak ditampilkan)
                                </option>
                                <option value="aktif" <?= $buku['status']=='aktif'?'selected':'' ?>>
                                    Aktif (Dijual)
                                </option>
                                <option value="nonaktif" <?= $buku['status']=='nonaktif'?'selected':'' ?>>
                                    Nonaktif (Ditutup)
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">
                                <i class="fas fa-file-alt"></i>Jumlah Halaman
                            </label>
                            <input type="number" name="jumlah_halaman" class="form-control" 
                                   value="<?= $buku['jumlah_halaman'] ?? 0 ?>" 
                                   min="1" max="5000">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">
                                <i class="fas fa-language"></i>Bahasa
                            </label>
                            <select name="bahasa" class="form-select">
                                <option value="Indonesia" <?= ($buku['bahasa'] ?? '') == 'Indonesia' ? 'selected' : '' ?>>Indonesia</option>
                                <option value="English" <?= ($buku['bahasa'] ?? '') == 'English' ? 'selected' : '' ?>>English</option>
                                <option value="Sunda" <?= ($buku['bahasa'] ?? '') == 'Sunda' ? 'selected' : '' ?>>Sunda</option>
                                <option value="Jawa" <?= ($buku['bahasa'] ?? '') == 'Jawa' ? 'selected' : '' ?>>Jawa</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            <i class="fas fa-align-left"></i>Deskripsi
                        </label>
                        <textarea name="deskripsi" class="form-control" rows="5" 
                                  required maxlength="2000"
                                  id="deskripsiInput"><?= htmlspecialchars($buku['deskripsi']) ?></textarea>
                        <div class="char-counter" id="deskripsiCounter">0/2000</div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label mb-3">
                            <i class="fas fa-image"></i>Cover Buku
                        </label>
                        <div class="file-upload">
                            <div class="text-center">
                                <?php if($buku['cover']): ?>
                                <img src="../uploads/covers/<?= $buku['cover'] ?>" 
                                     class="file-preview"
                                     alt="Cover Saat Ini"
                                     onerror="this.src='https://via.placeholder.com/200x250/0d6efd/ffffff?text=NOVEXA'">
                                <?php else: ?>
                                <div class="mb-3">
                                    <i class="fas fa-cloud-upload-alt fa-3x text-primary"></i>
                                </div>
                                <?php endif; ?>
                                
                                <h6 class="mb-2">Klik untuk ganti cover</h6>
                                <p class="file-info mb-0">
                                    Format: JPG, PNG, WebP | Maks: 5MB
                                </p>
                            </div>
                            <input type="file" name="cover" class="form-control" 
                                   accept="image/*" id="coverInput">
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button type="submit" class="btn btn-save">
                            <i class="fas fa-save me-2"></i>Simpan Perubahan
                        </button>
                        <a href="buku_edit.php" class="btn btn-cancel">
                            <i class="fas fa-times me-2"></i>Batal
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- PREVIEW -->
    <div class="col-lg-4">
        <div class="book-preview">
            <h6 class="fw-bold mb-3 text-primary">
                <i class="fas fa-eye me-2"></i>Pratinjau
            </h6>
            
            <div class="text-center mb-4">
                <?php if($buku['cover']): ?>
                <img src="../uploads/covers/<?= $buku['cover'] ?>" 
                     class="preview-cover"
                     alt="Cover Buku"
                     onerror="this.src='https://via.placeholder.com/300x200/0d6efd/ffffff?text=NOVEXA'"
                     id="previewCover">
                <?php else: ?>
                <div class="preview-cover bg-light d-flex align-items-center justify-content-center">
                    <i class="fas fa-book fa-3x text-primary"></i>
                </div>
                <?php endif; ?>
                
                <h5 class="preview-title mt-3" id="previewTitle">
                    <?= htmlspecialchars($buku['judul']) ?>
                </h5>
                
                <div class="preview-meta">
                    <span class="preview-price" id="previewPrice">
                        Rp <?= number_format($buku['harga'],0,',','.') ?>
                    </span>
                    <span class="preview-status status-<?= $buku['status'] ?>" id="previewStatus">
                        <?= strtoupper($buku['status']) ?>
                    </span>
                </div>
            </div>
            
            <div class="mb-3">
                <h6 class="fw-bold small text-muted mb-2">Deskripsi</h6>
                <p class="small text-muted mb-0" id="previewDeskripsi">
                    <?= nl2br(htmlspecialchars($buku['deskripsi'])) ?>
                </p>
            </div>
            
            <div class="row">
                <div class="col-6">
                    <h6 class="fw-bold small text-muted mb-2">Halaman</h6>
                    <p class="mb-0 small" id="previewHalaman">
                        <?= $buku['jumlah_halaman'] ?? '0' ?> hal
                    </p>
                </div>
                <div class="col-6">
                    <h6 class="fw-bold small text-muted mb-2">Bahasa</h6>
                    <p class="mb-0 small" id="previewBahasa">
                        <?= $buku['bahasa'] ?? 'Indonesia' ?>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="card bg-light border-0 mt-3">
            <div class="card-body">
                <h6 class="fw-bold small text-muted mb-3">
                    <i class="fas fa-info-circle me-2"></i>Informasi Buku
                </h6>
                <div class="row">
                    <div class="col-6">
                        <p class="small text-muted mb-1">ID Buku</p>
                        <p class="fw-bold small">#<?= str_pad($buku['id'], 6, '0', STR_PAD_LEFT) ?></p>
                    </div>
                    <div class="col-6">
                        <p class="small text-muted mb-1">Dibuat</p>
                        <p class="fw-bold small">
                            <?= date('d M Y', strtotime($buku['created_at'])) ?>
                        </p>
                    </div>
                </div>
                <?php if($buku['updated_at']): ?>
                <div class="row">
                    <div class="col-12">
                        <p class="small text-muted mb-1">Terakhir Diubah</p>
                        <p class="fw-bold small">
                            <?= date('d M Y H:i', strtotime($buku['updated_at'])) ?>
                        </p>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Character counters
const judulInput = document.querySelector('input[name="judul"]');
const deskripsiInput = document.getElementById('deskripsiInput');
const judulCounter = document.getElementById('judulCounter');
const deskripsiCounter = document.getElementById('deskripsiCounter');

function updateCounters() {
    judulCounter.textContent = `${judulInput.value.length}/200`;
    deskripsiCounter.textContent = `${deskripsiInput.value.length}/2000`;
}

judulInput.addEventListener('input', updateCounters);
deskripsiInput.addEventListener('input', updateCounters);

// Initial counter update
updateCounters();

// Live preview update
judulInput.addEventListener('input', function() {
    document.getElementById('previewTitle').textContent = this.value || 'Judul Buku';
});

document.querySelector('input[name="harga"]').addEventListener('input', function() {
    const harga = parseInt(this.value) || 0;
    document.getElementById('previewPrice').textContent = 
        'Rp ' + harga.toLocaleString('id-ID');
});

document.querySelector('select[name="status"]').addEventListener('change', function() {
    const status = this.value;
    const statusEl = document.getElementById('previewStatus');
    statusEl.textContent = status.toUpperCase();
    statusEl.className = 'preview-status status-' + status;
});

document.querySelector('input[name="jumlah_halaman"]').addEventListener('input', function() {
    document.getElementById('previewHalaman').textContent = 
        (this.value || '0') + ' hal';
});

document.querySelector('select[name="bahasa"]').addEventListener('change', function() {
    document.getElementById('previewBahasa').textContent = this.value;
});

deskripsiInput.addEventListener('input', function() {
    document.getElementById('previewDeskripsi').textContent = this.value;
});

// Cover preview
const coverInput = document.getElementById('coverInput');
const previewCover = document.getElementById('previewCover');

coverInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewCover) {
                previewCover.src = e.target.result;
            }
        }
        reader.readAsDataURL(file);
    }
});

// Form validation
document.getElementById('editForm').addEventListener('submit', function(e) {
    const harga = document.querySelector('input[name="harga"]');
    const deskripsi = document.getElementById('deskripsiInput');
    
    // Reset validation
    harga.classList.remove('is-invalid');
    deskripsi.classList.remove('is-invalid');
    
    let isValid = true;
    
    // Validate harga
    if (parseInt(harga.value) < 1000 || parseInt(harga.value) > 10000000) {
        harga.classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate deskripsi
    if (deskripsi.value.trim().length < 10) {
        deskripsi.classList.add('is-invalid');
        isValid = false;
    }
    
    if (!isValid) {
        e.preventDefault();
        alert('Harap periksa kembali data yang Anda masukkan.');
    }
});

// File size validation
coverInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        this.value = '';
    }
});

// Auto-save draft (optional)
let autoSaveTimer;
const form = document.getElementById('editForm');

form.addEventListener('input', function() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        // You can implement auto-save feature here
        // console.log('Auto-saving...');
    }, 5000);
});
</script>
</body>
</html>