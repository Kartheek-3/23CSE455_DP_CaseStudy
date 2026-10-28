package com.dcm.observer;

import org.springframework.stereotype.Component;

/**
 * CH02 - ConcreteObserver A. Preserves the baseline email-reminder behaviour,
 * now as a registered observer. In the real app, delegate to EmailServiceImpl
 * (inject it here) instead of printing.
 */
@Component
public class EmailReminderObserver implements HearingObserver {
    @Override
    public void onHearing(String caseNo, String date) {
        // TODO in app: emailService.hearingReminder(...) for this case
        System.out.println("email," + caseNo + "," + date);
    }
}
