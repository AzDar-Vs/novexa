<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];

/* AMBIL PESANAN TERKIRIM (PAID) */
$stmt = $pdo->prepare("
  SELECT 
    t.id AS transaksi_id,
    u.nama AS pembeli,
    b.judul,
    t.created_at
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  JOIN users u ON u.id = t.user_id
  WHERE b.user_id = ?
    AND t.status = 'paid'
  ORDER BY t.created_at DESC
");
$stmt->execute([$seller_id]);
$data = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Pengiriman - Seller</title>
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
<h3 class="fw-bold mb-3">Pengiriman / Akses Buku 📦</h3>

<?php if($data): ?>
<div class="card shadow-sm border-0">
<table class="table mb-0">
<thead class="table-light">
<tr>
  <th>Transaksi</th>
  <th>Pembeli</th>
  <th>Buku</th>
  <th>Tanggal</th>
  <th>Status</th>
</tr>
</thead>
<tbody>
<?php foreach($data as $d): ?>
<tr>
  <td>#<?= $d['transaksi_id'] ?></td>
  <td><?= htmlspecialchars($d['pembeli']) ?></td>
  <td><?= htmlspecialchars($d['judul']) ?></td>
  <td><?= date('d M Y', strtotime($d['created_at'])) ?></td>
  <td><span class="badge bg-success">Akses Aktif</span></td>
</tr>
<?php endforeach; ?>
</tbody>
</table>
</div>
<?php else: ?>
<div class="card p-5 text-center shadow-sm border-0">
  <p class="text-muted mb-0">Belum ada pengiriman</p>
</div>
<?php endif; ?>

</div>

<?php include '../partials/footer.php'; ?>
</body>
</html>
