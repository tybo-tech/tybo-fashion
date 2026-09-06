<?php
// Audit fix §7.6 — the legacy job-item write endpoints are now thin
// delegates of the transactional layer (JobItemTransaction), so every write
// path recalculates and persists the parent job totals in one transaction.
// The URL, request body and success response shape (the echoed job item)
// are unchanged for rollback compatibility; error handling is stricter:
// invalid identifiers now fail loudly (HTTP 4xx) instead of silently
// succeeding with stale totals.
// Size validation is OFF here: non-admin clients (storefront checkout)
// write sizes sourced from product variations, not the size library.

include_once '../../config/Database.php';
include_once '../../models/JobItemTransaction.php';

function respond($body, $status = 200)
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(array('error' => 'Use POST.'), 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw);
if (!is_object($body)) {
    respond(array('error' => 'A JSON body is required.'), 400);
}

$CompanyId = isset($body->CompanyId) ? trim((string) $body->CompanyId) : '';
$JobId = isset($body->JobId) ? trim((string) $body->JobId) : '';
$JobItem = $body;

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($JobId === '') {
    respond(array('error' => 'JobId is required.'), 400);
}
// A tampered body must never be able to file the garment under a
// different job or company than the request is scoped to.
if (isset($JobItem->JobId) && trim((string) $JobItem->JobId) !== $JobId) {
    respond(array('error' => 'JobItem.JobId does not match the request JobId.'), 400);
}
if (isset($JobItem->CompanyId) && trim((string) $JobItem->CompanyId) !== $CompanyId) {
    respond(array('error' => 'JobItem.CompanyId does not match the request CompanyId.'), 400);
}

// ── Connection guard ─────────────────────────────────────────────────────
$database = new Database();
$db = null;
try {
    ob_start();
    $db = $database->connect();
    ob_end_clean();
} catch (Throwable $connectionError) {
    ob_end_clean();
    $db = null;
}
if (!($db instanceof PDO)) {
    error_log('add-job-item: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$transaction = new JobItemTransaction($db, false);
list($status, $response) = $transaction->add($CompanyId, $JobId, $JobItem);
if ($status !== 200) {
    respond($response, $status);
}
respond($response['garment']);