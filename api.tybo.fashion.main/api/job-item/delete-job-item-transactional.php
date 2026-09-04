<?php
// Sprint 5 §6 — transactional garment removal. Additive endpoint: does not
// modify delete-job-item.php (the legacy state-changing GET) or any legacy
// contract. Removal is POST/DELETE only — never a state-changing GET.
//
// POST or DELETE { CompanyId, JobId, JobItemId }
// One transaction: delete the garment (scoped to the job and company),
// recalculate and persist the parent job totals, and return
// { garment: null, removedJobItemId, totals }.
//
// Last-garment behaviour follows the locked formula (JobTotals): invoice,
// payments, proof and unrelated metadata are preserved; garment-discount
// fields are reset; shipping is preserved and the total becomes the
// remaining shipping charge. The client delete_from_cart() wipe is NOT
// reproduced here.

include_once '../../config/Database.php';
include_once '../../models/JobItemTransaction.php';

function respond($body, $status = 200)
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST' && $method !== 'DELETE') {
    respond(array('error' => 'Use POST or DELETE.'), 405);
}

// Identifiers may arrive as query params or a JSON body; body wins when
// both are present. Any mismatch between the two sources is rejected.
$CompanyId = isset($_GET['CompanyId']) ? trim((string) $_GET['CompanyId']) : '';
$JobId = isset($_GET['JobId']) ? trim((string) $_GET['JobId']) : '';
$JobItemId = isset($_GET['JobItemId']) ? trim((string) $_GET['JobItemId']) : '';

$body = null;
$raw = file_get_contents('php://input');
if ($raw !== false && $raw !== '') {
    $decoded = json_decode($raw);
    if (is_object($decoded)) {
        $body = $decoded;
    }
}
if ($body !== null) {
    if (isset($body->CompanyId)) {
        if ($CompanyId !== '' && $CompanyId !== trim((string) $body->CompanyId)) {
            respond(array('error' => 'CompanyId mismatch between query and body.'), 400);
        }
        $CompanyId = trim((string) $body->CompanyId);
    }
    if (isset($body->JobId)) {
        if ($JobId !== '' && $JobId !== trim((string) $body->JobId)) {
            respond(array('error' => 'JobId mismatch between query and body.'), 400);
        }
        $JobId = trim((string) $body->JobId);
    }
    if (isset($body->JobItemId)) {
        if ($JobItemId !== '' && $JobItemId !== trim((string) $body->JobItemId)) {
            respond(array('error' => 'JobItemId mismatch between query and body.'), 400);
        }
        $JobItemId = trim((string) $body->JobItemId);
    }
}

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($JobId === '') {
    respond(array('error' => 'JobId is required.'), 400);
}
if ($JobItemId === '') {
    respond(array('error' => 'JobItemId is required.'), 400);
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
    error_log('delete-job-item-transactional: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$transaction = new JobItemTransaction($db);
list($status, $response) = $transaction->remove($CompanyId, $JobId, $JobItemId);
respond($response, $status);
