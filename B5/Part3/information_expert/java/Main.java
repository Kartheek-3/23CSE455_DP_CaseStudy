import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

final class TripItem {
    final String id;
    final String tripId;
    final String name;
    String confirmationRef;
    String inboxId;
    final String status;
    TripItem(String id, String tripId, String name, String reference, String inboxId, String status) {
        this.id = id; this.tripId = tripId; this.name = name;
        this.confirmationRef = reference; this.inboxId = inboxId; this.status = status;
    }
}
final class Trip {
    final String id;
    final List<TripItem> items = new ArrayList<>();
    Trip(String id) { this.id = id; }
}
final class LinkResult {
    final String action;
    final TripItem item;
    final String error;
    LinkResult(String action, TripItem item, String error) {
        this.action = action; this.item = item; this.error = error;
    }
}
final class InboxItem {
    final String id;
    final String tripId;
    final String providerName;
    final String incomingReference;
    InboxItem(String id, String tripId, String providerName, String incomingReference) {
        this.id = id; this.tripId = tripId;
        this.providerName = providerName; this.incomingReference = incomingReference;
    }
    static boolean missing(String s) { return s == null || s.strip().isEmpty() || s.strip().equals("~"); }
    static String display(String s) { return missing(s) ? "~" : s.strip(); }
    LinkResult linkOrCreateTripItem(Trip trip, String caseId) {
        String name = display(providerName);
        if (name.equals("~")) return new LinkResult("ERROR", null, "MISSING_PROVIDER");
        for (TripItem item : trip.items) {
            if (item.tripId.equals(tripId) && item.name.strip().toLowerCase(Locale.ROOT).equals(name.toLowerCase(Locale.ROOT))) {
                if (missing(item.confirmationRef)) item.confirmationRef = display(incomingReference);
                if (missing(item.inboxId)) item.inboxId = id;
                return new LinkResult("LINKED", item, null);
            }
        }
        TripItem created = new TripItem("item-" + caseId, tripId, name, display(incomingReference), id, "confirmed");
        trip.items.add(created);
        return new LinkResult("CREATED", created, null);
    }
}
final class InboxReviewController {
    String review(InboxItem inbox, Trip trip, String caseId) {
        LinkResult result = inbox.linkOrCreateTripItem(trip, caseId);
        if (result.action.equals("ERROR")) return String.join("\t", caseId, "ERROR", result.error);
        TripItem item = result.item;
        return String.join("\t", caseId, result.action, item.id, item.name.strip(),
                           InboxItem.display(item.confirmationRef), InboxItem.display(item.inboxId));
    }
}
