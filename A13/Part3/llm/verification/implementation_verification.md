# Verification: generated snippets, tests and measurements (prompt 6)

Model output being checked: the 60 snippets and tests under `Part3/code/`, written through generator scripts that are reproduced in `Part3/llm/outputs/implementation_phase_output.md`, and `Part3/evidence/run_measurements.py`.
Evaluation in `data/llm.csv`: AI-assisted label recorded 2026-10-11 (see `human_review_checklist.md`).

## What the model contributed
Everything under `Part3/code/`, `Part3/test-cases/`, `Part3/evidence/run_measurements.py` and the READMEs. The specifications for each small problem (inputs, rules, error cases) were designed by the model from the source ranges it read; they are not copied from Misskey.

## What was checked, with evidence
| check | evidence | result |
|---|---|---|
| each snippet's tests run and pass | `Part3/evidence/test-logs/<pattern>_<language>.log` (60 files, command + output + exit code) | 60 of 60 pass; fixtures have 97 cases (after the Observer fixture gained one case), so 388 passing executions |
| the four languages test the same cases | one fixture per pattern in `Part3/test-cases/`, read by all four runners | same input and expected string for every language |
| production and test code are separate | each language folder has one production file and one test file; the test reads the fixture path from the command line | holds |
| LOC and complexity | `Part3/evidence/loc-cc/lizard_functions.csv` (lizard 1.24.1) | recorded; JavaScript `get`/`set`/`delete` quirk worked around and documented |
| timing | `Part3/evidence/timing/raw_timing.csv` (five timed runs per snippet; compile first); the one warm-up run is in `run_measurements.py` (line 130) only | recorded; the warm-up time is not stored, and the `# timing: 1 warm-up + 5 runs` line in each log lists only the five timed runs, so the warm-up cannot be shown from output |
| timing and logs regenerated | the whole harness was run again after the Observer change (prompt 8), so all logs, raw timings, lizard output and CSV rows come from one consistent run | done |
| tool versions | `Part3/evidence/environment.txt` | recorded from the commands themselves |
| compiler warnings | no `warning` text in any log (g++ with `-Wall -Wextra`) | none in the final run |
| the CSV matches the evidence | `data/cross_language.csv` is written by `run_measurements.py` from the same run that produced the logs | 60 rows, header as in the assignment |

## Corrections made during the work (all kept in the final files)
1. JavaScript Observer: Node's `EventEmitter.off(event, undefined)` throws a `TypeError`, which failed the unknown-listener case. The test now passes a never-registered function; the difference is stated in the JavaScript README.
2. Python Repository: `EntityNotFound` had an empty message, so the expected `ERR:EntityNotFound` failed. The exception now carries that message.
3. Service Layer fixture: the order of the `deactivated#id` line was changed to come after the events, because it is a state check made after the command; this was done before the first run and is explained in the fixture header.
4. C++ test helpers gave an unused-function warning in tests that do not need `join`; they are marked `[[maybe_unused]]`.
5. The Python Adapter had a docstring, which was changed to a `#` comment on the assumption that lizard counts docstrings as code. That assumption was not tested at the time. The later review found it was wrong: lizard excludes docstrings from NLOC (Python Repository and Publish-Subscribe, which still have docstrings, are 1-2 lines lower in lizard than in a plain non-blank count). The change was harmless but its stated reason was incorrect.
6. Lizard dropped JavaScript methods named `get`/`set`/`delete`, which hid a complexity maximum for the Two-Level Cache snippet (first run showed 1, correct value 3). The harness now measures a renamed temporary copy.

7. (prompt 8) Observer: the snippets reported the previous value as `oldValue` and always emitted. Re-reading `manager.ts` showed that `commit` returns early for an unchanged value (254-257) and that `_save` reads `this.s[key]` after `rewriteRawState` has stored the new value (244-247, 261, 267-271), with `s` a plain object. The source therefore emits the new value as `oldValue`. The four snippets, the fixture (new case `unchanged_value_not_announced`, new expected strings) and the README now reproduce that. Tests were rerun (8/8 in every language) and the harness was rerun for all patterns. This was found by reading the source; Misskey's frontend was not executed.

## Limits of this verification
- Behaviour equality was shown on the fixtures only; the models deliberately drop framework behaviour (see each pattern README's "Not modelled").
- Rules that are the model's own and not from Misskey: null backend rejected in the strategy manager; two-call limit in the front controller; 100-unit memory lifetime; `.down`/`.flaky` fake hosts; case-insensitive host lowering as a stand-in for `toPuny`; failed plugin keeps handlers (this one follows the source).
- JavaScript, Python and the others differ in how errors are reported; the tests only compare the message text.
- Timing includes process start-up and is from one machine.
