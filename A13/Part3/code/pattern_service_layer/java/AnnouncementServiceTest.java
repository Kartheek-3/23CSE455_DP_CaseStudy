import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class AnnouncementServiceTest {

    static String run(String text) {
        List<String> out = new ArrayList<>();
        EventPublisher events = new EventPublisher() {
            public void publishMainStream(String userId, String type) { out.add("event:main:" + userId + " " + type); }

            public void publishBroadcastStream(String type) { out.add("event:broadcast " + type); }
        };
        ModerationLog moderationLog = (moderator, type) -> out.add("modlog:" + type);
        AnnouncementRepository repo = new AnnouncementRepository();
        AnnouncementService service = new AnnouncementService(repo, events, moderationLog);
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 4);
            if (parts[0].equals("create")) {
                int start = out.size();
                Announcement created = service.create(parts[3], parts[1].equals("-") ? null : parts[1],
                        parts[2].equals("mod") ? "admin" : null);
                out.add(start, "created#" + created.id);
            } else if (parts[0].equals("read")) {
                Announcement target = repo.find(Integer.parseInt(parts[2]));
                boolean wasActive = target != null && target.isActive;
                service.read(parts[1], Integer.parseInt(parts[2]));
                if (wasActive && !target.isActive) out.add("deactivated#" + target.id);
            } else if (parts[0].equals("get")) {
                try {
                    Packed packed = service.get(Integer.parseInt(parts[1]), parts[2].equals("-") ? null : parts[2]);
                    out.add("announcement#" + packed.announcement().id + " title=" + packed.announcement().title
                            + (packed.read() == null ? "" : " read=" + packed.read()));
                } catch (NoSuchElementException e) {
                    out.add("ERR:" + e.getMessage());
                }
            } else if (parts[0].equals("unread")) {
                List<String> ids = new ArrayList<>();
                for (Announcement a : service.unread(parts[1])) ids.add(String.valueOf(a.id));
                out.add("unread:" + (ids.isEmpty() ? "none" : String.join(",", ids)));
            }
        }
        return String.join("~", out);
    }

    public static void main(String[] args) throws Exception {
        int passed = 0, total = 0;
        for (String line : Files.readAllLines(Path.of(args[0]))) {
            if (line.isBlank() || line.startsWith("#")) continue;
            String[] f = line.split("\\|", 3);
            total++;
            String got = run(f[1]);
            boolean ok = got.equals(f[2]);
            if (ok) passed++;
            System.out.println((ok ? "PASS " : "FAIL ") + f[0] + (ok ? "" : ": expected [" + f[2] + "] got [" + got + "]"));
        }
        System.out.println("passed " + passed + "/" + total);
        System.exit(passed == total ? 0 : 1);
    }
}
