<?php
// Sprint 5 §6 — transactional garment update. Additive endpoint: does not
// modify update-job-item.php or any legacy contract.
//
// POST { CompanyId, JobId, JobItemId, JobItem: { ...job item model } }
// One transaction: update the garment (scoped to the job and company),
// recalculate and persist the parent job totals, and return
// { garment, removedJobItemId: null, totals }.

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
$JobItemId = isset($body->JobItemId) ? trim((string) $body->JobItemId) : '';
$JobItem = isset($body->JobItem) && is_object($body->JobItem) ? $body->JobItem : null;

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($JobId === '') {
    respond(array('error' => 'JobId is required.'), 400);
}
if ($JobItemId === '') {
    respond(array('error' => 'JobItemId is required.'), 400);
}
if ($JobItem === null) {
    respond(array('error' => 'JobItem is required.'), 400);
}
// Tampered body identifiers are rejected, not silently overwritten.
if (isset($JobItem->JobItemId) && trim((string) $JobItem->JobItemId) !== $JobItemId) {
    respond(array('error' => 'JobItem.JobItemId does not match the request JobItemId.'), 400);
}
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
    error_log('update-job-item-transactional: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$transaction = new JobItemTransaction($db);
list($status, $response) = $transaction->update($CompanyId, $JobId, $JobItemId, $JobItem);
respond($response, $status);
