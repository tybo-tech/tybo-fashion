<?php
// Cascade delete a customer. POST or DELETE { CompanyId, CustomerId }.
//
// A customer owns their jobs; deleting the customer removes their jobs and
// every branch under them (garments, work, orders) in one transaction, then
// the customer itself — so no orphaned rows are left behind.
// Identifiers may arrive as query params or a JSON body; body wins when both
// are present, and any mismatch between the two sources is rejected.

include_once '../../config/Database.php';
include_once '../../models/CascadeDelete.php';

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

$CompanyId = isset($_GET['CompanyId']) ? trim((string) $_GET['CompanyId']) : '';
$CustomerId = isset($_GET['CustomerId']) ? trim((string) $_GET['CustomerId']) : '';

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
    if (isset($body->CustomerId)) {
        if ($CustomerId !== '' && $CustomerId !== trim((string) $body->CustomerId)) {
            respond(array('error' => 'CustomerId mismatch between query and body.'), 400);
        }
        $CustomerId = trim((string) $body->CustomerId);
    }
}

if ($CompanyId === '') {
    respond(array('error' => 'CompanyId is required.'), 400);
}
if ($CustomerId === '') {
    respond(array('error' => 'CustomerId is required.'), 400);
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
    error_log('delete-customer: database connection unavailable.');
    respond(array('error' => 'Service temporarily unavailable.'), 500);
}

$cascade = new CascadeDelete($db);
list($status, $response) = $cascade->deleteCustomer($CompanyId, $CustomerId);
respond($response, $status);
