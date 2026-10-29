'use strict';
const fs = require('node:fs');

class AdapterError extends Error { constructor(code) { super(code); this.code = code; } }
class NormalizedOffer {
  constructor(providerCode, providerName, offerId, name, kind, address, description, cents, currency) {
    Object.assign(this, {providerCode, providerName, offerId, name, kind, address, description, cents, currency});
  }
  fields() { return [this.providerCode, this.providerName, this.offerId, this.name, this.kind, this.address, this.description, String(this.cents), this.currency]; }
}
function loadRows(path, header) {
  const records = fs.readFileSync(path, 'utf8').trimEnd().split(/\r?\n/).map(line => line.split('\t'));
  if (!records.length || records[0].join('\t') !== header.join('\t') || records.slice(1).some(row => row.length !== header.length)) throw new AdapterError('INVALID_FIXTURE');
  return records.slice(1).map(row => Object.fromEntries(header.map((key, index) => [key, row[index]])));
}
function parseCents(value) {
  if (!/^[0-9]+\.[0-9]{2}$/.test(value)) throw new AdapterError('INVALID_OFFER');
  const [major, minor] = value.split('.').map(Number);
  const cents = major * 100 + minor;
  if (!Number.isSafeInteger(cents)) throw new AdapterError('INVALID_OFFER');
  return cents;
}
class OfferProvider { offersFor(destination) { throw new Error('Implement offersFor'); } }
class AtlasAdapter extends OfferProvider {
  constructor(source) { super(); this.source = source; }
  offersFor(destination) {
    const header = ['destination','id','title','category','location','details','price'];
    const kinds = {activity:'do', shopping:'shop', dining:'eat'};
    const rows = loadRows(this.source, header).filter(row => row.destination === destination);
    return rows.map(row => {
      const parts = row.price.split(':');
      if (!row.id.trim() || !row.title.trim() || !row.location.trim() || !row.details.trim() ||
          !Object.hasOwn(kinds, row.category) || parts.length !== 2 || !['EUR','GBP','USD'].includes(parts[0])) throw new AdapterError('INVALID_OFFER');
      return new NormalizedOffer('atlas_demo','Atlas Demo',row.id,row.title,kinds[row.category],row.location,row.details,parseCents(parts[1]),parts[0]);
    });
  }
}
class BeaconAdapter extends OfferProvider {
  constructor(source) { super(); this.source = source; }
  offersFor(destination) {
    const header = ['code','label','type','address','summary','amount','currency','destination'];
    const kinds = {experience:'do', retail:'shop', dining:'eat'};
    const rows = loadRows(this.source, header).filter(row => row.destination === destination);
    return rows.map(row => {
      if (!row.code.trim() || !row.label.trim() || !row.address.trim() || !row.summary.trim() ||
          !Object.hasOwn(kinds, row.type) || !['EUR','GBP','USD'].includes(row.currency)) throw new AdapterError('INVALID_OFFER');
      return new NormalizedOffer('beacon_demo','Beacon Demo',row.code,row.label,kinds[row.type],row.address,row.summary,parseCents(row.amount),row.currency);
    });
  }
}
class ProviderRegistry {
  static find(code, atlasSource, beaconSource) {
    if (code === 'atlas_demo') return new AtlasAdapter(atlasSource);
    if (code === 'beacon_demo') return new BeaconAdapter(beaconSource);
    throw new AdapterError('UNKNOWN_PROVIDER');
  }
}
class BookingOfferClient {
  getOffer(providerCode, destination, offerId, atlasSource, beaconSource) {
    if (!['atlas_demo','beacon_demo'].includes(providerCode)) throw new AdapterError('UNKNOWN_PROVIDER');
    if (!['rome','paris'].includes(destination)) throw new AdapterError('UNKNOWN_DESTINATION');
    const provider = ProviderRegistry.find(providerCode, atlasSource, beaconSource);
    const offer = provider.offersFor(destination).find(item => item.offerId === offerId);
    if (!offer) throw new AdapterError('UNKNOWN_OFFER');
    return offer;
  }
}
module.exports = {AdapterError, NormalizedOffer, OfferProvider, AtlasAdapter, BeaconAdapter, ProviderRegistry, BookingOfferClient};
