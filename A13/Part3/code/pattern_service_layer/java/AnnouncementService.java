import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.TreeMap;

class Announcement {
    final int id;
    final String title;
    final String userId;
    boolean isActive = true;

    Announcement(int id, String title, String userId) {
        this.id = id;
        this.title = title;
        this.userId = userId;
    }
}

record Packed(Announcement announcement, Boolean read) {}

interface EventPublisher {
    void publishMainStream(String userId, String type);
    void publishBroadcastStream(String type);
}

interface ModerationLog {
    void log(String moderator, String type);
}

class AnnouncementRepository {
    private final TreeMap<Integer, Announcement> rows = new TreeMap<>();
    private final Set<String> reads = new HashSet<>();

    void insert(Announcement announcement) { rows.put(announcement.id, announcement); }

    Announcement find(int id) { return rows.get(id); }

    List<Announcement> all() { return new ArrayList<>(rows.values()); }

    boolean addRead(String userId, int id) { return reads.add(userId + ":" + id); }

    boolean hasRead(String userId, int id) { return reads.contains(userId + ":" + id); }
}

public class AnnouncementService {
    private final AnnouncementRepository repository;
    private final EventPublisher events;
    private final ModerationLog moderationLog;
    private int nextId = 1;

    public AnnouncementService(AnnouncementRepository repository, EventPublisher events, ModerationLog moderationLog) {
        this.repository = repository;
        this.events = events;
        this.moderationLog = moderationLog;
    }

    public Announcement create(String title, String userId, String moderator) {
        Announcement announcement = new Announcement(nextId++, title, userId);
        repository.insert(announcement);
        if (userId != null) {
            events.publishMainStream(userId, "announcementCreated");
            if (moderator != null) moderationLog.log(moderator, "createUserAnnouncement");
        } else {
            events.publishBroadcastStream("announcementCreated");
            if (moderator != null) moderationLog.log(moderator, "createGlobalAnnouncement");
        }
        return announcement;
    }

    public List<Announcement> unread(String userId) {
        List<Announcement> result = new ArrayList<>();
        for (Announcement a : repository.all()) {
            boolean visible = a.userId == null || a.userId.equals(userId);
            if (a.isActive && visible && !repository.hasRead(userId, a.id)) result.add(a);
        }
        return result;
    }

    public void read(String userId, int id) {
        if (!repository.addRead(userId, id)) return;
        Announcement announcement = repository.find(id);
        if (announcement != null && userId.equals(announcement.userId)) announcement.isActive = false;
        if (unread(userId).isEmpty()) events.publishMainStream(userId, "readAllAnnouncements");
    }

    public Packed get(int id, String me) {
        Announcement announcement = repository.find(id);
        if (announcement == null || (announcement.userId != null && !announcement.userId.equals(me))) {
            throw new NoSuchElementException("not found");
        }
        return new Packed(announcement, me == null ? null : repository.hasRead(me, id));
    }
}
