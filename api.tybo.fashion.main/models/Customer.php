<?php

class Customer
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    private function decodeCustomerData(array $item): array
    {
        $item["Measurements"] = json_decode($item["Measurements"] ?? '[]', true);
        $item["Metadata"] = json_decode($item["Metadata"] ?? '[]', true);
        return $item;
    }

    public function getCustomerById($customerId)
    {
        if (!$customerId) {
            return null;
        }

        // Enhanced query with comprehensive customer data and job analytics
        $query = "SELECT
            c.CustomerId,
            c.CompanyId,
            c.CustomerType,
            c.Name,
            c.Surname,
            c.Email,
            c.PhoneNumber,
            c.Dp,
            c.AddressLineHome,
            c.AddressUrlHome,
            c.AddressLineWork,
            c.AddressUrlWork,
            c.BuildingType,
            c.AddressLine2,
            c.Suburb,
            c.City,
            c.PostalCode,
            c.CompanyName,
            c.UserId,
            c.Measurements,
            c.Metadata,
            c.CreateDate,
            c.ModifyDate,
            c.StatusId,
            c.UserToken,

            -- Job Statistics
            COUNT(j.JobId) as TotalJobs,
            COUNT(CASE WHEN j.Status = 'Completed' THEN 1 END) as CompletedJobs,
            COUNT(CASE WHEN j.Status = 'In Progress' OR j.Status = 'Started' OR j.Status = 'Pending' THEN 1 END) as ActiveJobs,
            COUNT(CASE WHEN j.Status = 'Not started' THEN 1 END) as PendingJobs,
            COUNT(CASE WHEN j.Status = 'Cancelled' THEN 1 END) as CancelledJobs,

            -- Financial Analytics
            COALESCE(SUM(CAST(j.TotalCost as DECIMAL(10,2))), 0) as TotalJobValue,
            COALESCE(AVG(CAST(j.TotalCost as DECIMAL(10,2))), 0) as AverageJobValue,
            COALESCE(MAX(CAST(j.TotalCost as DECIMAL(10,2))), 0) as HighestJobValue,
            COALESCE(MIN(CASE WHEN CAST(j.TotalCost as DECIMAL(10,2)) > 0 THEN CAST(j.TotalCost as DECIMAL(10,2)) END), 0) as LowestJobValue,

            -- Payment Analytics from metadata
            COALESCE(SUM(
                CASE
                    WHEN j.Metadata IS NOT NULL AND j.Metadata != ''
                    THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(j.Metadata, '$.paidAmount')) as DECIMAL(10,2))
                    ELSE 0
                END
            ), 0) as TotalPaidAmount,

            COALESCE(SUM(
                CASE
                    WHEN j.Metadata IS NOT NULL AND j.Metadata != ''
                    THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(j.Metadata, '$.dueAmount')) as DECIMAL(10,2))
                    ELSE CAST(j.TotalCost as DECIMAL(10,2))
                END
            ), 0) as TotalDueAmount,

            -- Activity Tracking
            MIN(j.CreateDate) as FirstJobDate,
            MAX(j.CreateDate) as LastJobDate,
            MAX(j.ModifyDate) as LastActivityDate,

            -- Recent Activity (last 30 days)
            COUNT(CASE WHEN j.CreateDate >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as JobsLast30Days,
            COUNT(CASE WHEN j.ModifyDate >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as ActivityLast30Days,

            -- Shipping Preferences
            GROUP_CONCAT(DISTINCT j.Shipping) as ShippingMethods,

            -- Job Types
            GROUP_CONCAT(DISTINCT j.JobType) as JobTypes

        FROM customer c
        LEFT JOIN job j ON c.CustomerId = j.CustomerId AND j.StatusId = 1
        WHERE c.CustomerId = ? AND c.StatusId = 1
        GROUP BY c.CustomerId, c.CompanyId, c.CustomerType, c.Name, c.Surname, c.Email,
                 c.PhoneNumber, c.Dp, c.AddressLineHome, c.AddressUrlHome, c.AddressLineWork,
                 c.AddressUrlWork, c.BuildingType, c.AddressLine2, c.Suburb, c.City,
                 c.PostalCode, c.CompanyName, c.UserId, c.Measurements, c.Metadata,
                 c.CreateDate, c.ModifyDate, c.StatusId, c.UserToken";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$customerId]);

            if (!$stmt->rowCount()) {
                return null;
            }

            $customer = $stmt->fetch(PDO::FETCH_ASSOC);

            // Decode JSON fields
            $customer['Measurements'] = json_decode($customer['Measurements'] ?? '[]', true);
            $customer['Metadata'] = json_decode($customer['Metadata'] ?? '{}', true);

            // Get detailed job history
            $customer['JobHistory'] = $this->getCustomerJobHistory($customerId);

            // Get payment history
            $customer['PaymentHistory'] = $this->getCustomerPaymentHistory($customerId);

            // Add computed business metrics
            $customer['CustomerLifetimeValue'] = floatval($customer['TotalJobValue']);
            $customer['AverageJobValue'] = floatval($customer['AverageJobValue']);
            $customer['PaymentCompletionRate'] = $customer['TotalJobValue'] > 0
                ? round((floatval($customer['TotalPaidAmount']) / floatval($customer['TotalJobValue'])) * 100, 1)
                : 0;
            $customer['OutstandingBalance'] = floatval($customer['TotalDueAmount']);

            // Customer insights
            $customer['CustomerStatus'] = $this->determineCustomerStatus($customer);
            $customer['CustomerPriority'] = $this->calculateCustomerPriority($customer);
            $customer['ProfileCompleteness'] = $this->calculateDetailedProfileCompleteness($customer);

            // Contact & Address Analysis
            $customer['ContactInfo'] = $this->analyzeContactInfo($customer);
            $customer['AddressInfo'] = $this->analyzeAddressInfo($customer);

            // Activity Analysis
            $customer['ActivityInsights'] = $this->generateActivityInsights($customer);

            // Preferred services and patterns
            $customer['ServicePreferences'] = $this->analyzeServicePreferences($customer);

            // Format dates
            $customer['CreateDateFormatted'] = date('Y-m-d H:i', strtotime($customer['CreateDate']));
            $customer['ModifyDateFormatted'] = date('Y-m-d H:i', strtotime($customer['ModifyDate']));
            $customer['FirstJobDateFormatted'] = $customer['FirstJobDate']
                ? date('Y-m-d H:i', strtotime($customer['FirstJobDate']))
                : null;
            $customer['LastJobDateFormatted'] = $customer['LastJobDate']
                ? date('Y-m-d H:i', strtotime($customer['LastJobDate']))
                : null;
            $customer['LastActivityFormatted'] = $customer['LastActivityDate']
                ? date('Y-m-d H:i', strtotime($customer['LastActivityDate']))
                : 'No activity';

            // Full name for convenience
            $customer['FullName'] = trim($customer['Name'] . ' ' . $customer['Surname']);

            // Customer tenure
            $customer['CustomerTenure'] = $this->calculateCustomerTenure($customer['CreateDate']);

            return $customer;

        } catch (Exception $e) {
            error_log("Customer getCustomerById error: " . $e->getMessage());
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    private function getCustomerJobHistory($customerId)
    {
        $query = "SELECT
            JobId,
            JobNo,
            Tittle,
            JobType,
            Description,
            TotalCost,
            Status,
            DueDate,
            CreateDate,
            ModifyDate,
            Metadata,
            Shipping,
            ShippingPrice
        FROM job
        WHERE CustomerId = ? AND StatusId = 1
        ORDER BY CreateDate DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$customerId]);

            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Process each job to add computed fields
            foreach ($jobs as &$job) {
                $job['Metadata'] = json_decode($job['Metadata'] ?? '{}', true);
                $job['FormattedCost'] = number_format(floatval($job['TotalCost']), 2);
                $job['CreateDateFormatted'] = date('Y-m-d H:i', strtotime($job['CreateDate']));
                $job['DueDateFormatted'] = $job['DueDate'] ? date('Y-m-d', strtotime($job['DueDate'])) : null;
                $job['IsOverdue'] = $job['DueDate'] && strtotime($job['DueDate']) < time();

                // Payment info from metadata
                $job['PaidAmount'] = isset($job['Metadata']['paidAmount']) ? floatval($job['Metadata']['paidAmount']) : 0;
                $job['DueAmount'] = isset($job['Metadata']['dueAmount']) ? floatval($job['Metadata']['dueAmount']) : floatval($job['TotalCost']);
                $job['PaymentStatus'] = $job['DueAmount'] <= 0 ? 'Paid' : ($job['PaidAmount'] > 0 ? 'Partial' : 'Unpaid');
            }

            return $jobs;

        } catch (Exception $e) {
            error_log("Error fetching customer job history: " . $e->getMessage());
            return [];
        }
    }

    private function getCustomerPaymentHistory($customerId)
    {
        $query = "SELECT
            j.JobId,
            j.JobNo,
            j.TotalCost,
            j.Metadata,
            j.CreateDate as JobDate
        FROM job j
        WHERE j.CustomerId = ? AND j.StatusId = 1
        AND j.Metadata IS NOT NULL
        AND JSON_EXTRACT(j.Metadata, '$.payments') IS NOT NULL
        ORDER BY j.CreateDate DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$customerId]);

            $paymentHistory = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $metadata = json_decode($row['Metadata'], true);
                if (isset($metadata['payments']) && is_array($metadata['payments'])) {
                    foreach ($metadata['payments'] as $payment) {
                        $paymentHistory[] = [
                            'JobId' => $row['JobId'],
                            'JobNo' => $row['JobNo'],
                            'Amount' => floatval($payment['Amount']),
                            'Date' => $payment['Date'],
                            'Type' => $payment['Type'] ?? 'Manual',
                            'FormattedAmount' => number_format(floatval($payment['Amount']), 2),
                            'FormattedDate' => date('Y-m-d H:i', strtotime($payment['Date']))
                        ];
                    }
                }
            }

            // Sort by date (most recent first)
            usort($paymentHistory, function($a, $b) {
                return strtotime($b['Date']) - strtotime($a['Date']);
            });

            return $paymentHistory;

        } catch (Exception $e) {
            error_log("Error fetching customer payment history: " . $e->getMessage());
            return [];
        }
    }

    private function calculateDetailedProfileCompleteness($customer)
    {
        $score = 0;
        $maxScore = 12;

        // Basic info (3 points)
        if (!empty($customer['Name'])) $score++;
        if (!empty($customer['Surname'])) $score++;
        if (!empty($customer['Email']) && $customer['Email'] !== 'Na') $score++;

        // Contact info (2 points)
        if (!empty($customer['PhoneNumber'])) $score++;
        if (!empty($customer['Dp'])) $score++;

        // Address info (4 points)
        if (!empty($customer['AddressLineHome'])) $score++;
        if (!empty($customer['City'])) $score++;
        if (!empty($customer['PostalCode'])) $score++;
        if (!empty($customer['Suburb'])) $score++;

        // Measurements (2 points)
        if (!empty($customer['Measurements']) && count($customer['Measurements']) > 0) {
            $measurementScore = 0;
            foreach ($customer['Measurements'] as $measurement) {
                if (!empty($measurement['Value'])) $measurementScore++;
            }
            if ($measurementScore > 0) $score++;
            if ($measurementScore >= 5) $score++; // Bonus for comprehensive measurements
        }

        // Company info (1 point)
        if (!empty($customer['CompanyName'])) $score++;

        return round(($score / $maxScore) * 100);
    }

    private function analyzeContactInfo($customer)
    {
        return [
            'HasEmail' => !empty($customer['Email']) && $customer['Email'] !== 'Na',
            'HasPhone' => !empty($customer['PhoneNumber']),
            'HasProfilePicture' => !empty($customer['Dp']),
            'PreferredContact' => $this->getPreferredContactMethod($customer),
            'ContactCompleteness' => $this->calculateContactCompleteness($customer)
        ];
    }

    private function analyzeAddressInfo($customer)
    {
        $hasHome = !empty($customer['AddressLineHome']);
        $hasWork = !empty($customer['AddressLineWork']);
        $hasComplete = !empty($customer['City']) && !empty($customer['PostalCode']);

        return [
            'HasHomeAddress' => $hasHome,
            'HasWorkAddress' => $hasWork,
            'HasCompleteAddress' => $hasComplete,
            'AddressType' => $customer['BuildingType'] ?? 'Not specified',
            'PrimaryAddress' => $hasHome ? $customer['AddressLineHome'] : ($hasWork ? $customer['AddressLineWork'] : 'No address'),
            'FullAddress' => $this->buildFullAddress($customer)
        ];
    }

    private function generateActivityInsights($customer)
    {
        $insights = [];

        // Activity level
        if ($customer['ActivityLast30Days'] > 3) {
            $insights[] = 'Highly active customer';
        } elseif ($customer['ActivityLast30Days'] > 0) {
            $insights[] = 'Recent activity';
        } else {
            $insights[] = 'No recent activity';
        }

        // Job frequency
        if ($customer['TotalJobs'] > 10) {
            $insights[] = 'Frequent customer';
        } elseif ($customer['TotalJobs'] > 5) {
            $insights[] = 'Regular customer';
        } elseif ($customer['TotalJobs'] > 0) {
            $insights[] = 'Occasional customer';
        } else {
            $insights[] = 'New customer - no jobs yet';
        }

        // Payment behavior
        if ($customer['PaymentCompletionRate'] >= 90) {
            $insights[] = 'Excellent payment history';
        } elseif ($customer['PaymentCompletionRate'] >= 70) {
            $insights[] = 'Good payment history';
        } elseif ($customer['PaymentCompletionRate'] > 0) {
            $insights[] = 'Mixed payment history';
        }

        return $insights;
    }

    private function analyzeServicePreferences($customer)
    {
        $shippingMethods = !empty($customer['ShippingMethods'])
            ? explode(',', $customer['ShippingMethods'])
            : [];
        $jobTypes = !empty($customer['JobTypes'])
            ? explode(',', $customer['JobTypes'])
            : [];

        return [
            'PreferredShipping' => array_unique($shippingMethods),
            'ServiceTypes' => array_unique($jobTypes),
            'AverageOrderValue' => $customer['AverageJobValue'],
            'PreferredOrderSize' => $customer['AverageJobValue'] > 5000 ? 'High-value' :
                                   ($customer['AverageJobValue'] > 2000 ? 'Medium-value' : 'Standard')
        ];
    }

    private function calculateContactCompleteness($customer)
    {
        $score = 0;
        $maxScore = 3;

        if (!empty($customer['Email']) && $customer['Email'] !== 'Na') $score++;
        if (!empty($customer['PhoneNumber'])) $score++;
        if (!empty($customer['Dp'])) $score++;

        return round(($score / $maxScore) * 100);
    }

    private function buildFullAddress($customer)
    {
        $parts = [];

        if (!empty($customer['AddressLineHome'])) $parts[] = $customer['AddressLineHome'];
        if (!empty($customer['AddressLine2'])) $parts[] = $customer['AddressLine2'];
        if (!empty($customer['Suburb'])) $parts[] = $customer['Suburb'];
        if (!empty($customer['City'])) $parts[] = $customer['City'];
        if (!empty($customer['PostalCode'])) $parts[] = $customer['PostalCode'];

        return implode(', ', $parts);
    }

    private function calculateCustomerTenure($createDate)
    {
        $start = new DateTime($createDate);
        $now = new DateTime();
        $diff = $now->diff($start);

        if ($diff->y > 0) {
            return $diff->y . ' year' . ($diff->y > 1 ? 's' : '');
        } elseif ($diff->m > 0) {
            return $diff->m . ' month' . ($diff->m > 1 ? 's' : '');
        } else {
            return $diff->d . ' day' . ($diff->d > 1 ? 's' : '');
        }
    }

    public function getByEmail($email, $companyId)
    {
        $query = "SELECT * FROM customer WHERE Email = ? AND CompanyId = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email, $companyId]);

        if ($stmt->rowCount()) {
            return $this->decodeCustomerData($stmt->fetch(PDO::FETCH_ASSOC));
        }

        return null;
    }

    public function checkIfCustomerExists($email, $companyId)
    {
        if (!$email) return null;

        $query = "SELECT * FROM customer WHERE Email = ? AND CompanyId = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email, $companyId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function add($model)
    {
        $customerId = getUuid($this->conn);
        $userToken = bin2hex(openssl_random_pseudo_bytes(16));
        $hashedPassword = password_hash($model->Password, PASSWORD_BCRYPT);

        $query = "INSERT INTO customer (
            CustomerId, CompanyId, CustomerType, Name, Surname, Email, PhoneNumber, Password, Dp,
            AddressLineHome, Measurements, Metadata, AddressUrlHome, AddressLineWork, AddressUrlWork,
            BuildingType, AddressLine2, Suburb, City, PostalCode, CompanyName, UserId,
            CreateUserId, ModifyUserId, StatusId, UserToken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $customerId,
                $model->CompanyId,
                $model->CustomerType,
                $model->Name,
                $model->Surname,
                $model->Email,
                $model->PhoneNumber,
                $hashedPassword,
                $model->Dp,
                $model->AddressLineHome,
                json_encode($model->Measurements),
                json_encode($model->Metadata),
                $model->AddressUrlHome,
                $model->AddressLineWork,
                $model->AddressUrlWork,
                $model->BuildingType,
                $model->AddressLine2,
                $model->Suburb,
                $model->City,
                $model->PostalCode,
                $model->CompanyName,
                $model->UserId,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId,
                $userToken
            ]);
            return $this->getCustomerById($customerId);
        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    public function update($model)
    {
        // Preserve sensitive/audit columns when the incoming model does not
        // carry them. The focused detail endpoint never returns the password
        // hash or UserToken to the browser, so an edit/save from that flow
        // must not overwrite them with empty values. Existing callers that
        // send a password/token still work unchanged.
        $existing = $this->loadExistingAuthFields($model->CustomerId);
        $password = !empty($model->Password)
            ? password_hash($model->Password, PASSWORD_BCRYPT)
            : $existing['Password'];
        $userToken = !empty($model->UserToken)
            ? $model->UserToken
            : $existing['UserToken'];
        $createUserId = !empty($model->CreateUserId)
            ? $model->CreateUserId
            : $existing['CreateUserId'];
        $modifyUserId = !empty($model->ModifyUserId)
            ? $model->ModifyUserId
            : $existing['ModifyUserId'];

        $query = "UPDATE customer SET
            CompanyId = ?, CustomerType = ?, Name = ?, Surname = ?, Email = ?, PhoneNumber = ?,
            Password = ?, Dp = ?, AddressLineHome = ?, Measurements = ?, Metadata = ?, AddressUrlHome = ?,
            AddressLineWork = ?, AddressUrlWork = ?, BuildingType = ?, AddressLine2 = ?, Suburb = ?, City = ?,
            PostalCode = ?, CompanyName = ?, UserId = ?, CreateUserId = ?, ModifyUserId = ?, StatusId = ?,
            UserToken = ?, ModifyDate = NOW()
        WHERE CustomerId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $model->CompanyId,
                $model->CustomerType,
                $model->Name,
                $model->Surname,
                $model->Email,
                $model->PhoneNumber,
                $password,
                $model->Dp,
                $model->AddressLineHome,
                json_encode($model->Measurements),
                json_encode($model->Metadata),
                $model->AddressUrlHome,
                $model->AddressLineWork,
                $model->AddressUrlWork,
                $model->BuildingType,
                $model->AddressLine2,
                $model->Suburb,
                $model->City,
                $model->PostalCode,
                $model->CompanyName,
                $model->UserId,
                $createUserId,
                $modifyUserId,
                $model->StatusId,
                $userToken,
                $model->CustomerId
            ]);

            $this->updateUser($model, $modifyUserId);
            $data = $this->getCustomerById($model->CustomerId);
            $data["UserUpdate"] = true;
            return $data;

        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    /**
     * Loads the current Password, UserToken, CreateUserId and ModifyUserId for
     * a customer so update() can preserve them when the incoming model omits
     * them. Returns empty strings when the row is missing so update() still
     * behaves predictably.
     */
    private function loadExistingAuthFields($customerId)
    {
        $query = "SELECT Password, UserToken, CreateUserId, ModifyUserId
            FROM customer WHERE CustomerId = ? LIMIT 1";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$customerId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                return array('Password' => '', 'UserToken' => '', 'CreateUserId' => '', 'ModifyUserId' => '');
            }
            return array(
                'Password' => $row['Password'] ?? '',
                'UserToken' => $row['UserToken'] ?? '',
                'CreateUserId' => $row['CreateUserId'] ?? '',
                'ModifyUserId' => $row['ModifyUserId'] ?? '',
            );
        } catch (Exception $e) {
            return array('Password' => '', 'UserToken' => '', 'CreateUserId' => '', 'ModifyUserId' => '');
        }
    }

    public function updateUser($model, $modifyUserId = null)
    {
        $query = "UPDATE user SET
            Name = ?, Surname = ?, Email = ?, PhoneNumber = ?, Dp = ?, AddressLineHome = ?,
            Measurements = ?, Metadata = ?, AddressUrlHome = ?, AddressLineWork = ?, AddressUrlWork = ?,
            ModifyUserId = ?, AddressLine2 = ?, BuildingType = ?, City = ?, CompanyName = ?, PostalCode = ?,
            ModifyDate = NOW()
        WHERE UserId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $model->Name,
                $model->Surname,
                $model->Email,
                $model->PhoneNumber,
                $model->Dp,
                $model->AddressLineHome,
                json_encode($model->Measurements),
                json_encode($model->Metadata),
                $model->AddressUrlHome,
                $model->AddressLineWork,
                $model->AddressUrlWork,
                $modifyUserId !== null ? $modifyUserId : $model->ModifyUserId,
                $model->AddressLine2,
                $model->BuildingType,
                $model->City,
                $model->CompanyName,
                $model->PostalCode,
                $model->UserId
            ]);
            return true;
        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    public function getCustomers($companyId, $customerType)
    {
        $query = "SELECT
            c.CustomerId,
            c.Name,
            c.Surname,
            c.Email,
            c.PhoneNumber,
            c.Dp,
            c.AddressLineHome,
            c.AddressUrlHome,
            c.AddressLineWork,
            c.City,
            c.PostalCode,
            c.CompanyName,
            c.Measurements,
            c.Metadata,
            c.CreateDate,
            c.ModifyDate,
            c.StatusId,

            -- Job Statistics
            COUNT(j.JobId) as TotalJobs,
            COUNT(CASE WHEN j.Status = 'Completed' THEN 1 END) as CompletedJobs,
            COUNT(CASE WHEN j.Status != 'Completed' AND j.Status != 'Cancelled' THEN 1 END) as ActiveJobs,
            COALESCE(SUM(CAST(j.TotalCost as DECIMAL(10,2))), 0) as TotalJobValue,

            -- Payment Statistics from job metadata
            COALESCE(SUM(
                CASE
                    WHEN j.Metadata IS NOT NULL AND j.Metadata != ''
                    THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(j.Metadata, '$.paidAmount')) as DECIMAL(10,2))
                    ELSE 0
                END
            ), 0) as TotalPaidAmount,

            COALESCE(SUM(
                CASE
                    WHEN j.Metadata IS NOT NULL AND j.Metadata != ''
                    THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(j.Metadata, '$.dueAmount')) as DECIMAL(10,2))
                    ELSE CAST(j.TotalCost as DECIMAL(10,2))
                END
            ), 0) as TotalDueAmount,

            -- Recent Activity
            MAX(j.CreateDate) as LastJobDate,
            MAX(j.ModifyDate) as LastActivityDate,

            -- Contact Details
            CASE
                WHEN c.Email IS NOT NULL AND c.Email != '' AND c.Email != 'Na' THEN 'Yes'
                ELSE 'No'
            END as HasEmail,

            CASE
                WHEN c.PhoneNumber IS NOT NULL AND c.PhoneNumber != '' THEN 'Yes'
                ELSE 'No'
            END as HasPhone,

            -- Address Status
            CASE
                WHEN (c.AddressLineHome IS NOT NULL AND c.AddressLineHome != '')
                  OR (c.AddressLineWork IS NOT NULL AND c.AddressLineWork != '') THEN 'Yes'
                ELSE 'No'
            END as HasAddress,

            -- Measurements Status
            CASE
                WHEN c.Measurements IS NOT NULL AND c.Measurements != '' AND c.Measurements != '[]' THEN 'Yes'
                ELSE 'No'
            END as HasMeasurements

        FROM customer c
        LEFT JOIN job j ON c.CustomerId = j.CustomerId AND j.StatusId = 1
        WHERE c.CompanyId = ? AND c.CustomerType = ? AND c.StatusId = 1
        GROUP BY c.CustomerId, c.Name, c.Surname, c.Email, c.PhoneNumber, c.Dp,
                 c.AddressLineHome, c.AddressUrlHome, c.AddressLineWork, c.City,
                 c.PostalCode, c.CompanyName, c.Measurements, c.Metadata,
                 c.CreateDate, c.ModifyDate, c.StatusId
        ORDER BY c.ModifyDate DESC, c.CreateDate DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$companyId, $customerType]);

            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Process each customer to add computed fields and decode JSON
            $processedCustomers = [];
            foreach ($customers as $customer) {
                // Decode JSON fields
                $customer['Measurements'] = json_decode($customer['Measurements'] ?? '[]', true);
                $customer['Metadata'] = json_decode($customer['Metadata'] ?? '{}', true);

                // Add computed business metrics
                $customer['CustomerLifetimeValue'] = floatval($customer['TotalJobValue']);
                $customer['AverageJobValue'] = $customer['TotalJobs'] > 0
                    ? round(floatval($customer['TotalJobValue']) / intval($customer['TotalJobs']), 2)
                    : 0;

                $customer['PaymentCompletionRate'] = $customer['TotalJobValue'] > 0
                    ? round((floatval($customer['TotalPaidAmount']) / floatval($customer['TotalJobValue'])) * 100, 1)
                    : 0;

                $customer['OutstandingBalance'] = floatval($customer['TotalDueAmount']);

                // Determine customer status
                $customer['CustomerStatus'] = $this->determineCustomerStatus($customer);

                // Format dates for better readability
                $customer['CreateDateFormatted'] = date('Y-m-d H:i', strtotime($customer['CreateDate']));
                $customer['LastActivityFormatted'] = $customer['LastActivityDate']
                    ? date('Y-m-d H:i', strtotime($customer['LastActivityDate']))
                    : 'No activity';

                // Add profile completeness score
                $customer['ProfileCompleteness'] = $this->calculateProfileCompleteness($customer);

                // Add customer priority based on value and activity
                $customer['CustomerPriority'] = $this->calculateCustomerPriority($customer);

                // Add full name for convenience
                $customer['FullName'] = trim($customer['Name'] . ' ' . $customer['Surname']);

                // Add preferred contact method
                $customer['PreferredContact'] = $this->getPreferredContactMethod($customer);

                $processedCustomers[] = $customer;
            }

            // Log comprehensive summary for debugging
            error_log(sprintf(
                "Customer List Query - Company: %s, Type: %s, Found: %d customers, " .
                "Total Value: R%.2f, Active Customers: %d",
                $companyId,
                $customerType,
                count($processedCustomers),
                array_sum(array_column($processedCustomers, 'CustomerLifetimeValue')),
                count(array_filter($processedCustomers, function($c) {
                    return $c['ActiveJobs'] > 0;
                }))
            ));

            return $processedCustomers;

        } catch (Exception $e) {
            error_log("Customer getCustomers error: " . $e->getMessage());
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    private function determineCustomerStatus($customer)
    {
        if ($customer['TotalJobs'] == 0) {
            return 'New';
        } elseif ($customer['ActiveJobs'] > 0) {
            return 'Active';
        } elseif ($customer['OutstandingBalance'] > 0) {
            return 'Outstanding Payment';
        } elseif ($customer['LastActivityDate'] && strtotime($customer['LastActivityDate']) > strtotime('-6 months')) {
            return 'Recent';
        } else {
            return 'Inactive';
        }
    }

    private function calculateProfileCompleteness($customer)
    {
        $score = 0;
        $maxScore = 7;

        // Basic info (2 points)
        if (!empty($customer['Name'])) $score++;
        if (!empty($customer['Surname'])) $score++;

        // Contact info (2 points)
        if ($customer['HasEmail'] === 'Yes') $score++;
        if ($customer['HasPhone'] === 'Yes') $score++;

        // Address info (1 point)
        if ($customer['HasAddress'] === 'Yes') $score++;

        // Measurements (1 point)
        if ($customer['HasMeasurements'] === 'Yes') $score++;

        // Profile picture (1 point)
        if (!empty($customer['Dp'])) $score++;

        return round(($score / $maxScore) * 100);
    }

    private function calculateCustomerPriority($customer)
    {
        $value = floatval($customer['TotalJobValue']);
        $activeJobs = intval($customer['ActiveJobs']);
        $recentActivity = $customer['LastActivityDate'] &&
                         strtotime($customer['LastActivityDate']) > strtotime('-3 months');

        if ($value > 10000 || $activeJobs > 2) {
            return 'High';
        } elseif ($value > 3000 || $activeJobs > 0 || $recentActivity) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    private function getPreferredContactMethod($customer)
    {
        $hasEmail = !empty($customer['Email']) && $customer['Email'] !== 'Na';
        $hasPhone = !empty($customer['PhoneNumber']);

        if ($hasEmail && $hasPhone) {
            return 'Email & Phone';
        } elseif ($hasEmail) {
            return 'Email';
        } elseif ($hasPhone) {
            return 'Phone';
        } else {
            return 'No Contact Info';
        }
    }


    /**
     * One lean, server-paginated page of admin customers for
     * /customer/get-admin-customers.php (Sprint 2).
     *
     * Returns exactly four display fields per row (CustomerId, CustomerName,
     * PhoneNumber, Email) plus a matching total. No job join, financial
     * calculation, JSON extraction/decoding, address, measurements, avatar
     * or analytics work happens on this path. getCustomers() above remains
     * untouched for the New Job embedded picker and rollback.
     *
     * Search is server-side and case-insensitive under the DB collation,
     * covering name, surname, combined full name, phone and email, via
     * parameterized LIKE '%term%'. Pagination is deterministic:
     * ModifyDate DESC, CreateDate DESC, CustomerId DESC.
     */
    public function GetAdminCustomersPage($companyId, $search, $limit, $offset)
    {
        $query = "SELECT
            c.CustomerId,
            COALESCE(
                NULLIF(TRIM(CONCAT_WS(' ', c.Name, c.Surname)), ''),
                '—'
            ) AS CustomerName,
            COALESCE(NULLIF(TRIM(c.PhoneNumber), ''), '—') AS PhoneNumber,
            COALESCE(
                NULLIF(NULLIF(TRIM(c.Email), ''), 'Na'),
                '—'
            ) AS Email
        FROM customer c
        WHERE c.CompanyId = :CompanyId
            AND c.CustomerType = 'Customer'
            AND c.StatusId = 1";

        $params = array(':CompanyId' => $companyId);

        if ($search !== '') {
            $query .= " AND (
                c.Name LIKE :search
                OR c.Surname LIKE :search
                OR CONCAT_WS(' ', c.Name, c.Surname) LIKE :search
                OR c.PhoneNumber LIKE :search
                OR c.Email LIKE :search
            )";
            $params[':search'] = '%' . $search . '%';
        }

        $query .= " ORDER BY c.ModifyDate DESC, c.CreateDate DESC, c.CustomerId DESC
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
            return array("ERROR" => "Unable to load customers.");
        }

        $countQuery = "SELECT COUNT(*) AS total
        FROM customer c
        WHERE c.CompanyId = :CompanyId
            AND c.CustomerType = 'Customer'
            AND c.StatusId = 1";

        $countParams = array(':CompanyId' => $companyId);

        if ($search !== '') {
            $countQuery .= " AND (
                c.Name LIKE :search
                OR c.Surname LIKE :search
                OR CONCAT_WS(' ', c.Name, c.Surname) LIKE :search
                OR c.PhoneNumber LIKE :search
                OR c.Email LIKE :search
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
            return array("ERROR" => "Unable to load customers.");
        }

        return array('items' => $items, 'total' => $total);
    }

    public function getCustomersByUser($userId)
    {
        $query = "SELECT * FROM customer WHERE UserId = ? ORDER BY ModifyDate DESC";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$userId]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            return array_map([$this, 'decodeCustomerData'], $results);
        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    /**
     * Focused admin customer detail for /customer/get-admin-customer-detail.php
     * (Sprint 3). Additive: legacy getCustomerById()/get.php remain untouched.
     *
     * Returns the editable customer fields the existing form round-trips
     * (full row + decoded Measurements/Metadata + FullName) plus only the
     * analytics the new detail page renders. It deliberately does NOT return
     * job/payment history arrays, contact/address/activity/service-preference
     * analysis, or any field the page does not consume.
     *
     * Analytics distinguish null/missing from legitimate numeric zero:
     *   - TotalJobs/ActiveJobs/CompletedJobs are integers (0 when none).
     *   - CustomerLifetimeValue/OutstandingBalance are floats (0.0 when none).
     *   - PaymentCompletionRate is null when there is no job value (never a
     *     fabricated 0), else a percentage.
     *   - ProfileCompleteness is null when it cannot be computed, else a
     *     percentage.
     *   - LastActivityDate is null when there is no activity.
     *
     * Lookup is scoped by both CompanyId and CustomerId.
     */
    public function GetAdminCustomerDetail($companyId, $customerId)
    {
        $query = "SELECT
            c.CustomerId,
            c.CompanyId,
            c.CustomerType,
            c.Name,
            c.Surname,
            c.Email,
            c.PhoneNumber,
            c.Dp,
            c.AddressLineHome,
            c.AddressUrlHome,
            c.AddressLineWork,
            c.AddressUrlWork,
            c.BuildingType,
            c.AddressLine2,
            c.Suburb,
            c.City,
            c.PostalCode,
            c.CompanyName,
            c.UserId,
            c.Measurements,
            c.Metadata,
            c.CreateDate,
            c.ModifyDate,
            c.StatusId,
            c.UserToken,

            -- Job counts (integers; 0 when none)
            COUNT(j.JobId) AS TotalJobs,
            COUNT(CASE WHEN j.Status = 'Completed' THEN 1 END) AS CompletedJobs,
            COUNT(CASE WHEN j.Status IN ('In Progress', 'Started', 'Pending') THEN 1 END) AS ActiveJobs,

            -- Financial totals (floats; 0.0 when none)
            COALESCE(SUM(CAST(j.TotalCost AS DECIMAL(10,2))), 0) AS TotalJobValue,
            COALESCE(SUM(
                CASE
                    WHEN j.Metadata IS NOT NULL AND j.Metadata != ''
                    THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(j.Metadata, '$.paidAmount')) AS DECIMAL(10,2))
                    ELSE 0
                END
            ), 0) AS TotalPaidAmount,
            COALESCE(SUM(
                CASE
                    WHEN j.Metadata IS NOT NULL AND j.Metadata != ''
                    THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(j.Metadata, '$.dueAmount')) AS DECIMAL(10,2))
                    ELSE CAST(j.TotalCost AS DECIMAL(10,2))
                END
            ), 0) AS TotalDueAmount,

            -- Last activity (null when none)
            MAX(j.ModifyDate) AS LastActivityDate

        FROM customer c
        LEFT JOIN job j ON c.CustomerId = j.CustomerId AND j.StatusId = 1
        WHERE c.CustomerId = :CustomerId
            AND c.CompanyId = :CompanyId
            AND c.StatusId = 1
        GROUP BY c.CustomerId, c.CompanyId, c.CustomerType, c.Name, c.Surname, c.Email,
                 c.PhoneNumber, c.Dp, c.AddressLineHome, c.AddressUrlHome, c.AddressLineWork,
                 c.AddressUrlWork, c.BuildingType, c.AddressLine2, c.Suburb, c.City,
                 c.PostalCode, c.CompanyName, c.UserId, c.Measurements, c.Metadata,
                 c.CreateDate, c.ModifyDate, c.StatusId, c.UserToken";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':CustomerId', $customerId, PDO::PARAM_STR);
            $stmt->bindValue(':CompanyId', $companyId, PDO::PARAM_STR);
            $stmt->execute();

            if (!$stmt->rowCount()) {
                return null;
            }

            $customer = $stmt->fetch(PDO::FETCH_ASSOC);

            // Decode JSON fields
            $customer['Measurements'] = json_decode($customer['Measurements'] ?? '[]', true);
            $customer['Metadata'] = json_decode($customer['Metadata'] ?? '{}', true);

            // Full name for convenience (matches the form's single Name input)
            $customer['FullName'] = trim($customer['Name'] . ' ' . $customer['Surname']);

            // Financial analytics — floats, 0.0 when none
            $customer['CustomerLifetimeValue'] = floatval($customer['TotalJobValue']);
            $customer['OutstandingBalance'] = floatval($customer['TotalDueAmount']);

            // Payment rate — null when there is no job value (never a fabricated 0)
            $customer['PaymentCompletionRate'] = floatval($customer['TotalJobValue']) > 0
                ? round((floatval($customer['TotalPaidAmount']) / floatval($customer['TotalJobValue'])) * 100, 1)
                : null;

            // Profile completeness — null when it cannot be computed
            $customer['ProfileCompleteness'] = $this->calculateAdminProfileCompleteness($customer);

            // Last activity — null when none
            $customer['LastActivityDate'] = $customer['LastActivityDate'] ?: null;

            return $customer;

        } catch (Exception $e) {
            error_log("Customer GetAdminCustomerDetail error: " . $e->getMessage());
            return array("ERROR" => "Unable to load customer.");
        }
    }

    /**
     * Profile completeness for the focused detail endpoint. Returns null when
     * it cannot be computed (no name), else a percentage 0-100. Only counts
     * fields the detail page actually renders.
     */
    private function calculateAdminProfileCompleteness($customer)
    {
        if (empty($customer['Name'])) {
            return null;
        }

        $score = 0;
        $maxScore = 6;

        if (!empty($customer['Surname'])) $score++;
        if (!empty($customer['Email']) && $customer['Email'] !== 'Na') $score++;
        if (!empty($customer['PhoneNumber'])) $score++;
        if (!empty($customer['AddressLineHome'])) $score++;
        if (!empty($customer['City'])) $score++;

        $hasMeasurement = false;
        if (!empty($customer['Measurements']) && is_array($customer['Measurements'])) {
            foreach ($customer['Measurements'] as $measurement) {
                if (!empty($measurement['Value'])) {
                    $hasMeasurement = true;
                    break;
                }
            }
        }
        if ($hasMeasurement) $score++;

        return round(($score / $maxScore) * 100);
    }
}
