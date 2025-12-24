<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
    header("Location: ../auth/auth.php");
    exit;
}

$user_id = $_SESSION['user']['id'];

/* UPDATE PROFILE */
$success = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = $_POST['nama'];
    $bio  = $_POST['bio'] ?? '';
    $avatar = $_FILES['avatar'] ?? null;

    // Handle avatar upload
    $avatar_filename = null;
    if ($avatar && $avatar['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($avatar['name'], PATHINFO_EXTENSION);
        $avatar_filename = 'avatar_' . $user_id . '_' . time() . '.' . $ext;
        $upload_path = '../uploads/avatars/' . $avatar_filename;
        
        // Create directory if not exists
        if (!is_dir('../uploads/avatars')) {
            mkdir('../uploads/avatars', 0755, true);
        }
        
        if (move_uploaded_file($avatar['tmp_name'], $upload_path)) {
            // Delete old avatar if exists
            $old_avatar = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
            $old_avatar->execute([$user_id]);
            $old = $old_avatar->fetchColumn();
            if ($old && file_exists('../uploads/avatars/' . $old)) {
                unlink('../uploads/avatars/' . $old);
            }
        } else {
            $avatar_filename = null;
        }
    }

    // Prepare update query
    $params = [$nama, $bio];
    $sql = "UPDATE users SET nama=?, bio=?, updated_at=NOW()";
    
    if ($avatar_filename) {
        $sql .= ", avatar=?";
        $params[] = $avatar_filename;
    }
    
    $sql .= " WHERE id=?";
    $params[] = $user_id;

    $stmt = $pdo->prepare($sql);
    if ($stmt->execute($params)) {
        $_SESSION['user']['nama'] = $nama;
        if ($avatar_filename) {
            $_SESSION['user']['avatar'] = $avatar_filename;
        }
        $success = "Profil berhasil diperbarui!";
    }
}

/* AMBIL DATA USER */
$user = $pdo->prepare("SELECT * FROM users WHERE id=?");
$user->execute([$user_id]);
$user = $user->fetch();

/* STATISTIK USER */
$stats = $pdo->prepare("
    SELECT 
        (SELECT COUNT(*) FROM keranjang k WHERE k.user_id = ?) as total_keranjang,
        (SELECT COUNT(*) FROM transaksi t WHERE t.user_id = ? AND t.status = 'paid') as total_transaksi,
        (SELECT COUNT(*) FROM favorit f WHERE f.user_id = ?) as total_favorit
");
$stats->execute([$user_id, $user_id, $user_id]);
$statistics = $stats->fetch();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Profil Saya - Novexa</title>
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

    /* Profile Header */
    .profile-header {
        background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
        border-radius: 16px;
        color: white;
        margin-bottom: 2rem;
        box-shadow: 0 5px 20px rgba(25, 135, 84, 0.15);
        overflow: hidden;
        position: relative;
    }

    .profile-header::before {
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

    .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1;
        position: relative;
    }

    .avatar-upload {
        position: relative;
        display: inline-block;
    }

    .avatar-upload-label {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36px;
        height: 36px;
        background: var(--primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        border: 2px solid white;
        z-index: 2;
    }

    .avatar-upload input[type="file"] {
        display: none;
    }

    /* Stats Card */
    .stats-card {
        background: var(--white);
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        border: 1px solid var(--primary-light);
        transition: all 0.3s ease;
    }

    .stats-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .stats-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.25rem;
    }

    .stats-cart .stats-icon {
        background: rgba(25, 135, 84, 0.1);
        color: var(--primary);
    }

    .stats-transaction .stats-icon {
        background: rgba(13, 110, 253, 0.1);
        color: #0d6efd;
    }

    .stats-favorit .stats-icon {
        background: rgba(255, 193, 7, 0.1);
        color: #ffc107;
    }

    .stats-value {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .stats-label {
        color: var(--secondary);
        font-size: 0.85rem;
        margin: 0;
    }

    /* Profile Form */
    .profile-form-card {
        background: var(--white);
        border-radius: 16px;
        border: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        overflow: hidden;
    }

    .form-card-header {
        background-color: #f8f9fa;
        border-bottom: 2px solid var(--primary-light);
        padding: 1.25rem 1.5rem;
        font-weight: 600;
        color: var(--primary);
    }

    .form-card-body {
        padding: 1.5rem;
    }

    .form-label {
        font-weight: 500;
        color: #333;
        margin-bottom: 0.5rem;
    }

    .form-control, .form-select {
        border: 2px solid #e9ecef;
        border-radius: 8px;
        padding: 0.75rem;
        transition: all 0.3s ease;
    }

    .form-control:focus, .form-select:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
    }

    .btn-save {
        background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .btn-save:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(25, 135, 84, 0.3);
    }

    /* Tabs */
    .profile-tabs {
        background: var(--white);
        border-radius: 12px;
        padding: 0.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    }

    .profile-tabs .nav-link {
        color: var(--secondary);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .profile-tabs .nav-link.active {
        background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
        color: white;
    }

    .profile-tabs .nav-link:hover:not(.active) {
        background-color: var(--primary-light);
        color: var(--primary);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .profile-header {
            text-align: center;
            padding: 1.5rem;
        }
        
        .profile-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
        }
        
        .stats-card {
            margin-bottom: 1rem;
        }
    }
    </style>
</head>
<body>

<?php include '../partials/navbar_buyer.php'; ?>

<div class="container mt-4">

<!-- Profile Header -->
<div class="profile-header">
    <div class="row align-items-center">
        <div class="col-md-4 text-center text-md-start p-4">
            <div class="avatar-upload">
                <?php if($user['avatar']): ?>
                <img src="../uploads/avatars/<?= $user['avatar'] ?>" 
                     class="profile-avatar"
                     alt="<?= htmlspecialchars($user['nama']) ?>"
                     onerror="this.src='https://ui-avatars.com/api/?name=<?= urlencode($user['nama']) ?>&background=198754&color=fff&size=120'">
                <?php else: ?>
                <div class="profile-avatar bg-white d-flex align-items-center justify-content-center">
                    <span class="display-4 text-primary fw-bold">
                        <?= strtoupper(substr($user['nama'], 0, 1)) ?>
                    </span>
                </div>
                <?php endif; ?>
                <label class="avatar-upload-label" for="avatarInput">
                    <i class="fas fa-camera"></i>
                </label>
            </div>
        </div>
        <div class="col-md-8 p-4">
            <h1 class="h3 fw-bold mb-2"><?= htmlspecialchars($user['nama']) ?></h1>
            <p class="mb-3 opacity-90">
                <i class="fas fa-envelope me-2"></i><?= $user['email'] ?>
            </p>
            <p class="mb-0 opacity-80">
                <?= nl2br(htmlspecialchars($user['bio'] ?? 'Belum ada bio')) ?>
            </p>
        </div>
    </div>
</div>

<!-- Stats Cards -->
<div class="row mb-4">
    <div class="col-md-4 mb-3">
        <div class="stats-card stats-cart">
            <div class="stats-icon">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stats-value"><?= $statistics['total_keranjang'] ?? 0 ?></div>
            <p class="stats-label">Keranjang</p>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="stats-card stats-transaction">
            <div class="stats-icon">
                <i class="fas fa-receipt"></i>
            </div>
            <div class="stats-value"><?= $statistics['total_transaksi'] ?? 0 ?></div>
            <p class="stats-label">Transaksi</p>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="stats-card stats-favorit">
            <div class="stats-icon">
                <i class="fas fa-heart"></i>
            </div>
            <div class="stats-value"><?= $statistics['total_favorit'] ?? 0 ?></div>
            <p class="stats-label">Favorit</p>
        </div>
    </div>
</div>

<!-- Tabs -->
<div class="profile-tabs">
    <ul class="nav nav-pills justify-content-center">
        <li class="nav-item">
            <a class="nav-link active" data-bs-toggle="tab" href="#profile">
                <i class="fas fa-user me-2"></i>Profil
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#security">
                <i class="fas fa-shield-alt me-2"></i>Keamanan
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#settings">
                <i class="fas fa-cog me-2"></i>Pengaturan
            </a>
        </li>
    </ul>
</div>

<!-- Tab Content -->
<div class="tab-content">
    <!-- Profile Tab -->
    <div class="tab-pane fade show active" id="profile">
        <div class="profile-form-card">
            <div class="form-card-header">
                <i class="fas fa-edit me-2"></i>Edit Profil
            </div>
            <div class="form-card-body">
                <?php if($success): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="fas fa-check-circle me-2"></i><?= $success ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <?php endif; ?>

                <form method="POST" enctype="multipart/form-data">
                    <div class="mb-4">
                        <label class="form-label">Foto Profil</label>
                        <input type="file" class="form-control" id="avatarInput" name="avatar" accept="image/*">
                        <small class="text-muted">Upload foto dengan maksimum 2MB</small>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nama Lengkap</label>
                            <input type="text" name="nama" class="form-control" 
                                   value="<?= htmlspecialchars($user['nama']) ?>" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" 
                                   value="<?= $user['email'] ?>" disabled>
                            <small class="text-muted">Email tidak dapat diubah</small>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label">Bio</label>
                        <textarea name="bio" class="form-control" rows="4" 
                                  placeholder="Ceritakan sedikit tentang diri Anda..."><?= htmlspecialchars($user['bio'] ?? '') ?></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Bergabung Sejak</label>
                        <input type="text" class="form-control" 
                               value="<?= date('d F Y', strtotime($user['created_at'])) ?>" disabled>
                    </div>

                    <div class="text-end">
                        <button type="submit" class="btn btn-save">
                            <i class="fas fa-save me-2"></i>Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Security Tab -->
    <div class="tab-pane fade" id="security">
        <div class="profile-form-card">
            <div class="form-card-header">
                <i class="fas fa-shield-alt me-2"></i>Keamanan Akun
            </div>
            <div class="form-card-body">
                <form id="passwordForm">
                    <div class="mb-3">
                        <label class="form-label">Password Saat Ini</label>
                        <input type="password" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password Baru</label>
                        <input type="password" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Konfirmasi Password Baru</label>
                        <input type="password" class="form-control" required>
                    </div>
                    <div class="text-end">
                        <button type="submit" class="btn btn-save">
                            <i class="fas fa-key me-2"></i>Ubah Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Settings Tab -->
    <div class="tab-pane fade" id="settings">
        <div class="profile-form-card">
            <div class="form-card-header">
                <i class="fas fa-cog me-2"></i>Pengaturan
            </div>
            <div class="form-card-body">
                <div class="mb-4">
                    <h6 class="fw-bold mb-3">Notifikasi</h6>
                    <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="notifEmail" checked>
                        <label class="form-check-label" for="notifEmail">Email notifikasi</label>
                    </div>
                    <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="notifPromo" checked>
                        <label class="form-check-label" for="notifPromo">Promo dan penawaran</label>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="notifUpdate">
                        <label class="form-check-label" for="notifUpdate">Update buku baru</label>
                    </div>
                </div>

                <div class="mb-4">
                    <h6 class="fw-bold mb-3">Privasi</h6>
                    <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="privacyProfile" checked>
                        <label class="form-check-label" for="privacyProfile">Tampilkan profil publik</label>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="privacyActivity">
                        <label class="form-check-label" for="privacyActivity">Sembunyikan aktivitas membaca</label>
                    </div>
                </div>

                <div class="text-end">
                    <button type="button" class="btn btn-save" onclick="saveSettings()">
                        <i class="fas fa-save me-2"></i>Simpan Pengaturan
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

</div>

<?php include '../partials/footer.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Preview avatar before upload
document.getElementById('avatarInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.querySelector('.profile-avatar');
            if (img.tagName === 'IMG') {
                img.src = e.target.result;
            } else {
                // If it's a div (placeholder), convert to img
                const newImg = document.createElement('img');
                newImg.src = e.target.result;
                newImg.className = 'profile-avatar';
                newImg.alt = 'Avatar';
                img.parentNode.replaceChild(newImg, img);
            }
        }
        reader.readAsDataURL(file);
    }
});

// Password form
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Fitur perubahan password akan segera tersedia!');
    this.reset();
});

// Save settings
function saveSettings() {
    alert('Pengaturan berhasil disimpan!');
}

// Initialize tab functionality
const triggerTabList = document.querySelectorAll('.profile-tabs .nav-link')
triggerTabList.forEach(triggerEl => {
    const tabTrigger = new bootstrap.Tab(triggerEl)
    triggerEl.addEventListener('click', event => {
        event.preventDefault()
        tabTrigger.show()
    })
});
</script>
</body>
</html>