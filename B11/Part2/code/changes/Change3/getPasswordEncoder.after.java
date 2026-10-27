// CH03 - AFTER: real BCrypt. Replaces the stubbed anonymous encoder at
// config/SecurityConfiguration.java:57-77. The Strategy STRUCTURE and the
// wiring at line 31 (auth...passwordEncoder(getPasswordEncoder())) are unchanged;
// only the concrete strategy's behaviour is corrected.

private PasswordEncoder getPasswordEncoder() {
    return new BCryptPasswordEncoder();   // real hashing + matching
}

// MIGRATION NOTE: existing rows store plaintext passwords (the old stub never
// hashed). Before enabling this, re-hash existing passwords once, e.g. on next
// successful login re-encode, or run a one-off migration that BCrypts each stored
// value. Document whichever you choose in test_result/.
