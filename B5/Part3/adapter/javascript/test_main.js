'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {AdapterError, BookingOfferClient, AtlasAdapter, BeaconAdapter} = require('./main');
const ROOT = path.resolve(__dirname,'../../common_specs');
const read = file => fs.readFileSync(path.join(ROOT,file),'utf8').trimEnd().split(/\r?\n/).map(line => line.split('\t'));
function checkError(fn, code) {
  try { fn(); throw new Error('Expected error '+code); }
  catch (error) { if (!(error instanceof AdapterError) || error.code !== code) throw error; }
}
function isolationChecks() {
  const a = path.join(ROOT,'atlas_raw.tsv'), b = path.join(ROOT,'beacon_raw.tsv');
  const badA = path.join(ROOT,'adapter_invalid_fixtures/atlas_invalid_price.tsv');
  const badB = path.join(ROOT,'adapter_invalid_fixtures/beacon_invalid_type.tsv');
  const missingB = path.join(ROOT,'adapter_invalid_fixtures/beacon_missing_structure.tsv');
  const client = new BookingOfferClient();
  checkError(() => client.getOffer('atlas_demo','rome','atlas-rome-bad-price-01',badA,b),'INVALID_OFFER');
  checkError(() => client.getOffer('beacon_demo','rome','beacon-rome-invalid-01',a,badB),'INVALID_OFFER');
  checkError(() => client.getOffer('beacon_demo','rome','beacon-rome-incomplete-01',a,missingB),'INVALID_FIXTURE');
  if (client.getOffer('beacon_demo','rome','beacon-rome-museum-01',badA,b).offerId !== 'beacon-rome-museum-01') throw new Error('Beacon isolated from Atlas');
  if (client.getOffer('atlas_demo','rome','atlas-rome-walk-01',a,badB).offerId !== 'atlas-rome-walk-01') throw new Error('Atlas isolated from Beacon');
  if (new AtlasAdapter(a).offersFor('paris').length !== 1 || new BeaconAdapter(b).offersFor('rome').length !== 1) throw new Error('Destination filter');
  checkError(() => client.getOffer('atlas_demo','rome','beacon-rome-museum-01',a,b),'UNKNOWN_OFFER');
  checkError(() => client.getOffer('beacon_demo','rome','atlas-rome-walk-01',a,b),'UNKNOWN_OFFER');
}
function main() {
  const cases = read('adapter_cases.tsv'), expected = read('adapter_expected.tsv');
  if (cases.length !== 11 || expected.length !== 11) throw new Error('Wrong number of cases');
  if (cases[0].join('\t') !== 'case_id\tprovider_code\tdestination_code\toffer_id\tatlas_source\tbeacon_source') throw new Error('Bad case header');
  for (let i=1; i<cases.length; i++) {
    const [id, provider, destination, offerId, atlas, beacon] = cases[i];
    let actual;
    try { actual = [id,'OK',...new BookingOfferClient().getOffer(provider,destination,offerId,path.join(ROOT,atlas),path.join(ROOT,beacon)).fields()]; }
    catch(error) { if (!(error instanceof AdapterError)) throw error; actual = [id,'ERROR',error.code]; }
    if (actual.join('\t') !== expected[i].join('\t')) throw new Error(`Mismatch ${id}: ${actual.join('\t')} expected ${expected[i].join('\t')}`);
    process.stdout.write(actual.join('\t')+'\n');
  }
  isolationChecks();
  process.stderr.write('passed=10/10 failures=0 errors=0 skipped=0; extra_isolation_checks=passed\n');
}
try { main(); } catch(error) { console.error(error); process.exitCode=1; }
