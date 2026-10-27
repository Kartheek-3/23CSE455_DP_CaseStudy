from dataclasses import dataclass
from typing import Optional


@dataclass
class Announcement:
    id: int
    title: str
    user_id: Optional[str] = None
    is_active: bool = True


class AnnouncementRepository:
    def __init__(self):
        self._rows = {}
        self._reads = set()

    def insert(self, announcement):
        self._rows[announcement.id] = announcement

    def find(self, announcement_id):
        return self._rows.get(announcement_id)

    def all(self):
        return [self._rows[i] for i in sorted(self._rows)]

    def add_read(self, user_id, announcement_id):
        if (user_id, announcement_id) in self._reads:
            return False
        self._reads.add((user_id, announcement_id))
        return True

    def has_read(self, user_id, announcement_id):
        return (user_id, announcement_id) in self._reads


class AnnouncementService:
    def __init__(self, repository, events, moderation_log):
        self._repository = repository
        self._events = events
        self._moderation_log = moderation_log
        self._next_id = 1

    def create(self, title, user_id=None, moderator=None):
        announcement = Announcement(self._next_id, title, user_id)
        self._next_id += 1
        self._repository.insert(announcement)
        if user_id is not None:
            self._events.publish_main_stream(user_id, "announcementCreated")
            if moderator is not None:
                self._moderation_log.log(moderator, "createUserAnnouncement")
        else:
            self._events.publish_broadcast_stream("announcementCreated")
            if moderator is not None:
                self._moderation_log.log(moderator, "createGlobalAnnouncement")
        return announcement

    def unread(self, user_id):
        return [a for a in self._repository.all()
                if a.is_active and a.user_id in (None, user_id) and not self._repository.has_read(user_id, a.id)]

    def read(self, user_id, announcement_id):
        if not self._repository.add_read(user_id, announcement_id):
            return
        announcement = self._repository.find(announcement_id)
        if announcement is not None and announcement.user_id == user_id:
            announcement.is_active = False
        if not self.unread(user_id):
            self._events.publish_main_stream(user_id, "readAllAnnouncements")

    def get(self, announcement_id, me=None):
        announcement = self._repository.find(announcement_id)
        if announcement is None or (announcement.user_id is not None and announcement.user_id != me):
            raise LookupError("not found")
        read = None if me is None else self._repository.has_read(me, announcement_id)
        return announcement, read
