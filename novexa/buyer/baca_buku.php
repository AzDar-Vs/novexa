<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'buyer') {
    header("Location: ../auth/auth.php");
    exit;
}

$user_id = $_SESSION['user']['id'];
$buku_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

/* CEK APAKAH BUKU SUDAH DIBELI */
$cek = $pdo->prepare("
    SELECT COUNT(*) as total
    FROM detail_item di
    JOIN keranjang k ON k.id = di.keranjang_id
    WHERE k.user_id = ? AND di.buku_id = ?
");
$cek->execute([$user_id, $buku_id]);
$hasBook = $cek->fetch()['total'] > 0;

if (!$hasBook) {
    header("Location: detail_buku.php?id=$buku_id");
    exit;
}

/* AMBIL BUKU */
$buku = $pdo->prepare("
    SELECT b.*, u.nama as penulis
    FROM buku b 
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
");
$buku->execute([$buku_id]);
$buku = $buku->fetch();

if (!$buku) {
    header("Location: explore.php");
    exit;
}

/* AMBIL BAB DENGAN PAGINATION */
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$per_page = 1; // Satu bab per halaman
$offset = ($page - 1) * $per_page;

// Total chapters
$total_chapters = $pdo->prepare("
    SELECT COUNT(*) as total 
    FROM bab_buku 
    WHERE buku_id = ?
");
$total_chapters->execute([$buku_id]);
$total_chapters = $total_chapters->fetch()['total'];

// Current chapter
$bab = $pdo->prepare("
    SELECT id, judul_bab, isi, nomor_bab
    FROM bab_buku
    WHERE buku_id = ?
    ORDER BY nomor_bab
    LIMIT 1 OFFSET ?
");
$bab->execute([$buku_id, $offset]);
$bab = $bab->fetch();

/* AMBIL DAFTAR BAB UNTUK NAVIGASI */
$chapters_list = $pdo->prepare("
    SELECT id, judul_bab, nomor_bab
    FROM bab_buku
    WHERE buku_id = ?
    ORDER BY nomor_bab
");
$chapters_list->execute([$buku_id]);
$chapters = $chapters_list->fetchAll();

/* SIMPAN PROGRES BACA (OPSIONAL) */
if ($bab) {
    $save_progress = $pdo->prepare("
        INSERT INTO melihat (user_id, buku_id, bab_id, last_read_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE bab_id = ?, last_read_at = NOW()
    ");
    $save_progress->execute([$user_id, $buku_id, $bab['id'], $bab['id']]);
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($buku['judul']) ?> - Baca - Novexa</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
    :root {
        --primary: #198754;
        --primary-light: #d1e7dd;
        --secondary: #6c757d;
        --light: #f8f9fa;
        --white: #ffffff;
        --dark: #212529;
    }

    body {
        font-family: 'Poppins', sans-serif;
        background: #f8f9fa;
        color: var(--dark);
        line-height: 1.6;
    }

    /* Reader Container */
    .reader-container {
        max-width: 800px;
        margin: 0 auto;
        background: var(--white);
        min-height: 100vh;
        box-shadow: 0 0 30px rgba(0,0,0,0.1);
    }

    /* Reader Header */
    .reader-header {
        background: linear-gradient(135deg, var(--primary) 0%, #146c43 100%);
        color: white;
        padding: 1rem 1.5rem;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .book-title-header {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chapter-title {
        font-size: 0.9rem;
        opacity: 0.9;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Reader Controls */
    .reader-controls {
        background: var(--white);
        border-bottom: 1px solid #dee2e6;
        padding: 0.75rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .nav-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .btn-nav {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #dee2e6;
        background: white;
        color: var(--dark);
        transition: all 0.3s ease;
    }

    .btn-nav:hover {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        transform: translateY(-1px);
    }

    .chapter-indicator {
        font-size: 0.9rem;
        color: var(--secondary);
    }

    /* Reader Content */
    .reader-content {
        padding: 2rem;
        min-height: 70vh;
    }

    .chapter-number {
        color: var(--primary);
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .chapter-heading {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: var(--dark);
        line-height: 1.3;
    }

    .chapter-content {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #333;
    }

    .chapter-content p {
        margin-bottom: 1.5rem;
    }

    /* Table of Contents */
    .toc-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 300px;
        background: var(--white);
        box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        z-index: 1050;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        overflow-y: auto;
    }

    .toc-sidebar.show {
        transform: translateX(0);
    }

    .toc-header {
        background: linear-gradient(135deg, var(--primary) 0%, #146c43 100%);
        color: white;
        padding: 1.25rem;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .toc-item {
        border-bottom: 1px solid #eee;
    }

    .toc-link {
        display: block;
        padding: 1rem 1.25rem;
        color: var(--dark);
        text-decoration: none;
        transition: all 0.2s ease;
        font-size: 0.95rem;
    }

    .toc-link:hover {
        background: rgba(25, 135, 84, 0.05);
        color: var(--primary);
        padding-left: 1.5rem;
    }

    .toc-link.active {
        background: rgba(25, 135, 84, 0.1);
        color: var(--primary);
        font-weight: 500;
        border-left: 4px solid var(--primary);
    }

    .toc-number {
        color: var(--primary);
        font-weight: 600;
        margin-right: 0.75rem;
        font-size: 0.85rem;
    }

    /* Overlay */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1040;
        display: none;
    }

    .overlay.show {
        display: block;
    }

    /* Settings Panel */
    .settings-panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 300px;
        background: var(--white);
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        z-index: 1050;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        padding: 1.5rem;
        overflow-y: auto;
    }

    .settings-panel.show {
        transform: translateX(0);
    }

    .settings-header {
        font-weight: 600;
        color: var(--primary);
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid var(--primary-light);
    }

    /* Progress Bar */
    .progress-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--white);
        border-top: 1px solid #dee2e6;
        padding: 0.75rem 1.5rem;
        z-index: 1000;
    }

    .progress-label {
        font-size: 0.85rem;
        color: var(--secondary);
        margin-bottom: 0.25rem;
    }

    .progress-bar {
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, var(--primary) 0%, #20c997 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    /* Reading Stats */
    .reading-stats {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--secondary);
    }

    /* Empty State */
    .empty-chapter {
        text-align: center;
        padding: 4rem 2rem;
    }

    .empty-chapter i {
        font-size: 3rem;
        color: #dee2e6;
        margin-bottom: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .reader-container {
            box-shadow: none;
        }
        
        .reader-content {
            padding: 1.5rem;
        }
        
        .chapter-heading {
            font-size: 1.5rem;
        }
        
        .chapter-content {
            font-size: 1rem;
        }
        
        .reader-controls {
            padding: 0.75rem 1rem;
        }
        
        .toc-sidebar,
        .settings-panel {
            width: 100%;
        }
    }

    @media (max-width: 576px) {
        .reader-header {
            padding: 1rem;
        }
        
        .reader-content {
            padding: 1.25rem;
        }
        
        .chapter-heading {
            font-size: 1.3rem;
        }
        
        .nav-buttons .btn-nav {
            width: 36px;
            height: 36px;
        }
    }
    </style>
</head>
<body>

<!-- Overlay -->
<div class="overlay" id="overlay"></div>

<!-- Table of Contents Sidebar -->
<div class="toc-sidebar" id="tocSidebar">
    <div class="toc-header">
        <i class="fas fa-list me-2"></i>Daftar Isi
        <button type="button" class="btn-close btn-close-white float-end" onclick="closeTOC()"></button>
    </div>
    <ul class="toc-list">
        <?php foreach($chapters as $chapter): ?>
        <li class="toc-item">
            <a href="?id=<?= $buku_id ?>&page=<?= $chapter['nomor_bab'] ?>" 
               class="toc-link <?= ($bab && $chapter['id'] == $bab['id']) ? 'active' : '' ?>">
                <span class="toc-number"><?= $chapter['nomor_bab'] ?>.</span>
                <?= htmlspecialchars($chapter['judul_bab']) ?>
            </a>
        </li>
        <?php endforeach; ?>
    </ul>
</div>

<!-- Settings Panel -->
<div class="settings-panel" id="settingsPanel">
    <h6 class="settings-header">
        <i class="fas fa-cog me-2"></i>Pengaturan Baca
    </h6>
    
    <div class="mb-4">
        <label class="form-label small fw-bold mb-2">Ukuran Font</label>
        <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="changeFontSize('small')">
                A-
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm active" onclick="changeFontSize('normal')">
                A
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="changeFontSize('large')">
                A+
            </button>
        </div>
    </div>
    
    <div class="mb-4">
        <label class="form-label small fw-bold mb-2">Warna Tema</label>
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-light border" style="width: 30px; height: 30px;" onclick="changeTheme('light')"></button>
            <button class="btn btn-sm btn-dark border" style="width: 30px; height: 30px;" onclick="changeTheme('dark')"></button>
            <button class="btn btn-sm btn-light border" style="width: 30px; height: 30px; background: #fef6e4;" onclick="changeTheme('sepia')"></button>
        </div>
    </div>
    
    <div class="mb-4">
        <label class="form-label small fw-bold mb-2">Spasi Baris</label>
        <input type="range" class="form-range" min="1.5" max="2.5" step="0.1" value="1.8" id="lineHeightRange" oninput="changeLineHeight(this.value)">
    </div>
    
    <div class="text-end">
        <button class="btn btn-sm btn-outline-secondary" onclick="closeSettings()">
            Tutup
        </button>
    </div>
</div>

<div class="reader-container">

    <!-- Reader Header -->
    <div class="reader-header">
        <div class="d-flex justify-content-between align-items-center">
            <div class="flex-grow-1 me-3">
                <div class="book-title-header">
                    <i class="fas fa-book me-2"></i><?= htmlspecialchars($buku['judul']) ?>
                </div>
                <p class="chapter-title mb-0">
                    <?= $bab ? htmlspecialchars($bab['judul_bab']) : 'Bab tidak ditemukan' ?>
                </p>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-light" onclick="openTOC()">
                    <i class="fas fa-list"></i>
                </button>
                <button class="btn btn-sm btn-outline-light" onclick="openSettings()">
                    <i class="fas fa-cog"></i>
                </button>
                <a href="detail_buku.php?id=<?= $buku_id ?>" class="btn btn-sm btn-outline-light">
                    <i class="fas fa-times"></i>
                </a>
            </div>
        </div>
    </div>

    <!-- Reader Controls -->
    <div class="reader-controls">
        <div class="nav-buttons">
            <button class="btn-nav" onclick="goToChapter(<?= $page - 1 ?>)" <?= $page <= 1 ? 'disabled' : '' ?>>
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="btn-nav" onclick="openTOC()">
                <i class="fas fa-list"></i>
            </button>
            <button class="btn-nav" onclick="openSettings()">
                <i class="fas fa-cog"></i>
            </button>
            <button class="btn-nav" onclick="goToChapter(<?= $page + 1 ?>)" <?= $page >= $total_chapters ? 'disabled' : '' ?>>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <div class="chapter-indicator">
            Bab <?= $bab ? $bab['nomor_bab'] : '0' ?> dari <?= $total_chapters ?>
        </div>
    </div>

    <!-- Reader Content -->
    <div class="reader-content" id="readerContent">
        <?php if($bab): ?>
            <div class="chapter-number">BAB <?= $bab['nomor_bab'] ?></div>
            <h1 class="chapter-heading"><?= htmlspecialchars($bab['judul_bab']) ?></h1>
            <div class="chapter-content">
                <?= nl2br(htmlspecialchars($bab['isi'])) ?>
            </div>
        <?php else: ?>
            <div class="empty-chapter">
                <i class="fas fa-book-open"></i>
                <h5 class="fw-bold mb-3">Bab Tidak Ditemukan</h5>
                <p class="text-muted mb-4">Silakan pilih bab lain dari daftar isi.</p>
                <button class="btn btn-success" onclick="openTOC()">
                    <i class="fas fa-list me-2"></i>Buka Daftar Isi
                </button>
            </div>
        <?php endif; ?>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
        <div class="progress-label">
            <i class="fas fa-chart-line me-1"></i>Progress Membaca
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: <?= $total_chapters > 0 ? ($page / $total_chapters * 100) : 0 ?>%"></div>
        </div>
        <div class="reading-stats">
            <span><?= $page ?> dari <?= $total_chapters ?> bab</span>
            <span><?= $total_chapters > 0 ? round($page / $total_chapters * 100) : 0 ?>% selesai</span>
        </div>
    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Navigation functions
function goToChapter(page) {
    if (page >= 1 && page <= <?= $total_chapters ?>) {
        window.location.href = `?id=<?= $buku_id ?>&page=${page}`;
    }
}

// Sidebar functions
function openTOC() {
    document.getElementById('tocSidebar').classList.add('show');
    document.getElementById('overlay').classList.add('show');
}

function closeTOC() {
    document.getElementById('tocSidebar').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
}

function openSettings() {
    document.getElementById('settingsPanel').classList.add('show');
    document.getElementById('overlay').classList.add('show');
}

function closeSettings() {
    document.getElementById('settingsPanel').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
}

// Close sidebars when clicking overlay
document.getElementById('overlay').addEventListener('click', function() {
    closeTOC();
    closeSettings();
});

// Reading settings
function changeFontSize(size) {
    const content = document.getElementById('readerContent');
    const buttons = document.querySelectorAll('.btn-group .btn');
    
    buttons.forEach(btn => btn.classList.remove('active', 'btn-primary'));
    buttons.forEach(btn => btn.classList.add('btn-outline-secondary'));
    
    if (size === 'small') {
        content.style.fontSize = '0.95rem';
        buttons[0].classList.remove('btn-outline-secondary');
        buttons[0].classList.add('active', 'btn-primary');
    } else if (size === 'normal') {
        content.style.fontSize = '1.1rem';
        buttons[1].classList.remove('btn-outline-secondary');
        buttons[1].classList.add('active', 'btn-primary');
    } else {
        content.style.fontSize = '1.25rem';
        buttons[2].classList.remove('btn-outline-secondary');
        buttons[2].classList.add('active', 'btn-primary');
    }
}

function changeTheme(theme) {
    const body = document.body;
    const readerContent = document.getElementById('readerContent');
    
    body.className = body.className.replace(/theme-\S+/g, '');
    body.classList.add(`theme-${theme}`);
    
    if (theme === 'dark') {
        document.querySelector('.reader-container').style.backgroundColor = '#212529';
        document.querySelector('.reader-container').style.color = '#f8f9fa';
        readerContent.style.color = '#f8f9fa';
    } else if (theme === 'sepia') {
        document.querySelector('.reader-container').style.backgroundColor = '#fef6e4';
        document.querySelector('.reader-container').style.color = '#5c4b37';
        readerContent.style.color = '#5c4b37';
    } else {
        document.querySelector('.reader-container').style.backgroundColor = '#ffffff';
        document.querySelector('.reader-container').style.color = '#212529';
        readerContent.style.color = '#333';
    }
}

function changeLineHeight(value) {
    document.querySelector('.chapter-content').style.lineHeight = value;
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Left arrow for previous chapter
    if (e.key === 'ArrowLeft') {
        goToChapter(<?= $page ?> - 1);
    }
    // Right arrow for next chapter
    else if (e.key === 'ArrowRight') {
        goToChapter(<?= $page ?> + 1);
    }
    // ESC to close sidebars
    else if (e.key === 'Escape') {
        closeTOC();
        closeSettings();
    }
});

// Save reading progress
window.addEventListener('beforeunload', function() {
    navigator.sendBeacon('save_progress.php', JSON.stringify({
        book_id: <?= $buku_id ?>,
        chapter_id: <?= $bab ? $bab['id'] : 0 ?>,
        chapter_number: <?= $page ?>
    }));
});
</script>
</body>
</html>