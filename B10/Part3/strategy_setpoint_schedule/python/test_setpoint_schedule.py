"""Test runner for setpoint_schedule.py (reads the shared CSV)."""
import re
import sys

from setpoint_schedule import create_method_handler

CSV_PATH = '../../test-cases/setpoint_schedule_cases.csv'
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


def fmt(value):
    if value is None:
        return 'None'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    return str(value)


def parse_rows(text, row_separator):
    return [[float(n) for n in row.split(';')] for row in text.split(row_separator)]


def run_case(case):
    linked = []
    rows = []
    if case['method_type'] == 'Cascade':
        for spec in case['params'].split('|'):
            linked_type, linked_rows = spec.split(':', 1)
            linked.append(create_method_handler(linked_type, parse_rows(linked_rows, '/')))
    else:
        rows = parse_rows(case['params'], '|')
    method = create_method_handler(case['method_type'], rows, linked)
    setpoint, ended = method.calculate_setpoint(float(case['now']), float(case['start']))
    return f'{fmt(setpoint)}|{fmt(ended)}'


def main():
    with open(CSV_PATH, encoding='utf-8') as f:
        lines = [line.rstrip('\r\n') for line in f if line.strip()]
    header = lines[0].split(',')
    passed = total = 0
    for line in lines[1:]:
        case = dict(zip(header, line.split(',')))
        total += 1
        expected = case['expected']
        try:
            actual, raised = run_case(case), False
        except Exception as err:
            actual, raised = f'{type(err).__name__}: {err}', True
        ok = raised if expected == 'ERROR' else (not raised and same(expected, actual))
        if ok:
            passed += 1
        else:
            print(f"FAIL {case['case_id']}: expected {expected}, got {'ERROR ' if raised else ''}{actual}")
    print(f'Strategy tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
