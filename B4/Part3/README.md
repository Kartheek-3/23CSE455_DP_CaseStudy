# Part 3 - Cross-language comparison

The same Dynamic Rent Pricing Strategy and Advanced Property Filtering Specification problems are implemented in Java, Python, JavaScript, and C++. Production code and tests are separate. `run_all.sh` compiles Java/C++, performs one warmup, then records five measured test processes for every implementation.

Expected results are 6/6 for each Strategy suite and 5/5 for each Specification suite. Raw runs are in `evidence/cross_language_runs.txt`; static metrics are in `evidence/cross_language_metrics.json`; normalized results are in `../data/cross_language.csv`.

The timing includes process/runtime startup and test execution. It must not be interpreted as a general language-performance benchmark.

