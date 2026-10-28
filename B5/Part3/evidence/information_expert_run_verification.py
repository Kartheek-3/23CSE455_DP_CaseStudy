#!/usr/bin/env python3
"""Compile, test and time P01 via the same procedure used for frozen Strategy."""
import csv
import hashlib
import json
import statistics
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKSUMS = {
    'information_expert_cases.tsv': 'c12f408f1d5c3e9e19e35d3e3b5e415a9fc8af0cbef726692033115370257657',
    'information_expert_expected.tsv': '6274eab668f786007555af1f19babeaef6cc8fcf9575cdaabada99f8d3775584',
}
JOBS = [
    ('Java', 'java', ['javac', 'Main.java', 'TestMain.java'], ['java', 'TestMain']),
    ('Python', 'python', None, ['python3', 'test_main.py']),
    ('JavaScript', 'javascript', None, ['node', 'test_main.js']),
    ('C++', 'cpp', ['g++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-pedantic', 'main.cpp', 'test_main.cpp', '-o', 'information_expert_tests'], ['./information_expert_tests']),
]
VERSIONS = [
    ('java', ['java', '-version']), ('javac', ['javac', '-version']),
    ('python3', ['python3', '--version']), ('node', ['node', '--version']),
    ('g++', ['g++', '--version']),
]


def execute(command, folder):
    began = time.perf_counter_ns()
    result = subprocess.run(command, cwd=folder, capture_output=True, text=True)
    return result, (time.perf_counter_ns() - began) / 1e6


def main():
    for name, digest in CHECKSUMS.items():
        actual = hashlib.sha256((ROOT / 'common_specs' / name).read_bytes()).hexdigest()
        if actual != digest:
            raise RuntimeError(f'Frozen fixture changed: {name}')
    inputs = (ROOT / 'common_specs/information_expert_cases.tsv').read_text(encoding='utf-8').splitlines()[1:]
    expected = (ROOT / 'common_specs/information_expert_expected.tsv').read_text(encoding='utf-8').splitlines()[1:]
    if len(inputs) != len(expected) or len(expected) != 8:
        raise RuntimeError('Incorrect frozen fixture count')
    versions = {}
    for name, command in VERSIONS:
        proc, _ = execute(command, ROOT)
        if proc.returncode:
            raise RuntimeError(f'Version command failed: {command}: {proc.stderr}')
        versions[name] = (proc.stdout or proc.stderr).strip().splitlines()[0]
    (ROOT / 'evidence/information_expert_environment_versions.json').write_text(json.dumps(versions, indent=2) + '\n')
    compilation, results = [], {}
    for name, folder, compile_cmd, test_cmd in JOBS:
        cwd = ROOT / 'information_expert' / folder
        if compile_cmd:
            proc, _ = execute(compile_cmd, cwd)
            compilation.append({'language': name, 'command': ' '.join(compile_cmd), 'exit_code': proc.returncode, 'stdout': proc.stdout, 'stderr': proc.stderr})
            if proc.returncode:
                raise RuntimeError(f'{name} compilation failed: {proc.stderr}')
        proc, _ = execute(test_cmd, cwd)
        evidence = (f'Command: {" ".join(test_cmd)}\nWorking directory: Part3/information_expert/{folder}\n'
                    f'Exit code: {proc.returncode}\n\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}')
        (cwd / 'test_result.txt').write_text(evidence, encoding='utf-8')
        signature = 'passed=8/8 failures=0 errors=0 skipped=0'
        if proc.returncode or proc.stdout.splitlines() != expected or signature not in proc.stderr:
            raise RuntimeError(f'{name} test failed: {evidence}')
        runs = []
        for i in range(6):
            trial, elapsed = execute(test_cmd, cwd)
            if trial.returncode or trial.stdout.splitlines() != expected or signature not in trial.stderr:
                raise RuntimeError(f'{name} timing iteration {i} failed')
            runs.append({'run': 'warmup' if i == 0 else f'measure_{i}', 'elapsed_ms': round(elapsed, 6), 'exit_code': trial.returncode, 'passed': 8, 'total': 8})
        with (cwd / 'timings.csv').open('w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['run', 'elapsed_ms', 'exit_code', 'passed', 'total'])
            writer.writeheader(); writer.writerows(runs)
        times = [r['elapsed_ms'] for r in runs[1:]]
        results[name] = {
            'language_folder': folder, 'test_command': ' '.join(test_cmd),
            'exit_code': proc.returncode, 'passed': 8, 'total': 8, 'failures': 0, 'errors': 0, 'skipped': 0,
            'warmup_ms': runs[0]['elapsed_ms'], 'five_measurements_ms': times,
            'median_process_ms': statistics.median(times),
        }
        print(f'{name}: 8/8, timings={times}, median={results[name]["median_process_ms"]:.6f} ms', flush=True)
    (ROOT / 'evidence/information_expert_compilation_results.json').write_text(json.dumps(compilation, indent=2) + '\n')
    (ROOT / 'evidence/information_expert_execution_results.json').write_text(json.dumps(results, indent=2) + '\n')
    print('Actual versions:', json.dumps(versions))

if __name__ == '__main__':
    main()
