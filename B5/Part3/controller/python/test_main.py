import csv
import sys
from pathlib import Path
from main import Account, CoverTaskQueue, TripCreationController, TripStore


ROOT = Path(__file__).resolve().parents[2] / 'common_specs'
with (ROOT / 'controller_cases.tsv').open(encoding='utf-8', newline='') as stream:
    cases = list(csv.DictReader(stream, delimiter='\t'))
with (ROOT / 'controller_expected.tsv').open(encoding='utf-8', newline='') as stream:
    expected = [line.rstrip('\r\n') for line in stream][1:]
if len(cases) != 8 or len(expected) != 8:
    raise RuntimeError('fixture count mismatch')

for case, wanted in zip(cases, expected):
    account = Account(case['user_id'], case['owner_traveler_id'])
    store = TripStore()
    queue = CoverTaskQueue()
    controller = TripCreationController(account, store, queue)
    actual = controller.create(case['case_id'], case['title'], case['start_date'], case['end_date'])
    success = actual.split('\t')[1] == 'CREATED'
    if success:
        side_effects_ok = (len(store.trips) == len(account.memberships) == len(queue.trip_ids) == 1
                           and account.memberships[0].trip_id == store.trips[0].id
                           and account.memberships[0].traveler_id == case['owner_traveler_id']
                           and account.memberships[0].role == 'owner'
                           and queue.trip_ids[0] == store.trips[0].id)
    else:
        side_effects_ok = (not store.trips and not account.memberships and not queue.trip_ids)
    if actual != wanted or not side_effects_ok:
        print(f'FAIL {case["case_id"]} wanted={wanted!r} actual={actual!r} side_effects_ok={side_effects_ok}', file=sys.stderr)
        sys.exit(1)
    print(actual)
print('passed=8/8 failures=0 errors=0 skipped=0', file=sys.stderr)
