<?php
// Bulk garment add for online-shop checkout. Audit fix §7.6: this used to
// loop JobItem::Create() (no totals recalculation) and crashed on an
// undefined $jobItems variable ($data->jobItems was read instead). It now
// runs every insert through JobItemTransaction, so job totals are
// recalculated once per garment and partial failures roll back that
// garment's transaction. Response: { added: n, failed: [ {index, error} ] }.
// Size validation is OFF here: checkout sizes come from product
// variations, not the size library.

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
$items = isset($body->JobItems) && is_array($body->JobItems) ? $body->JobItems : null;

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($JobId === '') {
    respond(array('error' => 'JobId is required.'), 400);
}
if ($items === null || count($items) === 0) {
    respond(array('error' => 'JobItems is required.'), 400);
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
    error_log('add-job-item-range: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$transaction = new JobItemTransaction($db, false);
$added = 0;
$failed = array();
foreach ($items as $index => $item) {
    if (!is_object($item)) {
        $failed[] = array('index' => $index, 'error' => 'JobItem must be an object.');
        continue;
    }
    // Keep the garment's identifiers consistent with the request scope;
    // tampered ones are rejected rather than silently overwritten.
    $item->JobId = $JobId;
    $item->CompanyId = $CompanyId;
    list($status, $response) = $transaction->add($CompanyId, $JobId, $item);
    if ($status === 200) {
        $added++;
    } else {
        $failed[] = array('index' => $index, 'error' => isset($response['error']) ? $response['error'] : 'Unknown error.');
    }
}

respond(array('added' => $added, 'failed' => $failed));