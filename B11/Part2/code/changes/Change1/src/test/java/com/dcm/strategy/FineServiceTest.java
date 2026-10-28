package com.dcm.strategy;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** CH01 - JUnit 5 tests for the Overdue Fine Strategy.
 *  Run: mvn -Dtest=FineServiceTest test   (JUnit 5 is on Spring Boot 2.4's test starter). */
class FineServiceTest {

    @Test
    void regularPolicyChargesFlatPerDay() {
        FineService s = new FineService(new RegularFine());
        assertEquals(0.0,  s.computeFine(0));
        assertEquals(15.0, s.computeFine(3));
        assertEquals(50.0, s.computeFine(10));
    }

    @Test
    void advocatePolicyIsTieredAfterSevenDays() {
        FineService s = new FineService(new AdvocateFine());
        assertEquals(0.0,  s.computeFine(0));
        assertEquals(6.0,  s.computeFine(3));
        assertEquals(14.0, s.computeFine(7));
        assertEquals(23.0, s.computeFine(10));
    }

    @Test
    void switchingPolicyChangesOnlyTheStrategy() {
        FineService s = new FineService(new RegularFine());
        assertEquals(50.0, s.computeFine(10));
        s.setPolicy(new AdvocateFine());
        assertEquals(23.0, s.computeFine(10));   // same context, different strategy
    }
}
