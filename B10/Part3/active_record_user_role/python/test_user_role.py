"""Test runner for user_role.py (reads the shared CSV)."""
import re
import sys

from user_role import Role, Session, User

CSV_PATH = '../../test-cases/user_role_cases.csv'
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
    session = Session()
    users = {}
    results = []
    for operation in case['operations'].split('|'):
        name, *args = operation.split(':')
        if name == 'user':
            user = users[args[0]] = User(session, args[0], args[1])
            user.set_password(args[2])
            results.append('saved' if user.save() is not None else 'None')
        elif name == 'role':
            role = Role(session, None if args[0] == '!' else args[0])
            results.append('saved' if role.save() is not None else 'None')
        elif name in ('delete_user', 'delete_new'):
            user = users[args[0]] if name == 'delete_user' else User(session, args[0], f'{args[0]}@new')
            log_size = len(session.log)
            user.delete()
            results.append('error_logged' if len(session.log) > log_size else 'deleted')
        elif name == 'check':
            user = users[args[0]]
            results.append('match' if User.check_password(args[1], user.password_hash) == user.password_hash else 'no_match')
        elif name == 'check_hash':
            results.append(User.check_password(args[0], args[1]))
        elif name == 'count_users':
            results.append(str(session.count(User)))
        else:
            results.append(str(session.count(Role)))
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
    print(f'Active Record tests: {passed}/{total} passed')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
