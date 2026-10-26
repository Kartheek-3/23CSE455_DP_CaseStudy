package com.dcm.strategy;

import org.springframework.stereotype.Component;

/** CH01 - ConcreteStrategy B: 2.0/day for the first week, 3.0/day after. */
@Component("advocateFine")
public class AdvocateFine implements FinePolicy {
    @Override
    public double fine(int daysLate) {
        if (daysLate <= 0) return 0.0;
        if (daysLate <= 7) return daysLate * 2.0;
        return 14.0 + (daysLate - 7) * 3.0;
    }
}
