# CH01 - Multi-currency support

Users can transfer supported currencies and receive an EUR settlement amount. Same-currency requests retain the amount. Conversion selection is isolated behind `CurrencyConversionStrategy`; external quote format is isolated by `VendorFxAdapter`.

Acceptance checks: EUR to EUR 10.00 settles at EUR 10.00; USD to EUR 10.00 settles at EUR 9.20; an unsupported source would fail at rate selection in a production provider.

`diff.patch` is a focused illustrative transfer-flow excerpt, not a directly applicable patch between the separately maintained baseline and evolved source trees.
