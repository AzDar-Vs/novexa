<?php
session_start();
require_once '../config/database.php';
//BUKU ADD
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $judul = trim($_POST['judul']);
  $deskripsi = trim($_POST['deskripsi']);
  $harga = (int) $_POST['harga'];

  // ===== UPLOAD COVER =====
  $coverName = null;
  if (!empty($_FILES['cover']['name'])) {
    $ext = strtolower(pathinfo($_FILES['cover']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png'];

    if (!in_array($ext, $allowed)) {
      $error = "Cover harus berupa JPG atau PNG";
    } else {
      $coverName = 'cover_' . time() . '_' . rand(100,999) . '.' . $ext;
      move_uploaded_file(
        $_FILES['cover']['tmp_name'],
        '../uploads/covers/' . $coverName
      );
    }
  }

  if (!$error && $judul && $deskripsi && $harga > 0) {
    $stmt = $pdo->prepare("
      INSERT INTO buku (user_id, judul, deskripsi, harga, cover, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'draft', NOW())
    ");
    $stmt->execute([$seller_id, $judul, $deskripsi, $harga, $coverName]);

    header("Location: buku_list.php");
    exit;
  }

  if (!$error) {
    $error = "Semua field wajib diisi";
  }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Tambah Buku - Toko Buku Online</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <link href="../assets/css/dashboard.css" rel="stylesheet">
  <style>
    :root {
      --primary-color: #4361ee;
      --secondary-color: #3f37c9;
      --accent-color: #4cc9f0;
      --light-color: #f8f9fa;
      --dark-color: #212529;
      --success-color: #2ecc71;
      --warning-color: #f39c12;
      --danger-color: #e74c3c;
      --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      --transition: all 0.3s ease;
    }
    
    body {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
      padding-bottom: 60px;
    }
    
    .navbar-brand {
      font-weight: 700;
      color: var(--primary-color) !important;
    }
    
    .container {
      max-width: 1000px;
    }
    
    .page-header {
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: var(--card-shadow);
      position: relative;
      overflow: hidden;
    }
    
    .page-header::before {
      content: "";
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    .page-header h3 {
      position: relative;
      z-index: 1;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .page-header p {
      position: relative;
      z-index: 1;
      opacity: 0.9;
      margin-bottom: 0;
    }
    
    .form-card {
      background: white;
      border-radius: 16px;
      border: none;
      box-shadow: var(--card-shadow);
      overflow: hidden;
      transition: var(--transition);
    }
    
    .form-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      background: linear-gradient(90deg, #f8f9fa, #e9ecef);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      padding: 1.25rem 1.5rem;
      border-radius: 16px 16px 0 0 !important;
    }
    
    .card-header h5 {
      color: var(--dark-color);
      font-weight: 600;
      margin: 0;
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .form-control, .form-select {
      border: 1px solid #e1e5eb;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      transition: var(--transition);
    }
    
    .form-control:focus, .form-select:focus {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.15);
    }
    
    .form-control::placeholder {
      color: #adb5bd;
    }
    
    textarea.form-control {
      min-height: 120px;
      resize: vertical;
    }
    
    .btn-primary {
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      border: none;
      border-radius: 10px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      transition: var(--transition);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
    }
    
    .btn-outline-secondary {
      border-radius: 10px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      border-width: 2px;
    }
    
    .alert {
      border-radius: 10px;
      border: none;
      padding: 1rem 1.25rem;
    }
    
    .alert-danger {
      background-color: rgba(231, 76, 60, 0.1);
      color: var(--danger-color);
      border-left: 4px solid var(--danger-color);
    }
    
    .file-upload-container {
      border: 2px dashed #dee2e6;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      background-color: #f8f9fa;
      transition: var(--transition);
      cursor: pointer;
    }
    
    .file-upload-container:hover {
      border-color: var(--accent-color);
      background-color: rgba(76, 201, 240, 0.05);
    }
    
    .file-upload-container i {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    .file-upload-container p {
      color: #6c757d;
      margin-bottom: 0.5rem;
    }
    
    .file-upload-container small {
      color: #adb5bd;
    }
    
    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
      margin-top: 2rem;
    }
    
    .required-field::after {
      content: " *";
      color: var(--danger-color);
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 15px;
      }
      
      .page-header {
        padding: 1.25rem 1.5rem;
      }
      
      .card-body {
        padding: 1.5rem;
      }
      
      .form-footer {
        flex-direction: column;
        align-items: stretch;
      }
      
      .form-footer .btn {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  </style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">
  <div class="page-header">
    <h3><i class="bi bi-book me-2"></i>Tambah Buku Baru</h3>
    <p>Lengkapi informasi buku Anda untuk menambahkannya ke katalog</p>
  </div>

  <div class="form-card">
    <div class="card-header">
      <h5><i class="bi bi-pencil-square me-2"></i>Form Informasi Buku</h5>
    </div>
    
    <div class="card-body">
      <?php if($error): ?>
        <div class="alert alert-danger d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <div><?= $error ?></div>
        </div>
      <?php endif; ?>

      <form method="POST" enctype="multipart/form-data" id="bukuForm">
        <div class="row">
          <div class="col-md-8">
            <div class="mb-4">
              <label class="form-label required-field">Judul Buku</label>
              <input type="text" name="judul" class="form-control" required placeholder="Masukkan judul buku yang menarik">
              <div class="form-text">Judul yang menarik dapat meningkatkan penjualan</div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="mb-4">
              <label class="form-label required-field">Harga</label>
              <div class="input-group">
                <span class="input-group-text bg-light">Rp</span>
                <input type="number" name="harga" class="form-control" required placeholder="0" min="1000" step="500">
              </div>
              <div class="form-text">Harga dalam Rupiah</div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label required-field">Deskripsi Buku</label>
          <textarea name="deskripsi" class="form-control" rows="4" required placeholder="Jelaskan secara detail tentang buku ini, termasuk keunggulan dan kontennya"></textarea>
          <div class="form-text">Deskripsi yang detail membantu pembeli memahami isi buku</div>
        </div>

        <div class="mb-4">
          <label class="form-label">Cover Buku</label>
          <div class="file-upload-container" onclick="document.getElementById('fileInput').click()">
            <i class="bi bi-cloud-arrow-up"></i>
            <p>Klik untuk mengunggah cover buku</p>
            <small>Format yang didukung: JPG, PNG (Maks. 5MB)</small>
          </div>
          <input type="file" name="cover" id="fileInput" class="d-none" accept="image/*" onchange="previewFileName(this)">
          <div id="fileName" class="mt-2 text-muted small"></div>
        </div>

        <div class="form-footer">
          <div>
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-check-circle me-2"></i>Simpan Buku
            </button>
            <a href="buku_list.php" class="btn btn-outline-secondary ms-2">
              <i class="bi bi-x-circle me-2"></i>Batal
            </a>
          </div>
          <div class="text-muted small">
            <i class="bi bi-info-circle me-1"></i>Field dengan tanda * wajib diisi
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include '../partials/footer.php'; ?>

<script>
  // Menampilkan nama file yang dipilih
  function previewFileName(input) {
    const fileNameDiv = document.getElementById('fileName');
    if (input.files.length > 0) {
      fileNameDiv.innerHTML = `<i class="bi bi-file-image me-1"></i>File dipilih: ${input.files[0].name}`;
      fileNameDiv.className = "mt-2 text-success small";
    } else {
      fileNameDiv.innerHTML = '';
    }
  }
  
  // Validasi form sebelum submit
  document.getElementById('bukuForm').addEventListener('submit', function(e) {
    const harga = document.querySelector('input[name="harga"]');
    if (harga.value < 1000) {
      alert('Harga minimal adalah Rp 1.000');
      harga.focus();
      e.preventDefault();
    }
  });
</script>
</body>
</html>