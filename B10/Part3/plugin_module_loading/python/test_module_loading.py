"""Test runner for module_loading.py (reads the shared CSV)."""
import re
import sys

from module_loading import InputController, parse_input_information

CSV_PATH = '../../test-cases/module_loading_cases.csv'
NUMBER = re.compile(r'^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$')


def tokens(text):
    return [t for t in re.split(r'[\s|;=,()]+', text) if t]


def same(expected, actual):
    a, b = tokens(expected), tokens(actual)
    if len(a) != len(b):
        return False
    for x, y in zip(a, b):
        if NUMBER.match(x) and NUMBER.match(y):
            if abs(float(x) - float(y)) > 1e-9:
                return False
        elif x != y:
            return False
    return True


def attempt(function):
    try:
        return function(), False
    except Exception as err:
        return f'{type(err).__name__}: {err}', True


def check(expected, actual, raised):
    return raised if expected == 'ERROR' else (not raised and same(expected, actual))


def registry_text(registry, errors):
    entries = [f"{name}={registry[name]['file_path']}" for name in sorted(registry)]
    if errors:
        entries.append(f'duplicates={len(errors)}')
    return '|'.join(entries) if entries else 'none'


def run_case(case):
    files = [f for f in case['files'].split('|') if f]
    result, raised = attempt(lambda: parse_input_information(files))
    if raised:
        return result, raised, None, None
    registry, errors = result
    device, device_raised = attempt(lambda: InputController(registry).initialize(case['device']).describe())
    return registry_text(registry, errors), False, device, device_raised


def main():
    with open(CSV_PATH, encoding='utf-8') as f:
        lines = [line.rstrip('\r\n') for line in f if line.strip()]
    header = lines[0].split(',')
    passed = total = 0
    for line in lines[1:]:
        case = dict(zip(header, line.split(',')))
        total += 1
        registry, raised, device, device_raised = run_case(case)
        ok = check(case['expected_registry'], registry, raised)
        if ok and not raised:
            ok = check(case['expected_device'], device, device_raised)
        if ok:
            passed += 1
        else:
            print(f"FAIL {case['case_id']}: expected {case['expected_registry']} / {case['expected_device']}, got "
                  f"{'ERROR ' if raised else ''}{registry} / {'ERROR ' if device_raised else ''}{device}")
    print(f'Plugin tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
