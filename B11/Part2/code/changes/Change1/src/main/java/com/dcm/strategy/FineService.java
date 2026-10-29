package com.dcm.strategy;

import org.springframework.stereotype.Service;

/**
 * CH01 - Context for the Overdue Fine Strategy. Holds the active FinePolicy and
 * delegates the calculation to it, so the fee algorithm can be switched without
 * changing callers. Wire into the controller/service layer where a case action
 * becomes overdue.
 */
@Service
public class FineService {              // Context

    private FinePolicy policy;

    public FineService(FinePolicy policy) {   // default-injected strategy
        this.policy = policy;
    }

    public void setPolicy(FinePolicy policy) {
        this.policy = policy;
    }

    public double computeFine(int daysLate) {
        return policy.fine(daysLate);
    }
}
