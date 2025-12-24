<?php
session_start();
require_once '../config/database.php';

$id = $_GET['id'];

/* transaksi */
$trx = $pdo->prepare("SELECT * FROM transaksi WHERE id=?");
$trx->execute([$id]);
$trx = $trx->fetch();

/* item */
$item = $pdo->prepare("
  SELECT buku.judul, transaksi_item.harga
  FROM transaksi_item
  JOIN buku ON buku.id = transaksi_item.buku_id
  WHERE transaksi_item.transaksi_id=?
");
$item->execute([$id]);
$items = $item->fetchAll();
?>
<!DOCTYPE html>
<html>
<body>

<h3>Transaksi #<?= $trx['id'] ?></h3>
<p>Total: Rp <?= number_format($trx['total_harga']) ?></p>
<p>Status: <?= $trx['status'] ?></p>

<h4>Buku Dibeli</h4>
<ul>
<?php foreach($items as $i): ?>
  <li><?= $i['judul'] ?> — Rp <?= number_format($i['harga']) ?></li>
  <td>
    <a href="baca_buku.php?id=<?= $i['buku_id'] ?>"
       class="btn btn-success btn-sm">
       Baca Buku
    </a>
  </td>
  <?php endforeach; ?>
</ul>

</body>
</html>
