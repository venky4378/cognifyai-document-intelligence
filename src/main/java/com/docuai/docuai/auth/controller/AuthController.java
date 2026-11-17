package com.docuai.docuai.auth.controller;

import com.docuai.docuai.auth.dto.*;
import com.docuai.docuai.auth.service.AuthService;
import com.docuai.docuai.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request){
        RegisterResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request){
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String response = authService.sendforgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password-otp")
    public ResponseEntity<String> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordOtpRequest request) {
        authService.resetPasswordWithOtp(request);
        return ResponseEntity.ok("Password successfully updated. You can now sign in.");
    }


}
