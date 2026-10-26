# CH02 - Transaction limits

Each transfer must pass a per-transfer cap and the accumulated sender amount must not exceed a daily cap. Limits reject before repository persistence or notification.

Acceptance checks: EUR 900 passes a EUR 1,000 per-transfer cap; EUR 1,001 fails; a second EUR 300 transfer after EUR 800 already used fails a EUR 1,000 daily cap.

`diff.patch` is a focused illustrative transfer-flow excerpt, not a directly applicable patch between the separately maintained baseline and evolved source trees.
