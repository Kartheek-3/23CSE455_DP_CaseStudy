
import subprocess
import sys
import time
import statistics

times = []

for _ in range(5):
    start = time.perf_counter()

    subprocess.run(
        [sys.executable, "main.py"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        check=True
    )

    elapsed = time.perf_counter() - start
    times.append(elapsed)

print("Runs (seconds):", [round(t, 6) for t in times])
print("Median (seconds):", round(statistics.median(times), 6))
