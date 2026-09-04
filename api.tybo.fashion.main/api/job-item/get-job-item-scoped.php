<?php
// Sprint 5 §6 — scoped garment-detail read. Additive endpoint: does not
// modify get-job-item.php or any legacy contract.
//
// GET ?CompanyId=...&JobId=...&JobItemId=...
// Returns the garment ONLY when JobItemId belongs to JobId and JobId to
// CompanyId. Cross-job and cross-company garment IDs are 404 — the same
// answer as a missing garment. Unlike get-job-item.php this does NOT embed
// the whole parent job; the garment page no longer needs it.
//
// NOTE (Sprint 5 §7): identifier scoping, not authentication. Tenant
// enforcement language is avoided until the security sprint lands.

include_once '../../config/Database.php';
include_once '../../models/JobItem.php';

function respond($body, $status = 200)
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(array('error' => 'Use GET.'), 405);
}

$CompanyId = isset($_GET['CompanyId']) ? trim((string) $_GET['CompanyId']) : '';
$JobId = isset($_GET['JobId']) ? trim((string) $_GET['JobId']) : '';
$JobItemId = isset($_GET['JobItemId']) ? trim((string) $_GET['JobItemId']) : '';

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($JobId === '') {
    respond(array('error' => 'JobId is required.'), 400);
}
if ($JobItemId === '') {
    respond(array('error' => 'JobItemId is required.'), 400);
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
    error_log('get-job-item-scoped: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$jobItem = new JobItem($db);
$garment = $jobItem->getScopedById($JobItemId, $JobId, $CompanyId);

if ($garment === null) {
    respond(array('error' => 'Garment not found in this job.'), 404);
}

respond(array('garment' => $garment));
