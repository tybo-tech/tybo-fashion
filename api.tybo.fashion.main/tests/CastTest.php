<?php

/**
 * Hermetic tests for common/Cast.php (no database).
 *
 * Run: php tests/CastTest.php
 */

require_once __DIR__ . '/../common/Cast.php';

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

// ── money ────────────────────────────────────────────────────────────────
check('money: int', '1200.00', Cast::money(1200));
check('money: float rounds', '1200.55', Cast::money(1200.554));
check('money: string', '1200.00', Cast::money('1200'));
check('money: string with decimals', '0.10', Cast::money('0.1'));
check('money: thousands separators', '1234.00', Cast::money('1,234'));
check('money: spaces', '1234.00', Cast::money(' 1 234 '));
check('money: null', '0.00', Cast::money(null));
check('money: empty string', '0.00', Cast::money(''));
check('money: garbage', '0.00', Cast::money('N/A'));
check('money: whitespace garbage', '0.00', Cast::money('  '));

// ── moneyFloat ───────────────────────────────────────────────────────────
check('moneyFloat: string', 1200.0, Cast::moneyFloat('1200'));
check('moneyFloat: garbage is 0.0', 0.0, Cast::moneyFloat('N/A'));
check('moneyFloat: null is 0.0', 0.0, Cast::moneyFloat(null));

// ── quantity ─────────────────────────────────────────────────────────────
check('quantity: int', '3', Cast::quantity(3));
check('quantity: string', '3', Cast::quantity('3'));
check('quantity: fractional truncates', '2', Cast::quantity(2.75));
check('quantity: negative string', '-2', Cast::quantity('-2'));
check('quantity: null', '0', Cast::quantity(null));
check('quantity: empty string', '0', Cast::quantity(''));
check('quantity: garbage', '0', Cast::quantity('two'));

// ── days ─────────────────────────────────────────────────────────────────
check('days: int', '12', Cast::days(12));
check('days: null', '0', Cast::days(null));

// ── dateTime ─────────────────────────────────────────────────────────────
check('dateTime: ISO-8601 Z', '2026-01-31 14:30:00', Cast::dateTime('2026-01-31T14:30:00.000Z'));
check('dateTime: mysql format', '2026-01-31 14:30:00', Cast::dateTime('2026-01-31 14:30:00'));
check('dateTime: date only', '2026-01-31 00:00:00', Cast::dateTime('2026-01-31'));
check('dateTime: empty string', null, Cast::dateTime(''));
check('dateTime: null', null, Cast::dateTime(null));
check('dateTime: whitespace', null, Cast::dateTime('   '));
check('dateTime: garbage', null, Cast::dateTime('not-a-date'));

echo "\n{$checks} checks, {$failures} failures\n";
exit($failures === 0 ? 0 : 1);