<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
  header("Location: ../auth/auth.php");
  exit;
}

$seller_id = $_SESSION['user']['id'];

/* ======================
   HITUNG SALDO SELLER
====================== */
$stmt = $pdo->prepare("
  SELECT COALESCE(SUM(ti.harga),0)
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  WHERE b.user_id = ?
    AND t.status = 'paid'
");
$stmt->execute([$seller_id]);
$saldo = $stmt->fetchColumn();

/* ======================
   RIWAYAT SALDO SELLER
====================== */
$stmt = $pdo->prepare("
  SELECT 
    t.id AS transaksi_id,
    b.judul,
    ti.harga,
    t.created_at
  FROM transaksi_item ti
  JOIN buku b ON b.id = ti.buku_id
  JOIN transaksi t ON t.id = ti.transaksi_id
  WHERE b.user_id = ?
    AND t.status = 'paid'
  ORDER BY t.created_at DESC
");
$stmt->execute([$seller_id]);
$riwayat = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Saldo Seller</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="../assets/css/dashboard.css" rel="stylesheet">

<style>
body { background:#f7f3eb; }
.card { border-radius:14px; }
</style>
</head>
<body>

<?php include '../partials/navbar_seller.php'; ?>

<div class="container mt-4">

<h3 class="fw-bold mb-3">Saldo Saya 💰</h3>

<!-- SALDO -->
<div class="card shadow-sm border-0 mb-4">
  <div class="card-body text-center py-4">
    <small class="text-muted">Total Pendapatan</small>
    <h1 class="fw-bold text-success">
      Rp <?= number_format($saldo,0,',','.') ?>
    </h1>
  </div>
</div>

<!-- RIWAYAT -->
<div class="card shadow-sm border-0">
  <div class="card-header bg-white fw-bold">
    Riwayat Penjualan
  </div>
  <div class="card-body p-0">
    <?php if($riwayat): ?>
    <table class="table mb-0 align-middle">
      <thead class="table-light">
        <tr>
          <th>Transaksi</th>
          <th>Buku</th>
          <th>Harga</th>
          <th>Tanggal</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach($riwayat as $r): ?>
        <tr>
          <td>#<?= $r['transaksi_id'] ?></td>
          <td><?= htmlspecialchars($r['judul']) ?></td>
          <td class="text-success">
            + Rp <?= number_format($r['harga'],0,',','.') ?>
          </td>
          <td><?= date('d M Y', strtotime($r['created_at'])) ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    <?php else: ?>
      <div class="p-4 text-center text-muted">
        Belum ada penjualan
      </div>
    <?php endif; ?>
  </div>
</div>

</div>

<?php include '../partials/footer.php'; ?>
</body>
</html>
