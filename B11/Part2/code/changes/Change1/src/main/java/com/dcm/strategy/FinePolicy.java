package com.dcm.strategy;

/**
 * CH01 - Strategy interface for overdue late-fee calculation.
 * New collaboration "Overdue Fine Strategy" (status: newly_introduced).
 * Mirrors the GoF Strategy already present as the PasswordEncoder in
 * config/SecurityConfiguration.java, but applied to the case-management domain.
 */
public interface FinePolicy {          // Strategy
    double fine(int daysLate);
}
