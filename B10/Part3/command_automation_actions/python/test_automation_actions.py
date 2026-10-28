"""Test runner for automation_actions.py (reads the shared CSV)."""
import re
import sys

from automation_actions import ActionInvoker, EmailAction, EmailService, OutputControl, OutputOnOffAction

CSV_PATH = '../../test-cases/automation_actions_cases.csv'
OUTPUTS = {'pump1': 'Main Pump', 'valve2': 'Drip Valve'}
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


def pairs(text):
    return dict(item.split('=', 1) for item in text.split('|') if item)


def run_case(case):
    config = pairs(case['config'])
    service = EmailService(int(config.get('hourly_max', '5')))
    control = OutputControl(OUTPUTS)
    invoker = ActionInvoker()
    invoker.register('email-1', EmailAction(config.get('email', 'grower@farm.org').replace(';', ','), service))
    invoker.register('output-1', OutputOnOffAction(config.get('output_id', 'pump1'), int(config.get('channel', '0')),
                                                   config.get('state', 'on'), float(config.get('duration', '0')),
                                                   control))
    dict_vars = {'value': pairs(case['value'])}
    if case['message'] != '-':
        dict_vars['message'] = case['message']
    result = invoker.trigger_action(case['action_id'], dict_vars)
    log = service.log + control.log
    return result['message'], '|'.join(log) if log else 'none'


def main():
    with open(CSV_PATH, encoding='utf-8') as f:
        lines = [line.rstrip('\r\n') for line in f if line.strip()]
    header = lines[0].split(',')
    passed = total = 0
    for line in lines[1:]:
        case = dict(zip(header, line.split(',')))
        total += 1
        expected = (case['expected_message'], case['expected_log'])
        try:
            actual, raised = run_case(case), False
        except Exception as err:
            actual, raised = (f'{type(err).__name__}: {err}', ''), True
        if expected[0] == 'ERROR':
            ok = raised
        else:
            ok = not raised and same(expected[0], actual[0]) and same(expected[1], actual[1])
        if ok:
            passed += 1
        else:
            print(f"FAIL {case['case_id']}: expected {' / '.join(expected)}, got "
                  f"{'ERROR ' if raised else ''}{' / '.join(actual)}")
    print(f'Command tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
