import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.List;

final class Trip {
    final String id, title;
    final LocalDate startDate, endDate;
    Trip(String id, String title, LocalDate startDate, LocalDate endDate) {
        this.id = id; this.title = title; this.startDate = startDate; this.endDate = endDate;
    }
}
final class TripMember {
    final String tripId, travelerId, role;
    TripMember(String tripId, String travelerId, String role) {
        this.tripId = tripId; this.travelerId = travelerId; this.role = role;
    }
}
final class Account {
    final String userId, ownerTravelerId;
    final List<TripMember> memberships = new ArrayList<>();
    Account(String userId, String ownerTravelerId) {
        this.userId = userId; this.ownerTravelerId = ownerTravelerId;
    }
    void addMembership(TripMember member) { memberships.add(member); }
}
final class TripStore {
    final List<Trip> trips = new ArrayList<>();
    void add(Trip trip) { trips.add(trip); }
}
final class CoverTaskQueue {
    final List<String> tripIds = new ArrayList<>();
    void enqueue(String tripId) { tripIds.add(tripId); }
}
final class TripCreationController {
    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE.withResolverStyle(ResolverStyle.STRICT);
    final Account account;
    final TripStore store;
    final CoverTaskQueue coverTasks;
    TripCreationController(Account account, TripStore store, CoverTaskQueue coverTasks) {
        this.account = account; this.store = store; this.coverTasks = coverTasks;
    }
    String create(String caseId, String title, String startText, String endText) {
        if (absent(account.userId)) return error(caseId, "UNAUTHENTICATED");
        if (absent(account.ownerTravelerId)) return error(caseId, "MISSING_OWNER");
        String cleanTitle = title.trim();
        if (cleanTitle.isEmpty() || cleanTitle.equals("~")) return error(caseId, "MISSING_TITLE");
        LocalDate start, end;
        try {
            if (!startText.matches("\\d{4}-\\d{2}-\\d{2}") || !endText.matches("\\d{4}-\\d{2}-\\d{2}"))
                return error(caseId, "INVALID_DATE");
            start = LocalDate.parse(startText, DATE);
            end = LocalDate.parse(endText, DATE);
        } catch (DateTimeParseException ex) { return error(caseId, "INVALID_DATE"); }
        if (end.isBefore(start)) return error(caseId, "INVALID_DATE_RANGE");
        // All validation precedes these non-failing in-memory operations.
        Trip trip = new Trip("trip-" + caseId, cleanTitle, start, end);
        TripMember owner = new TripMember(trip.id, account.ownerTravelerId, "owner");
        store.add(trip);
        account.addMembership(owner);
        coverTasks.enqueue(trip.id);
        return String.join("\t", caseId, "CREATED", trip.id, trip.title, owner.travelerId, owner.role, "COVER_QUEUED");
    }
    private static boolean absent(String value) { return value == null || value.trim().isEmpty() || value.equals("~"); }
    private static String error(String caseId, String code) { return caseId + "\tERROR\t" + code; }
}
