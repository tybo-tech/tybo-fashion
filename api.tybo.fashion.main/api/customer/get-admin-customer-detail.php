<?php
// Read-only focused customer detail for the admin Customer screen (Sprint 3).
// Additive endpoint: does not alter the legacy customer/get.php response or
// any write contract.
// Returns the editable customer fields the existing form round-trips (full
// row + decoded Measurements/Metadata + FullName) plus only the analytics the
// new detail page renders. It deliberately does NOT return job/payment
// history arrays, contact/address/activity/service-preference analysis, or
// any field the page does not consume.
// Lookup is scoped by both CompanyId and CustomerId.
// Database connection failures are absorbed here (Database.php unmodified)
// and reported as a generic 500.

include_once '../../config/Database.php';
include_once '../../models/Customer.php';

function get_admin_customer_detail_respond($body, $status = 200)
{
  http_response_code($status);
  echo json_encode($body);
  exit;
}

$CompanyId = isset($_GET['CompanyId']) ? trim($_GET['CompanyId']) : '';
$CustomerId = isset($_GET['CustomerId']) ? trim($_GET['CustomerId']) : '';

if ($CompanyId === '') {
  get_admin_customer_detail_respond(array('error' => 'CompanyId is required.'), 400);
}
if ($CustomerId === '') {
  get_admin_customer_detail_respond(array('error' => 'CustomerId is required.'), 400);
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
  error_log('get-admin-customer-detail: database connection unavailable.');
  get_admin_customer_detail_respond(array('error' => 'Unable to load customer.'), 500);
}

$customer = new Customer($db);
$result = null;
try {
  $result = $customer->GetAdminCustomerDetail($CompanyId, $CustomerId);
} catch (Throwable $queryError) {
  error_log('get-admin-customer-detail: query failed.');
  get_admin_customer_detail_respond(array('error' => 'Unable to load customer.'), 500);
}

if (is_array($result) && isset($result['ERROR'])) {
  get_admin_customer_detail_respond(array('error' => 'Unable to load customer.'), 500);
}

if ($result === null) {
  get_admin_customer_detail_respond(array('error' => 'Customer not found.'), 404);
}

// The `customer` group carries only the editable fields the form round-trips;
// the `analytics` group is the single source for the computed metrics. Strip
// the computed columns out of `customer` so the contract stays clean.
$analyticsKeys = array(
  'TotalJobs', 'CompletedJobs', 'ActiveJobs', 'TotalJobValue', 'TotalPaidAmount',
  'TotalDueAmount', 'LastActivityDate', 'CustomerLifetimeValue',
  'OutstandingBalance', 'PaymentCompletionRate', 'ProfileCompleteness',
);
foreach ($analyticsKeys as $key) {
  unset($result[$key]);
}

get_admin_customer_detail_respond(array(
  'customer' => $result,
  'analytics' => array(
    'TotalJobs' => (int) $result['TotalJobs'],
    'ActiveJobs' => (int) $result['ActiveJobs'],
    'CompletedJobs' => (int) $result['CompletedJobs'],
    'CustomerLifetimeValue' => floatval($result['CustomerLifetimeValue']),
    'OutstandingBalance' => floatval($result['OutstandingBalance']),
    'PaymentCompletionRate' => $result['PaymentCompletionRate'],
    'ProfileCompleteness' => $result['ProfileCompleteness'],
    'LastActivityDate' => $result['LastActivityDate'],
  ),
));
