package com.docuai.docuai.auth.service;

import com.docuai.docuai.auth.dto.*;
import com.docuai.docuai.entity.PasswordResetOtp;
import com.docuai.docuai.entity.User;
import com.docuai.docuai.exception.EmailAlreadyExistsException;
import com.docuai.docuai.repository.PasswordResetOtpRepository;
import com.docuai.docuai.repository.UserRepository;
import io.jsonwebtoken.security.Password;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetOtpRepository otpRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       PasswordResetOtpRepository otpRepository,
                       EmailService emailService,
                       JwtService jwtService){
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser =  userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getCreatedAt()
        );
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication =
                authenticationManager.authenticate(
                         new UsernamePasswordAuthenticationToken(
                                 request.getEmail(),
                                 request.getPassword()
                         )
                );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        return new LoginResponse(token,"Bearer");
    }

    @Transactional
    public String sendforgotPassword(ForgotPasswordRequest request){
        String email = request.getEmail().trim().toLowerCase();

        if(!userRepository.existsByEmail(email)){
            return "If an account exist with this email, a 6 digit OTP has been sent.";
        }

        otpRepository.deleteByEmail(email);

        int randomPin = (int) (Math.random() * 900000) + 100000;
        String otp = String.valueOf(randomPin);

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(email);
        resetOtp.setOtp(otp);
        resetOtp.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(resetOtp);

        emailService.sendOtpEmail(email,otp);

        return "A 6 - digit  Otp code has been sent to "+ email;
    }

    @Transactional
    public void resetPasswordWithOtp(ResetPasswordOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp().trim();
        PasswordResetOtp resetOtp = otpRepository.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid 6-digit OTP code. Please verify and try again."));
        if (resetOtp.isExpired()) {
            otpRepository.delete(resetOtp);
            throw new RuntimeException("This OTP code has expired. Please request a new one.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User account not found."));
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        // Invalidate OTP after use
        otpRepository.delete(resetOtp);
    }
}