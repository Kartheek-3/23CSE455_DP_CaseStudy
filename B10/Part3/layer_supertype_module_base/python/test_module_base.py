"""Test runner for module_base.py (reads the shared CSV)."""
import re
import sys

from module_base import AbstractFunction, AbstractInput, OptionStore

CSV_PATH = '../../test-cases/module_base_cases.csv'
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


def option_defs(text):
    defs = []
    for item in text.split('|'):
        option = {}
        for key, field in zip(('id', 'type', 'default_value', 'required'), item.split(':')):
            if field != '!':
                option[key] = field == 'true' if key == 'required' else field
        defs.append(option)
    return defs


def pairs(text):
    return {k: v.replace(';', ',') for k, v in (item.split('=', 1) for item in text.split('|') if item)}


def run_case(case):
    store = OptionStore()
    member_class, other_class = (AbstractInput, AbstractFunction) if case['member'] == 'input' else (AbstractFunction, AbstractInput)
    member = member_class('u1', store)
    member.setup_custom_options(option_defs(case['option_defs']), pairs(case['stored']))
    parts = [f'{name}={fmt(member.options[name])}' for name in sorted(member.options)]
    if member.errors:
        parts.append(f'errors={len(member.errors)}')
    if case['persist'] != '-':
        name, value = case['persist'].split('=', 1)
        member.set_custom_option(name, value)
        parts.append(f'stored={fmt(member.get_custom_option(name))}')
        parts.append(f"other_table={fmt(other_class('u1', store).get_custom_option(name))}")
    return '|'.join(parts)


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
    print(f'Layer Supertype tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
