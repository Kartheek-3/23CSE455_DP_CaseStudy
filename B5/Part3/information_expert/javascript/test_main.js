'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Trip, TripItem, InboxItem, InboxReviewController, display } = require('./main');
const root = path.resolve(__dirname, '../../common_specs');
const cases = fs.readFileSync(path.join(root, 'information_expert_cases.tsv'), 'utf8').trimEnd().split(/\r?\n/).slice(1);
const expected = fs.readFileSync(path.join(root, 'information_expert_expected.tsv'), 'utf8').trimEnd().split(/\r?\n/).slice(1);
if (cases.length !== 8 || expected.length !== 8) throw new Error('Expected 8 cases');
for (let i = 0; i < cases.length; i++) {
  const [id, inboxId, tripId, provider, reference, oldId, oldTrip, oldName, oldRef, oldInbox] = cases[i].split('\t');
  const trip = new Trip(tripId);
  if (oldId !== '~') trip.items.push(new TripItem(oldId, oldTrip, oldName, oldRef, oldInbox));
  const before = JSON.stringify(trip.items);
  const inbox = new InboxItem(inboxId, tripId, provider, reference);
  const actual = new InboxReviewController().review(inbox, trip, id);
  const action = actual.split('\t')[1];
  let stateOK;
  if (action === 'ERROR') stateOK = JSON.stringify(trip.items) === before;
  else if (action === 'CREATED') {
    const item = trip.items.at(-1);
    stateOK = trip.items.length === JSON.parse(before).length + 1
      && JSON.stringify(trip.items.slice(0, -1)) === before
      && item.id === `item-${id}` && item.tripId === tripId && item.name === provider.trim()
      && item.status === 'confirmed' && item.confirmationRef === display(reference) && item.inboxId === inboxId;
  } else {
    const item = trip.items[0];
    stateOK = trip.items.length === 1 && item.id === oldId && item.tripId === oldTrip
      && item.name === oldName && item.status === 'idea'
      && item.confirmationRef === (oldRef === '~' ? display(reference) : oldRef)
      && item.inboxId === (oldInbox === '~' ? inboxId : oldInbox);
  }
  if (actual !== expected[i] || !stateOK) {
    console.error(`FAIL ${id} wanted=${JSON.stringify(expected[i])} actual=${JSON.stringify(actual)} stateOK=${stateOK}`);
    process.exit(1);
  }
  console.log(actual);
}
console.error('passed=8/8 failures=0 errors=0 skipped=0');
