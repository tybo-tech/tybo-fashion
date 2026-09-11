<?php

/**
 * Cascade deletion model.
 *
 * A job owns its garments (jobitem), work (jobwork / jobworkuser) and orders
 * (orders / orderproduct); a customer owns its jobs. Removing a job or a
 * customer therefore means removing the whole branch, in ONE database
 * transaction, so the system never accumulates orphaned rows.
 *
 * Kept as a focused model (not folded into Job.php / Customer.php) so those
 * classes stay short and each concern lives in one place.
 *
 * NOTE: identifier scoping (CompanyId + JobId/CustomerId validated against
 * the stored rows) is not authentication. Tenant enforcement is a separate
 * security concern.
 */
class CascadeDeleteException extends Exception {}

class CascadeDelete
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Delete a job and everything that belongs to it.
     *
     * Removes, scoped to the company: jobitem, jobwork, jobworkuser,
     * orderproduct (for the job's orders), orders, then the job itself.
     *
     * @return array [httpStatus, responseBody]
     */
    public function deleteJob($CompanyId, $JobId)
    {
        $CompanyId = is_string($CompanyId) ? trim($CompanyId) : '';
        $JobId = is_string($JobId) ? trim($JobId) : '';
        if ($CompanyId === '') {
            return array(400, array('error' => 'CompanyId is required.'));
        }
        if ($JobId === '') {
            return array(400, array('error' => 'JobId is required.'));
        }

        $this->conn->beginTransaction();
        try {
            $job = $this->lockJob($CompanyId, $JobId);

            $counts = $this->deleteJobBranch($CompanyId, $JobId);

            $stmt = $this->conn->prepare(
                'DELETE FROM job WHERE JobId = ? AND CompanyId = ?'
            );
            $stmt->execute(array($JobId, $CompanyId));
            $counts['jobs'] = $stmt->rowCount();

            $this->conn->commit();
        } catch (CascadeDeleteException $e) {
            $this->conn->rollBack();
            return array($e->getCode() ?: 400, array('error' => $e->getMessage()));
        } catch (Throwable $e) {
            $this->conn->rollBack();
            error_log('cascade delete (job) rolled back: ' . $e->getMessage());
            return array(500, array('error' => 'The job could not be deleted. Nothing was changed.'));
        }

        return array(200, array(
            'deleted' => true,
            'deletedJobId' => $JobId,
            'counts' => $counts,
        ));
    }

    /**
     * Delete a customer, every job they own and every branch under those jobs.
     *
     * Removes, scoped to the company: each job's branch (jobitem, jobwork,
     * jobworkuser, orderproduct, orders), any remaining orders/orderproducts
     * tied directly to the customer, the jobs, then the customer itself.
     *
     * @return array [httpStatus, responseBody]
     */
    public function deleteCustomer($CompanyId, $CustomerId)
    {
        $CompanyId = is_string($CompanyId) ? trim($CompanyId) : '';
        $CustomerId = is_string($CustomerId) ? trim($CustomerId) : '';
        if ($CompanyId === '') {
            return array(400, array('error' => 'CompanyId is required.'));
        }
        if ($CustomerId === '') {
            return array(400, array('error' => 'CustomerId is required.'));
        }

        $this->conn->beginTransaction();
        try {
            $this->lockCustomer($CompanyId, $CustomerId);

            $counts = array(
                'customers' => 0,
                'jobs' => 0,
                'jobItems' => 0,
                'jobWork' => 0,
                'jobWorkUsers' => 0,
                'orders' => 0,
                'orderProducts' => 0,
            );

            // Every job owned by the customer, each with its full branch.
            $stmt = $this->conn->prepare(
                'SELECT JobId FROM job WHERE CustomerId = ? AND CompanyId = ?'
            );
            $stmt->execute(array($CustomerId, $CompanyId));
            $jobIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            foreach ($jobIds as $jobId) {
                $branch = $this->deleteJobBranch($CompanyId, $jobId);
                $counts['jobItems'] += $branch['jobItems'];
                $counts['jobWork'] += $branch['jobWork'];
                $counts['jobWorkUsers'] += $branch['jobWorkUsers'];
                $counts['orders'] += $branch['orders'];
                $counts['orderProducts'] += $branch['orderProducts'];
            }

            $stmt = $this->conn->prepare(
                'DELETE FROM job WHERE CustomerId = ? AND CompanyId = ?'
            );
            $stmt->execute(array($CustomerId, $CompanyId));
            $counts['jobs'] = $stmt->rowCount();

            // Any order/orderproduct tied directly to the customer but not
            // reached through a job (e.g. legacy online orders).
            $counts['orderProducts'] += $this->deleteOrderProductsByCustomer($CustomerId);

            $stmt = $this->conn->prepare(
                'DELETE FROM orders WHERE CustomerId = ? AND CompanyId = ?'
            );
            $stmt->execute(array($CustomerId, $CompanyId));
            $counts['orders'] += $stmt->rowCount();

            $stmt = $this->conn->prepare(
                'DELETE FROM customer WHERE CustomerId = ? AND CompanyId = ?'
            );
            $stmt->execute(array($CustomerId, $CompanyId));
            $counts['customers'] = $stmt->rowCount();

            if ($counts['customers'] < 1) {
                throw new CascadeDeleteException('Customer not found.', 404);
            }

            $this->conn->commit();
        } catch (CascadeDeleteException $e) {
            $this->conn->rollBack();
            return array($e->getCode() ?: 400, array('error' => $e->getMessage()));
        } catch (Throwable $e) {
            $this->conn->rollBack();
            error_log('cascade delete (customer) rolled back: ' . $e->getMessage());
            return array(500, array('error' => 'The customer could not be deleted. Nothing was changed.'));
        }

        return array(200, array(
            'deleted' => true,
            'deletedCustomerId' => $CustomerId,
            'counts' => $counts,
        ));
    }

    // ── Internals ────────────────────────────────────────────────────────

    /**
     * Remove every child row of a single job (but not the job row itself).
     * Caller owns the transaction.
     *
     * @return array<string,int>
     */
    private function deleteJobBranch($CompanyId, $JobId)
    {
        $counts = array(
            'jobItems' => $this->deleteByColumn('jobitem', 'JobId', $JobId),
            'jobWork' => $this->deleteByColumn('jobwork', 'JobId', $JobId),
            'jobWorkUsers' => $this->deleteByColumn('jobworkuser', 'JobId', $JobId),
            'orders' => 0,
            'orderProducts' => 0,
        );

        // Orders for this job, and their line items.
        $stmt = $this->conn->prepare(
            'SELECT OrdersId FROM orders WHERE JobId = ? AND CompanyId = ?'
        );
        $stmt->execute(array($JobId, $CompanyId));
        $orderIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (!empty($orderIds)) {
            $counts['orderProducts'] = $this->deleteByColumnIn('orderproduct', 'OrderId', $orderIds);
        }

        $stmt = $this->conn->prepare(
            'DELETE FROM orders WHERE JobId = ? AND CompanyId = ?'
        );
        $stmt->execute(array($JobId, $CompanyId));
        $counts['orders'] = $stmt->rowCount();

        return $counts;
    }

    private function deleteOrderProductsByCustomer($CustomerId)
    {
        $stmt = $this->conn->prepare(
            'DELETE FROM orderproduct WHERE CustomerId = ?'
        );
        $stmt->execute(array($CustomerId));
        return $stmt->rowCount();
    }

    private function deleteByColumn($table, $column, $value)
    {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$table} WHERE {$column} = ?"
        );
        $stmt->execute(array($value));
        return $stmt->rowCount();
    }

    private function deleteByColumnIn($table, $column, array $values)
    {
        if (empty($values)) {
            return 0;
        }
        $placeholders = implode(', ', array_fill(0, count($values), '?'));
        $stmt = $this->conn->prepare(
            "DELETE FROM {$table} WHERE {$column} IN ({$placeholders})"
        );
        $stmt->execute(array_values($values));
        return $stmt->rowCount();
    }

    /** Lock the job row and verify it belongs to the company. */
    private function lockJob($CompanyId, $JobId)
    {
        $stmt = $this->conn->prepare(
            'SELECT JobId, CompanyId FROM job WHERE JobId = ? FOR UPDATE'
        );
        $stmt->execute(array($JobId));
        $job = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$job || trim((string) $job['CompanyId']) !== trim($CompanyId)) {
            // Same answer for missing and cross-company: 404, never a silent success.
            throw new CascadeDeleteException('Job not found.', 404);
        }
        return $job;
    }

    /** Lock the customer row and verify it belongs to the company. */
    private function lockCustomer($CompanyId, $CustomerId)
    {
        $stmt = $this->conn->prepare(
            'SELECT CustomerId, CompanyId FROM customer WHERE CustomerId = ? FOR UPDATE'
        );
        $stmt->execute(array($CustomerId));
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$customer || trim((string) $customer['CompanyId']) !== trim($CompanyId)) {
            throw new CascadeDeleteException('Customer not found.', 404);
        }
        return $customer;
    }
}
