package com.dcm.strategy;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * CH01 - ConcreteStrategy A: flat 5.0 per day overdue.
 * Marked @Primary so it is the default FinePolicy injected into FineService when
 * two concrete strategies (regularFine, advocateFine) are both candidate beans.
 * Without this, Spring raises NoUniqueBeanDefinitionException at context startup
 * (found during live integration). Callers switch to the advocate policy at
 * runtime via FineService.setPolicy(...).
 */
@Primary
@Component("regularFine")
public class RegularFine implements FinePolicy {
    @Override
    public double fine(int daysLate) {
        if (daysLate <= 0) return 0.0;
        return daysLate * 5.0;
    }
}
