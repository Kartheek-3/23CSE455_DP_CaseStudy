#!/usr/bin/env python3
"""Compile, execute, and benchmark the S3-N01 shared fixture suite (all four)."""
import csv
import json
import statistics
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JOBS = [
    ('Java', 'java', ['javac', 'Main.java', 'TestMain.java'], ['java', 'TestMain']),
    ('Python', 'python', None, ['python3', 'test_main.py']),
    ('JavaScript', 'javascript', None, ['node', 'test_main.js']),
    ('C++', 'cpp', ['g++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-pedantic', 'main.cpp', 'test_main.cpp', '-o', 'strategy_tests'], ['./strategy_tests']),
]
VERSIONS = [
    ('Java', ['java', '-version']), ('javac', ['javac', '-version']),
    ('Python', ['python3', '--version']), ('Node.js', ['node', '--version']),
    ('g++', ['g++', '--version']),
]

def execute(command, cwd):
    started = time.perf_counter_ns()
    proc = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
    elapsed = (time.perf_counter_ns() - started) / 1_000_000
    return proc, elapsed


def main():
    versions = {}
    for name, cmd in VERSIONS:
        p, _ = execute(cmd, ROOT)
        versions[name] = (p.stdout or p.stderr).strip().splitlines()[0]
    (ROOT / 'evidence' / 'environment_versions.json').write_text(json.dumps(versions, indent=2) + '\n')
    compiled = []
    results = {}
    for name, folder, compile_cmd, test_cmd in JOBS:
        cwd = ROOT / 'strategy' / folder
        if compile_cmd:
            p, _ = execute(compile_cmd, cwd)
            compiled.append({'language':name,'command':' '.join(compile_cmd),'exit_code':p.returncode,'stdout':p.stdout,'stderr':p.stderr})
            if p.returncode: raise RuntimeError(f'{name} compilation failed: {p.stderr}')
        p, _ = execute(test_cmd, cwd)
        (cwd / 'test_result.txt').write_text(
            f'Command: {" ".join(test_cmd)}\nWorking directory: Part3/strategy/{folder}\n'
            f'Exit code: {p.returncode}\n\nSTDOUT (one row per shared fixture):\n{p.stdout}\nSTDERR:\n{p.stderr}',
            encoding='utf-8')
        actual_lines = p.stdout.splitlines()
        expected_lines = (ROOT / 'common_specs' / 'strategy_expected.tsv').read_text().splitlines()[1:]
        assert p.returncode == 0 and actual_lines == expected_lines and 'passed=15/15 failures=0 errors=0' in p.stderr, f'{name} fixture failure'
        samples = []
        # Exactly one warmup then five measured fresh processes, each reads all fixtures.
        for i in range(6):
            q, ms = execute(test_cmd, cwd)
            assert q.returncode == 0 and q.stdout.splitlines() == expected_lines, f'{name} measurement-run fixture failure'
            samples.append({'run':'warmup' if i == 0 else f'measure_{i}', 'elapsed_ms':round(ms, 6), 'exit_code':q.returncode, 'passed':15,'total':15})
        with (cwd / 'timings.csv').open('w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['run','elapsed_ms','exit_code','passed','total'])
            writer.writeheader(); writer.writerows(samples)
        median = statistics.median(s['elapsed_ms'] for s in samples[1:])
        results[name] = {'folder':folder, 'test_command':' '.join(test_cmd), 'exit_code':p.returncode,
                         'passed':15,'total':15,'failures':0,'errors':0,
                         'warmup_ms':samples[0]['elapsed_ms'],
                         'five_measurements_ms':[s['elapsed_ms'] for s in samples[1:]],
                         'median_process_ms':round(median,6)}
        print(f'{name}: 15/15 passed, times={results[name]["five_measurements_ms"]}, median={median:.6f} ms')
    (ROOT / 'evidence' / 'compile_results.json').write_text(json.dumps(compiled, indent=2) + '\n')
    (ROOT / 'evidence' / 'execution_results.json').write_text(json.dumps(results, indent=2) + '\n')
    print('Versions:', json.dumps(versions))

if __name__ == '__main__': main()
