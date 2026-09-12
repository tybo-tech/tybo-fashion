<?php
/**
 * Marketplace homepage feed.
 *
 * GET /products/home-feed.php?count=8
 *
 * Returns the newest eligible listings (visible, in-stock-priced, from an
 * active shop) with designer details, a stock label and a 50% deposit,
 * diversified so no single designer dominates the row.
 */
include_once '../../config/Database.php';
include_once '../../models/ProductQuery.php';
include_once '../../models/HomeFeed.php';

$database = new Database();
$db = $database->connect();

$count = (int) ($_GET['count'] ?? 8);
if ($count <= 0) {
  $count = 8;
}

$service = new ProductQuery($db);
$result = $service->getHomeFeed($count);
echo json_encode(cleanUtf8Array($result));
