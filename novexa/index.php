<?php
session_start();
if (isset($_SESSION['user'])) {
  header("Location: ".$_SESSION['user']['role']."/dashboard.php");
  exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Novexa — Platform Buku Digital Terdepan</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="assets/css/index.css" rel="stylesheet">
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">
      <i class="bi bi-book-half me-2"></i>NOVEXA
    </a>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="#features">Fitur</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#testimonials">Testimoni</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#about">Tentang</a>
        </li>
      </ul>
      <a href="auth/auth.php" class="btn btn-success ms-lg-3 mt-2 mt-lg-0">
        <i class="bi bi-box-arrow-in-right me-2"></i>Masuk / Daftar
      </a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero-section">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <h1 class="display-4 fw-bold mb-4">
          Jelajahi Dunia Literasi Digital
          <span class="text-gradient">Tanpa Batas</span>
        </h1>
        <p class="lead mb-4">
          Platform lengkap untuk pembaca, penulis, dan penerbit. Temukan, baca, dan publikasi buku digital dalam satu ekosistem terintegrasi.
        </p>
        <div class="d-flex flex-wrap gap-3">
          <a href="auth/auth.php" class="btn btn-success btn-lg px-4 py-3">
            <i class="bi bi-rocket-takeoff me-2"></i>Mulai Sekarang
          </a>
          <a href="#features" class="btn btn-outline-success btn-lg px-4 py-3">
            <i class="bi bi-play-circle me-2"></i>Lihat Demo
          </a>
        </div>
        <div class="mt-5">
          <div class="d-flex align-items-center">
            <div class="avatar-group me-4">
              <img src="https://i.pravatar.cc/40?img=1" class="avatar" alt="User">
              <img src="https://i.pravatar.cc/40?img=2" class="avatar" alt="User">
              <img src="https://i.pravatar.cc/40?img=3" class="avatar" alt="User">
              <span class="avatar-count">+2.5k</span>
            </div>
            <div>
              <p class="mb-0 fw-semibold">Bergabung dengan komunitas literasi digital terbesar</p>
              <small class="text-muted">2,500+ pengguna aktif</small>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mt-5 mt-lg-0">
        <div class="hero-image-container">
          <div class="floating-element element-1">
            <i class="bi bi-book text-success"></i>
          </div>
          <div class="floating-element element-2">
            <i class="bi bi-pencil text-primary"></i>
          </div>
          <div class="floating-element element-3">
            <i class="bi bi-laptop text-warning"></i>
          </div>
          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
               alt="Novexa Platform" class="img-fluid rounded-4 shadow-lg hero-image">
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features" class="py-5 bg-white">
  <div class="container">
    <div class="text-center mb-5">
      <span class="badge bg-success-soft rounded-pill px-4 py-2 mb-3">
        <i class="bi bi-stars me-2"></i>Fitur Unggulan
      </span>
      <h2 class="display-5 fw-bold mb-3">Semua yang Anda Butuhkan untuk <span class="text-gradient">Literasi Digital</span></h2>
      <p class="lead text-muted">Platform lengkap dengan berbagai fitur untuk semua kebutuhan literasi digital Anda</p>
    </div>
    
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card feature-card h-100 border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="feature-icon mb-4">
              <i class="bi bi-book-half"></i>
            </div>
            <h4 class="fw-bold mb-3">📖 Untuk Pembaca</h4>
            <p class="text-muted">Akses ribuan buku digital dari berbagai genre dengan sistem rekomendasi cerdas. Baca di mana saja, kapan saja.</p>
            <ul class="list-unstyled mt-3">
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Koleksi buku terlengkap</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Baca offline</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Bookmark & catatan</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card feature-card h-100 border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="feature-icon mb-4">
              <i class="bi bi-pencil-square"></i>
            </div>
            <h4 class="fw-bold mb-3">✍️ Untuk Penulis</h4>
            <p class="text-muted">Tulis, edit, dan publikasi buku langsung di platform. Pantau statistik dan interaksi dengan pembaca.</p>
            <ul class="list-unstyled mt-3">
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Editor buku online</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Analitik pembaca</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Sistem royalti otomatis</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card feature-card h-100 border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="feature-icon mb-4">
              <i class="bi bi-shield-check"></i>
            </div>
            <h4 class="fw-bold mb-3">🛡️ Untuk Admin</h4>
            <p class="text-muted">Kelola konten, pengguna, dan transaksi dengan dashboard yang lengkap dan sistem keamanan terbaik.</p>
            <ul class="list-unstyled mt-3">
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Dashboard analitik</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Moderasi konten</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Manajemen pengguna</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section id="testimonials" class="py-5 bg-light">
  <div class="container">
    <div class="text-center mb-5">
      <span class="badge bg-success-soft rounded-pill px-4 py-2 mb-3">
        <i class="bi bi-chat-heart me-2"></i>Testimoni
      </span>
      <h2 class="display-5 fw-bold mb-3">Apa Kata <span class="text-gradient">Pengguna Kami</span></h2>
      <p class="lead text-muted">Bergabung dengan ribuan pengguna yang sudah merasakan manfaat Novexa</p>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="card testimonial-card border-0 h-100">
          <div class="card-body p-4">
            <div class="d-flex align-items-center mb-3">
              <img src="https://i.pravatar.cc/50?img=5" class="rounded-circle me-3" alt="User">
              <div>
                <h5 class="fw-bold mb-0">Ahmad Rizki</h5>
                <small class="text-muted">Penulis Novel</small>
              </div>
            </div>
            <p class="mb-0">"Platform yang sangat membantu penulis indie seperti saya. Royalti langsung ke rekening tanpa ribet!"</p>
            <div class="rating mt-3">
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="card testimonial-card border-0 h-100">
          <div class="card-body p-4">
            <div class="d-flex align-items-center mb-3">
              <img src="https://i.pravatar.cc/50?img=6" class="rounded-circle me-3" alt="User">
              <div>
                <h5 class="fw-bold mb-0">Sari Dewi</h5>
                <small class="text-muted">Pembaca Aktif</small>
              </div>
            </div>
            <p class="mb-0">"Koleksi buku digitalnya lengkap banget! Bisa baca di HP tanpa perlu bawa buku fisik."</p>
            <div class="rating mt-3">
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-half text-warning"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="card testimonial-card border-0 h-100">
          <div class="card-body p-4">
            <div class="d-flex align-items-center mb-3">
              <img src="https://i.pravatar.cc/50?img=8" class="rounded-circle me-3" alt="User">
              <div>
                <h5 class="fw-bold mb-0">Budi Santoso</h5>
                <small class="text-muted">Penerbit Digital</small>
              </div>
            </div>
            <p class="mb-0">"Dashboard adminnya sangat membantu untuk manage konten dan laporan keuangan."</p>
            <div class="rating mt-3">
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star-fill text-warning"></i>
              <i class="bi bi-star text-warning"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-5 text-white cta-section">
  <div class="container">
    <div class="row justify-content-center text-center">
      <div class="col-lg-8">
        <h2 class="display-5 fw-bold mb-4">Siap Bergabung dengan Revolusi Literasi Digital?</h2>
        <p class="lead mb-4">Bergabunglah dengan komunitas pembaca dan penulis terbesar di Indonesia. Gratis untuk mendaftar!</p>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <a href="auth/auth.php" class="btn btn-light btn-lg px-5 py-3">
            <i class="bi bi-person-plus me-2"></i>Daftar Sekarang
          </a>
          <a href="#features" class="btn btn-outline-light btn-lg px-5 py-3">
            <i class="bi bi-info-circle me-2"></i>Pelajari Lebih Lanjut
          </a>
        </div>
        <p class="mt-4 mb-0">
          <small><i class="bi bi-shield-check me-1"></i>100% aman dan terpercaya</small>
        </p>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-5 bg-dark text-white">
  <div class="container">
    <div class="row">
      <div class="col-lg-4 mb-4 mb-lg-0">
        <a class="navbar-brand fw-bold text-white mb-3 d-inline-block" href="#">
          <i class="bi bi-book-half me-2"></i>NOVEXA
        </a>
        <p class="text-white-50">Platform buku digital terdepan di Indonesia yang menghubungkan pembaca, penulis, dan penerbit dalam satu ekosistem.</p>
        <div class="social-icons mt-3">
          <a href="#" class="text-white me-3"><i class="bi bi-facebook"></i></a>
          <a href="#" class="text-white me-3"><i class="bi bi-twitter"></i></a>
          <a href="#" class="text-white me-3"><i class="bi bi-instagram"></i></a>
          <a href="#" class="text-white"><i class="bi bi-linkedin"></i></a>
        </div>
      </div>
      
      <div class="col-lg-2 col-md-4 mb-4 mb-lg-0">
        <h5 class="fw-bold mb-3">Menu</h5>
        <ul class="list-unstyled">
          <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none">Beranda</a></li>
          <li class="mb-2"><a href="#features" class="text-white-50 text-decoration-none">Fitur</a></li>
          <li class="mb-2"><a href="#testimonials" class="text-white-50 text-decoration-none">Testimoni</a></li>
          <li><a href="#" class="text-white-50 text-decoration-none">Harga</a></li>
        </ul>
      </div>
      
      <div class="col-lg-3 col-md-4 mb-4 mb-lg-0">
        <h5 class="fw-bold mb-3">Dukungan</h5>
        <ul class="list-unstyled">
          <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none">Bantuan & FAQ</a></li>
          <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none">Kebijakan Privasi</a></li>
          <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none">Syarat & Ketentuan</a></li>
          <li><a href="#" class="text-white-50 text-decoration-none">Hubungi Kami</a></li>
        </ul>
      </div>
      
      <div class="col-lg-3 col-md-4">
        <h5 class="fw-bold mb-3">Kontak</h5>
        <ul class="list-unstyled text-white-50">
          <li class="mb-2"><i class="bi bi-envelope me-2"></i>hello@novexa.id</li>
          <li class="mb-2"><i class="bi bi-telephone me-2"></i>(021) 1234-5678</li>
          <li><i class="bi bi-geo-alt me-2"></i>Jakarta, Indonesia</li>
        </ul>
      </div>
    </div>
    
    <hr class="my-4 text-white-50">
    
    <div class="row">
      <div class="col-md-6">
        <p class="mb-0 text-white-50">&copy; 2025 Novexa. Hak cipta dilindungi undang-undang.</p>
      </div>
      <div class="col-md-6 text-md-end">
        <p class="mb-0 text-white-50">Dibuat dengan <i class="bi bi-heart-fill text-danger"></i> untuk literasi Indonesia</p>
      </div>
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
  // Animasi sederhana untuk floating elements
  document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.floating-element');
    
    elements.forEach((element, index) => {
      element.style.animationDelay = `${index * 0.5}s`;
    });
  });
</script>

</body>
</html>