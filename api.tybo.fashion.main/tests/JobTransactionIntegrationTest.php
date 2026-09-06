<?php

/**
 * Sprint 5 §6 — transaction integration tests (require a database).
 *
 * Run: php tests/JobTransactionIntegrationTest.php
 * Config via environment (defaults match the docker-compose API):
 *   JOB_TEST_DB_HOST, JOB_TEST_DB_NAME, JOB_TEST_DB_USER, JOB_TEST_DB_PASS
 *
 * Skips gracefully when no database is reachable. Covers:
 *   - add/update/remove via JobItemTransaction recalculate and persist
 *     job totals in the same transaction (JobGarmentMutationResponse).
 *   - rollback failure: injected totals failure after the item mutation
 *     leaves the item AND job totals untouched and reports 500.
 *   - cross-job and cross-company garment IDs are rejected (404).
 *   - last-garment removal preserves metadata and totals to shipping.
 *
 * Sandbox rows are created with a dedicated test CompanyId and removed
 * afterwards.
 */

require_once __DIR__ . '/../models/JobItemTransaction.php';

$host = getenv('JOB_TEST_DB_HOST') ?: '127.0.0.1';
$name = getenv('JOB_TEST_DB_NAME') ?: 'tybo_fashion';
$user = getenv('JOB_TEST_DB_USER') ?: 'docker';
$pass = getenv('JOB_TEST_DB_PASS') ?: 'docker';

try {
    $db = new PDO(
        "mysql:host={$host};dbname={$name}",
        $user,
        $pass,
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
    );
} catch (PDOException $e) {
    echo "SKIP  database unavailable at {$host}/{$name}\n";
    exit(0);
}

$failures = 0;
$checks = 0;

function check($name, $expected, $actual)
{
    global $failures, $checks;
    $checks++;
    $ok = $expected === $actual;
    if (!$ok) {
        $failures++;
        echo "FAIL  {$name}\n";
        echo '      expected: ' . var_export($expected, true) . "\n";
        echo '      actual:   ' . var_export($actual, true) . "\n";
    } else {
        echo "ok    {$name}\n";
    }
}

/**
 * Money/values that round-trip through JSON/MySQL lose int/float typing
 * (50.0 comes back as "50"), so numeric assertions compare with tolerance.
 */
function check_num($name, $expected, $actual)
{
    global $failures, $checks;
    $checks++;
    if (!is_numeric($actual) || abs((float) $actual - (float) $expected) > 0.001) {
        $failures++;
        echo "FAIL  {$name}\n";
        echo '      expected: ' . var_export($expected, true) . "\n";
        echo '      actual:   ' . var_export($actual, true) . "\n";
    } else {
        echo "ok    {$name}\n";
    }
}

// ── Sandbox ──────────────────────────────────────────────────────────────
$CompanyId = 'test-company-' . bin2hex(random_bytes(6));
$JobId = 'test-job-' . bin2hex(random_bytes(6));
$otherJobId = 'test-job-other-' . bin2hex(random_bytes(6));
$otherCompanyId = 'test-company-other-' . bin2hex(random_bytes(6));

$metadata = json_encode(array(
    'InvoiceNo' => 'INV-TEST',
    'payments' => array(array('Amount' => 50, 'Date' => '2026-01-01', 'Type' => 'Manual')),
));

function seedJob($db, $JobId, $CompanyId, $metadata, $shippingPrice)
{
    $db->prepare(
        "INSERT INTO job (JobId, CompanyId, CustomerId, CustomerName, JobNo,
            Tittle, JobType, Description, TotalCost, TotalDays, Shipping,
            ShippingPrice, Status, Class, CreateUserId, ModifyUserId,
            StatusId, Metadata, DueDate)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, NOW())"
    )->execute(array(
        $JobId, $CompanyId, 'test-customer', 'Test Customer', 'JOB-TEST',
        'Sprint 5 integration', 'Internal', 'sandbox', 0, 0, 'Courier',
        $shippingPrice, 'Not started', 'standard', 'test', 'test', 1,
        $metadata,
    ));
}

function seedItem($db, $JobItemId, $JobId, $CompanyId, $unitPrice, $quantity)
{
    $db->prepare(
        "INSERT INTO jobitem (JobItemId, JobId, CompanyId, Measurements,
            Metadata, Size, Colour, ItemName, ItemType, UnitPrice, Quantity,
            SubTotal, CreateUserId, ModifyUserId, StatusId)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)"
    )->execute(array(
        $JobItemId, $JobId, $CompanyId, 'null', 'null', 'M', 'Black',
        'Test garment', 'Skirt', $unitPrice, $quantity,
        $unitPrice * $quantity, 'test', 'test',
    ));
}

function readJob($db, $JobId)
{
    $stmt = $db->prepare("SELECT TotalCost, Metadata, ShippingPrice FROM job WHERE JobId = ?");
    $stmt->execute(array($JobId));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $row['Metadata'] = json_decode($row['Metadata'], true);
    return $row;
}

function cleanup($db, $CompanyId, $JobId, $otherJobId)
{
    $db->prepare("DELETE FROM jobitem WHERE CompanyId = ?")->execute(array($CompanyId));
    $db->prepare("DELETE FROM job WHERE JobId IN (?, ?)")->execute(array($JobId, $otherJobId));
    $db->prepare("DELETE FROM other_info WHERE ParentId = ? AND ItemType = 'SystemSizes'")->execute(array($CompanyId));
}

function seedSizeLibrary($db, $CompanyId, array $sizes)
{
    $db->prepare(
        "INSERT INTO other_info (Name, ItemType, ImageUrl, ParentId, Notes,
            ItemValue, Status, Decription, Rules, ItemCode)
         VALUES ('', 'SystemSizes', '', ?, '', ?, '', '', '', '')"
    )->execute(array($CompanyId, json_encode($sizes)));
}

try {
    seedJob($db, $JobId, $CompanyId, $metadata, 50.00);
    seedJob($db, $otherJobId, $otherCompanyId, $metadata, 10.00);
    seedSizeLibrary($db, $CompanyId, array('S', 'M', 'XXL'));
    $transaction = new JobItemTransaction($db);

    // ── 1. Add: one transaction recalculates totals ──────────────────────
    $model = (object) array(
        'ItemName' => 'Mini skirt', 'ItemType' => 'Skirt', 'Size' => 'M',
        'Colour' => 'Black', 'UnitPrice' => 200.0, 'Quantity' => 2,
        'CompanyId' => $CompanyId, 'JobId' => $JobId,
        'CreateUserId' => 'test', 'ModifyUserId' => 'test', 'StatusId' => 1,
    );
    list($status, $body) = $transaction->add($CompanyId, $JobId, $model);
    check('add: status 200', 200, $status);
    check('add: garment returned', 'Mini skirt', $body['garment']['ItemName'] ?? null);
    check('add: removedJobItemId null', null, $body['removedJobItemId'] ?? null);
    check_num('add: totals.itemsSubtotal', 400.0, $body['totals']['itemsSubtotal'] ?? null);
    check_num('add: totals.totalCost = 400 + 50 shipping', 450.0, $body['totals']['totalCost'] ?? null);
    check_num('add: totals.dueAmount = 450 - 50 paid', 400.0, $body['totals']['dueAmount'] ?? null);
    $jobRow = readJob($db, $JobId);
    check_num('add: job TotalCost persisted', 450.0, $jobRow['TotalCost']);
    check_num('add: metadata paidAmount persisted', 50.0, $jobRow['Metadata']['paidAmount'] ?? null);
    check_num('add: metadata dueAmount persisted', 400.0, $jobRow['Metadata']['dueAmount'] ?? null);
    $addedJobItemId = $body['garment']['JobItemId'] ?? null;

    // ── 2. Update: totals follow the new quantity ────────────────────────
    $model->Quantity = 1;
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('update: status 200', 200, $status);
    check_num('update: totals.itemsSubtotal', 200.0, $body['totals']['itemsSubtotal'] ?? null);
    check_num('update: job TotalCost persisted', 250.0, (float) readJob($db, $JobId)['TotalCost']);

    // ── 2b. Scoped read (Sprint 5 §6) ────────────────────────────────────
    require_once __DIR__ . '/../models/JobItem.php';
    $jobItemModel = new JobItem($db);
    $scoped = $jobItemModel->getScopedById($addedJobItemId, $JobId, $CompanyId);
    check('scoped read: garment returned', 'Mini skirt', $scoped['ItemName'] ?? null);
    check('scoped read: does not embed the parent job', false, array_key_exists('Job', $scoped ?? array()));
    $parent = $jobItemModel->getScopedParentContext($JobId, $CompanyId);
    check('parent context: JobNo returned', 'JOB-TEST', $parent['JobNo'] ?? null);
    check(
        'parent context: minimal keys only',
        array('JobId', 'JobNo'),
        array_keys($parent ?? array())
    );
    check(
        'scoped read: cross-company rejected',
        null,
        $jobItemModel->getScopedById($addedJobItemId, $JobId, $otherCompanyId)
    );
    check(
        'scoped read: cross-job rejected',
        null,
        $jobItemModel->getScopedById($addedJobItemId, $otherJobId, $CompanyId)
    );
    check(
        'scoped read: unknown id rejected',
        null,
        $jobItemModel->getScopedById('no-such-item', $JobId, $CompanyId)
    );

    // ── 2c. Field validation (quantity ≥ 1 whole number; price ≥ 0) ──────
    $model->Quantity = 0;
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('quantity 0 rejected: 400', 400, $status);
    $model->Quantity = 1.5;
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('fractional quantity rejected: 400', 400, $status);
    $model->Quantity = 1;
    $model->UnitPrice = -1;
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('negative unit price rejected: 400', 400, $status);
    $model->UnitPrice = 200.0;
    check_num('rejected updates left totals intact', 250.0, (float) readJob($db, $JobId)['TotalCost']);

    // ── 2d. Size validation against the company size library (audit §7.2) ─
    // The transactional constructor validates by default.
    $model->Size = 'M';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('size in library: 200', 200, $status);
    check('size in library: canonical label persisted', 'M', $body['garment']['Size'] ?? null);

    $model->Size = '  xxl ';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('size case/whitespace-insensitive match: 200', 200, $status);
    check('size canonical spelling persisted', 'XXL', $body['garment']['Size'] ?? null);

    $model->Size = 'NoSuchSize';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('size not in library: 400', 400, $status);
    check_num('rejected size left totals intact', 250.0, (float) readJob($db, $JobId)['TotalCost']);

    $model->Size = 'Measurements ';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('sentinel Measurements canonicalised: 200', 200, $status);
    check('sentinel Measurements persisted canonical', 'Measurements', $body['garment']['Size'] ?? null);

    $model->Size = 'Use Measurements';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('legacy sentinel Use Measurements canonicalised: 200', 200, $status);
    check('legacy sentinel persisted canonical', 'Measurements', $body['garment']['Size'] ?? null);

    $model->Size = 'later';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('sentinel Later canonicalised: 200', 200, $status);
    check('sentinel Later persisted canonical', 'Later', $body['garment']['Size'] ?? null);

    $model->Size = '';
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('empty size allowed: 200', 200, $status);
    check('empty size persisted null', null, $body['garment']['Size'] ?? null);
    $model->Size = 'M';

    // Legacy delegate mode (validateSize = false): unknown labels pass.
    $legacy = new JobItemTransaction($db, false);
    $model->Size = 'Storefront Variation 42';
    list($status, $body) = $legacy->update($CompanyId, $JobId, $addedJobItemId, $model);
    check('legacy delegate accepts unknown size: 200', 200, $status);
    $model->Size = 'M';

    // ── 3. Cross-job / cross-company rejection ───────────────────────────
    list($status, $body) = $transaction->update($otherCompanyId, $otherJobId, $addedJobItemId, $model);
    check('cross-company garment rejected: 404', 404, $status);
    list($status, $body) = $transaction->update($CompanyId, $otherJobId, $addedJobItemId, $model);
    check('cross-job garment rejected: 404', 404, $status);
    // The rejected attempts must not have mutated anything.
    check_num('rejected update left totals intact', 250.0, (float) readJob($db, $JobId)['TotalCost']);

    // ── 4. Rollback failure: totals failure after item mutation ──────────
    JobItemTransaction::$failAfterMutationForTests = true;
    $model->Quantity = 5;
    list($status, $body) = $transaction->update($CompanyId, $JobId, $addedJobItemId, $model);
    JobItemTransaction::$failAfterMutationForTests = false;
    check('rollback: status 500', 500, $status);
    check('rollback: error reported', true, isset($body['error']));
    $jobRow = readJob($db, $JobId);
    check_num('rollback: job TotalCost unchanged', 250.0, $jobRow['TotalCost']);
    $stmt = $db->prepare("SELECT Quantity FROM jobitem WHERE JobItemId = ?");
    $stmt->execute(array($addedJobItemId));
    check('rollback: item quantity unchanged', 1, (int) $stmt->fetch(PDO::FETCH_ASSOC)['Quantity']);

    // ── 5. Remove last garment: totals fall to shipping, metadata kept ───
    list($status, $body) = $transaction->remove($CompanyId, $JobId, $addedJobItemId);
    check('remove: status 200', 200, $status);
    check('remove: garment null', null, $body['garment']);
    check('remove: removedJobItemId returned', $addedJobItemId, $body['removedJobItemId']);
    check_num('remove: totalCost = remaining shipping', 50.0, $body['totals']['totalCost'] ?? null);
    $jobRow = readJob($db, $JobId);
    check_num('remove: job TotalCost persisted', 50.0, $jobRow['TotalCost']);
    check('remove: InvoiceNo preserved', 'INV-TEST', $jobRow['Metadata']['InvoiceNo']);
    check_num('remove: payments preserved', 50.0, $jobRow['Metadata']['paidAmount'] ?? null);
    check_num('remove: dueAmount = 50 - 50', 0.0, $jobRow['Metadata']['dueAmount'] ?? null);
    check('remove: hasDiscount reset', false, $jobRow['Metadata']['hasDiscount']);

    // ── 6. Removing an already-removed garment 404s ──────────────────────
    list($status, $body) = $transaction->remove($CompanyId, $JobId, $addedJobItemId);
    check('double remove: 404', 404, $status);
} finally {
    cleanup($db, $CompanyId, $JobId, $otherJobId);
}

echo "\n{$checks} checks, {$failures} failures\n";
exit($failures === 0 ? 0 : 1);
