<?php
include_once '../../config/Database.php';
include_once '../../models/Job.php';
include_once '../../models/JobItem.php';
include_once '../../models/Customer.php';

$response = array('success' => false, 'message' => '', 'data' => null);
$logs = array(); // string array to store logs

try {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data) {
        throw new Exception('Invalid input data.');
    }

    $database = new Database();
    $db = $database->connect();

    $job = new Job($db);
    $JobId = $database->getGuid($db);
    $count = $job->CountCompanyOrders($data->CompanyId);
    $data->JobNo = 'JOB' . ($count + 1);
    if ($data->Metadata) {
        // Set Invoice No
        $data->Metadata->InvoiceNo = 'INV' . ($count + 1);
    }

    $addedJob = $job->Create($JobId, $data);

    if (!was_job_creation_a_success($addedJob)) {
        throw new Exception('Job creation failed.');
    }

    if (has_job_items($data)) {
        $jobItem = new JobItem($db);
        foreach ($data->JobItems as $item) {
            $item->JobId = $JobId;
            if (!$jobItem->Create($item)) {
                array_push($logs, 'Job item creation failed for item: ' . (isset($item->Name) ? $item->Name : 'Unknown'));
            }
        }
    }

    if (has_customer($data)) {
        $customer = new Customer($db);
        $check = $customer->getByEmail($data->Customer->Email, $data->CompanyId);
        if ($check && !empty($check["CustomerId"])) {
            $job->UpdateCustomerId($check['CustomerId'], $JobId);
            array_push($logs, 'Customer already exists.');
        } else {
            $new_customer = $customer->add($data->Customer);
            if (isset($new_customer['CustomerId'])) {
                $job->UpdateCustomerId($new_customer['CustomerId'], $JobId);
                array_push($logs, 'Customer created successfully.');
            } else {
                array_push($logs, 'Failed to create new customer.');
            }
        }
    }

    $job->UpdateLogs($JobId, $logs);
    $add_full_job = $job->GetJobById($JobId);

    $response['success'] = true;
    $response['message'] = 'Job and job items created successfully.';
    $response['data'] = $add_full_job; // Return the full job details including the customer details
    $response['logs'] = $logs;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    $response['logs'] = $logs; // Return logs even if there was an error
}

echo json_encode($response);

function has_job_items($data)
{
    return isset($data->JobItems) && count($data->JobItems) > 0;
}

function was_job_creation_a_success($addedJob)
{
    return isset($addedJob) && !empty($addedJob['JobId']);
}

function has_customer($data)
{
    return isset($data->Customer) && !empty($data->Customer->Email) && !empty($data->Customer->Name);
}
