# Redactions applied to the submitted source copies (2026-10-11)

The faculty instructions forbid uploading passwords or credentials. Two values published in the upstream repository were replaced in both source copies. Nothing else was changed. The upstream files remain available, with their original hashes, at the commit archive in `provenance.json`.

| File | Line | Value replaced | SHA-256 before (= upstream) | SHA-256 after |
|---|---|---|---|---|
| `data/code/baseline_83998629/canteen/settings.py` | 147 | PostgreSQL user, password, host and database in a commented-out `dj_database_url.parse(...)` call | `d60cada677497c95aa43d99e0abb180adb41c1a1ca8ea945e1b688df9bac4fb6` | `45c44764d3bed2cdd1e9393f24f9219ee7ae471213d70833b1c338e502824139` |
| `data/code/baseline_83998629/static/js/firebase.js` | 10 | Firebase web `apiKey` value | `acb3f0a2806e161383b3ac6361d8a5c8ef38d2ce2ccb35608ffac4a20aa2c4ff` | `249441a1f9e6def1be043282322eb220281221fc714bf427395624277e342a6b` |
| `data/code/evolved_CH01/canteen/settings.py` | 147 | PostgreSQL user, password, host and database in a commented-out `dj_database_url.parse(...)` call | `d60cada677497c95aa43d99e0abb180adb41c1a1ca8ea945e1b688df9bac4fb6` | `45c44764d3bed2cdd1e9393f24f9219ee7ae471213d70833b1c338e502824139` |
| `data/code/evolved_CH01/static/js/firebase.js` | 10 | Firebase web `apiKey` value | `acb3f0a2806e161383b3ac6361d8a5c8ef38d2ce2ccb35608ffac4a20aa2c4ff` | `249441a1f9e6def1be043282322eb220281221fc714bf427395624277e342a6b` |

Of the 170 upstream files, 167 are kept byte-identical in `data/code/baseline_83998629/`, these 2 are kept with the single-line redactions above, and 1 (a third-party stock video) is left out of the package (see `data/code/README.md`). `data/code/verify_baseline.py` checks this.
