# CH03 - Digital contract management

Acceptance criteria: every contract starts Draft; only Draft can be sent; Sent can be signed or expired; Signed and Expired reject further transitions; document and signature IDs are 64-character lowercase SHA-256 hashes.

Refactoring: Replace State-Dependent Conditional with State objects. Rejecting defaults sit in `AbstractContractState`, and each concrete state implements only permitted transitions. An Eloquent model and migration persist property, tenant, document hash, signature hash, and status. Evidence is in `digital_contract.patch` and the evolved suite. Commit: `8e2af082067bb83aab7e40caf2b7a463fef8b643`.

Effect: one new **Digital Contract Lifecycle** State instance is introduced. The educational implementation does not claim PKI verification or legal e-signature compliance.
