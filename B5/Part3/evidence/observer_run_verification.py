#!/usr/bin/env python3
"""Repeatable P08 Observer build/test/timing: fresh processes, shared TSV fixtures."""
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
    ('C++', 'cpp', ['g++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-pedantic', 'main.cpp', 'test_main.cpp', '-o', 'observer_tests'], ['./observer_tests']),
]
VERSION_COMMANDS = [
    ('java', ['java', '-version']),
    ('javac', ['javac', '-version']),
    ('python3', ['python3', '--version']),
    ('node', ['node', '--version']),
    ('g++', ['g++', '--version']),
]


def execute(command, cwd):
    start = time.perf_counter_ns()
    proc = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
    elapsed = (time.perf_counter_ns() - start) / 1_000_000
    return proc, elapsed


def main():
    versions = {}
    for name, cmd in VERSION_COMMANDS:
        p, _ = execute(cmd, ROOT)
        if p.returncode:
            raise RuntimeError(f'{name} --version failed: {p.stderr}')
        versions[name] = (p.stdout or p.stderr).strip().splitlines()[0]
    (ROOT / 'evidence' / 'observer_environment_versions.json').write_text(json.dumps(versions, indent=2) + '\n')
    expected = (ROOT / 'common_specs' / 'observer_expected.tsv').read_text(encoding='utf-8').splitlines()[1:]
    assert len(expected) == 7
    compile_results = []
    execution_results = {}
    for language, folder, compile_cmd, test_cmd in JOBS:
        cwd = ROOT / 'observer' / folder
        if compile_cmd:
            p, _ = execute(compile_cmd, cwd)
            compile_results.append({'language': language, 'command': ' '.join(compile_cmd), 'exit_code': p.returncode,
                                    'stdout': p.stdout, 'stderr': p.stderr})
            if p.returncode:
                raise RuntimeError(f'{language} compilation failed: {p.stderr}')
        p, _ = execute(test_cmd, cwd)
        (cwd / 'test_result.txt').write_text(
            f'Command: {" ".join(test_cmd)}\nWorking directory: Part3/observer/{folder}\n'
            f'Exit code: {p.returncode}\n\nSTDOUT:\n{p.stdout}\nSTDERR:\n{p.stderr}', encoding='utf-8')
        if p.returncode or p.stdout.splitlines() != expected or 'passed=7/7 failures=0 errors=0' not in p.stderr:
            raise RuntimeError(f'{language} tests did not pass against shared fixtures: {p.stderr}')
        samples = []
        # One warmup followed by precisely five measured fresh process runs.
        for i in range(6):
            q, ms = execute(test_cmd, cwd)
            if q.returncode or q.stdout.splitlines() != expected or 'passed=7/7 failures=0 errors=0' not in q.stderr:
                raise RuntimeError(f'{language} run {i} failed during timing')
            samples.append({'run': 'warmup' if i == 0 else f'measure_{i}',
                            'elapsed_ms': round(ms, 6), 'exit_code': q.returncode, 'passed': 7, 'total': 7})
        with (cwd / 'timings.csv').open('w', encoding='utf-8', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=['run', 'elapsed_ms', 'exit_code', 'passed', 'total'])
            writer.writeheader()
            writer.writerows(samples)
        five = [row['elapsed_ms'] for row in samples[1:]]
        execution_results[language] = {
            'folder': folder, 'test_command': ' '.join(test_cmd), 'exit_code': p.returncode,
            'passed': 7, 'total': 7, 'failures': 0, 'errors': 0, 'skipped': 0,
            'warmup_ms': samples[0]['elapsed_ms'], 'five_measurements_ms': five,
            'median_process_ms': statistics.median(five),
        }
        print(f'{language}: 7/7 passed, five={five}, median={statistics.median(five):.6f} ms')
    (ROOT / 'evidence' / 'observer_compilation_results.json').write_text(json.dumps(compile_results, indent=2) + '\n')
    (ROOT / 'evidence' / 'observer_execution_results.json').write_text(json.dumps(execution_results, indent=2) + '\n')
    print('Versions:', json.dumps(versions, indent=2))


if __name__ == '__main__':
    main()
