<?php
require_once 'JobItem.php';
require_once 'Customer.php';
require_once 'Orders.php';
require_once 'Company.php';
class Job
{
    private $conn;
    private $companyId;
    private $cusmtomers = array();
    private $orders = array();

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // CRUD for address
    public function Create($jobId, $model)
    {

        $query = "INSERT INTO job
        (
            JobId,
            CompanyId,
            CustomerId,
            CustomerName,
            JobNo,
            Tittle,
            JobType,
            Description,
            TotalCost,
            TotalDays,
            Shipping,
            ShippingPrice,
            Status,
            Class,
            CreateUserId,
            ModifyUserId,
            StatusId,
            Metadata,
            DueDate
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
                        $jobId,
                        $model->CompanyId,
                        $model->CustomerId,
                        $model->CustomerName,
                        $model->JobNo,
                        $model->Tittle,
                        $model->JobType,
                        $model->Description,
                        $model->TotalCost,
                        $model->TotalDays,
                        $model->Shipping,
                        $model->ShippingPrice,
                        $model->Status,
                        $model->Class,
                        $model->CreateUserId,
                        $model->ModifyUserId,
                        $model->StatusId,
                        json_encode($model->Metadata),
                        $model->DueDate ?? ''
                    )
                )
            ) {
                return $this->GetById($jobId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    //Update job customer Id
    public function UpdateCustomerId($CustomerId, $JobId)
    {

        $query = "UPDATE job SET CustomerId = ? WHERE JobId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array($CustomerId, $JobId))) {
                return $this->GetById($JobId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    // Update Job Logs, job.Metadata.Logs , where Logs is string array.
    // Fist get the job by Id, then append the logs to the Metadata.Logs array
    public function UpdateLogs($JobId, $Logs)
    {
        $job = $this->GetById($JobId);

        if (!$job || isset($job['ERROR'])) {
            return array("ERROR" => "Job not found.");
        }

        if (!isset($job['Metadata'])) {
            $job['Metadata'] = array();
        }

        if (!isset($job['Metadata']['Logs']) || !is_array($job['Metadata']['Logs'])) {
            $job['Metadata']['Logs'] = array();
        }

        $job['Metadata']['Logs'] = array_merge($job['Metadata']['Logs'], $Logs);
        $query = "UPDATE job SET Metadata = ? WHERE JobId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array(json_encode($job['Metadata']), $JobId))) {
                return $this->GetById($JobId);
            } else {
                return array("ERROR" => "Failed to update job logs.");
            }
        } catch (Exception $e) {
            return array("ERROR" => $e->getMessage());
        }
    }

    public function Update($model)
    {

        $query = "UPDATE job SET
            CompanyId = ? ,
            CustomerId = ? ,
            CustomerName = ? ,
            JobNo = ? ,
            Tittle = ? ,
            JobType = ? ,
            Description = ? ,
            TotalCost = ? ,
            TotalDays = ? ,
            Shipping = ?,
            ShippingPrice = ?,
            StartDate = ? ,
            DueDate = ? ,
            Status = ? ,
            Class = ? ,
            CreateUserId = ? ,
            ModifyUserId = ? ,
            StatusId = ? ,
            Metadata = ? ,
            ModifyDate = now()
            WHERE JobId = ?
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
                        $model->CompanyId,
                        $model->CustomerId,
                        $model->CustomerName,
                        $model->JobNo,
                        $model->Tittle,
                        $model->JobType,
                        $model->Description,
                        $model->TotalCost,
                        $model->TotalDays,
                        $model->Shipping,
                        $model->ShippingPrice,
                        $model->StartDate,
                        $model->DueDate,
                        $model->Status,
                        $model->Class,
                        $model->CreateUserId,
                        $model->ModifyUserId,
                        $model->StatusId,
                        json_encode($model->Metadata),
                        $model->JobId
                    )
                )
            ) {
                return $this->GetById($model->JobId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function loadOrders(string $idList)
    {
        $query = "SELECT
        OrderNo,
        JobId,
        OrdersId,
        Total,
        Paid,
        Due
         FROM orders WHERE JobId in $idList ORDER BY CreateDate DESC";
        //error log query
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array());
            if ($stmt->rowCount()) {
                $this->orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function loadCustomers()
    {
        $CustomerType = 'Customer';
        $query = "SELECT
        CustomerId,
        Name
        FROM customer WHERE  CompanyId=? AND CustomerType = ? ORDER BY ModifyDate DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($this->companyId, $CustomerType));
            if ($stmt->rowCount()) {
                $this->cusmtomers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    private function getCustomerById($CustomerId)
    {
        foreach ($this->cusmtomers as $customer) {
            if ($customer['CustomerId'] == $CustomerId) {
                return $customer;
            }
        }
        return null;
    }
    private function getOrderByJobId($JobId)
    {

        foreach ($this->orders as $order) {
            if ($order['JobId'] == $JobId) {
                $paid = (($order["Paid"] / $order["Total"]) * 100);
                //round to 2 decimal places
                $paid = round($paid, 2);
                $order["PercentagePaid"] = $paid;
                return $order;
            }
        }
        return null;
    }


    public function GetJobsByCompanyId($CompanyId, $StatusId)
    {
        $this->companyId = $CompanyId;
        $this->loadCustomers();

        // Enhanced query with all fields needed for admin UI
        $query = "SELECT
            JobId,
            CompanyId,
            CustomerId,
            CustomerName,
            JobNo,
            Tittle,
            JobType,
            Description,
            TotalCost,
            TotalDays,
            Shipping,
            ShippingPrice,
            Status,
            Class,
            CreateUserId,
            ModifyUserId,
            StatusId,
            Metadata,
            DueDate,
            CreateDate,
            ModifyDate
        FROM job
        WHERE CompanyId = ? AND StatusId = ?
        ORDER BY CreateDate DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($CompanyId, $StatusId));
            $jobs = array();

            if ($stmt->rowCount()) {
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $this->getOrderRange($items);

                foreach ($items as $item) {
                    // Parse metadata JSON
                    $item['Metadata'] = json_decode($item['Metadata'], true);

                    // Add customer details
                    $item['Customer'] = $this->getCustomerById($item['CustomerId']);

                    // Add order details
                    $item['Order'] = $this->getOrderByJobId($item['JobId']);

                    // Calculate derived fields for admin UI
                    $item['IsOverdue'] = $this->isJobOverdue($item['DueDate']);
                    $item['DaysRemaining'] = $this->calculateDaysRemaining($item['DueDate']);
                    $item['FormattedCost'] = number_format($item['TotalCost'], 2);
                    $item['StatusDisplay'] = $this->getStatusDisplay($item['Status'], $item['StatusId']);

                    // Add progress information
                    if ($item['Order']) {
                        $item['PaymentStatus'] = $item['Order']['PaymentStatus'] ?? 'Pending';
                        $item['PercentagePaid'] = $item['Order']['PercentagePaid'] ?? 0;
                    }

                    array_push($jobs, $item);
                }
            }
            return $jobs;
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    // Helper method to check if job is overdue
    private function isJobOverdue($dueDate) {
        if (empty($dueDate)) return false;
        return strtotime($dueDate) < strtotime('today');
    }

    // Helper method to calculate days remaining
    private function calculateDaysRemaining($dueDate) {
        if (empty($dueDate)) return null;
        $today = new DateTime();
        $due = new DateTime($dueDate);
        $diff = $today->diff($due);
        return $due < $today ? -$diff->days : $diff->days;
    }

    // Helper method to get formatted status display
    private function getStatusDisplay($status, $statusId) {
        $statusMap = [
            1 => 'Not Started',
            2 => 'In Progress',
            3 => 'Stuck',
            4 => 'Complete',
            5 => 'Cancelled'
        ];
        return $statusMap[$statusId] ?? $status;
    }

    public function GetJobsByCreateUserId($CreateUserId)
    {
        $query = "
            SELECT
                CustomerId,
                JobNo,
                JobId,
                Status,
                DueDate,
                CreateDate,
                Metadata
            FROM job
            WHERE CreateUserId = ?
            ORDER BY CreateDate DESC
        ";

        $all_items = $this->get_all_items($CreateUserId);
        $jobs = [];

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$CreateUserId]);

            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as $item) {
                $item['Metadata'] = json_decode($item['Metadata'], true);
                $item['JobItems'] = array_values(array_filter($all_items, function ($i) use ($item) {
                    return $i['JobId'] == $item['JobId'];
                })) ?? [];

                $jobs[] = $item;
            }
        } catch (Exception $e) {
            return ["ERROR" => $e->getMessage()];
        }

        return $jobs;
    }

    public function get_all_items($CreateUserId)
    {
        $query = "
            SELECT
                JobId,
                FeaturedImageUrl
            FROM jobitem
            WHERE
                CreateUserId = ?
                AND FeaturedImageUrl IS NOT NULL
                AND FeaturedImageUrl != ''
        ";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$CreateUserId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return ["ERROR" => $e->getMessage()];
        }
    }

    private function getOrderRange(array $jobs)
    {
        $idList = '(';
        foreach ($jobs as $item) {
            $idList .= "'" . $item['JobId'] . "'";
            if ($item != end($jobs)) {
                $idList .= ',';
            }
        }
        $idList .= ')';
        $this->loadOrders($idList);
    }
    public function GetById($JobId)
    {
        $query = "SELECT * FROM job WHERE JobId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($JobId));

            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $data['Metadata'] = json_decode($data['Metadata'], true);
                return $data;
            } else {
                return array("ERROR" => "Job not found.");
            }
        } catch (Exception $e) {
            return array("ERROR" => $e->getMessage());
        }
    }

    public function GetJobById(
        $JobId
    ) {

        $query = "SELECT * FROM job WHERE JobId = ? or JobNo = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($JobId, $JobId));
            // $jobWork = new JobWork($this->conn);
            $user = new Customer($this->conn);
            $order = new Orders($this->conn);
            $jobItem = new JobItem($this->conn);
            $company = new Company($this->conn);

            if ($stmt->rowCount()) {
                $item = $stmt->fetch(PDO::FETCH_ASSOC);
                // $item['Tasks'] =  $jobWork->GetByJobId($item['JobId']);
                $item['Customer'] = $user->getCustomerById($item['CustomerId']);
                $item['Order'] = $order->getByJobId($item['JobId']);
                $item['JobItems'] = $jobItem->getByJobId($item['JobId']);
                $item['Company'] = $company->GetDetailedById($item['CompanyId'], 0, 1);
                $item['CountOrders'] = $this->CountCompanyOrders($item['CompanyId']);
                $item['Metadata'] = json_decode($item['Metadata']);
                return $item;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function CountCompanyOrders($CompanyId)
    {

        $query = "SELECT count(JobId) as Count FROM job WHERE CompanyId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($CompanyId));
            $orders = $stmt->fetch(PDO::FETCH_ASSOC);
            return $orders['Count'];
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    /**
     * Lean, paginated admin jobs page.
     * Returns { items: [{JobId, JobNo, CustomerName, Status}], total } or ERROR array.
     * Filters/search run against job.Status (never StatusId); StatusId = 1
     * remains the active-record condition only.
     * $statusValues must already be normalized LOWERCASE stored values.
     */
    public function GetAdminJobsPage($CompanyId, $statusValues, $search, $limit, $offset)
    {
        $query = "SELECT
            job.JobId,
            job.JobNo,
            COALESCE(
                NULLIF(TRIM(CONCAT_WS(' ', customer.Name, customer.Surname)), ''),
                NULLIF(job.CustomerName, ''),
                '—'
            ) AS CustomerName,
            CASE LOWER(TRIM(job.Status))
                WHEN 'not started' THEN 'Not started'
                WHEN 'in progress' THEN 'In Progress'
                WHEN 'working on it' THEN 'In Progress'
                WHEN 'completed' THEN 'Completed'
                WHEN 'complete' THEN 'Completed'
                WHEN 'done' THEN 'Completed'
                WHEN 'stuck' THEN 'Stuck'
                WHEN 'terminated' THEN 'Terminated'
                WHEN 'paused' THEN 'Paused'
                ELSE COALESCE(NULLIF(TRIM(job.Status), ''), 'Not started')
            END AS Status
        FROM job
        LEFT JOIN customer
            ON customer.CustomerId = job.CustomerId
            AND customer.CompanyId = job.CompanyId
        WHERE job.CompanyId = :CompanyId
            AND job.StatusId = 1";

        $params = array(':CompanyId' => $CompanyId);

        if (!empty($statusValues)) {
            $statusPlaceholders = array();
            foreach ($statusValues as $i => $value) {
                $key = ':status' . $i;
                $statusPlaceholders[] = $key;
                $params[$key] = $value;
            }
            $query .= " AND LOWER(TRIM(job.Status)) IN (" . implode(', ', $statusPlaceholders) . ")";
        }

        if ($search !== '') {
            $query .= " AND (
                job.JobNo LIKE :search
                OR job.CustomerName LIKE :search
                OR customer.Name LIKE :search
                OR customer.Surname LIKE :search
                OR CONCAT_WS(' ', customer.Name, customer.Surname) LIKE :search
                OR customer.PhoneNumber LIKE :search
            )";
            $params[':search'] = '%' . $search . '%';
        }

        $query .= " ORDER BY job.CreateDate DESC, job.JobId DESC
        LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return array("ERROR" => "Unable to load jobs.");
        }

        $countQuery = "SELECT COUNT(*) AS total
        FROM job
        LEFT JOIN customer
            ON customer.CustomerId = job.CustomerId
            AND customer.CompanyId = job.CompanyId
        WHERE job.CompanyId = :CompanyId
            AND job.StatusId = 1";

        $countParams = array(':CompanyId' => $CompanyId);

        if (!empty($statusValues)) {
            $statusPlaceholders = array();
            foreach ($statusValues as $i => $value) {
                $key = ':status' . $i;
                $statusPlaceholders[] = $key;
                $countParams[$key] = $value;
            }
            $countQuery .= " AND LOWER(TRIM(job.Status)) IN (" . implode(', ', $statusPlaceholders) . ")";
        }

        if ($search !== '') {
            $countQuery .= " AND (
                job.JobNo LIKE :search
                OR job.CustomerName LIKE :search
                OR customer.Name LIKE :search
                OR customer.Surname LIKE :search
                OR CONCAT_WS(' ', customer.Name, customer.Surname) LIKE :search
                OR customer.PhoneNumber LIKE :search
            )";
            $countParams[':search'] = '%' . $search . '%';
        }

        try {
            $stmt = $this->conn->prepare($countQuery);
            foreach ($countParams as $key => $value) {
                $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->execute();
            $total = (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        } catch (Exception $e) {
            return array("ERROR" => "Unable to load jobs.");
        }

        return array('items' => $items, 'total' => $total);
    }
}
