<nav class="navbar navbar-expand-lg navbar-dark" style="background:#0f3d2e">
  <div class="container">
    <!-- Logo -->
    <a class="navbar-brand fw-bold d-flex align-items-center" href="#">
      <i class="fas fa-book-open me-2"></i>NOVEXA
    </a>

    <!-- Toggle Button -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navbar Content -->
    <div class="collapse navbar-collapse" id="nav">
      <!-- Left Menu -->
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" href="/novexa/buyer/dashboard.php">
            <i class="fas fa-home me-1"></i>Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/novexa/buyer/explore.php">
            <i class="fas fa-compass me-1"></i>Explore
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link position-relative" href="/novexa/buyer/keranjang.php">
            <i class="fas fa-shopping-cart me-1"></i>Keranjang
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning cart-count">0</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/novexa/buyer/transaksi.php">
            <i class="fas fa-receipt me-1"></i>Transaksi
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/novexa/buyer/saldo.php">
            <i class="fas fa-wallet me-1"></i>Saldo
          </a>
        </li>
      </ul>

      <!-- Right Menu -->
      <div class="d-flex align-items-center">
        <!-- Notifikasi Dropdown -->
        <div class="dropdown me-3">
          <a href="#" class="nav-link dropdown-toggle position-relative" id="notifDropdown" 
             data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-bell fs-5"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notifDropdown" style="min-width: 300px;">
            <li>
              <h6 class="dropdown-header d-flex justify-content-between">
                <span>Notifikasi</span>
                <a href="#" class="text-decoration-none small text-muted">Tandai semua</a>
              </h6>
            </li>
            <li><hr class="dropdown-divider"></li>
            
            <!-- Notifikasi Item -->
            <li>
              <a href="#" class="dropdown-item">
                <div class="d-flex">
                  <div class="flex-shrink-0 bg-success bg-opacity-10 text-success p-2 rounded-circle me-3">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="mb-1">Pembelian Berhasil</h6>
                    <p class="mb-1 small text-muted">Buku "Pemrograman PHP" berhasil dibeli</p>
                    <small class="text-muted">2 jam yang lalu</small>
                  </div>
                </div>
              </a>
            </li>
            
            <li>
              <a href="#" class="dropdown-item">
                <div class="d-flex">
                  <div class="flex-shrink-0 bg-info bg-opacity-10 text-info p-2 rounded-circle me-3">
                    <i class="fas fa-bullhorn"></i>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="mb-1">Promo Spesial</h6>
                    <p class="mb-1 small text-muted">Diskon 30% untuk semua buku teknologi</p>
                    <small class="text-muted">1 hari yang lalu</small>
                  </div>
                </div>
              </a>
            </li>
            
            <li><hr class="dropdown-divider"></li>
            <li>
              <a href="/novexa/buyer/notifikasi.php" class="dropdown-item text-center text-success">
                Lihat Semua Notifikasi
              </a>
            </li>
          </ul>
        </div>

        <!-- Profile Dropdown -->
        <div class="dropdown">
          <a href="#" class="nav-link dropdown-toggle d-flex align-items-center" 
             id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="rounded-circle bg-success d-flex align-items-center justify-content-center me-2" 
                 style="width: 32px; height: 32px;">
              <?php 
                $nama = $_SESSION['user']['nama'] ?? 'User';
                echo '<span class="text-white fw-bold">' . strtoupper(substr($nama, 0, 1)) . '</span>';
              ?>
            </div>
            <span class="d-none d-lg-inline"><?= htmlspecialchars($nama) ?></span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="profileDropdown">
            <li>
              <h6 class="dropdown-header">
                <?= htmlspecialchars($nama) ?>
                <div class="small text-muted">Pembaca Aktif</div>
              </h6>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="/novexa/buyer/profile.php">
                <i class="fas fa-user me-2"></i>Profil Saya
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="/novexa/buyer/library.php">
                <i class="fas fa-book-open me-2"></i>Koleksi Buku
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="/novexa/buyer/wishlist.php">
                <i class="fas fa-heart me-2"></i>Wishlist
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="../auth/logout.php">
                <i class="fas fa-sign-out-alt me-2"></i>Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
.navbar {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0.75rem 0;
}

.navbar-brand {
  font-size: 1.5rem;
}

.nav-link {
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem !important;
}

.nav-link:hover, .nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  border: none;
  border-radius: 10px;
}

.cart-count {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
}

.dropdown-item:focus, .dropdown-item:hover {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

@media (max-width: 992px) {
  .dropdown-menu {
    margin-top: 10px;
  }
  
  .navbar-nav {
    margin-bottom: 1rem;
  }
  
  .d-lg-inline {
    display: inline !important;
  }
}
</style>

<script>
// Update cart count from session
document.addEventListener('DOMContentLoaded', function() {
  // Fetch cart count via AJAX
  fetch('/novexa/buyer/get_cart_count.php')
    .then(response => response.json())
    .then(data => {
      if(data.count !== undefined) {
        const cartBadges = document.querySelectorAll('.cart-count');
        cartBadges.forEach(badge => {
          badge.textContent = data.count;
        });
      }
    })
    .catch(error => console.error('Error fetching cart count:', error));
});
</script>