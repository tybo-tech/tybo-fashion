<?php
// Sprint 5 §6 — transactional garment add. Additive endpoint: does not
// modify add-job-item.php or any legacy contract.
//
// POST { CompanyId, JobId, JobItem: { ...job item model } }
// One transaction: insert the garment, recalculate and persist the parent
// job totals, and return { garment, removedJobItemId: null, totals }.
// Nothing reports success unless the whole transaction commits.

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
$JobItem = isset($body->JobItem) && is_object($body->JobItem) ? $body->JobItem : null;

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($JobId === '') {
    respond(array('error' => 'JobId is required.'), 400);
}
if ($JobItem === null) {
    respond(array('error' => 'JobItem is required.'), 400);
}
// A tampered body must never be able to file the garment under a
// different job or company than the request is scoped to.
if (isset($JobItem->JobId) && trim((string) $JobItem->JobId) !== $JobId) {
    respond(array('error' => 'JobItem.JobId does not match the request JobId.'), 400);
}
if (isset($JobItem->CompanyId) && trim((string) $JobItem->CompanyId) !== $CompanyId) {
    respond(array('error' => 'JobItem.CompanyId does not match the request CompanyId.'), 400);
}

// ── Connection guard: Database::connect() may echo a driver error and
// return null. Never surface it; fail generically. ────────────────────────
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
    error_log('add-job-item-transactional: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$transaction = new JobItemTransaction($db);
list($status, $response) = $transaction->add($CompanyId, $JobId, $JobItem);
respond($response, $status);
