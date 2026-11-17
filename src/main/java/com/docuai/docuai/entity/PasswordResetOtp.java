package com.docuai.docuai.entity;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="password_reset_otps")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false,length = 6)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    public boolean isExpired(){
        return LocalDateTime.now().isAfter(this.expiryDate);
    }




}
