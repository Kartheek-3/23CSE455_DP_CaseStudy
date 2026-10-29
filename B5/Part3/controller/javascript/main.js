'use strict';
class Trip {
  constructor(id, title, startDate, endDate) {
    this.id = id; this.title = title; this.startDate = startDate; this.endDate = endDate;
  }
}
class TripMember {
  constructor(tripId, travelerId, role) {
    this.tripId = tripId; this.travelerId = travelerId; this.role = role;
  }
}
class Account {
  constructor(userId, ownerTravelerId) {
    this.userId = userId; this.ownerTravelerId = ownerTravelerId; this.memberships = [];
  }
  addMembership(member) { this.memberships.push(member); }
}
class TripStore {
  constructor() { this.trips = []; }
  add(trip) { this.trips.push(trip); }
}
class CoverTaskQueue {
  constructor() { this.tripIds = []; }
  enqueue(tripId) { this.tripIds.push(tripId); }
}
function validGregorian(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}
class TripCreationController {
  constructor(account, store, coverTasks) {
    this.account = account; this.store = store; this.coverTasks = coverTasks;
  }
  create(caseId, title, startText, endText) {
    const absent = x => x == null || x.trim() === '' || x === '~';
    const error = code => [caseId, 'ERROR', code].join('\t');
    if (absent(this.account.userId)) return error('UNAUTHENTICATED');
    if (absent(this.account.ownerTravelerId)) return error('MISSING_OWNER');
    const cleaned = title.trim();
    if (absent(cleaned)) return error('MISSING_TITLE');
    if (!validGregorian(startText) || !validGregorian(endText)) return error('INVALID_DATE');
    if (endText < startText) return error('INVALID_DATE_RANGE');
    const trip = new Trip(`trip-${caseId}`, cleaned, startText, endText);
    const member = new TripMember(trip.id, this.account.ownerTravelerId, 'owner');
    this.store.add(trip);
    this.account.addMembership(member);
    this.coverTasks.enqueue(trip.id);
    return [caseId, 'CREATED', trip.id, trip.title, member.travelerId, member.role, 'COVER_QUEUED'].join('\t');
  }
}
module.exports = { Trip, TripMember, Account, TripStore, CoverTaskQueue, TripCreationController };
