<?php

class GenericModel
{
    private PDO $conn;
    private string $table;
    private array $fields = [];

    public function __construct(PDO $db, string $table)
    {
        $this->conn = $db;
        $this->table = $this->validateTableName($table);
    }

    public function setFields(array $fields): void
    {
        $this->fields = $this->validateFields($fields);
    }

    public function insert(): int|array
    {
        $columns = array_column($this->fields, 'name');
        $placeholders = array_fill(0, count($columns), '?');
        $values = array_column($this->fields, 'value');

        $query = "INSERT INTO {$this->table} (" . implode(',', $columns) . ") VALUES (" . implode(',', $placeholders) . ")";

        return $this->executeQuery($query, $values, true);
    }

    public function update(array $where): bool|array
    {
        if (empty($where)) {
            return ["ERROR" => "Update conditions required."];
        }

        $columns = array_column($this->fields, 'name');
        $values = array_column($this->fields, 'value');

        $setClause = implode(' = ?, ', $columns) . ' = ?';
        list($whereClause, $whereValues) = $this->buildWhereClause($where);

        $query = "UPDATE {$this->table} SET $setClause WHERE $whereClause";

        return $this->executeQuery($query, array_merge($values, $whereValues));
    }

    public function get(array $filters = [], array $sort = [], int $limit = null, int $offset = 0): array
    {
        $whereClause = "";
        $whereValues = [];
        if (!empty($filters)) {
            list($whereClause, $whereValues) = $this->buildWhereClause($filters);
        }

        $orderBy = !empty($sort) ? "ORDER BY " . implode(", ", array_map(fn($s) => "{$s['column']} {$s['direction']}", $sort)) : "";

        $limitClause = $limit ? "LIMIT $offset, $limit" : "";

        $query = "SELECT * FROM {$this->table} $whereClause $orderBy $limitClause";

        return $this->executeQuery($query, $whereValues, false);
    }

    public function delete(array $where): bool|array
    {
        if (empty($where)) {
            return ["ERROR" => "Delete conditions required."];
        }

        list($whereClause, $whereValues) = $this->buildWhereClause($where);

        $query = "DELETE FROM {$this->table} WHERE $whereClause";

        return $this->executeQuery($query, $whereValues);
    }

    private function buildWhereClause(array $conditions): array
    {
        $whereClauses = [];
        $values = [];

        foreach ($conditions as $column => $condition) {
            if (is_array($condition) && count($condition) === 2) {
                list($operator, $value) = $condition;
                if (!in_array($operator, ['=', '<', '>', '<=', '>=', 'LIKE', '!='])) {
                    throw new InvalidArgumentException("Invalid SQL operator: $operator");
                }
            } else {
                $operator = '=';
                $value = $condition;
            }
            $whereClauses[] = "$column $operator ?";
            $values[] = $value;
        }

        return ["WHERE " . implode(" AND ", $whereClauses), $values];
    }

    private function executeQuery(string $query, array $values, bool $returnId = false): bool|array|int
    {
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute($values)) {
                return $returnId ? $this->conn->lastInsertId() : $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (PDOException $e) {
            return ["ERROR" => $e->getMessage()];
        }
        return false;
    }

    private function validateTableName(string $table): string
    {
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
            throw new InvalidArgumentException("Invalid table name: $table");
        }
        return $table;
    }

    private function validateFields(array $fields): array
    {
        foreach ($fields as $field) {
            if (!isset($field['name'], $field['type'], $field['value'])) {
                throw new InvalidArgumentException("Field structure is incorrect. Each field must have 'name', 'type', and 'value'.");
            }

            switch ($field['type']) {
                case 'int':
                    if (!is_int($field['value'])) throw new InvalidArgumentException("Invalid type for {$field['name']}");
                    break;
                case 'string':
                    if (!is_string($field['value'])) throw new InvalidArgumentException("Invalid type for {$field['name']}");
                    break;
                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $field['value'])) throw new InvalidArgumentException("Invalid date format for {$field['name']}");
                    break;
                case 'time':
                    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $field['value'])) throw new InvalidArgumentException("Invalid time format for {$field['name']}");
                    break;
                default:
                    throw new InvalidArgumentException("Unsupported field type: {$field['type']}");
            }
        }
        return $fields;
    }
}
