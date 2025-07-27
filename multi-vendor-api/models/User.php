<?php
require_once 'Company.php';
// require_once 'Product.php';

class User
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function add(
        $model
    ) {
        if ($this->getByEmail($model->Email) > 0) {
            return "user already exists";
        }
        $UserId = getUuid($this->conn);
        $UserToken = '';
        $query = "INSERT INTO user(
            UserId,
            CompanyId,
            UserType,
            Name,
            Surname,
            Email,
            PhoneNumber,
            Password,
            Dp,
            AddressLineHome,
            Measurements,
            AddressUrlHome,
            AddressLineWork,
            AddressUrlWork,
            CreateUserId,
            ModifyUserId,
            StatusId,
            UserToken,
            ReferralCode,
            ParentReferralCode,
            AddressLine2,
            BuildingType,
            City,
            CompanyName,
            PostalCode,
            Suburb,
            Metadata
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
                        $UserId,
                        $model->CompanyId,
                        $model->UserType,
                        $model->Name,
                        $model->Surname,
                        $model->Email,
                        $model->PhoneNumber,
                        $model->Password,
                        $model->Dp,
                        $model->AddressLineHome,
                        json_encode($model->Measurements),
                        $model->AddressUrlHome,
                        $model->AddressLineWork,
                        $model->AddressUrlWork,
                        $model->CreateUserId,
                        $model->ModifyUserId,
                        $model->StatusId,
                        $UserToken,
                        $model->ReferralCode,
                        $model->ParentReferralCode,
                        $model->AddressLine2,
                        $model->BuildingType,
                        $model->City,
                        $model->CompanyName,
                        $model->PostalCode,
                        $model->Suburb,
                        json_encode($model->Metadata)
                    )
                )
            ) {
                return $this->getUserById($UserId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function Update(
        $model
    ) {
        $query = "UPDATE
        user
    SET
    CompanyId = ?,
    UserType = ?,
    Name = ?,
    Surname = ?,
    Email = ?,
    PhoneNumber = ?,
    Password = ?,
    Dp = ?,
    AddressLineHome= ?,
    Measurements= ?,
    AddressUrlHome= ?,
    AddressLineWork= ?,
    AddressUrlWork= ?,
    CreateUserId = ?,
    ModifyUserId = ?,
    StatusId = ?,
    UserToken = ?,
    ReferralCode = ?,
    ParentReferralCode =?,
    AddressLine2=?,
    BuildingType=?,
    City=?,
    CompanyName=?,
    PostalCode=?,
    Suburb=?,
    Metadata=?,
    ModifyDate = NOW()
    WHERE
    UserId = ?
         ";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
                        $model->CompanyId,
                        $model->UserType,
                        $model->Name,
                        $model->Surname,
                        $model->Email,
                        $model->PhoneNumber,
                        $model->Password,
                        $model->Dp,
                        $model->AddressLineHome,
                        json_encode($model->Measurements),
                        $model->AddressUrlHome,
                        $model->AddressLineWork,
                        $model->AddressUrlWork,
                        $model->CreateUserId,
                        $model->ModifyUserId,
                        $model->StatusId,
                        $model->UserToken,
                        $model->ReferralCode,
                        $model->ParentReferralCode,
                        $model->AddressLine2,
                        $model->BuildingType,
                        $model->City,
                        $model->CompanyName,
                        $model->PostalCode,
                        $model->Suburb,
                        json_encode($model->Metadata),
                        $model->UserId

                    )
                )
            ) {
                $this->UpdateCustomer($model);
                return $this->getUserById($model->UserId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function UpdateCustomer(
        $model
    ) {
        $query = "UPDATE
        customer
    SET
    Name = ?,
    Surname = ?,
    Email = ?,
    PhoneNumber = ?,
    Dp = ?,
    AddressLineHome= ?,
    Measurements= ?,
    Metadata= ?,
    AddressUrlHome= ?,
    AddressLineWork= ?,
    AddressUrlWork= ?,
    BuildingType= ?,
     AddressLine2= ?,
     Suburb= ?,
     City= ?,
     PostalCode= ?,
     CompanyName= ?,
    ModifyUserId = ?,
    ModifyDate = NOW()
    WHERE
    UserId = ?
         ";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
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
                        $model->BuildingType,
                        $model->AddressLine2,
                        $model->Suburb,
                        $model->City,
                        $model->PostalCode,
                        $model->CompanyName,
                        $model->ModifyUserId,
                        $model->UserId

                    )
                )
            ) {
                return true;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function getUserById($UserId)
    {
        if (!isset($UserId)) {
            return null;
        }
        $query = "SELECT * FROM user WHERE UserId =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($UserId));

        if ($stmt->rowCount()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $result["Measurements"] = json_decode($result["Measurements"]);
            $result["Metadata"] = json_decode($result["Metadata"]);
            $result["Favorites"] = $this->my_favs($result);
            return $result;
        }
    }
    public function draft_order($UserId)
    {
        if (!isset($UserId)) {
            return null;
        }
        $query = "SELECT * FROM user WHERE JSON_UNQUOTE(JSON_EXTRACT(Metadata, '$.DraftOrderId')) = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($UserId));

        if ($stmt->rowCount()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $result["Measurements"] = json_decode($result["Measurements"]);
            $result["Metadata"] = json_decode($result["Metadata"]);
            return $result;
        }
    }
    public function getUsers($CompanyId, $UserType)
    {
        if (empty($CompanyId)) {
            return array("ERROR", "Invalid Request, CompanyId is required");
        }
        $query = "SELECT 
        UserId ,
        CompanyId,
        UserType,
        Name,
        Surname,
        Email,
        PhoneNumber
         FROM user WHERE CompanyId ='$CompanyId'";
        if (!empty($UserType)) {
            $query .= " AND UserType = '$UserType' ";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array());

        if ($stmt->rowCount()) {
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }


    public function getByEmail($Email)
    {
        $query = "SELECT * FROM user WHERE Email =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($Email));

        if ($stmt->rowCount()) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user && !empty($user['UserId'])) {
                $user["Measurements"] = json_decode($user["Measurements"]);
                $user["Metadata"] = json_decode($user["Metadata"]);
                $user["Password"] = null;
                $user["UserToken"] = $this->generatePasswordResetKey($user['UserId']);
            }
            return $user;
        }
        return null;
    }
    function generatePasswordResetKey($UserId)
    {
        $key = md5(uniqid($UserId, true));
        $query = "UPDATE user SET UserToken = ? WHERE UserId = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($key, $UserId));
        return $key;
    }
    public function getUserByEmailandPassword($email, $password)
    {
        $query = "SELECT  * FROM user WHERE Email =  ? AND BINARY Password = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($email, $password));

        if ($stmt->rowCount()) {
            $company = new Company($this->conn);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!empty($result['CompanyId'])) {
                $result['Company'] = $company->GetById($result['CompanyId']);
            }
            $result["Measurements"] = json_decode($result["Measurements"]);
            $result["Metadata"] = json_decode($result["Metadata"]);
            $result["Favorites"] = $this->my_favs($result);

            return $result;
        } else {
            return 'Invalid Request';
        }
    }
    function my_favs($user)
    {
        $favorites = $user["Metadata"]->Favorites;
        if (!empty($favorites)) {
            // $product = new ProductQuery($this->conn);
            // return $product->getProductsByIds($favorites);
        }
        return [];
    }


    /**
     * Updates the user's password using the provided UserToken and resets UserToken.
     * 
     * @param string $UserToken The token used to identify the user.
     * @param string $Password The new password to be hashed and stored.
     * @return bool Returns true on success or false on failure.
     */
    public function UpdatePassword(string $UserToken, string $Password): array
    {
        $response = array();
        if (empty($UserToken) || empty($Password)) {
            $response["message"] = "Invalid Request";
            $response["isSuccess"] = false;
            return $response;
        }

        // Hash the new password before storing
        // $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
        $hashedPassword = $Password;
        $query = "UPDATE user SET Password = ?, UserToken = '' WHERE UserToken = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $response["isSuccess"] = $stmt->execute([$hashedPassword, $UserToken]);
            $response["message"] = $response["isSuccess"] ? "Password updated successfully" : "Failed to update password";
            return $response;
        } catch (PDOException $e) {
            $response["message"] = $e->getMessage();
            $response["isSuccess"] = false;
            return $response;
        }
    }


    function updateArrayValue($prop, $oldValue, $newValue)
    {
        // Step 1: Get all users containing the old value in the specified array property
        $users = $this->listUsersByProp($prop, $oldValue);

        if (empty($users)) {
            return "No updates needed"; // Nothing to update
        }

        // Step 2: Loop through users and update the array
        foreach ($users as &$user) {
            // Ensure we only decode if it's a string
            if (is_string($user[$prop])) {
                $user[$prop] = json_decode($user[$prop], true);
            }

            // Step 3: Update the array with the new value
            foreach ($user[$prop] as &$currentValue) {
                if ($currentValue['Name'] === $oldValue) { // Use associative array notation
                    $currentValue['Name'] = $newValue;
                    break; // Stop searching after updating
                }
            }

            // Step 4: Re-encode the array back to JSON (for debugging)
            $user[$prop] = json_encode($user[$prop]);

            // Step 5: Update the user record in the database
            $query = "UPDATE user SET $prop = ? WHERE UserId = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$user[$prop], $user['UserId']]);

        }

        return "Updated $prop from $oldValue to $newValue for " . count($users) . " users";
    }

    function listUsersByProp($prop, $value = 'Waist to desired pants length')
    {
        // Validate property against an allowed list
        $allowedProps = ['Measurements']; // Example properties
        if (!in_array($prop, $allowedProps)) {
            throw new InvalidArgumentException("Invalid property name");
        }

        $query = "SELECT UserId, Name, $prop FROM user WHERE JSON_LENGTH($prop) > 0";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $results = [];

            foreach ($items as &$item) {
                $item[$prop] = json_decode($item[$prop], true);
                $decodedMeasurements = $item[$prop];

                // Ensure it's a valid array before proceeding
                if (is_array($decodedMeasurements)) {
                    foreach ($decodedMeasurements as $measurement) {
                        if (isset($measurement['Name']) && $measurement['Name'] === $value) {
                            $results[] = $item;
                            break; // No need to check further, already found a match
                        }
                    }
                }
            }
            return $results;
        }
        return []; // Return an empty array if no items found
    }


}
