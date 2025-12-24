<?php
session_start();
require_once '../config/database.php';

$user_id = $_SESSION['user']['id'];

/* ambil keranjang */
$keranjang = $pdo->prepare("SELECT id FROM keranjang WHERE user_id=?");
$keranjang->execute([$user_id]);
$keranjang_id = $keranjang->fetch()['id'];

/* ambil item */
$items = $pdo->prepare("
  SELECT buku_id, harga
  FROM detail_item
  WHERE keranjang_id=?
");
$items->execute([$keranjang_id]);
$items = $items->fetchAll();

/* hitung total */
$total = array_sum(array_column($items,'harga'));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  // 1. buat transaksi
  $pdo->prepare("
    INSERT INTO transaksi (user_id,total_harga,status,created_at)
    VALUES (?,?, 'paid', NOW())
  ")->execute([$user_id,$total]);

  $transaksi_id = $pdo->lastInsertId();

  // 2. simpan item transaksi
  $stmtItem = $pdo->prepare("
    INSERT INTO transaksi_item (transaksi_id,buku_id,harga)
    VALUES (?,?,?)
  ");

  foreach ($items as $i) {
    $stmtItem->execute([$transaksi_id,$i['buku_id'],$i['harga']]);
  }

  // 3. kosongkan keranjang
  $pdo->prepare("DELETE FROM detail_item WHERE keranjang_id=?")
      ->execute([$keranjang_id]);

  header("Location: transaksi.php");
  exit;
}
?>
<!DOCTYPE html>
<html>
<body>
<h3>Total Bayar: Rp <?= number_format($total) ?></h3>
<form method="POST">
  <button>Bayar Sekarang</button>
</form>
</body>
</html>
