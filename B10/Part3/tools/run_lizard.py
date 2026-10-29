"""Run lizard on the PRODUCTION file of every language for each pattern (dev tool).

Writes the raw lizard output to Part3/evidence/lizard_<pattern>.txt.
Usage (from Part3/):  python tools/run_lizard.py
"""
import os
import subprocess

from measure import EVIDENCE, LANGUAGES, PART3, PATTERNS, find_venv

LIZARD = os.path.join(find_venv(PART3), 'Scripts', 'lizard.exe')

for key, (folder, name, files) in PATTERNS.items():
    paths = [f'{language}/{files[language][0]}' for language in LANGUAGES]
    cwd = os.path.join(PART3, folder)
    for path in paths:
        if not os.path.isfile(os.path.join(cwd, path)):
            raise SystemExit(f'missing production file {path}')
    result = subprocess.run([LIZARD] + paths, cwd=cwd, capture_output=True, text=True)
    with open(os.path.join(EVIDENCE, f'lizard_{key}.txt'), 'w', encoding='utf-8') as f:
        f.write(f'# lizard 1.24.1 on the production files only; working folder: Part3/{folder}\n')
        f.write(f'$ lizard {" ".join(paths)}\n')
        f.write(result.stdout + result.stderr)
    print(f'wrote evidence/lizard_{key}.txt')
