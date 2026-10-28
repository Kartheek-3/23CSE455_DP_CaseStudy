"""Test runner for setpoint_interpolation.py (reads the shared CSV)."""
import re
import sys

from setpoint_interpolation import DailyMethod, DateMethod, MethodRow

CSV_PATH = '../../test-cases/setpoint_interpolation_cases.csv'
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


def run_case(case):
    rows = []
    for item in case['rows'].split('|'):
        start, end, sp_start, sp_end = item.split(';')
        rows.append(MethodRow(start, end, float(sp_start), float(sp_end) if sp_end else None))
    method = DailyMethod(rows) if case['method'] == 'Daily' else DateMethod(rows)
    setpoint, ended = method.calculate_setpoint(case['now'])
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
    print(f'Template Method tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
