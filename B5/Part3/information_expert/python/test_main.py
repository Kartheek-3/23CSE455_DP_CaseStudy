import csv
import sys
from pathlib import Path
from main import InboxItem, InboxReviewController, Trip, TripItem, display

root = Path(__file__).resolve().parents[2] / 'common_specs'
with (root / 'information_expert_cases.tsv').open(encoding='utf-8', newline='') as f:
    cases = list(csv.DictReader(f, delimiter='\t'))
with (root / 'information_expert_expected.tsv').open(encoding='utf-8') as f:
    expected = f.read().splitlines()[1:]
if len(cases) != 8 or len(expected) != 8:
    raise RuntimeError('Expected exactly 8 cases')

for row, wanted in zip(cases, expected):
    trip = Trip(row['trip_id'])
    if row['existing_item_id'] != '~':
        trip.items.append(TripItem(row['existing_item_id'], row['existing_trip_id'],
                                   row['existing_item_name'], row['existing_reference'],
                                   row['existing_inbox_id']))
    before = [(i.id, i.trip_id, i.name, i.confirmation_ref, i.inbox_id, i.status) for i in trip.items]
    inbox = InboxItem(row['inbox_id'], row['trip_id'], row['provider_name'], row['incoming_reference'])
    actual = InboxReviewController().review(inbox, trip, row['case_id'])
    action = actual.split('\t')[1]
    if action == 'ERROR':
        state_ok = [(i.id, i.trip_id, i.name, i.confirmation_ref, i.inbox_id, i.status) for i in trip.items] == before
    elif action == 'CREATED':
        last = trip.items[-1]
        state_ok = (len(trip.items) == len(before) + 1
                    and last.id == 'item-' + row['case_id'] and last.trip_id == row['trip_id']
                    and last.name == row['provider_name'].strip() and last.status == 'confirmed'
                    and last.confirmation_ref == display(row['incoming_reference'])
                    and last.inbox_id == row['inbox_id']
                    and [(i.id, i.trip_id, i.name, i.confirmation_ref, i.inbox_id, i.status)
                         for i in trip.items[:-1]] == before)
    else:
        item = trip.items[0]
        state_ok = (len(trip.items) == len(before) == 1 and item.id == before[0][0]
                    and item.trip_id == before[0][1] and item.name == before[0][2]
                    and item.status == before[0][5]
                    and item.confirmation_ref == (before[0][3] if before[0][3] != '~'
                                                  else display(row['incoming_reference']))
                    and item.inbox_id == (before[0][4] if before[0][4] != '~' else row['inbox_id']))
    if actual != wanted or not state_ok:
        print(f'FAIL {row["case_id"]}: wanted={wanted!r} actual={actual!r} state_ok={state_ok}', file=sys.stderr)
        sys.exit(1)
    print(actual)
print('passed=8/8 failures=0 errors=0 skipped=0', file=sys.stderr)
