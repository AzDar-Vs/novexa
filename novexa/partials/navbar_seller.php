<nav class="navbar navbar-expand-lg navbar-dark"
     style="background:#0d47a1;">
  <div class="container">
    <a class="navbar-brand fw-bold" href="../seller/dashboard.php">
      NOVEXA SELLER
    </a>

    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSeller">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSeller">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" href="../seller/dashboard.php">Dashboard</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="../seller/buku.php">Buku Saya</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="../seller/pesanan.php">Pesanan</a>
        </li>
      </ul>

      <ul class="navbar-nav">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle"
             href="#"
             role="button"
             data-bs-toggle="dropdown">
            <?= htmlspecialchars($_SESSION['user']['nama']) ?>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item"
                 href="../seller/profile.php">
                 Profil
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item text-danger"
                 href="../auth/logout.php">
                 Logout
              </a>
            </li>
          </ul>
        </li>
      </ul>

    </div>
  </div>
</nav>
