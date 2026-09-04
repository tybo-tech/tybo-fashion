<?php
// Read-only lean customers list for the admin Customers screen.
// Additive endpoint: does not alter the legacy customer/list.php response or
// any write contract.
// Returns exactly four display fields per row (CustomerId, CustomerName,
// PhoneNumber, Email) plus pagination metadata. No job join, financial
// calculation, JSON extraction/decoding, address, measurements, avatar or
// analytics work happens on this path. CustomerType is intentionally not
// accepted from the client; this endpoint always uses 'Customer'.
// Database connection failures are absorbed here (Database.php unmodified)
// and reported as a generic 500.

include_once '../../config/Database.php';
include_once '../../models/Customer.php';

function get_admin_customers_respond($body, $status = 200)
{
  http_response_code($status);
  echo json_encode($body);
  exit;
}

$CompanyId = isset($_GET['CompanyId']) ? trim($_GET['CompanyId']) : '';

if ($CompanyId === '') {
  get_admin_customers_respond(array('error' => 'CompanyId is required.'), 400);
}

// ── Pagination: integer cast + clamp (invalid values never fail) ──────────
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 20;
if ($page < 1) {
  $page = 1;
}
if ($pageSize < 1) {
  $pageSize = 20;
}
if ($pageSize > 100) {
  $pageSize = 100;
}

// ── Search: trim + 100-char cap ───────────────────────────────────────────
$q = isset($_GET['q']) ? trim($_GET['q']) : '';
if (mb_strlen($q) > 100) {
  $q = mb_substr($q, 0, 100);
}

// ── Connection guard: Database::connect() may echo a driver error and
// return null. Never surface it; validate the handle; fail generically. ───
$database = new Database();
$db = null;
try {
  ob_start();
  $db = $database->connect();
  $connectionOutput = ob_get_clean();
} catch (Throwable $connectionError) {
  ob_end_clean();
  $connectionOutput = null;
  $db = null;
}
if (!($db instanceof PDO)) {
  error_log('get-admin-customers: database connection unavailable.');
  get_admin_customers_respond(array('error' => 'Unable to load customers.'), 500);
}

$customer = new Customer($db);
$result = null;
try {
  $result = $customer->GetAdminCustomersPage($CompanyId, $q, $pageSize, ($page - 1) * $pageSize);
} catch (Throwable $queryError) {
  error_log('get-admin-customers: query failed.');
  get_admin_customers_respond(array('error' => 'Unable to load customers.'), 500);
}

if (is_array($result) && isset($result['ERROR'])) {
  get_admin_customers_respond(array('error' => 'Unable to load customers.'), 500);
}

$totalItems = (int) $result['total'];
$totalPages = $totalItems > 0 ? (int) ceil($totalItems / $pageSize) : 0;

get_admin_customers_respond(array(
  'items' => $result['items'],
  'pagination' => array(
    'page' => $page,
    'pageSize' => $pageSize,
    'totalItems' => $totalItems,
    'totalPages' => $totalPages,
    'hasPrevious' => $page > 1 && $totalPages > 0,
    'hasNext' => $page < $totalPages,
  ),
));
