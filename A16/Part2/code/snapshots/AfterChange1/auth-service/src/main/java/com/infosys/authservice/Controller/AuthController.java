package com.infosys.authservice.Controller;

import com.infosys.authservice.Entity.User;
import com.infosys.authservice.Dto.RegistrationResponse;
import com.infosys.authservice.Repository.UserRepo;
import com.infosys.authservice.Service.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepo userRepo;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public RegistrationResponse register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        User savedUser = userRepo.save(user);
        return new RegistrationResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
                
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password.");
        }
        
        String token = jwtService.generateToken(user.getUsername());
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return response;
    }
}
