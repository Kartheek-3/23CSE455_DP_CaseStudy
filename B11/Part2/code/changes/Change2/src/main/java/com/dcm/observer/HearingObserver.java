package com.dcm.observer;

/**
 * CH02 - Observer interface. Turns the baseline scheduler-driven broadcast
 * (LegalAppApplication @Scheduled -> EmailServiceImpl, recorded UNCERTAIN in
 * Part 1) into a genuine subject-maintains-observers Observer.
 */
public interface HearingObserver {      // Observer
    void onHearing(String caseNo, String date);
}
