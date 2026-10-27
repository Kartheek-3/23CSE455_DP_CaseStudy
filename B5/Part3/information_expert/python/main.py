from dataclasses import dataclass, field


def missing(value):
    return value is None or value.strip() in ('', '~')


def display(value):
    return '~' if missing(value) else value.strip()


@dataclass
class TripItem:
    id: str
    trip_id: str
    name: str
    confirmation_ref: str = '~'
    inbox_id: str = '~'
    status: str = 'idea'


@dataclass
class Trip:
    id: str
    items: list[TripItem] = field(default_factory=list)


@dataclass
class InboxItem:
    id: str
    trip_id: str
    provider_name: str
    incoming_reference: str

    def link_or_create_trip_item(self, trip: Trip, case_id: str):
        name = display(self.provider_name)
        if name == '~':
            return 'ERROR', 'MISSING_PROVIDER'
        for item in trip.items:
            if item.trip_id == self.trip_id and item.name.strip().lower() == name.lower():
                if missing(item.confirmation_ref):
                    item.confirmation_ref = display(self.incoming_reference)
                if missing(item.inbox_id):
                    item.inbox_id = self.id
                return 'LINKED', item
        created = TripItem(f'item-{case_id}', self.trip_id, name,
                           display(self.incoming_reference), self.id, 'confirmed')
        trip.items.append(created)
        return 'CREATED', created


class InboxReviewController:
    def review(self, inbox: InboxItem, trip: Trip, case_id: str):
        action, result = inbox.link_or_create_trip_item(trip, case_id)
        if action == 'ERROR':
            return '\t'.join((case_id, 'ERROR', result))
        return '\t'.join((case_id, action, result.id, result.name.strip(),
                          display(result.confirmation_ref), display(result.inbox_id)))
