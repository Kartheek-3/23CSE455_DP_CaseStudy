package com.infosys.authservice.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.nio.charset.StandardCharsets;

import java.util.Date;

@Service
public class JwtService {

    private final byte[] secretKey;

    public JwtService(@Value("${security.jwt.secret}") String secret) {
        this.secretKey = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(Keys.hmacShaKeyFor(
                        secretKey),
                        Jwts.SIG.HS256)
                .compact();
    }
}
