<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
  header("Location: ../auth/auth.php");
  exit;
}

/* PROMOTE / DEMOTE ROLE */
if (isset($_GET['role'], $_GET['id'])) {
  $id = (int) $_GET['id'];
  $role = $_GET['role'];

  if (in_array($role, ['buyer','seller'])) {
    $stmt = $pdo->prepare("UPDATE users SET role=? WHERE id=?");
    $stmt->execute([$role, $id]);
  }
  header("Location: akun.php");
  exit;
}

$stmt = $pdo->query("
  SELECT id, nama, email, role, created_at
  FROM users
  ORDER BY created_at DESC
");
$users = $stmt->fetchAll();

// Count roles
$totalUsers = count($users);
$totalAdmins = 0;
$totalSellers = 0;
$totalBuyers = 0;

foreach ($users as $user) {
    switch ($user['role']) {
        case 'admin': $totalAdmins++; break;
        case 'seller': $totalSellers++; break;
        case 'buyer': $totalBuyers++; break;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Manajemen Akun - Admin</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
    --admin-red: #dc3545;
    --admin-red-dark: #c82333;
    --admin-red-light: #f8d7da;
    --admin-gray: #6c757d;
    --admin-light: #f8f9fa;
    --admin-white: #ffffff;
    --admin-dark: #212529;
    --admin-success: #198754;
    --admin-warning: #ffc107;
    --admin-info: #0dcaf0;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%);
    min-height: 100vh;
    color: var(--admin-dark);
    padding-bottom: 60px;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

/* HEADER */
.dashboard-header {
    background: linear-gradient(135deg, var(--admin-red) 0%, var(--admin-red-dark) 100%);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    color: white;
    margin: 1.5rem 0 2rem 0;
    box-shadow: 0 5px 20px rgba(220, 53, 69, 0.15);
    position: relative;
    overflow: hidden;
}

.dashboard-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.dashboard-header h3 {
    font-weight: 700;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
}

.dashboard-header p {
    opacity: 0.9;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
}

/* ROLE STATS */
.role-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.role-stat-card {
    background: var(--admin-white);
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border: 1px solid rgba(220, 53, 69, 0.1);
    transition: all 0.3s ease;
}

.role-stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.role-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.75rem;
    font-size: 1.25rem;
    color: white;
}

.role-stat-icon.admin {
    background: linear-gradient(135deg, var(--admin-red), var(--admin-red-dark));
}

.role-stat-icon.seller {
    background: linear-gradient(135deg, var(--admin-success), #157347);
}

.role-stat-icon.buyer {
    background: linear-gradient(135deg, var(--admin-info), #0bacd0);
}

.role-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: var(--admin-dark);
}

.role-stat-label {
    font-size: 0.85rem;
    color: var(--admin-gray);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

/* TABLE CONTAINER */
.table-container {
    background: var(--admin-white);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(220, 53, 69, 0.1);
    overflow: hidden;
    margin-bottom: 2rem;
}

.table-header {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-bottom: 2px solid #e9ecef;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-header h5 {
    font-weight: 600;
    color: var(--admin-red);
    margin: 0;
    font-size: 1.1rem;
}

.table-header .subtitle {
    color: var(--admin-gray);
    font-size: 0.9rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.table-wrapper {
    overflow-x: auto;
}

.table {
    margin-bottom: 0;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 800px;
}

.table thead th {
    background: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
    font-weight: 600;
    color: var(--admin-red);
    padding: 1rem 1.25rem;
    white-space: nowrap;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table tbody td {
    padding: 1.25rem;
    vertical-align: middle;
    border-bottom: 1px solid #eee;
    transition: all 0.3s ease;
}

.table tbody tr {
    transition: all 0.3s ease;
}

.table tbody tr:hover {
    background: rgba(220, 53, 69, 0.03);
}

.table tbody tr:hover td {
    transform: scale(1.01);
}

/* USER INFO */
.user-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--admin-red), var(--admin-red-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(220, 53, 69, 0.2);
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: var(--admin-dark);
    font-size: 0.95rem;
}

.user-email {
    font-size: 0.85rem;
    color: var(--admin-gray);
}

/* ROLE BADGES */
.role-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.role-admin {
    background: rgba(220, 53, 69, 0.12);
    color: var(--admin-red);
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.role-seller {
    background: rgba(25, 135, 84, 0.12);
    color: var(--admin-success);
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.role-buyer {
    background: rgba(13, 202, 240, 0.12);
    color: var(--admin-info);
    border: 1px solid rgba(13, 202, 240, 0.2);
}

/* ACTION BUTTONS */
.action-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.btn-role {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 2px solid;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-role:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    text-decoration: none;
}

.btn-seller {
    background: rgba(25, 135, 84, 0.1);
    color: var(--admin-success);
    border-color: rgba(25, 135, 84, 0.3);
}

.btn-seller:hover {
    background: var(--admin-success);
    color: white;
    border-color: var(--admin-success);
}

.btn-buyer {
    background: rgba(255, 193, 7, 0.1);
    color: #d39e00;
    border-color: rgba(255, 193, 7, 0.3);
}

.btn-buyer:hover {
    background: #ffc107;
    color: var(--admin-dark);
    border-color: #ffc107;
}

.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(108, 117, 125, 0.1);
    color: var(--admin-gray);
    border-color: rgba(108, 117, 125, 0.3);
}

/* FILTER TABS */
.filter-tabs {
    background: var(--admin-white);
    border-radius: 12px;
    padding: 0.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    border: 1px solid rgba(220, 53, 69, 0.1);
}

.filter-tabs .nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.25rem;
}

.filter-tabs .nav-link {
    color: var(--admin-gray);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
    border: 1px solid transparent;
}

.filter-tabs .nav-link.active {
    background: linear-gradient(135deg, var(--admin-red), var(--admin-red-dark));
    color: white;
    border-color: var(--admin-red);
}

.filter-tabs .nav-link:hover:not(.active) {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--admin-red);
    border-color: rgba(220, 53, 69, 0.2);
}

/* SEARCH BOX */
.search-box {
    background: var(--admin-white);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    border: 1px solid rgba(220, 53, 69, 0.1);
}

.search-input-group {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--admin-gray);
    z-index: 1;
}

.search-input {
    border: 2px solid #e9ecef;
    border-radius: 10px;
    padding: 0.75rem 1rem 0.75rem 3rem;
    width: 100%;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.search-input:focus {
    border-color: var(--admin-red);
    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
    outline: none;
}

/* EMPTY STATE */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--admin-gray);
}

.empty-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: #dee2e6;
}

.empty-title {
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--admin-dark);
    font-size: 1.1rem;
}

/* LOADING ANIMATION */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-row {
    animation: fadeIn 0.5s ease forwards;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .dashboard-header {
        padding: 1.25rem;
        text-align: center;
        margin: 1rem 0 1.5rem 0;
    }
    
    .dashboard-header h3 {
        font-size: 1.4rem;
    }
    
    .role-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .user-cell {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .user-avatar {
        margin-bottom: 0.5rem;
    }
    
    .action-buttons {
        justify-content: flex-start;
    }
    
    .btn-role {
        padding: 0.4rem 0.75rem;
        font-size: 0.75rem;
    }
}

@media (max-width: 576px) {
    .role-stats {
        grid-template-columns: 1fr;
    }
    
    .table tbody td {
        padding: 1rem;
    }
    
    .filter-tabs .nav-link {
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
    }
}
</style>
</head>
<body>

<?php include '../partials/navbar_admin.php'; ?>

<div class="container">
    <!-- HEADER -->
    <div class="dashboard-header">
        <h3><i class="fas fa-users-cog me-2"></i>Manajemen Akun</h3>
        <p>Kelola peran dan akses pengguna platform NOVEXA</p>
    </div>

    <!-- ROLE STATISTICS -->
    <div class="role-stats">
        <div class="role-stat-card">
            <div class="role-stat-icon admin">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div class="role-stat-value"><?= number_format($totalAdmins) ?></div>
            <p class="role-stat-label">Administrator</p>
        </div>
        
        <div class="role-stat-card">
            <div class="role-stat-icon seller">
                <i class="fas fa-store"></i>
            </div>
            <div class="role-stat-value"><?= number_format($totalSellers) ?></div>
            <p class="role-stat-label">Penjual</p>
        </div>
        
        <div class="role-stat-card">
            <div class="role-stat-icon buyer">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="role-stat-value"><?= number_format($totalBuyers) ?></div>
            <p class="role-stat-label">Pembeli</p>
        </div>
        
        <div class="role-stat-card">
            <div class="role-stat-icon admin">
                <i class="fas fa-users"></i>
            </div>
            <div class="role-stat-value"><?= number_format($totalUsers) ?></div>
            <p class="role-stat-label">Total Pengguna</p>
        </div>
    </div>

    <!-- FILTER TABS -->
    <div class="filter-tabs">
        <ul class="nav justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" href="#" onclick="filterUsers('all')">
                    <i class="fas fa-users me-2"></i>Semua Pengguna
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="filterUsers('admin')">
                    <i class="fas fa-shield-alt me-2"></i>Admin
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="filterUsers('seller')">
                    <i class="fas fa-store me-2"></i>Seller
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="filterUsers('buyer')">
                    <i class="fas fa-user me-2"></i>Buyer
                </a>
            </li>
        </ul>
    </div>

    <!-- SEARCH BOX -->
    <div class="search-box">
        <div class="search-input-group">
            <i class="fas fa-search search-icon"></i>
            <input type="text" id="searchInput" class="form-control search-input" 
                   placeholder="Cari berdasarkan nama atau email...">
        </div>
    </div>

    <!-- USER TABLE -->
    <div class="table-container">
        <div class="table-header">
            <div>
                <h5><i class="fas fa-list me-2"></i>Daftar Pengguna</h5>
                <p class="subtitle">
                    <i class="fas fa-filter me-1"></i>
                    <span id="userCount"><?= number_format($totalUsers) ?></span> pengguna ditemukan
                </p>
            </div>
            <div class="text-muted small">
                <i class="fas fa-sort-amount-down me-1"></i>Terbaru ke Terlama
            </div>
        </div>
        
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th width="300">Pengguna</th>
                        <th width="150">Role</th>
                        <th width="150">Tanggal Daftar</th>
                        <th width="200">Aksi</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                    <?php foreach($users as $index => $u): ?>
                    <tr class="user-row" data-role="<?= $u['role'] ?>" style="animation-delay: <?= $index * 0.05 ?>s;">
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar">
                                    <?= strtoupper(substr($u['nama'], 0, 1)) ?>
                                </div>
                                <div class="user-info">
                                    <div class="user-name"><?= htmlspecialchars($u['nama']) ?></div>
                                    <div class="user-email"><?= htmlspecialchars($u['email']) ?></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="role-badge role-<?= $u['role'] ?>">
                                <i class="fas fa-<?= $u['role'] === 'admin' ? 'shield-alt' : ($u['role'] === 'seller' ? 'store' : 'user') ?>"></i>
                                <?= strtoupper($u['role']) ?>
                            </span>
                        </td>
                        <td>
                            <small class="text-muted">
                                <?= date('d M Y', strtotime($u['created_at'])) ?>
                            </small>
                        </td>
                        <td>
                            <?php if($u['role'] !== 'admin'): ?>
                                <div class="action-buttons">
                                    <a href="?id=<?= $u['id'] ?>&role=seller" 
                                       class="btn-role btn-seller"
                                       title="Jadikan Seller"
                                       onclick="return confirm('Jadikan <?= htmlspecialchars(addslashes($u['nama'])) ?> sebagai Seller?')">
                                        <i class="fas fa-store"></i> Seller
                                    </a>
                                    <a href="?id=<?= $u['id'] ?>&role=buyer" 
                                       class="btn-role btn-buyer"
                                       title="Jadikan Buyer"
                                       onclick="return confirm('Jadikan <?= htmlspecialchars(addslashes($u['nama'])) ?> sebagai Buyer?')">
                                        <i class="fas fa-user"></i> Buyer
                                    </a>
                                </div>
                            <?php else: ?>
                                <span class="role-badge role-admin btn-disabled">
                                    <i class="fas fa-lock"></i> Role Admin
                                </span>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include '../partials/footer.php'; ?>

<script>
// Filter users by role
function filterUsers(role) {
    const rows = document.querySelectorAll('.user-row');
    const tabs = document.querySelectorAll('.filter-tabs .nav-link');
    let visibleCount = 0;
    
    // Update active tab
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs.forEach(tab => {
        const tabRole = tab.textContent.trim().toLowerCase();
        if ((role === 'all' && tabRole.includes('semua')) ||
            (role === 'admin' && tabRole.includes('admin')) ||
            (role === 'seller' && tabRole.includes('seller')) ||
            (role === 'buyer' && tabRole.includes('buyer'))) {
            tab.classList.add('active');
        }
    });
    
    // Show/hide rows
    rows.forEach(row => {
        if (role === 'all' || row.dataset.role === role) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('userCount').textContent = visibleCount.toLocaleString();
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function() {
    const keyword = this.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.style.display === 'none') return;
        
        const userName = row.querySelector('.user-name').textContent.toLowerCase();
        const userEmail = row.querySelector('.user-email').textContent.toLowerCase();
        
        if (userName.includes(keyword) || userEmail.includes(keyword)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('userCount').textContent = visibleCount.toLocaleString();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Animate role stats
    const statCards = document.querySelectorAll('.role-stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Focus search input when pressing Ctrl+F
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .user-row {
        opacity: 0;
        animation: slideIn 0.5s ease forwards;
    }
`;
document.head.appendChild(style);
</script>
</body>
</html>