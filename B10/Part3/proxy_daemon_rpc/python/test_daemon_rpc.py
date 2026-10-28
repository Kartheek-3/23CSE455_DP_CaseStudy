"""Test runner for daemon_rpc.py (reads the shared CSV)."""
import re
import sys

from daemon_rpc import Daemon, DaemonControl

CSV_PATH = '../../test-cases/daemon_rpc_cases.csv'
URI = 'PYRO:mycodo@localhost:9080'
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


def build_network(spec):
    kind, _, arg = spec.partition(':')
    if kind == 'up':
        return {URI: Daemon()}
    if kind == 'slow':
        return {URI: Daemon(latency=float(arg))}
    if kind == 'unhealthy':
        return {URI: Daemon(health_message=arg)}
    return {}


def run_case(case):
    timeout = float(case['timeout']) if case['timeout'] else None
    control = DaemonControl(build_network(case['daemon']), URI, timeout)
    results = []
    for operation in case['operations'].split('|'):
        name, *args = operation.split(':')
        if name == 'check_daemon':
            results.append(control.check_daemon())
        elif name == 'output_on':
            results.append(control.output_on(args[0], amount=float(args[2]), output_channel=int(args[1])))
        elif name == 'output_off':
            results.append(control.output_off(args[0], output_channel=int(args[1])))
        elif name == 'output_state':
            results.append(control.output_state(args[0], int(args[1])))
        else:
            results.append(control.output_on_off(args[0], args[2], amount=float(args[3]), output_channel=int(args[1])))
    return '|'.join(results)


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
    print(f'Proxy tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
