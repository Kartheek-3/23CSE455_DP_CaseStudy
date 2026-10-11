# A5 cross-language extension (8 patterns x 4 languages)

Each pattern has standalone demonstrations in Python, JavaScript, Java and C++ (32 source files). These are **portable reduced examples**, not Laravel code. They preserve the pattern roles and representative healthcare use cases but deliberately omit network services, framework routing, databases, authentication and clinical data.

## Running

From `A5/` run the per-language commands in `Part3/eight_patterns/cross_language.csv`. The GitHub workflow `.github/workflows/a5-validate.yml` is intended to run all 32 and the PHP contract suite, then compile `A5_Report.pdf`. Check the workflow logs before claiming results. Do not report timings, LOC or cyclomatic complexity as measured until those measurements have been executed.

## Evaluation notes

All implementations use synthetic data and deterministic assertions. Cross-language timing must use a shared protocol: compile first, warm up, then measure repeated executions on the same machine, record raw times, report median; distinguish startup cost from steady-state work. Keep the original Adapter and Strategy evidence separate from these newly added simplified variants.

## Pattern / domain mapping

- Facade: appointment booking + notification
- Repository: patient lookup persistence abstraction
- Adapter: laboratory order vendor payload translation
- Strategy: payment method selection
- Proxy: cached patient data lookup and invalidation
- Observer: clinical event subscriber notifications
- Factory Method: medical record JSON/CSV exporter creation
- Decorator: medical record access auditing

These 8 designs are **proposed extensions**; baseline counts must not be rewritten as if they existed in the original Laravel application.
