# Adapter S2-N01 — Frozen Common Specification

Instance: Multiple Booking Provider Normalization (GoF Adapter). Shared local TSV inputs; no network, reservations, payments or booking confirmations.

## Frozen fixture SHA-256
- `common_specs/adapter_cases.tsv` — `e5d753ee386c8d304019dc2c78df8a8c3e91f1b21a35915e555bc350afe9d209`
- `common_specs/adapter_expected.tsv` — `7157bcd97d2fe9296113d09b271fcb121b430a9c478f8c3bb2762f03ffd73293`
- `common_specs/adapter_invalid_fixtures/atlas_invalid_category.tsv` — `dee310dab911539ee6118eada728ef236736210da6df15aa3e2ff1627e258a73`
- `common_specs/adapter_invalid_fixtures/atlas_invalid_price.tsv` — `8d78ec02ea4081d42eb725ed6c4e97d6fb433b2a51b049e15ac6cbd7bf57645f`
- `common_specs/adapter_invalid_fixtures/atlas_missing_structure.tsv` — `45993de968aba956b997be26cc2269b7641f37f286593d1492a2b00e2ce88231`
- `common_specs/adapter_invalid_fixtures/beacon_invalid_type.tsv` — `14224cb0a4cdf1c3a948ea055b4522c25a728d2d59149a0d38883c6044e596cf`
- `common_specs/adapter_invalid_fixtures/beacon_missing_structure.tsv` — `fab4f36325ae3216dc4719ad13416a317145617e3eb5c3144e70ce3d7590a524`
- `common_specs/atlas_raw.tsv` — `c03ae80c9833901bb69ae46d40a4a559b38675cf76c177654df713d0ca9ce62d`
- `common_specs/beacon_raw.tsv` — `4f0ad0e9b9f40d33c7e1f150eaa076bf1b1bb73f57b46cc99ca0bf8ecf0aa027`

Case columns: `case_id`, `provider_code`, `destination_code`, `offer_id`, `atlas_source`, `beacon_source`. Each source path is relative to `Part3/common_specs` and selected *per case*, not mutable global state.

Success TSV columns: `case_id`, `OK`, `provider_code`, `provider_name`, `offer_id`, `name`, `kind`, `address`, `description`, `sample_amount_cents`, `currency`.

Failure columns: `case_id`, `ERROR`, `error_code`.

A01 Atlas Rome walk (2400 EUR cents), A02 Beacon Rome museum (1600), A03 Atlas Paris market (0), A04 Beacon Paris pastry (1250), A05 unknown provider, A06 unknown destination, A07 cross-provider offer, A08 unknown Atlas category, A09 malformed Atlas compound price, A10 missing Atlas schema column.

Atlas format header: `destination,id,title,category,location,details,price`. Its compound price is `CURRENCY:NN.NN` and its category maps `activity -> do`, `shopping -> shop`, `dining -> eat`.

Beacon format header: `code,label,type,address,summary,amount,currency,destination`. Its separate decimal amount maps to integer cents and its type maps `experience -> do`, `retail -> shop`, `dining -> eat`.

Both support only codes `atlas_demo`/`beacon_demo`, destinations `rome`/`paris`, kinds `do`/`shop`/`eat` and currencies EUR/GBP/USD. Reject missing required headers/row columns as INVALID_FIXTURE; invalid supported-destination offer contents as INVALID_OFFER. Select provider through a fixed whitelist. Client never inspects provider-specific fields. Invalid Beacon type and schema files are additional shared isolation checks; they are not additional Axx counted cases.
