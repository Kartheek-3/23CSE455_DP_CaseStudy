'use strict';
function missing(value) { return value == null || value.trim() === '' || value.trim() === '~'; }
function display(value) { return missing(value) ? '~' : value.trim(); }

class TripItem {
  constructor(id, tripId, name, confirmationRef = '~', inboxId = '~', status = 'idea') {
    Object.assign(this, { id, tripId, name, confirmationRef, inboxId, status });
  }
}
class Trip {
  constructor(id) { this.id = id; this.items = []; }
}
class InboxItem {
  constructor(id, tripId, providerName, incomingReference) {
    Object.assign(this, { id, tripId, providerName, incomingReference });
  }
  linkOrCreateTripItem(trip, caseId) {
    const name = display(this.providerName);
    if (name === '~') return { action: 'ERROR', error: 'MISSING_PROVIDER' };
    const existing = trip.items.find(item => item.tripId === this.tripId && item.name.trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      if (missing(existing.confirmationRef)) existing.confirmationRef = display(this.incomingReference);
      if (missing(existing.inboxId)) existing.inboxId = this.id;
      return { action: 'LINKED', item: existing };
    }
    const item = new TripItem(`item-${caseId}`, this.tripId, name, display(this.incomingReference), this.id, 'confirmed');
    trip.items.push(item);
    return { action: 'CREATED', item };
  }
}
class InboxReviewController {
  review(inbox, trip, caseId) {
    const result = inbox.linkOrCreateTripItem(trip, caseId);
    if (result.action === 'ERROR') return [caseId, 'ERROR', result.error].join('\t');
    const item = result.item;
    return [caseId, result.action, item.id, item.name.trim(), display(item.confirmationRef), display(item.inboxId)].join('\t');
  }
}
module.exports = { TripItem, Trip, InboxItem, InboxReviewController, display };
