'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Account, TripStore, CoverTaskQueue, TripCreationController } = require('./main');
const root = path.resolve(__dirname, '../../common_specs');
const cases = fs.readFileSync(path.join(root, 'controller_cases.tsv'), 'utf8').trimEnd().split(/\r?\n/).slice(1);
const expected = fs.readFileSync(path.join(root, 'controller_expected.tsv'), 'utf8').trimEnd().split(/\r?\n/).slice(1);
if (cases.length !== 8 || expected.length !== 8) throw new Error('Expected 8 cases');
for (let i = 0; i < 8; ++i) {
  const [caseId, userId, ownerId, title, start, end] = cases[i].split('\t');
  const account = new Account(userId, ownerId);
  const store = new TripStore();
  const queue = new CoverTaskQueue();
  const controller = new TripCreationController(account, store, queue);
  const actual = controller.create(caseId, title, start, end);
  const success = actual.split('\t')[1] === 'CREATED';
  const stateOK = success
    ? store.trips.length === 1 && account.memberships.length === 1 && queue.tripIds.length === 1
      && account.memberships[0].tripId === store.trips[0].id
      && account.memberships[0].travelerId === ownerId
      && account.memberships[0].role === 'owner' && queue.tripIds[0] === store.trips[0].id
    : store.trips.length === 0 && account.memberships.length === 0 && queue.tripIds.length === 0;
  if (actual !== expected[i] || !stateOK) {
    console.error(`FAIL ${caseId}: wanted=${JSON.stringify(expected[i])} got=${JSON.stringify(actual)} stateOK=${stateOK}`);
    process.exit(1);
  }
  console.log(actual);
}
console.error('passed=8/8 failures=0 errors=0 skipped=0');
