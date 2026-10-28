# CH03 - Fraud detection processing

Each transfer must be checked by an ordered rule chain before limits and persistence. Deny-listed beneficiaries reject immediately; high-value transfers return a velocity-review rejection for the caller to route to manual review.

Acceptance checks: a deny-listed beneficiary fails with the deny-list reason; a EUR 6,000.01 transaction returns the velocity-review reason; a EUR 200 non-listed transaction proceeds.

`diff.patch` is a focused illustrative transfer-flow excerpt, not a directly applicable patch between the separately maintained baseline and evolved source trees.
