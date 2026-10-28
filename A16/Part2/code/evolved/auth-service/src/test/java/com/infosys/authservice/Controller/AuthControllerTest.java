package com.infosys.authservice.Controller;

import com.infosys.authservice.Dto.RegistrationResponse;
import com.infosys.authservice.Entity.User;
import com.infosys.authservice.Repository.UserRepo;
import com.infosys.authservice.Service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Test
    void registerReturnsUserDetailsWithoutPassword() {
        UserRepo userRepo = mock(UserRepo.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        AuthController controller = new AuthController(userRepo, passwordEncoder, jwtService);
        User user = new User(null, "test-user", "plain-password", "DOCTOR");

        when(passwordEncoder.encode("plain-password")).thenReturn("encoded-password");
        when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(7L);
            return savedUser;
        });

        RegistrationResponse response = controller.register(user);

        assertNotNull(response);
        assertEquals(7L, response.id());
        assertEquals("test-user", response.username());
        assertEquals("DOCTOR", response.role());
        assertEquals("encoded-password", user.getPassword());
    }
}
