# Part 3 raw runtime measurements

All runs were measured on this machine after compilation using PowerShell `Stopwatch` around a process launch. Timings include process/runtime startup, execution, stdout capture, and exit; compilation and stdin are excluded. One warm-up preceded five measured runs for every process. Values are milliseconds. The output was checked against the shared expected output on every run.

| Pattern | Language | Expected output | Warm-up output | Run 1 ms | Run 2 ms | Run 3 ms | Run 4 ms | Run 5 ms | Median ms |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| Strategy | Java | `standard=9000;premium=8000` | `standard=9000;premium=8000` | 101.273 | 108.416 | 123.373 | 114.925 | 114.722 | 114.722 |
| Strategy | C++ | `standard=9000;premium=8000` | `standard=9000;premium=8000` | 15.855 | 14.015 | 13.835 | 16.532 | 14.604 | 14.604 |
| Strategy | Python | `standard=9000;premium=8000` | `standard=9000;premium=8000` | 26.6 | 26.238 | 25.909 | 24.788 | 25.29 | 25.909 |
| Strategy | JavaScript | `standard=9000;premium=8000` | `standard=9000;premium=8000` | 46.947 | 48.374 | 48.254 | 48.534 | 48.75 | 48.374 |
| Adapter | Java | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | 77.344 | 77.636 | 79.622 | 78.054 | 78.031 | 78.031 |
| Adapter | C++ | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | 14.902 | 14.421 | 14.223 | 14.401 | 15.621 | 14.421 |
| Adapter | Python | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | 47.401 | 51.693 | 48.777 | 48.151 | 46.817 | 48.151 |
| Adapter | JavaScript | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` | 52.608 | 48.185 | 48.954 | 50.195 | 48.233 | 48.954 |
