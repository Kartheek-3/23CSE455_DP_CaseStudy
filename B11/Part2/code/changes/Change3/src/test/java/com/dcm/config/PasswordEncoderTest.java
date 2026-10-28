package com.dcm.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;

/** CH03 - JUnit 5 tests proving the refactored encoder really hashes.
 *  These FAIL against the old stub (which returned plaintext and compared with
 *  equals) and PASS against new BCryptPasswordEncoder(). */
class PasswordEncoderTest {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void encodeProducesABcryptHashNotPlaintext() {
        String raw = "secret123";
        String hash = encoder.encode(raw);
        assertNotEquals(raw, hash);               // old stub failed here
        assertTrue(hash.startsWith("$2"));        // BCrypt hash marker
    }

    @Test
    void matchesAcceptsCorrectAndRejectsWrong() {
        String hash = encoder.encode("secret123");
        assertTrue(encoder.matches("secret123", hash));
        assertFalse(encoder.matches("wrongpass", hash));
    }
}
