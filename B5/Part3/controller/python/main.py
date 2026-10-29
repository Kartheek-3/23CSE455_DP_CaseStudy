from dataclasses import dataclass
from datetime import date
import re


@dataclass(frozen=True)
class Trip:
    id: str
    title: str
    start_date: date
    end_date: date


@dataclass(frozen=True)
class TripMember:
    trip_id: str
    traveler_id: str
    role: str


class Account:
    def __init__(self, user_id, owner_traveler_id):
        self.user_id = user_id
        self.owner_traveler_id = owner_traveler_id
        self.memberships = []

    def add_membership(self, membership):
        self.memberships.append(membership)


class TripStore:
    def __init__(self):
        self.trips = []

    def add(self, trip):
        self.trips.append(trip)


class CoverTaskQueue:
    def __init__(self):
        self.trip_ids = []

    def enqueue(self, trip_id):
        self.trip_ids.append(trip_id)


class TripCreationController:
    def __init__(self, account, store, cover_tasks):
        self.account = account
        self.store = store
        self.cover_tasks = cover_tasks

    def create(self, case_id, title, start_text, end_text):
        if not self.account.user_id or self.account.user_id.strip() in ('', '~'):
            return f'{case_id}\tERROR\tUNAUTHENTICATED'
        if not self.account.owner_traveler_id or self.account.owner_traveler_id.strip() in ('', '~'):
            return f'{case_id}\tERROR\tMISSING_OWNER'
        cleaned = title.strip()
        if cleaned in ('', '~'):
            return f'{case_id}\tERROR\tMISSING_TITLE'
        try:
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', start_text, re.ASCII) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', end_text, re.ASCII):
                raise ValueError('invalid date syntax')
            start = date.fromisoformat(start_text)
            end = date.fromisoformat(end_text)
        except ValueError:
            return f'{case_id}\tERROR\tINVALID_DATE'
        if end < start:
            return f'{case_id}\tERROR\tINVALID_DATE_RANGE'
        trip = Trip(f'trip-{case_id}', cleaned, start, end)
        owner = TripMember(trip.id, self.account.owner_traveler_id, 'owner')
        self.store.add(trip)
        self.account.add_membership(owner)
        self.cover_tasks.enqueue(trip.id)
        return '\t'.join((case_id, 'CREATED', trip.id, trip.title, owner.traveler_id, owner.role, 'COVER_QUEUED'))
