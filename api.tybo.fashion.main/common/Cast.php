<?php

/**
 * Centralised defensive casting for job/jobitem varchar-typed money,
 * quantity and date columns (see docs/jobs-and-job-items-database-audit.md
 * §7.1). Every read/write of TotalCost, TotalDays, ShippingPrice, DueDate,
 * UnitPrice, Quantity and SubTotal should go through these helpers so the
 * casting rules exist in exactly one place.
 *
 * Pure/static and DB-free, like JobTotals.
 */
class Cast
{
    /**
     * Money-like string/number to a canonical "123.45" string.
     * Non-numeric input (including null, '', garbage) becomes '0.00'.
     */
    public static function money($value)
    {
        if ($value === null || $value === '') {
            return '0.00';
        }
        if (is_string($value)) {
            $value = str_replace(array(',', ' '), '', trim($value));
        }
        if (!is_numeric($value)) {
            return '0.00';
        }
        return number_format((float) $value, 2, '.', '');
    }

    /**
     * Money-like value as a float (null-safe; non-numeric becomes 0.0).
     */
    public static function moneyFloat($value)
    {
        return (float) self::money($value);
    }

    /**
     * Quantity to an integer string ("3"). Null becomes '0'.
     * Fractional input is truncated toward zero, not rounded.
     */
    public static function quantity($value)
    {
        if ($value === null || $value === '') {
            return '0';
        }
        if (!is_numeric($value)) {
            return '0';
        }
        return (string) (int) $value;
    }

    /**
     * Days-like value to an integer string ("12"). Null/non-numeric → '0'.
     */
    public static function days($value)
    {
        return self::quantity($value);
    }

    /**
     * ISO-ish date string → MySQL DATETIME string ("2026-01-31 14:30:00"),
     * or null when empty/unparseable. Accepts the ISO-8601 strings the
     * frontend sends (e.g. 2026-01-31T14:30:00.000Z).
     */
    public static function dateTime($value)
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }
        $timestamp = strtotime(trim($value));
        if ($timestamp === false) {
            return null;
        }
        return date('Y-m-d H:i:s', $timestamp);
    }
}