"""Compile and run the Part 3 test runners once and save their raw output (dev tool).

Writes Part3/evidence/tests_<pattern>_<language>.txt with the command, working folder, exit code
and the unedited stdout/stderr of the compile and test steps.

Usage (from Part3/):  python tools/run_tests.py [pattern ...]     (default: all patterns)
"""
import os
import subprocess
import sys

from measure import EVIDENCE, LANGUAGES, PATTERNS, compile_command, folder, rel, run_command, shown


def run(pattern):
    for language in LANGUAGES:
        cwd = folder(pattern, language)
        out = [f'# {PATTERNS[pattern][1]} / {language}', f'working folder: {rel(cwd)}']
        compile_cmd = compile_command(pattern, language)
        ok = True
        if compile_cmd:
            compiled = subprocess.run(compile_cmd, cwd=cwd, capture_output=True, text=True)
            out += [f'$ {shown(compile_cmd, cwd)}', compiled.stdout + compiled.stderr, f'[compile exit code: {compiled.returncode}]']
            ok = compiled.returncode == 0
        if ok:
            command = run_command(pattern, language)
            result = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
            out += [f'$ {shown(command, cwd)}', result.stdout + result.stderr, f'[exit code: {result.returncode}]']
            last = result.stdout.strip().splitlines()[-1] if result.stdout.strip() else '(no output)'
        else:
            last = 'COMPILE FAILED'
        path = os.path.join(EVIDENCE, f'tests_{pattern}_{language}.txt')
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(out) + '\n')
        print(f'{pattern:16s} {language:11s} {last}')


if __name__ == '__main__':
    for key in (sys.argv[1:] or list(PATTERNS)):
        run(key)
