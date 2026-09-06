<?php
// Audit fix §7.6 — the legacy delete endpoint is now a delegate of the
// transactional layer (JobItemTransaction->remove): the removal and the
// parent job totals recalculation happen in one transaction, and the URL /
// JobItemId query-string contract is unchanged. The state-changing GET is
// retained for rollback compatibility with existing callers; new callers
// should use delete-job-item-transactional.php (POST).

include_once '../../config/Database.php';
include_once '../../models/JobItemTransaction.php';

function respond($body, $status = 200)
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$JobItemId = isset($_GET['JobItemId']) ? trim((string) $_GET['JobItemId']) : '';
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
    error_log('delete-job-item: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

// The legacy URL carries only the garment id; the job/company scope comes
// from the stored row itself.
$stmt = $db->prepare('SELECT JobId, CompanyId FROM jobitem WHERE JobItemId = ?');
$stmt->execute(array($JobItemId));
$existing = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$existing) {
    respond(array('error' => 'Garment not found.'), 404);
}

$transaction = new JobItemTransaction($db);
list($status, $response) = $transaction->remove(
    trim((string) $existing['CompanyId']),
    trim((string) $existing['JobId']),
    $JobItemId
);
if ($status !== 200) {
    respond($response, $status);
}
respond(array('deleted' => true, 'removedJobItemId' => $JobItemId, 'totals' => $response['totals']));