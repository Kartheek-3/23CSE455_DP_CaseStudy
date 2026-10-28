package com.dcm.observer;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

/** CH02 - JUnit 5 tests for the Observer. A recording observer captures what each
 *  channel received, proving all registered observers are notified from one call
 *  and that adding a channel does not change the caller. */
class CaseRegisterTest {

    static class RecordingObserver implements HearingObserver {
        final List<String> seen = new ArrayList<>();
        public void onHearing(String caseNo, String date) { seen.add(caseNo + "@" + date); }
    }

    @Test
    void allRegisteredObserversAreNotified() {
        CaseRegister r = new CaseRegister();
        RecordingObserver email = new RecordingObserver();
        RecordingObserver sms = new RecordingObserver();
        r.subscribe(email);
        r.subscribe(sms);

        r.newHearing("C-101", "2026-10-15");

        assertEquals(List.of("C-101@2026-10-15"), email.seen);
        assertEquals(List.of("C-101@2026-10-15"), sms.seen);   // new channel got the same event
    }

    @Test
    void unsubscribeStopsNotifications() {
        CaseRegister r = new CaseRegister();
        RecordingObserver sms = new RecordingObserver();
        r.subscribe(sms);
        r.unsubscribe(sms);
        r.newHearing("C-205", "2026-10-18");
        assertTrue(sms.seen.isEmpty());
    }
}
