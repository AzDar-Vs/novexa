<?php
// File: /novexa/partials/footer.php
?>
<!-- Footer -->
<footer class="footer bg-dark text-white pt-4 pb-3 mt-5">
    <div class="container">
        <div class="row g-4">
            <!-- Company Info -->
            <div class="col-lg-4 col-md-6">
                <div class="footer-brand mb-3">
                    <h5 class="fw-bold mb-2">
                        <i class="fas fa-book-open text-success me-2"></i>NOVEXA
                    </h5>
                    <p class="text-white-50 mb-3 small" style="font-size: 0.9rem;">
                        Platform buku digital terdepan di Indonesia. Temukan dan baca ribuan buku digital dalam satu tempat.
                    </p>
                    <div class="social-icons d-flex gap-2">
                        <a href="#" class="text-white-50 hover-text-white" title="Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="text-white-50 hover-text-white" title="Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="text-white-50 hover-text-white" title="Instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" class="text-white-50 hover-text-white" title="LinkedIn">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Quick Links -->
            <div class="col-lg-2 col-md-6">
                <h6 class="fw-bold mb-3 text-success small">MENU CEPAT</h6>
                <ul class="list-unstyled">
                    <li class="mb-2">
                        <a href="/novexa" class="text-white-50 small text-decoration-none hover-text-white">
                            <i class="fas fa-home me-2"></i>Beranda
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="/novexa/browse.php" class="text-white-50 small text-decoration-none hover-text-white">
                            <i class="fas fa-compass me-2"></i>Jelajahi
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="/novexa/buyer/dashboard.php" class="text-white-50 small text-decoration-none hover-text-white">
                            <i class="fas fa-user me-2"></i>Dashboard
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="/novexa/buyer/keranjang.php" class="text-white-50 small text-decoration-none hover-text-white">
                            <i class="fas fa-shopping-cart me-2"></i>Keranjang
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Kategori -->
            <div class="col-lg-2 col-md-6">
                <h6 class="fw-bold mb-3 text-success small">KATEGORI</h6>
                <ul class="list-unstyled">
                    <li class="mb-2">
                        <a href="/novexa/browse.php?category=fiksi" class="text-white-50 small text-decoration-none hover-text-white">
                            Fiksi
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="/novexa/browse.php?category=nonfiksi" class="text-white-50 small text-decoration-none hover-text-white">
                            Non-Fiksi
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="/novexa/browse.php?category=teknologi" class="text-white-50 small text-decoration-none hover-text-white">
                            Teknologi
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="/novexa/browse.php?category=bisnis" class="text-white-50 small text-decoration-none hover-text-white">
                            Bisnis
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Kontak -->
            <div class="col-lg-4 col-md-6">
                <h6 class="fw-bold mb-3 text-success small">HUBUNGI KAMI</h6>
                <ul class="list-unstyled text-white-50 small">
                    <li class="mb-2">
                        <i class="fas fa-map-marker-alt text-success me-2"></i>
                        Jl. Buku Digital No. 123, Jakarta
                    </li>
                    <li class="mb-2">
                        <i class="fas fa-phone text-success me-2"></i>
                        (021) 1234-5678
                    </li>
                    <li class="mb-2">
                        <i class="fas fa-envelope text-success me-2"></i>
                        support@novexa.id
                    </li>
                </ul>
                
                <!-- Newsletter Mini -->
                <div class="mt-3">
                    <p class="text-white-50 small mb-2">Berlangganan newsletter</p>
                    <div class="input-group input-group-sm">
                        <input type="email" class="form-control form-control-sm" placeholder="Email Anda" 
                               style="background: rgba(255,255,255,0.1); border-color: #495057; color: white;">
                        <button class="btn btn-success btn-sm" type="button">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Copyright -->
        <div class="row mt-4 pt-3 border-top border-secondary">
            <div class="col-md-6 text-center text-md-start">
                <p class="text-white-50 mb-2 small">
                    &copy; <?php echo date('Y'); ?> Novexa. Hak Cipta Dilindungi.
                </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
                <div class="d-flex justify-content-center justify-content-md-end gap-2">
                    <span class="text-white-50 small">Metode Pembayaran:</span>
                    <div class="d-flex gap-1">
                        <span class="badge bg-secondary">BCA</span>
                        <span class="badge bg-secondary">BRI</span>
                        <span class="badge bg-secondary">Mandiri</span>
                        <span class="badge bg-secondary">OVO</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>

<style>
.footer {
    background: linear-gradient(135deg, #0f3d2e 0%, #1a5338 100%) !important;
    font-size: 0.9rem;
}

.footer h6 {
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.footer ul li a {
    transition: all 0.2s ease;
    font-size: 0.85rem;
}

.footer ul li a:hover {
    color: white !important;
    padding-left: 5px;
}

.hover-text-white:hover {
    color: white !important;
    text-decoration: none;
}

.social-icons a {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.social-icons a:hover {
    background: #198754;
    transform: translateY(-2px);
    color: white !important;
}

.footer input.form-control {
    border-radius: 4px;
    font-size: 0.85rem;
}

.footer input.form-control:focus {
    box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
    border-color: #198754;
}

.footer .badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    font-weight: 500;
}

/* Back to Top Button Minimal */
.back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: #198754;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    font-size: 0.9rem;
}

.back-to-top.show {
    opacity: 1;
    transform: translateY(0);
}

.back-to-top:hover {
    background: #146c43;
    transform: translateY(-2px);
    color: white;
}

@media (max-width: 768px) {
    .footer {
        padding-top: 2rem !important;
        padding-bottom: 1.5rem !important;
    }
    
    .footer .col-md-6 {
        margin-bottom: 1.5rem;
    }
    
    .back-to-top {
        bottom: 15px;
        right: 15px;
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
    }
}
</style>

<!-- Back to Top Button -->
<a href="#" class="back-to-top" id="backToTop">
    <i class="fas fa-arrow-up"></i>
</a>

<script>
// Back to Top Button
document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Newsletter submit
    const newsletterBtn = document.querySelector('.footer .btn-success');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            if (input.value) {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                this.disabled = true;
                
                setTimeout(() => {
                    alert('Terima kasih telah berlangganan!');
                    input.value = '';
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1000);
            }
        });
    }
});
</script>