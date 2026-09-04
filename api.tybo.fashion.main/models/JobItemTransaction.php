<?php

require_once 'JobTotals.php';
require_once __DIR__ . '/../common/common.php';

/**
 * Thrown for client errors (400/404/405) detected inside a transaction.
 * The caller rolls back and re-serialises the status/body.
 */
class JobItemTransactionException extends Exception
{
}

/**
 * Sprint 5 §6 — atomic job-item mutations with server-side totals.
 *
 * Add/update/remove each run in ONE database transaction that also
 * recalculates and persists the parent job totals, and returns the
 * JobGarmentMutationResponse contract:
 *   { garment, removedJobItemId, totals }
 * Complete success is never reported when the totals update fails — any
 * Throwable rolls the whole transaction back.
 *
 * Additive: the legacy endpoints (add-job-item.php, update-job-item.php,
 * delete-job-item.php) remain untouched for rollback.
 *
 * NOTE (Sprint 5 §7): this is identifier scoping (CompanyId/JobId/JobItemId
 * validated against stored rows), not authentication. Tenant enforcement
 * language is intentionally avoided until the security sprint lands.
 */
class JobItemTransaction
{
    /**
     * Test hook: when true, a failure is injected after the item mutation
     * and before the totals update, to prove rollback behaviour. Never set
     * to true outside tests.
     * @var bool
     */
    public static $failAfterMutationForTests = false;

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * @param string $CompanyId
     * @param string $JobId
     * @param object $model Decoded request body (full job item model).
     * @return array [httpStatus, responseBody]
     */
    public function add($CompanyId, $JobId, $model)
    {
        return $this->mutate(
            $CompanyId,
            $JobId,
            null,
            false,
            function ($job) use ($model, $CompanyId, $JobId) {
                $this->assertNumeric($model->UnitPrice ?? null, 'UnitPrice');
                $this->assertNumeric($model->Quantity ?? null, 'Quantity');

                $JobItemId = getUuid($this->conn);
                $subTotal = round(
                    ((float) $model->UnitPrice) * ((float) $model->Quantity),
                    2
                );
                $stmt = $this->conn->prepare(
                    "INSERT INTO jobitem(
                        JobItemId, JobId, CompanyId, FeaturedImageUrl,
                        Measurements, Metadata, Size, Colour, ItemName,
                        ItemType, UnitPrice, Quantity, SubTotal,
                        CreateUserId, ModifyUserId, StatusId
                    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                );
                $stmt->execute(array(
                    $JobItemId,
                    $JobId,
                    $CompanyId,
                    $model->FeaturedImageUrl ?? null,
                    json_encode($model->Measurements ?? null),
                    json_encode($model->Metadata ?? null),
                    $model->Size ?? null,
                    $model->Colour ?? null,
                    $model->ItemName ?? null,
                    $model->ItemType ?? null,
                    number_format((float) $model->UnitPrice, 2, '.', ''),
                    $model->Quantity,
                    $subTotal,
                    $model->CreateUserId ?? null,
                    $model->ModifyUserId ?? null,
                    $model->StatusId ?? 1,
                ));
                return $JobItemId;
            }
        );
    }

    /**
     * @param string $CompanyId
     * @param string $JobId
     * @param string $JobItemId Required: identifies the garment to update.
     * @param object $model Decoded request body (full job item model).
     * @return array [httpStatus, responseBody]
     */
    public function update($CompanyId, $JobId, $JobItemId, $model)
    {
        return $this->mutate(
            $CompanyId,
            $JobId,
            $JobItemId,
            true,
            function ($job) use ($JobItemId, $model) {
                $this->assertNumeric($model->UnitPrice ?? null, 'UnitPrice');
                $this->assertNumeric($model->Quantity ?? null, 'Quantity');

                $subTotal = round(
                    ((float) $model->UnitPrice) * ((float) $model->Quantity),
                    2
                );
                $stmt = $this->conn->prepare(
                    "UPDATE jobitem SET
                        FeaturedImageUrl = ?, Measurements = ?, Metadata = ?,
                        Size = ?, Colour = ?, ItemName = ?, ItemType = ?,
                        UnitPrice = ?, Quantity = ?, SubTotal = ?,
                        ModifyUserId = ?, ModifyDate = NOW(), StatusId = ?
                    WHERE JobItemId = ?"
                );
                $stmt->execute(array(
                    $model->FeaturedImageUrl ?? null,
                    json_encode($model->Measurements ?? null),
                    json_encode($model->Metadata ?? null),
                    $model->Size ?? null,
                    $model->Colour ?? null,
                    $model->ItemName ?? null,
                    $model->ItemType ?? null,
                    number_format((float) $model->UnitPrice, 2, '.', ''),
                    $model->Quantity,
                    $subTotal,
                    $model->ModifyUserId ?? null,
                    $model->StatusId ?? 1,
                    $JobItemId,
                ));
                return $JobItemId;
            }
        );
    }

    /**
     * @param string $CompanyId
     * @param string $JobId
     * @param string $JobItemId Required: identifies the garment to remove.
     * @return array [httpStatus, responseBody]
     */
    public function remove($CompanyId, $JobId, $JobItemId)
    {
        return $this->mutate(
            $CompanyId,
            $JobId,
            $JobItemId,
            true,
            function ($job) use ($JobItemId) {
                $stmt = $this->conn->prepare(
                    "DELETE FROM jobitem WHERE JobItemId = ?"
                );
                $stmt->execute(array($JobItemId));
                if ($stmt->rowCount() < 1) {
                    // Never report success for a removal that removed
                    // nothing (already removed / vanished mid-flight).
                    throw new JobItemTransactionException('Garment not found in this job.', 404);
                }
                return null;
            }
        );
    }

    // ── Internals ────────────────────────────────────────────────────────

    /**
     * Shared transaction: lock job → scope-check → mutate item →
     * recalculate totals from the persisted rows → persist totals →
     * commit. Any failure rolls everything back.
     *
     * @param bool $requireItem When true, a valid non-empty JobItemId is
     *                          mandatory (update/remove); add passes false.
     */
    private function mutate($CompanyId, $JobId, $JobItemId, $requireItem, $itemMutation)
    {
        if (!is_string($CompanyId) || trim($CompanyId) === '') {
            return array(400, array('error' => 'CompanyId is required.'));
        }
        if (!is_string($JobId) || trim($JobId) === '') {
            return array(400, array('error' => 'JobId is required.'));
        }
        if (
            ($requireItem || $JobItemId !== null)
            && (!is_string($JobItemId) || trim($JobItemId) === '')
        ) {
            return array(400, array('error' => 'JobItemId is required.'));
        }

        $this->conn->beginTransaction();
        try {
            // Lock the parent job row for the duration of the mutation.
            $stmt = $this->conn->prepare(
                "SELECT JobId, CompanyId, ShippingPrice, Metadata, TotalCost
                 FROM job WHERE JobId = ? FOR UPDATE"
            );
            $stmt->execute(array($JobId));
            $job = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$job || trim((string) $job['CompanyId']) !== trim($CompanyId)) {
                // Same answer for missing job and cross-company job: 404,
                // never a silent success.
                throw new JobItemTransactionException('Job not found.', 404);
            }

            if ($JobItemId !== null) {
                $stmt = $this->conn->prepare(
                    "SELECT JobItemId, JobId, CompanyId FROM jobitem
                     WHERE JobItemId = ? FOR UPDATE"
                );
                $stmt->execute(array($JobItemId));
                $existing = $stmt->fetch(PDO::FETCH_ASSOC);
                // Cross-job and cross-company garment IDs are rejected.
                if (
                    !$existing
                    || trim((string) $existing['JobId']) !== trim($JobId)
                    || trim((string) $existing['CompanyId']) !== trim($CompanyId)
                ) {
                    throw new JobItemTransactionException('Garment not found in this job.', 404);
                }
            }

            $removedJobItemId = null;
            $resultJobItemId = $itemMutation($job);

            if ($resultJobItemId === null) {
                $removedJobItemId = $JobItemId;
            }

            if (self::$failAfterMutationForTests) {
                // Simulates the totals update failing after the item
                // mutation succeeded — the response must be a failure and
                // the item mutation must be rolled back.
                throw new RuntimeException('Injected totals failure (test).');
            }

            // Recalculate from the persisted state, never from the request.
            $stmt = $this->conn->prepare(
                "SELECT UnitPrice, Quantity FROM jobitem WHERE JobId = ?"
            );
            $stmt->execute(array($JobId));
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $metadata = json_decode((string) $job['Metadata'], true);
            if (!is_array($metadata)) {
                $metadata = array();
            }
            $totals = JobTotals::calculate($items, $metadata, $job['ShippingPrice']);
            $newMetadata = JobTotals::applyTotalsToMetadata($metadata, $totals);

            $stmt = $this->conn->prepare(
                "UPDATE job SET TotalCost = ?, Metadata = ?, ModifyDate = NOW()
                 WHERE JobId = ?"
            );
            $stmt->execute(array(
                $totals['totalCost'],
                json_encode($newMetadata),
                $JobId,
            ));

            $this->conn->commit();
        } catch (JobItemTransactionException $e) {
            $this->conn->rollBack();
            return array($e->getCode() ?: 400, array('error' => $e->getMessage()));
        } catch (Throwable $e) {
            // Totals failure must never be reported as success.
            $this->conn->rollBack();
            error_log('job-item transaction rolled back: ' . $e->getMessage());
            return array(500, array('error' => 'The garment change could not be saved. Nothing was changed.'));
        }

        $garment = $resultJobItemId !== null
            ? $this->readGarment($resultJobItemId)
            : null;

        return array(200, array(
            'garment' => $garment,
            'removedJobItemId' => $removedJobItemId,
            'totals' => $totals,
        ));
    }

    private function readGarment($JobItemId)
    {
        $stmt = $this->conn->prepare(
            "SELECT * FROM jobitem WHERE JobItemId = ?"
        );
        $stmt->execute(array($JobItemId));
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($item) {
            $item['Measurements'] = json_decode($item['Measurements']);
            $item['Metadata'] = json_decode($item['Metadata']);
        }
        return $item;
    }

    private function assertNumeric($value, $field)
    {
        if ($value === null || !is_numeric($value) || (float) $value < 0) {
            throw new JobItemTransactionException($field . ' must be a non-negative number.', 400);
        }
    }
}
