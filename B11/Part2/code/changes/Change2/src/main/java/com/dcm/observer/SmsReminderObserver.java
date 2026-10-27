package com.dcm.observer;

import org.springframework.stereotype.Component;

/**
 * CH02 - ConcreteObserver B (the NEW channel). Added without changing the caller
 * or the email observer - the point of the Observer pattern.
 */
@Component
public class SmsReminderObserver implements HearingObserver {
    @Override
    public void onHearing(String caseNo, String date) {
        // TODO in app: call an SMS gateway for this case
        System.out.println("sms," + caseNo + "," + date);
    }
}
