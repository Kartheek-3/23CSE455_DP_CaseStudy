# Part 3 — Final Cross-Language Validation

**Status: PASS.** The final CSV is assembled from the five supplied frozen append-ready JSON datasets. No existing implementation or measured metric was edited.

## Faculty CSV schema, row totals and uniqueness

- File: `Part3/cross_language.csv`; exactly **11 columns** in the required order: `pattern_name, instance_name, language, snippet_path, source_loc, max_function_cc, runtime_compiler, test_command, test_result, median_process_ms, language_notes`.
- **20 data rows**, not counting the header; 5 pattern types × 4 languages.
- Distribution: 4 rows each for Strategy, Observer, Controller, Information Expert and Adapter; 5 rows each for Java, Python, JavaScript and C++.
- No missing or duplicate `(pattern_name, instance_name, language)` tuples; all instance names match their frozen source patterns.
- All runtime/compiler, test command, test result, LOC, CC and median fields are nonblank. Values copied without adjustment from frozen append-ready JSON.

## Paths and metrics

- All 20 `snippet_path` entries resolve to production files beneath `Part3` and do not point at test runners.
- Where C++ uses both `main.hpp` and `main.cpp`, the record convention points to `main.cpp`, while its existing measured production LOC includes **both** files.
- All 20 LOC and CC values match their original `evidence/*static_metrics.json` entries.
- Each recorded median agrees with the mathematical median of the **five** measured run values; every timing file also includes one warm-up and records success for every run.
- Runtime/compiler versions match preserved evidence: OpenJDK/javac 21.0.12.1, Python 3.13.5, Node.js v22.16.0, g++ 14.2.0 with C++17.

## Recorded test-output validation

| Pattern | Cases per language | Java | Python | JavaScript | C++ | Total passed |
| --- | --- | --- | --- | --- | --- | --- |
| Strategy | 15 | 15/15 | 15/15 | 15/15 | 15/15 | 60/60 |
| Observer | 7 | 7/7 | 7/7 | 7/7 | 7/7 | 28/28 |
| Controller | 8 | 8/8 | 8/8 | 8/8 | 8/8 | 32/32 |
| Information Expert | 8 | 8/8 | 8/8 | 8/8 | 8/8 | 32/32 |
| Adapter | 10 | 10/10 | 10/10 | 10/10 | 10/10 | 40/40 |
| **Total** | — | 48/48 | 48/48 | 48/48 | 48/48 | **192/192** |


The logged STDOUT fixture rows from each of the 20 test results were compared with its one shared `*_expected.tsv`; all matched exactly. Logs show exit code 0 and zero failures/errors. The extra Adapter isolation assertions remain separate from this count. **These are standalone snippet results, not DaPlanStan Rails integration passes.**

## Preservation

All five historic cumulative ZIP archives passed their own integrity tests and the byte-level preservation chain: Strategy (34 entries), Observer (68), Controller (104), Information Expert (137) and Adapter (181). **Every entry of an earlier archive was present with identical bytes in the next archive**; the final Adapter ZIP's 181 entries matched the local files. Earlier per-stage checksum evidence remains in `Part3/evidence/`.

## Final cumulative ZIP integrity

The new cumulative Part3 ZIP was built without `.class`, executable C++ binaries, Python `__pycache__`, `.pyc` or temporary runtime files; all required pattern sources, TSVs, tests, raw evidence and final reports are present. Final ZIP `testzip()` and required-entry checks **passed**. The file checksum and total entry count are reported in the accompanying aggregation output.

## Limits

No recorded test or metric was recomputed for presentation. Checks validate consistency of existing evidence; they do not prove independence of that evidence, guarantee preservation of external unpublished files or run missing Rails/application integrations. Full Rails tests remain blocked by the previously documented Ruby and gem requirements.
