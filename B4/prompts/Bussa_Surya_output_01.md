# Digital-contract output

`ContractState` declares send, sign, and expire. `AbstractContractState` supplies rejecting defaults. `DraftState`, `SentState`, `SignedState`, and `ExpiredState` implement only valid behavior, while the domain `DigitalContract` delegates to its current state and stores immutable document identity plus the signature hash. A separate Eloquent model and migration persist the property, tenant, document hash, signature hash, and status. Tests demonstrate Draft -> Sent -> Signed, invalid-hash rejection, and a blocked expiry of a signed contract.
