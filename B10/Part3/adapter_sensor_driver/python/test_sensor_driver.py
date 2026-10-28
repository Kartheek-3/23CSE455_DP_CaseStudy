"""Test runner for sensor_driver.py (reads the shared CSV)."""
import re
import sys

from sensor_driver import Seesaw, SoilInput, WeatherApi, WeatherInput, update_measure

CSV_PATH = '../../test-cases/sensor_driver_cases.csv'
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


def run_case(case):
    enabled = [int(ch) for ch in case['enabled'].split('|')]
    raw = dict(item.split('=', 1) for item in case['raw'].split('|') if '=' in item)
    if case['input'] == 'soil':
        sensor = None if case['raw'] == 'unset' else Seesaw(raw)
        device = SoilInput(enabled, sensor)
    else:
        api_key, city = raw.pop('api_key', ''), raw.pop('city', '')
        network_up = raw.pop('network', 'up') != 'down'
        device = WeatherInput(enabled, WeatherApi(raw, network_up), api_key, city)
    values = update_measure(device)
    if values is None:
        return 'None'
    return '|'.join(f'{channel}={values[channel]}' for channel in sorted(values))


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
    print(f'Adapter tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
