#!/usr/bin/env python3
"""P03 Controller real compilation, test, version and fresh-process timing evidence."""
import csv
import hashlib
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
    ('C++', 'cpp', ['g++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-pedantic', 'main.cpp', 'test_main.cpp', '-o', 'controller_tests'], ['./controller_tests']),
]
VERSIONS = [('java', ['java', '-version']), ('javac', ['javac', '-version']),
            ('python3', ['python3', '--version']), ('node', ['node', '--version']), ('g++', ['g++', '--version'])]
EXPECTED_HASHES = {
    'controller_cases.tsv': '89d26a4cf16f1fdc84b1f279c637197d622f7a1f42a279153adccd86481040f2',
    'controller_expected.tsv': '55dc3248a0b492f4ee297bbf23eeffdc9422bae8bdf0a5e507ac165cb72544f5',
}


def run(cmd, cwd):
    start = time.perf_counter_ns()
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return p, (time.perf_counter_ns() - start) / 1_000_000


def main():
    for filename, target in EXPECTED_HASHES.items():
        current = hashlib.sha256((ROOT / 'common_specs' / filename).read_bytes()).hexdigest()
        if current != target:
            raise ValueError(f'Frozen controller fixture changed: {filename}')
    inputs = (ROOT / 'common_specs' / 'controller_cases.tsv').read_text(encoding='utf-8').splitlines()[1:]
    expected = (ROOT / 'common_specs' / 'controller_expected.tsv').read_text(encoding='utf-8').splitlines()[1:]
    assert len(inputs) == len(expected) == 8
    versions = {}
    for name, command in VERSIONS:
        proc, _ = run(command, ROOT)
        if proc.returncode:
            raise RuntimeError(f'Version command failed for {name}: {proc.stderr}')
        versions[name] = (proc.stdout or proc.stderr).strip().splitlines()[0]
    (ROOT / 'evidence/controller_environment_versions.json').write_text(json.dumps(versions, indent=2) + '\n', encoding='utf-8')
    results, compiled = {}, []
    for lang, folder, compile_cmd, test_cmd in JOBS:
        cwd = ROOT / 'controller' / folder
        if compile_cmd:
            proc, _ = run(compile_cmd, cwd)
            compiled.append({'language': lang, 'command': ' '.join(compile_cmd), 'exit_code': proc.returncode, 'stdout': proc.stdout, 'stderr': proc.stderr})
            if proc.returncode:
                raise RuntimeError(f'{lang} compilation failed: {proc.stderr}')
        proc, _ = run(test_cmd, cwd)
        result_text = (f'Command: {" ".join(test_cmd)}\nWorking directory: Part3/controller/{folder}\n'
                       f'Exit code: {proc.returncode}\n\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}')
        (cwd / 'test_result.txt').write_text(result_text, encoding='utf-8')
        signature = 'passed=8/8 failures=0 errors=0 skipped=0'
        if proc.returncode or proc.stdout.splitlines() != expected or signature not in proc.stderr:
            raise RuntimeError(f'{lang} 8-case test failed: {result_text}')
        runs = []
        for i in range(6):
            repeat, elapsed = run(test_cmd, cwd)
            if repeat.returncode or repeat.stdout.splitlines() != expected or signature not in repeat.stderr:
                raise RuntimeError(f'{lang}: benchmark iteration {i} failed')
            runs.append({'run': 'warmup' if i == 0 else f'measure_{i}', 'elapsed_ms': round(elapsed, 6),
                         'exit_code': repeat.returncode, 'passed': 8, 'total': 8})
        with (cwd / 'timings.csv').open('w', encoding='utf-8', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=['run', 'elapsed_ms', 'exit_code', 'passed', 'total'])
            writer.writeheader()
            writer.writerows(runs)
        measurements = [r['elapsed_ms'] for r in runs[1:]]
        results[lang] = {
            'language_folder': folder, 'test_command': ' '.join(test_cmd), 'exit_code': proc.returncode,
            'passed': 8, 'total': 8, 'failures': 0, 'errors': 0, 'skipped': 0,
            'warmup_ms': runs[0]['elapsed_ms'], 'five_measurements_ms': measurements,
            'median_process_ms': statistics.median(measurements),
        }
        print(f'{lang}: 8/8; timings={measurements}; median={results[lang]["median_process_ms"]:.6f} ms')
    (ROOT / 'evidence/controller_compilation_results.json').write_text(json.dumps(compiled, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'evidence/controller_execution_results.json').write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
    print('Actual versions:', json.dumps(versions))


if __name__ == '__main__':
    main()
