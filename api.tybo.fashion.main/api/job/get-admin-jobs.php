<?php
// Read-only lean jobs list for the admin Jobs screen.
// Additive endpoint: does not modify get-jobs.php or any write contract.
// StatusId = 1 is the active-record condition only; workflow state is read
// from and filtered on job.Status. No order/payment data is fetched.

include_once '../../config/Database.php';
include_once '../../models/Job.php';

function get_admin_jobs_respond($body, $status = 200)
{
  http_response_code($status);
  echo json_encode($body);
  exit;
}

$CompanyId = isset($_GET['CompanyId']) ? trim($_GET['CompanyId']) : '';

if ($CompanyId === '') {
  get_admin_jobs_respond(array('error' => 'CompanyId is required.'), 400);
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

// ── Status: slug → canonical stored value(s); unknown slug → 400 ─────────
// Canonical set: Not started, In Progress, Completed, Stuck, Terminated,
// Paused. Legacy 'Complete' is an alias of 'Completed' (a completed filter
// matches both). Empty status = all statuses. Matching is case-insensitive
// because DB casing varies ('Not started' vs 'Not Started').
$statusSlugToValues = array(
  'not-started' => array('not started'),
  'in-progress' => array('in progress'),
  'completed' => array('completed', 'complete'),
  'complete' => array('completed', 'complete'),
  'stuck' => array('stuck'),
  'terminated' => array('terminated'),
  'paused' => array('paused'),
);

$rawStatus = isset($_GET['status']) ? trim($_GET['status']) : '';
if ($rawStatus !== '' && !array_key_exists($rawStatus, $statusSlugToValues)) {
  get_admin_jobs_respond(array('error' => 'Unsupported job status.'), 400);
}
$statusValues = $rawStatus !== '' ? $statusSlugToValues[$rawStatus] : array();

$database = new Database();
$db = $database->connect();

$job = new Job($db);
$result = $job->GetAdminJobsPage($CompanyId, $statusValues, $q, $pageSize, ($page - 1) * $pageSize);

if (is_array($result) && isset($result['ERROR'])) {
  get_admin_jobs_respond(array('error' => 'Unable to load jobs.'), 500);
}

$totalItems = (int) $result['total'];
$totalPages = $totalItems > 0 ? (int) ceil($totalItems / $pageSize) : 0;

get_admin_jobs_respond(array(
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