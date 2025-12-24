<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];

/* ======================
   TANDAI DIBACA
====================== */
if (isset($_GET['read'])) {
  $id = (int) $_GET['read'];
  $pdo->prepare("
    UPDATE notifikasi 
    SET dibaca_at = NOW()
    WHERE id = ? AND user_id = ?
  ")->execute([$id, $seller_id]);

  header("Location: notifikasi.php");
  exit;
}

/* ======================
   AMBIL NOTIFIKASI
====================== */
$stmt = $pdo->prepare("
  SELECT id, pesan, dibaca_at
  FROM notifikasi
  WHERE user_id = ?
  ORDER BY id DESC
");
$stmt->execute([$seller_id]);
$notifikasi = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Notifikasi Seller</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="../assets/css/dashboard.css" rel="stylesheet">
<style>
body { background:#f7f3eb; }
.card { border-radius:14px; }
.notif-unread {
  background:#e8f5e9;
}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<h3 class="fw-bold mb-3">Notifikasi 🔔</h3>

<?php if($notifikasi): ?>
<div class="card shadow-sm border-0">
  <div class="list-group list-group-flush">
    <?php foreach($notifikasi as $n): ?>
      <div class="list-group-item <?= !$n['dibaca_at'] ? 'notif-unread' : '' ?>">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="mb-1"><?= htmlspecialchars($n['pesan']) ?></p>
            <?php if($n['dibaca_at']): ?>
              <small class="text-muted">Dibaca</small>
            <?php else: ?>
              <small class="text-success">Belum dibaca</small>
            <?php endif; ?>
          </div>
          <?php if(!$n['dibaca_at']): ?>
            <a href="?read=<?= $n['id'] ?>" class="btn btn-sm btn-outline-success">
              Tandai dibaca
            </a>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<?php else: ?>
<div class="card shadow-sm border-0 p-5 text-center">
  <p class="text-muted mb-0">Belum ada notifikasi</p>
</div>
<?php endif; ?>

</div>

<?php include '../partials/footer.php'; ?>
</body>
</html>
