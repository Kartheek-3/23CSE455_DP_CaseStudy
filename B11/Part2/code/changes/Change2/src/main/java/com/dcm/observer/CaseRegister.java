package com.dcm.observer;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * CH02 - Subject / ConcreteSubject. Maintains the list of registered observers
 * and notifies all of them when a hearing is raised. The scheduled job in
 * LegalAppApplication should call newHearing(...) instead of calling the email
 * service directly, so new channels can be added without touching the caller.
 */
@Component
public class CaseRegister {             // Subject
    private final List<HearingObserver> observers = new ArrayList<>();

    public void subscribe(HearingObserver o) { observers.add(o); }
    public void unsubscribe(HearingObserver o) { observers.remove(o); }

    public void newHearing(String caseNo, String date) {   // state change -> notify
        for (HearingObserver o : observers) {
            o.onHearing(caseNo, date);
        }
    }
}
