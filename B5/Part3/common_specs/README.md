# Frozen common Strategy specification — S3-N01

Selected confirmed DaPlanStan collaboration: **Strategy (GoF) — Cancellation Policy Evaluation**.
Source version: `scenario3_cancellation_policies`. These fixtures were fixed before implementation.

The same `strategy_cases.tsv` and `strategy_expected.tsv` are used by all four language test runners. Both are UTF-8, tab separated. The cases have the header
`case_id, policy_code, seconds_until_start, amount_cents, currency` (tabs, not commas).
The expected header describes the success fields. Each success line contains seven fields:
`case_id, OK, policy_code, fee_cents, refund_cents, currency, refundable`.
Each error line contains exactly three fields: `case_id, ERROR, error_code`.
The expected file is authoritative; runners compare whole output lines byte-for-byte after reading both fixtures.

`~` represents a missing timestamp. All 15 cases are independent. There are no real booking transactions.

## Frozen rules

- Flexible: >=86400 seconds to start: 0%; 1..86399: 10%; <=0: 100%.
- Moderate: >=259200: 0%; 86400..259199: 50%; <86400: 100%.
- Strict: always 100%.
- Fee percentage is an integer; half-up fee (cents) = `(amount_cents * percentage + 50) // 100` for valid nonnegative amounts; refund = amount minus fee. `refundable` is YES if refund > 0 and otherwise NO.
- Supported currencies: EUR, GBP, USD. Unknown policy -> `UNKNOWN_POLICY`, negative amount -> `INVALID_AMOUNT`, other currency -> `UNSUPPORTED_CURRENCY`, missing time -> `INVALID_TIME`.
- This is a quote-only problem: no eligibility database check, live clock, payment, booking cancellation, external request or persistent state.

## Case selection

S01 Moderate exactly 72h; S02 one second below 72h; S03 exactly 24h; S04 one second below 24h; S05 Flexible exactly 24h; S06 below 24h; S07 one second before start; S08 at start; S09 Strict at 96h; S10 Moderate on five cents (fee 3, refund 2); S11 Strict zero amount; S12 unknown policy; S13 negative amount; S14 unsupported JPY; S15 missing time.

## Fixture SHA-256
- `strategy_expected.tsv`: `9ace270b725c7863026ce1057af04c7415ebbd14c1aaecc16c9c89a4cb2d41e1`
- `strategy_cases.tsv`: `6397422cb3f9110c9c2b7ae1c1dd044578a15c1979767b30cb61e7b16c032871`
