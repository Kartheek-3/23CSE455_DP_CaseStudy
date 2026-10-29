class AnnouncementRepository {
  constructor() {
    this.rows = new Map();
    this.reads = new Set();
  }

  insert(announcement) { this.rows.set(announcement.id, announcement); }

  find(id) { return this.rows.get(id) ?? null; }

  all() { return [...this.rows.values()].sort((a, b) => a.id - b.id); }

  addRead(userId, id) {
    const key = userId + ':' + id;
    if (this.reads.has(key)) return false;
    this.reads.add(key);
    return true;
  }

  hasRead(userId, id) { return this.reads.has(userId + ':' + id); }
}

class AnnouncementService {
  constructor(repository, events, moderationLog) {
    this.repository = repository;
    this.events = events;
    this.moderationLog = moderationLog;
    this.nextId = 1;
  }

  create(title, userId = null, moderator = null) {
    const announcement = { id: this.nextId++, title, userId, isActive: true };
    this.repository.insert(announcement);
    if (userId !== null) {
      this.events.publishMainStream(userId, 'announcementCreated');
      if (moderator !== null) this.moderationLog.log(moderator, 'createUserAnnouncement');
    } else {
      this.events.publishBroadcastStream('announcementCreated');
      if (moderator !== null) this.moderationLog.log(moderator, 'createGlobalAnnouncement');
    }
    return announcement;
  }

  unread(userId) {
    return this.repository.all().filter(a =>
      a.isActive && (a.userId === null || a.userId === userId) && !this.repository.hasRead(userId, a.id));
  }

  read(userId, id) {
    if (!this.repository.addRead(userId, id)) return;
    const announcement = this.repository.find(id);
    if (announcement !== null && announcement.userId === userId) announcement.isActive = false;
    if (this.unread(userId).length === 0) this.events.publishMainStream(userId, 'readAllAnnouncements');
  }

  get(id, me = null) {
    const announcement = this.repository.find(id);
    if (announcement === null || (announcement.userId !== null && announcement.userId !== me)) {
      throw new Error('not found');
    }
    return { announcement, read: me === null ? null : this.repository.hasRead(me, id) };
  }
}

module.exports = { AnnouncementService, AnnouncementRepository };
