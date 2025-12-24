<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];
$success = '';

$stmt = $pdo->prepare("SELECT nama, email, bio FROM users WHERE id=?");
$stmt->execute([$seller_id]);
$user = $stmt->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $nama = trim($_POST['nama']);
  $bio = trim($_POST['bio']);

  $pdo->prepare("
    UPDATE users SET nama=?, bio=? WHERE id=?
  ")->execute([$nama,$bio,$seller_id]);

  $_SESSION['user']['nama'] = $nama;
  $success = "Profil berhasil diperbarui";
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Profil Seller</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="../assets/css/dashboard.css" rel="stylesheet">
<style>
body{background:#f7f3eb}
.card{border-radius:14px}
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">
<h3 class="fw-bold mb-3">Profil Saya 👤</h3>

<div class="card shadow-sm border-0">
<div class="card-body">
<?php if($success): ?>
<div class="alert alert-success"><?= $success ?></div>
<?php endif; ?>

<form method="POST">
  <div class="mb-3">
    <label class="form-label">Nama</label>
    <input type="text" name="nama" class="form-control"
           value="<?= htmlspecialchars($user['nama']) ?>" required>
  </div>

  <div class="mb-3">
    <label class="form-label">Email</label>
    <input type="email" class="form-control"
           value="<?= htmlspecialchars($user['email']) ?>" disabled>
  </div>

  <div class="mb-3">
    <label class="form-label">Bio</label>
    <textarea name="bio" class="form-control" rows="4"><?= htmlspecialchars($user['bio']) ?></textarea>
  </div>

  <button class="btn btn-success">Simpan Profil</button>
</form>
</div>
</div>
</div>

<?php include '../partials/footer.php'; ?>
</body>
</html>
